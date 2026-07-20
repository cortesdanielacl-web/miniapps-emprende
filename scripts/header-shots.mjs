import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "header-fix");
const widths = [320, 360, 375, 390];
const label = process.argv[2] || "after";

fs.mkdirSync(dir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

for (const w of widths) {
  await page.setViewportSize({ width: w, height: 280 });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const header = page.locator('header[data-slot="header"]');
  await header.screenshot({ path: path.join(dir, `${label}-${w}.png`) });
  const metrics = await page.evaluate(() => {
    const h = document.querySelector('header[data-slot="header"]');
    const brand = h.querySelector('a[href="/"]');
    const btn = [...h.querySelectorAll("a")].find((a) =>
      (a.textContent || "").includes("Calculadora")
    );
    const brandTitle = brand.querySelector(".font-heading");
    const hr = h.getBoundingClientRect();
    const br = brand.getBoundingClientRect();
    const nr = btn.getBoundingClientRect();
    return {
      headerH: +hr.height.toFixed(2),
      brandTop: +br.top.toFixed(2),
      brandBottom: +br.bottom.toFixed(2),
      btnTop: +nr.top.toFixed(2),
      btnBottom: +nr.bottom.toFixed(2),
      btnW: +nr.width.toFixed(2),
      btnInner: btn.innerText.replace(/\s+/g, " ").trim(),
      brandTitle: brandTitle.textContent.trim(),
      brandFullVisible: brandTitle.scrollWidth <= brandTitle.clientWidth + 1,
      stacked: nr.top >= br.bottom - 1,
      btnFullWidth: nr.width >= hr.width - 40,
    };
  });
  console.log(w, JSON.stringify(metrics));
}

// Desktop check
await page.setViewportSize({ width: 768, height: 220 });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(300);
await page.locator('header[data-slot="header"]').screenshot({
  path: path.join(dir, `${label}-desktop-768.png`),
});
const desktop = await page.evaluate(() => {
  const h = document.querySelector('header[data-slot="header"]');
  const brand = h.querySelector('a[href="/"]');
  const btn = [...h.querySelectorAll("a")].find((a) =>
    (a.textContent || "").includes("Calculadora")
  );
  const br = brand.getBoundingClientRect();
  const nr = btn.getBoundingClientRect();
  return {
    btnInner: btn.innerText.replace(/\s+/g, " ").trim(),
    sameRow: Math.abs(br.top - nr.top) < 8,
    headerH: +h.getBoundingClientRect().height.toFixed(2),
  };
});
console.log("desktop768", JSON.stringify(desktop));

await browser.close();
