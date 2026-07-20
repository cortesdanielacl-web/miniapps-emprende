import { chromium } from "playwright";

const widths = [320, 360, 375, 390, 640, 768];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

for (const w of widths) {
  await page.setViewportSize({ width: w, height: 220 });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  const m = await page.evaluate(() => {
    const h = document.querySelector('header[data-slot="header"]');
    const brand = h.querySelector('a[href="/"]');
    const btn = [...h.querySelectorAll("a")].find((a) =>
      (a.textContent || "").includes("Calculadora")
    );
    const brandTitle = brand.querySelector(".font-heading");
    const logo = brand.querySelector('[data-slot="brand-logo"]');
    return {
      btnInner: btn.innerText.replace(/\s+/g, " ").trim(),
      btnW: +btn.getBoundingClientRect().width.toFixed(2),
      brandTitle: brandTitle.textContent.trim(),
      brandTitleW: +brandTitle.getBoundingClientRect().width.toFixed(2),
      brandScrollW: brandTitle.scrollWidth,
      brandClientW: brandTitle.clientWidth,
      brandFullVisible: brandTitle.scrollWidth <= brandTitle.clientWidth + 1,
      logoW: logo ? +logo.getBoundingClientRect().width.toFixed(2) : null,
      headerH: +h.getBoundingClientRect().height.toFixed(2),
      singleLineBtn: !btn.innerText.includes("\n"),
    };
  });
  console.log(w, JSON.stringify(m));
}

await browser.close();
