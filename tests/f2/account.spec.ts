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
  return data.user.id as string;
}
test.beforeAll(async () => {
  if (!process.env.DATABASE_URL?.includes("/bamas_test"))
    throw new Error(
      "Refusing integration fixtures outside bamas_test database.",
    );
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
