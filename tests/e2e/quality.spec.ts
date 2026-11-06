import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function audit(page: import("@playwright/test").Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.locator("main").evaluate(async (element) => {
    await Promise.all(
      element
        .getAnimations({ subtree: true })
        .filter(
          (animation) => animation.effect?.getTiming().iterations !== Infinity,
        )
        .map((animation) => animation.finished.catch(() => undefined)),
    );
  });
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
}
test("mobile accessibility, keyboard search and empty state", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Kebaikan kecil/ }),
  ).toBeVisible();
  await audit(page);
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Jelajah", exact: true })
    .click();
  await expect(page.locator("main")).toBeFocused();
  await page.keyboard.press("/");
  await expect(
    page.getByRole("textbox", { name: "Cari kampanye" }),
  ).toBeFocused();
  await page.keyboard.type("does-not-exist");
  await expect(
    page.getByRole("heading", { name: "Kampanye tidak ditemukan" }),
  ).toBeVisible();
  await audit(page);
  await page.getByRole("button", { name: "Reset filter" }).click();
  await expect(page.locator(".campaign-card").first()).toBeVisible();
});
test("desktop frame, mobile widths and reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Kebaikan kecil/ }),
  ).toBeVisible();
  expect(
    await page
      .locator(".phone-frame")
      .evaluate((e) => e.getBoundingClientRect().width),
  ).toBe(414);
  await audit(page);
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await expect(page.locator(".intro")).toBeHidden();
});
test("corrupt and unavailable local storage remain usable", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("bamas-f1-simulation-v1", "{invalid"),
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Kebaikan kecil/ }),
  ).toBeVisible();
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error("Storage blocked");
    };
    Storage.prototype.getItem = () => {
      throw new Error("Storage blocked");
    };
  });
  await page.reload();
  await expect(
    page.locator("[role=alert]").filter({ hasText: "Penyimpanan perangkat" }),
  ).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Jelajah", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Cari kampanye" }),
  ).toBeVisible();
});
test("form and admin accessibility plus rejected moderation path", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Donasi sekarang", exact: true })
    .first()
    .click();
  await audit(page);
  await page.getByRole("button", { name: "Rp 10.000", exact: true }).click();
  await page.getByRole("button", { name: "Lanjut", exact: true }).click();
  await audit(page);
  await page.goto("/");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Profil", exact: true })
    .click();
  await audit(page);
  await page.getByRole("button", { name: /Dashboard admin demo/ }).click();
  await audit(page);
  await page
    .locator(".review-card")
    .first()
    .getByRole("button", { name: "Tolak", exact: true })
    .click();
  await expect(page.locator("main").getByRole("status")).toContainText(
    "Ditolak",
  );
});

test("detail tabs, saved campaign and missing deep link", async ({ page }) => {
  await page.goto("/?campaign=banjir-garut");
  await expect(page.locator("main h1")).toContainText("Darurat banjir");
  await audit(page);
  await page.getByRole("button", { name: "Kabar", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Dapur umum ke-4 dibuka" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Doa", exact: true }).click();
  await expect(page.getByText("Rina Kartika", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Simpan", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Hapus dari simpanan" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Hapus dari simpanan" }),
  ).toBeVisible();
  await page.goto("/?campaign=missing");
  await expect(
    page.getByRole("heading", { name: "Kampanye tidak ditemukan" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Kembali", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /Kebaikan kecil/ }),
  ).toBeVisible();
});
