import { test, expect } from "@playwright/test";
test("phone preview keeps demo available and disables server account access", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/BAMAS/);
  expect(
    await page.locator('meta[name="robots"]').getAttribute("content"),
  ).toContain("noindex");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.goto("/akun/reset-password?token=not-a-real-token");
  await expect(page).toHaveURL(/\/?screen=profile$/);
  await expect(
    page.getByRole("heading", { name: "Profil", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Masuk akun F2" })).toHaveCount(
    0,
  );
  for (const path of [
    "/api/me",
    "/api/campaigns",
    "/api/admin/overview",
    "/api/auth/get-session",
  ]) {
    const result = await request.get(path);
    expect(result.status()).toBe(404);
    expect((await result.json()).error.code).toBe("DEMO_ONLY");
  }
  const signup = await request.post("/api/auth/sign-up/email", { data: {} });
  expect(signup.status()).toBe(404);
  expect((await signup.json()).error.code).toBe("DEMO_ONLY");
});
