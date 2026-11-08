import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readAuthSettings,
  ConfigurationError,
} from "../src/features/auth/application/settings";
const local = {
  BETTER_AUTH_SECRET: "x".repeat(64),
  BETTER_AUTH_URL: "http://localhost:3000",
  SMTP_HOST: "127.0.0.1",
  SMTP_PORT: "1025",
  SMTP_SECURE: "false",
  SMTP_ALLOW_INSECURE_LOCAL: "true",
  MAIL_FROM: "accounts@example.test",
};
test("local email capture must be explicitly enabled and limited to loopback", () => {
  assert.equal(readAuthSettings(local).mail.requireTLS, false);
  for (const change of [
    { SMTP_HOST: "smtp.example.test" },
    { BETTER_AUTH_URL: "https://bamas.example" },
    { SMTP_ALLOW_INSECURE_LOCAL: "false" },
    { SMTP_PORT: "0" },
    { MAIL_FROM: "invalid\r\nBcc: other@example.test" },
  ]) {
    assert.throws(
      () => readAuthSettings({ ...local, ...change }),
      ConfigurationError,
    );
  }
});
test("public auth requires HTTPS, complete SMTP auth and validated TLS", () => {
  const secure = {
    ...local,
    BETTER_AUTH_URL: "https://bamas.example",
    SMTP_HOST: "smtp.example.test",
    SMTP_PORT: "587",
    SMTP_ALLOW_INSECURE_LOCAL: "false",
    SMTP_USER: "test-user",
    SMTP_PASSWORD: "test-password",
  };
  assert.equal(readAuthSettings(secure).mail.requireTLS, true);
  assert.equal(
    readAuthSettings({ ...secure, SMTP_SECURE: "true", SMTP_PORT: "465" }).mail
      .secure,
    true,
  );
  for (const change of [
    { BETTER_AUTH_URL: "http://bamas.example" },
    { SMTP_PASSWORD: "" },
    { SMTP_HOST: "" },
    { BETTER_AUTH_URL: "https://bamas.example/?redirect=evil" },
    { BETTER_AUTH_SECRET: "short" },
  ]) {
    assert.throws(
      () => readAuthSettings({ ...secure, ...change }),
      ConfigurationError,
    );
  }
  assert.throws(
    () => readAuthSettings({ AUTH_ALLOW_UNVERIFIED_LOCAL: "true" }),
    ConfigurationError,
  );
});
