import {
  test,
  expect,
  request as requests,
  type APIRequestContext,
} from "@playwright/test";
import { randomBytes, randomUUID } from "node:crypto";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import AxeBuilder from "@axe-core/playwright";
import { emailLink } from "./mailbox";
const baseURL = "http://localhost:3002";
const password = `Aa-${randomBytes(20).toString("hex")}`;
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const contexts: APIRequestContext[] = [];
let donorA: APIRequestContext,
  donorB: APIRequestContext,
  campaigner: APIRequestContext,
  admin: APIRequestContext;
let donorId: string,
  ownerId: string,
  adminId: string,
  publicId: string,
  privateId: string,
  donationId: string;
const email = `donor-${randomUUID()}@example.test`;
const draft = {
  title: "Bantuan pendidikan untuk warga desa",
  category: "pendidikan",
  targetIdr: "100000000000",
  durationDays: 30,
  location: "Bandung",
  image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b",
  story:
    "Anak-anak di desa membutuhkan perlengkapan sekolah dan ruang belajar yang layak untuk masa depan.",
};
async function context() {
  const c = await requests.newContext({
    baseURL,
    extraHTTPHeaders: { Origin: baseURL },
  });
  contexts.push(c);
  return c;
}
async function signup(c: APIRequestContext, address: string) {
  const response = await c.post("/api/auth/sign-up/email", {
    data: { email: address, password, name: "Pengguna Uji" },
  });
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data.token).toBeNull();
  expect((await c.get("/api/me")).status()).toBe(401);
  const verification = await emailLink(
    c,
    address,
    "Verifikasi email akun BAMAS",
  );
  expect((await c.get(verification, { maxRedirects: 0 })).status()).toBe(302);
  expect(
    (
      await c.post("/api/auth/sign-in/email", {
        data: { email: address, password },
      })
    ).status(),
  ).toBe(200);
  return data.user.id as string;
}
test.beforeAll(async () => {
  if (!process.env.DATABASE_URL?.includes("/bamas_test"))
    throw new Error(
      "Refusing integration fixtures outside bamas_test database.",
    );
  await db.rateLimit.deleteMany();
  donorA = await context();
  donorB = await context();
  campaigner = await context();
  admin = await context();
  donorId = await signup(donorA, email);
  await signup(donorB, `other-${randomUUID()}@example.test`);
  ownerId = await signup(campaigner, `owner-${randomUUID()}@example.test`);
  adminId = await signup(admin, `admin-${randomUUID()}@example.test`);
  await db.user.update({
    where: { id: ownerId },
    data: { role: "CAMPAIGNER" },
  });
  await db.user.update({ where: { id: adminId }, data: { role: "ADMIN" } });
  const c = await db.campaign.create({
    data: {
      ...draft,
      targetIdr: BigInt(draft.targetIdr),
      ownerId,
      slug: randomUUID(),
      status: "ACTIVE",
    },
  });
  publicId = c.id;
  const hidden = await db.campaign.create({
    data: {
      ...draft,
      targetIdr: 1000000n,
      ownerId,
      slug: randomUUID(),
      status: "DRAFT",
    },
  });
  privateId = hidden.id;
  const donation = await db.donation.create({
    data: {
      campaignId: publicId,
      donorId,
      amountIdr: 10000n,
      status: "PENDING",
    },
  });
  donationId = donation.id;
});
test.beforeEach(async () => {
  await db.rateLimit.deleteMany();
});
test.afterAll(async () => {
  await Promise.all(contexts.map((c) => c.dispose()));
  await db.$disconnect();
});
test("database identities and sessions, default role and forged privileges", async () => {
  const anonymous = await context();
  expect((await anonymous.get("/api/me")).status()).toBe(401);
  const me = await donorA.get("/api/me");
  expect((await me.json()).user.role).toBe("DONOR");
  const account = await db.account.findFirstOrThrow({
    where: { userId: donorId },
  });
  expect(account.password).not.toBe(password);
  expect(account.password?.length).toBeGreaterThan(30);
  const cookies = (await donorA.storageState()).cookies;
  expect(cookies.some((c) => c.httpOnly && c.sameSite === "Lax")).toBe(true);
  // A legacy session must not bypass the newly required verified-email check.
  await db.user.update({
    where: { id: donorId },
    data: { emailVerified: false },
  });
  expect((await donorA.get("/api/me")).status()).toBe(401);
  await db.user.update({
    where: { id: donorId },
    data: { emailVerified: true },
  });
  expect(
    (
      await donorA.post("/api/auth/update-user", { data: { role: "ADMIN" } })
    ).status(),
  ).toBe(422);
  expect(
    (
      await donorA.post("/api/auth/sign-up/email", {
        data: {
          name: "Forged",
          email: "forged@example.test",
          password,
          role: "ADMIN",
        },
      })
    ).status(),
  ).toBe(422);
  expect((await donorA.get("/api/admin/overview")).status()).toBe(403);
  expect((await campaigner.get("/api/admin/overview")).status()).toBe(403);
  expect((await admin.get("/api/admin/overview")).status()).toBe(200);
});
test("campaign owner restrictions, hidden drafts, validation and BIGINT serialization", async () => {
  expect((await donorA.post("/api/campaigns", { data: draft })).status()).toBe(
    403,
  );
  expect(
    (
      await campaigner.post("/api/campaigns", {
        data: { ...draft, ownerId: donorId },
      })
    ).status(),
  ).toBe(422);
  expect(
    (
      await campaigner.post("/api/campaigns", {
        data: { ...draft, targetIdr: "1000000.5" },
      })
    ).status(),
  ).toBe(422);
  const created = await campaigner.post("/api/campaigns", { data: draft });
  expect(created.status()).toBe(201);
  const c = (await created.json()).campaign;
  expect(c.status).toBe("DRAFT");
  expect(c.targetIdr).toBe("100000000000");
  const anonymous = await context();
  expect((await anonymous.get(`/api/campaigns/${c.slug}`)).status()).toBe(404);
  expect((await donorB.get(`/api/campaigns/${c.slug}`)).status()).toBe(404);
  expect((await campaigner.get(`/api/campaigns/${c.slug}`)).status()).toBe(200);
  expect((await admin.get(`/api/campaigns/${c.slug}`)).status()).toBe(200);
  expect(
    (await donorB.patch(`/api/me/campaigns/${c.id}`, { data: draft })).status(),
  ).toBe(404);
  expect(
    (
      await campaigner.patch(`/api/me/campaigns/${c.id}`, {
        data: { ...draft, status: "ACTIVE" },
      })
    ).status(),
  ).toBe(422);
  expect(
    (
      await campaigner.patch(`/api/me/campaigns/${c.id}`, {
        data: { ...draft, title: "Judul baru untuk bantuan pendidikan" },
      })
    ).status(),
  ).toBe(200);
  const list = (await (await anonymous.get("/api/campaigns")).json()).items;
  expect(list.every((x: { status: string }) => x.status === "ACTIVE")).toBe(
    true,
  );
  expect(list.some((x: { id: string }) => x.id === c.id)).toBe(false);
  expect((await anonymous.get("/api/campaigns?page=-1")).status()).toBe(422);
});
test("bookmarks and donation history never cross accounts; no paid mutation endpoint", async () => {
  expect(
    (
      await donorA.post("/api/me/bookmarks", { data: { campaignId: publicId } })
    ).status(),
  ).toBe(200);
  expect(
    (
      await donorA.post("/api/me/bookmarks", { data: { campaignId: publicId } })
    ).status(),
  ).toBe(200);
  expect(
    (await (await donorA.get("/api/me/bookmarks")).json()).items,
  ).toHaveLength(1);
  expect(
    (await (await donorB.get("/api/me/bookmarks")).json()).items,
  ).toHaveLength(0);
  expect(
    (
      await donorA.post("/api/me/bookmarks", {
        data: { campaignId: privateId },
      })
    ).status(),
  ).toBe(404);
  expect(
    (
      await donorB.delete(`/api/me/bookmarks/${publicId}`, { data: {} })
    ).status(),
  ).toBe(200);
  expect(
    (await (await donorA.get("/api/me/bookmarks")).json()).items,
  ).toHaveLength(1);
  const history = (await (await donorA.get("/api/me/donations")).json()).items;
  expect(history).toHaveLength(1);
  expect(history[0].amountIdr).toBe("10000");
  expect(
    (await (await donorB.get("/api/me/donations")).json()).items,
  ).toHaveLength(0);
  expect(
    (await donorB.get(`/api/donations/${donationId}/status`)).status(),
  ).toBe(404);
  expect(
    (await donorA.get(`/api/donations/${donationId}/status`)).status(),
  ).toBe(200);
  expect(
    (
      await donorA.post(`/api/donations/${donationId}/status`, {
        data: { status: "PAID" },
      })
    ).status(),
  ).toBe(405);
});
test("origin checks, fresh role reads and database constraints", async () => {
  expect(
    (
      await donorA.post("/api/me/bookmarks", {
        headers: { Origin: "https://evil.example" },
        data: { campaignId: publicId },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await donorA.post("/api/auth/sign-out", {
        headers: { Origin: "https://evil.example" },
        data: {},
      })
    ).status(),
  ).toBe(403);
  await db.user.update({ where: { id: adminId }, data: { role: "DONOR" } });
  expect((await admin.get("/api/admin/overview")).status()).toBe(403);
  await expect(
    db.donation.create({
      data: { campaignId: publicId, donorId, amountIdr: -1n },
    }),
  ).rejects.toThrow();
});
test("browser sign-in, persisted session and logout revocation", async ({
  page,
}) => {
  await page.goto("/akun");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Kata sandi", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Masuk akun", exact: true }).click();
  await expect(page.getByText("Role: DONOR", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("Role: DONOR", { exact: true })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(axe.violations.map((v) => v.id)).toEqual([]);
  const state = await page.context().storageState();
  const replay = await requests.newContext({ baseURL, storageState: state });
  contexts.push(replay);
  await page.getByRole("button", { name: "Keluar akun" }).click();
  await expect(
    page.getByRole("button", { name: "Masuk akun", exact: true }),
  ).toBeVisible();
  expect((await replay.get("/api/me")).status()).toBe(401);
});
test("database-backed auth rate limit rejects repeated wrong passwords", async () => {
  const anonymous = await context();
  let limited = false;
  for (let i = 0; i < 12; i++) {
    const result = await anonymous.post("/api/auth/sign-in/email", {
      data: { email, password: "Not-the-correct-password!" },
    });
    if (result.status() === 429) {
      limited = true;
      break;
    }
    expect(result.status()).toBe(401);
  }
  expect(limited).toBe(true);
});

test("verification required, resend privacy, expired/tampered links and safe redirects", async () => {
  const c = await context();
  const address = `unverified-${randomUUID()}@example.test`;
  const created = await c.post("/api/auth/sign-up/email", {
    data: {
      email: address,
      password,
      name: "Akun Verifikasi",
      callbackURL: `${baseURL}/akun/verifikasi`,
    },
  });
  expect(created.status()).toBe(200);
  const userId = (await created.json()).user.id;
  expect((await c.get("/api/me")).status()).toBe(401);
  expect(
    (
      await c.post("/api/auth/sign-in/email", {
        data: { email: address, password },
      })
    ).status(),
  ).toBe(403);
  const original = await emailLink(c, address, "Verifikasi email akun BAMAS");
  const damaged = new URL(original);
  damaged.searchParams.set("token", "invalid-token");
  const bad = await c.get(damaged.href, { maxRedirects: 0 });
  expect(bad.status()).toBe(302);
  expect(bad.headers().location.includes("error=")).toBe(true);
  // Expiry validation uses a correctly signed but expired test-only JWT.
  const { createHmac } = await import("node:crypto");
  const encode = (v: unknown) =>
    Buffer.from(JSON.stringify(v)).toString("base64url");
  const payload = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ email: address, userId, exp: Math.floor(Date.now() / 1000) - 60 })}`;
  damaged.searchParams.set(
    "token",
    `${payload}.${createHmac("sha256", process.env.BETTER_AUTH_SECRET!).update(payload).digest("base64url")}`,
  );
  const expired = await c.get(damaged.href, { maxRedirects: 0 });
  expect(expired.headers().location.includes("error=TOKEN_EXPIRED")).toBe(true);
  expect(
    (await db.user.findUniqueOrThrow({ where: { id: userId } })).emailVerified,
  ).toBe(false);
  const missing = await c.post("/api/auth/send-verification-email", {
    data: {
      email: "missing@example.test",
      callbackURL: `${baseURL}/akun/verifikasi`,
    },
  });
  const existing = await c.post("/api/auth/send-verification-email", {
    data: { email: address, callbackURL: `${baseURL}/akun/verifikasi` },
  });
  expect(existing.status()).toBe(200);
  expect(await missing.json()).toEqual(await existing.json());
  const resent = await emailLink(c, address, "Verifikasi email akun BAMAS");
  const external = new URL(resent);
  external.searchParams.set("callbackURL", "https://evil.example/");
  expect((await c.get(external.href, { maxRedirects: 0 })).status()).toBe(403);
  expect((await c.get(resent, { maxRedirects: 0 })).status()).toBe(302);
  expect(
    (await db.user.findUniqueOrThrow({ where: { id: userId } })).emailVerified,
  ).toBe(true);
  expect((await c.get("/api/me")).status()).toBe(401);
  // Verification is idempotent, but never creates a session on replay.
  expect((await c.get(resent, { maxRedirects: 0 })).status()).toBe(302);
  expect((await c.get("/api/me")).status()).toBe(401);
  expect(
    (
      await c.post("/api/auth/sign-in/email", {
        data: { email: address, password },
      })
    ).status(),
  ).toBe(200);
});

test("browser password recovery, one-use token and revocation of every old session", async ({
  page,
}) => {
  const anonymous = await context();
  const secondSession = await context();
  expect(
    (
      await secondSession.post("/api/auth/sign-in/email", {
        data: { email, password },
      })
    ).status(),
  ).toBe(200);
  const unknown = await anonymous.post("/api/auth/request-password-reset", {
    data: {
      email: "missing@example.test",
      redirectTo: `${baseURL}/akun/reset-password`,
    },
  });
  const known = await anonymous.post("/api/auth/request-password-reset", {
    data: { email, redirectTo: `${baseURL}/akun/reset-password` },
  });
  expect(known.status()).toBe(200);
  expect(await unknown.json()).toEqual(await known.json());
  await emailLink(anonymous, email, "Atur ulang kata sandi BAMAS");
  await page.goto("/akun/lupa-password");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByRole("button", { name: "Kirim tautan", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "Jika alamat email memenuhi syarat",
  );
  const link = await emailLink(anonymous, email, "Atur ulang kata sandi BAMAS");
  const token = new URL(link).pathname.split("/").at(-1)!;
  await page.goto(link);
  await expect(
    page.getByRole("heading", { name: "Kata sandi baru", exact: true }),
  ).toBeVisible();
  expect(new URL(page.url()).search).toBe("");
  expect(
    await page.locator('meta[name="referrer"]').getAttribute("content"),
  ).toBe("no-referrer");
  const nextPassword = `New-${randomBytes(20).toString("hex")}`;
  await page.getByLabel("Kata sandi baru", { exact: true }).fill(nextPassword);
  await page
    .getByLabel("Konfirmasi kata sandi", { exact: true })
    .fill("Mismatch-password!");
  await page
    .getByRole("button", { name: "Simpan kata sandi", exact: true })
    .click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Konfirmasi kata sandi" }),
  ).toContainText("tidak sama");
  await page
    .getByLabel("Konfirmasi kata sandi", { exact: true })
    .fill(nextPassword);
  await page
    .getByRole("button", { name: "Simpan kata sandi", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Kata sandi berhasil diubah",
  );
  expect((await donorA.get("/api/me")).status()).toBe(401);
  expect((await secondSession.get("/api/me")).status()).toBe(401);
  expect((await donorB.get("/api/me")).status()).toBe(200);
  expect(
    (
      await anonymous.post("/api/auth/reset-password", {
        data: { token, newPassword: nextPassword },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await anonymous.post("/api/auth/sign-in/email", {
        data: { email, password },
      })
    ).status(),
  ).toBe(401);
  expect(
    (
      await anonymous.post("/api/auth/sign-in/email", {
        data: { email, password: nextPassword },
      })
    ).status(),
  ).toBe(200);
  await page.evaluate(() => document.fonts.ready);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations.map((v) => v.id),
  ).toEqual([]);
});

test("reset expiry, forged tokens, CSRF, redirect rejection and concurrent single use", async () => {
  const c = await context();
  const requestReset = () =>
    c.post("/api/auth/request-password-reset", {
      data: { email, redirectTo: `${baseURL}/akun/reset-password` },
    });
  expect(
    (
      await c.post("/api/auth/request-password-reset", {
        data: { email, redirectTo: "https://evil.example" },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await c.post("/api/auth/request-password-reset", {
        headers: { Origin: "https://evil.example" },
        data: { email },
      })
    ).status(),
  ).toBe(403);
  const newPassword = `Reset-${randomBytes(20).toString("hex")}`;
  expect(
    (
      await c.post("/api/auth/reset-password", {
        data: { token: "forged-token", newPassword },
      })
    ).status(),
  ).toBe(400);
  expect((await requestReset()).status()).toBe(200);
  const expiredLink = await emailLink(c, email, "Atur ulang kata sandi BAMAS");
  const expiredToken = new URL(expiredLink).pathname.split("/").at(-1)!;
  await db.verification.updateMany({
    where: { value: donorId },
    data: { expiresAt: new Date(Date.now() - 60000) },
  });
  expect(
    (
      await c.post("/api/auth/reset-password", {
        data: { token: expiredToken, newPassword },
      })
    ).status(),
  ).toBe(400);
  expect(
    (await c.get(expiredLink, { maxRedirects: 0 }))
      .headers()
      .location.includes("error=INVALID_TOKEN"),
  ).toBe(true);
  expect((await requestReset()).status()).toBe(200);
  const link = await emailLink(c, email, "Atur ulang kata sandi BAMAS");
  const token = new URL(link).pathname.split("/").at(-1)!;
  expect(
    (
      await c.post("/api/auth/reset-password", {
        data: { token, newPassword: "short" },
      })
    ).status(),
  ).toBe(400);
  const responses = await Promise.all(
    [1, 2].map(() =>
      c.post("/api/auth/reset-password", { data: { token, newPassword } }),
    ),
  );
  expect(responses.map((r) => r.status()).sort()).toEqual([200, 400]);
});

test("verification and recovery email endpoints are rate limited", async () => {
  const c = await context();
  for (const path of ["send-verification-email", "request-password-reset"]) {
    for (let i = 0; i < 5; i++)
      expect(
        (
          await c.post(`/api/auth/${path}`, {
            data: { email: "missing@example.test" },
          })
        ).status(),
      ).toBe(200);
    expect(
      (
        await c.post(`/api/auth/${path}`, {
          data: { email: "missing@example.test" },
        })
      ).status(),
    ).toBe(429);
  }
});
