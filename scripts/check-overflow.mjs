import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WIDTHS = [320, 360, 375, 390, 430];
const HEIGHT = 900;
const URL = process.env.OVERFLOW_URL || 'http://localhost:3000';
const SCROLL_STEP = 400;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function waitForImages(page) {
  await page.evaluate(async () => {
    const imgs = [...document.images];
    await Promise.all(
      imgs.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) {
              resolve();
              return;
            }
            const done = () => resolve();
            img.addEventListener('load', done, { once: true });
            img.addEventListener('error', done, { once: true });
            setTimeout(done, 8000);
          })
      )
    );
  });
}

function collectReportInPage({ scrollY, clientWidth }) {
  const round = (n) => Math.round(n * 100) / 100;

  const parentChain = (el, levels = 3) => {
    const parts = [];
    let cur = el.parentElement;
    for (let i = 0; i < levels && cur; i++) {
      const cls =
        cur.className && typeof cur.className === 'string'
          ? '.' + cur.className.trim().split(/\s+/).filter(Boolean).slice(0, 2).join('.')
          : '';
      parts.push(`${cur.tagName.toLowerCase()}${cur.id ? '#' + cur.id : ''}${cls}`);
      cur = cur.parentElement;
    }
    return parts;
  };

  const describe = (el, reason) => {
    const rect = el.getBoundingClientRect();
    const cls =
      el.className && typeof el.className === 'string'
        ? el.className.slice(0, 160)
        : el.className?.baseVal
          ? String(el.className.baseVal).slice(0, 160)
          : '';
    const text = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80);
    return {
      tag: el.tagName.toLowerCase(),
      id: el.id || '',
      classes: cls,
      textContent: text,
      parentChain: parentChain(el, 3),
      reason,
      rect: {
        left: round(rect.left),
        right: round(rect.right),
        top: round(rect.top),
        bottom: round(rect.bottom),
        width: round(rect.width),
        height: round(rect.height),
      },
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      scrollY,
    };
  };

  const isVisible = (el) => {
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return false;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return false;
    return true;
  };

  const keyOf = (d) =>
    `${d.tag}|${d.id}|${d.classes}|${d.rect.left}|${d.rect.right}|${d.scrollWidth}|${d.clientWidth}|${d.reason}`;

  const offenders = [];
  const seen = new Set();

  const all = document.querySelectorAll('*');
  for (const el of all) {
    if (!isVisible(el)) continue;
    const rect = el.getBoundingClientRect();
    const reasons = [];
    if (rect.right > clientWidth + 0.5 || rect.left < -0.5) {
      reasons.push('bbox');
    }
    if (el.scrollWidth > el.clientWidth + 1) {
      reasons.push('scroll');
    }
    if (reasons.length === 0) continue;
    const d = describe(el, reasons.join('+'));
    const k = keyOf(d);
    if (!seen.has(k)) {
      seen.add(k);
      offenders.push(d);
    }
  }

  return offenders;
}

