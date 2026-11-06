import { test, expect } from "@playwright/test";
test("donate simulation, reload, and cancel another attempt", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Donasi sekarang", exact: true })
    .first()
    .click();
  await expect(
    page
      .locator("main")
      .getByText("SIMULASI — bukan transaksi nyata.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Lanjut", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "Masukkan nominal",
  );
  await page.getByRole("button", { name: "Rp 10.000", exact: true }).click();
  await page.getByRole("button", { name: "Lanjut", exact: true }).click();
  await page.getByRole("radio", { name: /QRIS/ }).check();
  await page.getByRole("button", { name: "Lanjut", exact: true }).click();
  await page.getByRole("button", { name: "Buat donasi SIMULASI" }).click();
  await page
    .getByRole("button", { name: "Simulasikan pembayaran berhasil" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Terima kasih, orang baik!" }),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Donasiku" })
    .click();
  await expect(page.locator(".history-item").first()).toContainText("Berhasil");
  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Beranda", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Donasi sekarang", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Rp 25.000", exact: true }).click();
  await page.getByRole("button", { name: "Lanjut", exact: true }).click();
  await page.getByRole("radio", { name: /GoPay/ }).check();
  await page.getByRole("button", { name: "Lanjut", exact: true }).click();
  await page.getByRole("button", { name: "Buat donasi SIMULASI" }).click();
  await page.getByRole("button", { name: "Batalkan simulasi" }).click();
  await expect(page.locator(".history-item").first()).toContainText(
    "Dibatalkan",
  );
});
