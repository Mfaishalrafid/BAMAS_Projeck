import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFile, mkdir } from "node:fs/promises";
const label = process.argv[2] ?? "current";
await mkdir("artifacts", { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://localhost:3001");
await page
  .getByRole("button", { name: "Donasi sekarang", exact: true })
  .first()
  .waitFor();
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: `artifacts/${label}-mobile.png` });
const audit = await new AxeBuilder({ page })
  .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
  .analyze();
const perf = await page.evaluate(() => ({
  navigation: performance.getEntriesByType("navigation").map((e) => ({
    duration: e.duration,
    domContentLoaded: e.domContentLoadedEventEnd,
  })),
  resources: performance.getEntriesByType("resource").map((e) => ({
    name: e.name,
    bytes: e.transferSize,
    duration: e.duration,
  })),
  overflow: document.documentElement.scrollWidth > innerWidth,
}));
await page.setViewportSize({ width: 1440, height: 1000 });
await page.screenshot({ path: `artifacts/${label}-desktop.png` });
await writeFile(
  `artifacts/${label}-audit.json`,
  JSON.stringify(
    {
      errors,
      violations: audit.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
      perf,
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify({
    label,
    errors,
    violations: audit.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
    sameOriginBytes: perf.resources
      .filter((r) => r.name.startsWith("http://localhost"))
      .reduce((a, r) => a + r.bytes, 0),
    overflow: perf.overflow,
  }),
);
await browser.close();