async function measureAtViewport(page, width) {
  await page.setViewportSize({ width, height: HEIGHT });
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 });
  await waitForImages(page);
  await page.waitForTimeout(400);

  const rootMetrics = await page.evaluate(() => {
    const html = document.documentElement;
    const body = document.body;
    const htmlStyle = getComputedStyle(html);
    const bodyStyle = getComputedStyle(body);
    return {
      html: {
        scrollWidth: html.scrollWidth,
        clientWidth: html.clientWidth,
        overflowX: htmlStyle.overflowX,
        overflow: htmlStyle.overflow,
      },
      body: {
        scrollWidth: body.scrollWidth,
        clientWidth: body.clientWidth,
        overflowX: bodyStyle.overflowX,
        overflow: bodyStyle.overflow,
      },
      innerWidth: window.innerWidth,
      scrollHeight: Math.max(
        html.scrollHeight,
        body.scrollHeight,
        html.offsetHeight,
        body.offsetHeight
      ),
    };
  });

  const clientWidth = rootMetrics.html.clientWidth;
  const scrollHeight = rootMetrics.scrollHeight;
  const offenderMap = new Map();

  const mergeOffenders = (list) => {
    for (const o of list) {
      const k = `${o.tag}|${o.id}|${o.classes}|${o.reason}|${Math.round(o.rect.left)}|${Math.round(o.rect.right)}|${o.scrollWidth}|${o.clientWidth}`;
      if (!offenderMap.has(k)) offenderMap.set(k, o);
    }
  };

  const positions = [];
  for (let y = 0; y <= scrollHeight; y += SCROLL_STEP) positions.push(y);
  if (positions[positions.length - 1] !== scrollHeight) positions.push(scrollHeight);

  for (const y of positions) {
    await page.evaluate((sy) => window.scrollTo(0, sy), y);
    await page.waitForTimeout(80);
    const found = await page.evaluate(collectReportInPage, {
      scrollY: y,
      clientWidth,
    });
    mergeOffenders(found);
  }

  await page.evaluate(() => window.scrollTo(0, 0));

  const specific = await page.evaluate((checks) => {
    const round = (n) => Math.round(n * 100) / 100;
    const cw = document.documentElement.clientWidth;

    const measureEl = (el, name) => {
      if (!el) return { name, present: false };
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      const overflowX =
        rect.right > cw + 0.5 ||
        rect.left < -0.5 ||
        el.scrollWidth > el.clientWidth + 1;
      return {
        name,
        present: true,
        tag: el.tagName.toLowerCase(),
        id: el.id || '',
        classes:
          el.className && typeof el.className === 'string'
            ? el.className.slice(0, 160)
            : '',
        textContent: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
        rect: {
          left: round(rect.left),
          right: round(rect.right),
          top: round(rect.top),
          bottom: round(rect.bottom),
          width: round(rect.width),
          height: round(rect.height),
        },
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        computedOverflowX: style.overflowX,
        overflowsViewport: overflowX,
        naturalWidth: el.naturalWidth ?? null,
        naturalHeight: el.naturalHeight ?? null,
        currentSrc: el.currentSrc || el.src || null,
      };
    };

    const out = [];
    for (const c of checks) {
      if (c.selector) {
        const els = [...document.querySelectorAll(c.selector)];
        if (els.length === 0) {
          out.push({ name: c.name, present: false });
        } else {
          for (const el of els) out.push(measureEl(el, c.name));
        }
      } else if (c.findKind === 'probar') {
        const nodes = [...document.querySelectorAll('button, a')].filter((el) =>
          (el.textContent || '').includes('Probar gratis')
        );
        if (nodes.length === 0) out.push({ name: c.name, present: false });
        else for (const el of nodes) out.push(measureEl(el, c.name));
      } else if (c.findKind === 'calculadora') {
        const nodes = [...document.querySelectorAll('header a')].filter((el) =>
          (el.textContent || '').includes('Calculadora')
        );
        if (nodes.length === 0) out.push({ name: c.name, present: false });
        else for (const el of nodes) out.push(measureEl(el, c.name));
      }
    }
    return out;
  }, [
    { name: 'header[data-slot=header]', selector: 'header[data-slot="header"]' },
    { name: '#hero img', selector: '#hero img' },
    { name: '#solucion img', selector: '#solucion img' },
    { name: 'button/a "Probar gratis"', findKind: 'probar' },
    { name: 'header a "Calculadora"', findKind: 'calculadora' },
  ]);

  const offenders = [...offenderMap.values()];
  const htmlOverflow =
    rootMetrics.html.scrollWidth > rootMetrics.html.clientWidth + 0.5;
  const bodyOverflow =
    rootMetrics.body.scrollWidth > rootMetrics.body.clientWidth + 0.5;

  return {
    viewportWidth: width,
    viewportHeight: HEIGHT,
    documentElement: {
      ...rootMetrics.html,
      hasHorizontalOverflow: htmlOverflow,
      overflowAmount: Math.max(0, rootMetrics.html.scrollWidth - rootMetrics.html.clientWidth),
    },
    body: {
      ...rootMetrics.body,
      hasHorizontalOverflow: bodyOverflow,
      overflowAmount: Math.max(0, rootMetrics.body.scrollWidth - rootMetrics.body.clientWidth),
    },
    innerWidth: rootMetrics.innerWidth,
    scrollHeight,
    scrollPositionsChecked: positions,
    overflowingElementCount: offenders.length,
    overflowingElements: offenders,
    specificChecks: specific,
  };
}

async function takeFullPageScreenshot(page, width, outPath) {
  await page.setViewportSize({ width, height: HEIGHT });
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 });
  await waitForImages(page);
  await page.waitForTimeout(300);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: outPath, fullPage: true });
  const st = fs.statSync(outPath);
  return { path: outPath, bytes: st.size, exists: true };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];
  const screenshots = {};

  try {
    for (const width of WIDTHS) {
      const report = await measureAtViewport(page, width);
      results.push(report);
    }

    const shot320 = path.join(__dirname, 'overflow-320.png');
    const shot375 = path.join(__dirname, 'overflow-375.png');
    screenshots['320'] = await takeFullPageScreenshot(page, 320, shot320);
    screenshots['375'] = await takeFullPageScreenshot(page, 375, shot375);
  } finally {
    await browser.close();
  }

  const output = {
    url: URL,
    checkedAt: new Date().toISOString(),
    widths: WIDTHS,
    height: HEIGHT,
    method: {
      waitUntil: 'networkidle',
      waitImages: 'complete (load or error)',
      scrollStep: SCROLL_STEP,
      bboxThreshold: 0.5,
      scrollWidthThreshold: 1,
    },
    screenshots,
    results,
  };

  console.log(JSON.stringify(output, null, 2));
}

main().catch((err) => {
  console.error(JSON.stringify({ error: String(err), stack: err?.stack }, null, 2));
  process.exit(1);
});