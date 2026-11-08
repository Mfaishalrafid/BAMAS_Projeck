import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
const dir = mkdtempSync(join(tmpdir(), "bamas-f2-"));
const name = `bamas-test-${randomBytes(6).toString("hex")}`;
const password = randomBytes(24).toString("hex");
const environment = { ...process.env };
for (const key of [
  "DOCKER_HOST",
  "DOCKER_CONTEXT",
  "DOCKER_TLS",
  "DOCKER_TLS_VERIFY",
  "DOCKER_CERT_PATH",
])
  delete environment[key];
function run(command, args, env = environment, capture = false) {
  const result = spawnSync(command, args, {
    env,
    encoding: "utf8",
    stdio: capture ? "pipe" : "inherit",
  });
  if (result.status !== 0)
    throw new Error(`${command} failed (${result.status}).`);
  return result.stdout?.trim();
}
const docker = (args, capture = false) =>
  run(
    "docker",
    ["--host=unix:///var/run/docker.sock", ...args],
    environment,
    capture,
  );
let started = false;
let mailStarted = false;
const mailName = `${name}-mail`;
try {
  const envFile = join(dir, "postgres.env");
  writeFileSync(
    envFile,
    `POSTGRES_USER=bamas_test\nPOSTGRES_PASSWORD=${password}\nPOSTGRES_DB=bamas_test\n`,
    { mode: 0o600 },
  );
  docker(
    [
      "run",
      "--rm",
      "-d",
      "--name",
      name,
      "--env-file",
      envFile,
      "-p",
      "127.0.0.1::5432",
      "postgres:17-alpine",
    ],
    true,
  );
  started = true;
  let ready = false;
  for (let i = 0; i < 30; i++) {
    const result = spawnSync(
      "docker",
      [
        "--host=unix:///var/run/docker.sock",
        "exec",
        name,
        "pg_isready",
        "-U",
        "bamas_test",
      ],
      { env: environment, stdio: "ignore" },
    );
    if (result.status === 0) {
      ready = true;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (!ready) throw new Error("PostgreSQL test startup timeout.");
  const address = docker(["port", name, "5432/tcp"], true);
  const port = address.split(":").at(-1);
  docker(
    [
      "run",
      "--rm",
      "-d",
      "--name",
      mailName,
      "-p",
      "127.0.0.1::1025",
      "-p",
      "127.0.0.1::8025",
      "axllent/mailpit@sha256:aef2aacc11f075ec0fb6874275ee4a421e688e11a96ebb296134d1735c7761ce",
    ],
    true,
  );
  mailStarted = true;
  const smtpPort = docker(["port", mailName, "1025/tcp"], true)
    .split(":")
    .at(-1);
  const mailPort = docker(["port", mailName, "8025/tcp"], true)
    .split(":")
    .at(-1);
  const mailURL = `http://127.0.0.1:${mailPort}`;
  let mailReady = false;
  for (let i = 0; i < 30; i++) {
    try {
      if ((await fetch(`${mailURL}/readyz`)).ok) {
        mailReady = true;
        break;
      }
    } catch {
      /* starting */
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (!mailReady) throw new Error("Mail test startup timeout.");
  const env = {
    ...environment,
    DATABASE_URL: `postgresql://bamas_test:${password}@127.0.0.1:${port}/bamas_test`,
    BETTER_AUTH_SECRET: randomBytes(32).toString("hex"),
    BETTER_AUTH_URL: "http://localhost:3002",
    SMTP_HOST: "127.0.0.1",
    SMTP_PORT: smtpPort,
    SMTP_SECURE: "false",
    SMTP_USER: "",
    SMTP_PASSWORD: "",
    SMTP_ALLOW_INSECURE_LOCAL: "true",
    MAIL_FROM: "accounts@bamas.example",
    MAILPIT_URL: mailURL,
  };
  console.log("Applying migrations to isolated PostgreSQL test database.");
  run("npx", ["prisma", "migrate", "deploy"], env);
  run("npx", ["prisma", "migrate", "deploy"], env);
  run("npx", ["playwright", "test", "--config=playwright.f2.config.ts"], env);
} finally {
  if (mailStarted) docker(["stop", mailName], true);
  if (started) docker(["stop", name], true);
  rmSync(dir, { recursive: true, force: true });
}
