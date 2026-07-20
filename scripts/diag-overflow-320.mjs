import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WIDTH = 320;
const HEIGHT = 900;
const URL = "http://localhost:3000/";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: WIDTH, height: HEIGHT });
  await page.goto(URL, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(600);

  const report = await page.evaluate(async () => {
    const iw = window.innerWidth;

    const cssPath = (el) => {
      if (el.id) return `#${CSS.escape(el.id)}`;
      const parts = [];
      let cur = el;
      while (cur && cur.nodeType === 1 && parts.length < 8) {
        let part = cur.tagName.toLowerCase();
        if (cur.id) {
          parts.unshift(`#${CSS.escape(cur.id)}`);
          break;
        }
        const parent = cur.parentElement;
        if (parent) {
          const siblings = [...parent.children].filter(
            (c) => c.tagName === cur.tagName
          );
          if (siblings.length > 1) {
            part += `:nth-of-type(${siblings.indexOf(cur) + 1})`;
          }
        }
        const cls = (typeof cur.className === "string" ? cur.className : "")
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2);
        if (cls.length) {
          part += `.${cls.map((c) => CSS.escape(c)).join(".")}`;
        }
        parts.unshift(part);
        cur = parent;
        if (cur && cur.tagName === "BODY") {
          parts.unshift("body");
          break;
        }
      }
      return parts.join(" > ");
    };

    const bySelector = new Map();

    const collect = (scrollY) => {
      for (const el of document.querySelectorAll("*")) {
        const st = getComputedStyle(el);
        if (st.display === "none" || st.visibility === "hidden") continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        if (!(r.right > iw)) continue;

        const cls = typeof el.className === "string" ? el.className : "";
        const text = (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80);
        const item = {
          tag: el.tagName.toLowerCase(),
          id: el.id || "",
          classes: cls,
          text,
          selector: cssPath(el),
          left: +r.left.toFixed(2),
          right: +r.right.toFixed(2),
          width: +r.width.toFixed(2),
          top: +r.top.toFixed(2),
          overflowPx: +(r.right - iw).toFixed(2),
          scrollY,
          aria: el.getAttribute("aria-label") || "",
          role: el.getAttribute("role") || "",
          dataSlot: el.getAttribute("data-slot") || "",
        };

        const prev = bySelector.get(item.selector);
        if (!prev || item.overflowPx > prev.overflowPx) {
          bySelector.set(item.selector, item);
        }
      }
    };

    const sh = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    );
    for (let y = 0; y <= sh; y += 300) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
      collect(y);
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 40));
    collect(0);

    const offenders = [...bySelector.values()].sort(
      (a, b) => b.overflowPx - a.overflowPx || a.top - b.top
    );

    return {
      url: location.href,
      viewport: { width: iw, height: window.innerHeight },
      documentElement: {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      },
      equal: document.documentElement.scrollWidth === window.innerWidth,
      count: offenders.length,
      offenders,
    };
  });

  await browser.close();

  const outPath = path.join(__dirname, "overflow-diag-320.json");
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
