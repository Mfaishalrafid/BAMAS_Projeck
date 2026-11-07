import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { randomUUID } from "node:crypto";
import { getDb } from "@/shared/server/db";
import { authConfig } from "@/shared/server/config";
function createAuth() {
  const config = authConfig();
  return betterAuth({
    appName: "BAMAS",
    secret: config.secret,
    baseURL: config.baseURL,
    trustedOrigins: [config.baseURL],
    database: prismaAdapter(getDb(), { provider: "postgresql" }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      requireEmailVerification: false,
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: true,
          defaultValue: "DONOR",
          input: false,
        },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: { enabled: false },
    },
    advanced: {
      database: { generateId: () => randomUUID() },
      cookiePrefix: "bamas",
      defaultCookieAttributes: { httpOnly: true, sameSite: "lax" },
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 100,
      customRules: {
        "/sign-in/email": { window: 60, max: 10 },
        "/sign-up/email": { window: 60, max: 5 },
      },
    },
    logger: { disabled: true },
  });
}
let instance: ReturnType<typeof createAuth> | undefined;
export function getAuth() {
  return (instance ??= createAuth());
}
