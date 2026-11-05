import { test, expect } from "@playwright/test";
test("four step campaign creation, approval, persistence and reset", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Galang", exact: true })
    .click();
  await page.getByRole("button", { name: "Pendidikan", exact: true }).click();
  await page
    .getByLabel("Judul kampanye")
    .fill("Bantuan sekolah untuk warga desa");
  await page.getByRole("button", { name: "Lanjut", exact: true }).click();
  await page.getByLabel("Target dana (Rp)").fill("1000000");
  await page.getByRole("button", { name: "Lanjut", exact: true }).click();
  await page
    .getByLabel("Cerita kampanye")
    .fill(
      "Anak-anak di desa membutuhkan perlengkapan sekolah untuk melanjutkan pendidikan mereka.",
    );
  await page.getByRole("button", { name: "Lanjut", exact: true }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Ajukan kampanye SIMULASI" }).click();
  await expect(page.locator("main")).toContainText("Menunggu verifikasi");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Profil", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Dashboard admin demo", exact: false })
    .click();
  const card = page
    .locator(".review-card")
    .filter({ hasText: "Bantuan sekolah untuk warga desa" });
  await card.getByRole("button", { name: "Setujui", exact: true }).click();
  await expect(page.locator("main").getByRole("status")).toContainText(
    "Disetujui",
  );
  await page.reload();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Jelajah", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Cari kampanye" })
    .fill("Bantuan sekolah untuk warga desa");
  await expect(page.locator(".campaign-card")).toHaveCount(1);
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Profil", exact: true })
    .click();
  await page.getByRole("button", { name: /Reset data demo/ }).click();
  await page.getByRole("button", { name: "Ya, reset demo" }).click();
  await expect(page.locator("main").getByRole("status")).toContainText(
    "direset",
  );
});
