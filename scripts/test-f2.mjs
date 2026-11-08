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
  const env = {
    ...environment,
    DATABASE_URL: `postgresql://bamas_test:${password}@127.0.0.1:${port}/bamas_test`,
    BETTER_AUTH_SECRET: randomBytes(32).toString("hex"),
    BETTER_AUTH_URL: "http://localhost:3002",
    AUTH_ALLOW_UNVERIFIED_LOCAL: "true",
  };
  console.log("Applying migrations to isolated PostgreSQL test database.");
  run("npx", ["prisma", "migrate", "deploy"], env);
  run("npx", ["prisma", "migrate", "deploy"], env);
  run("npx", ["playwright", "test", "--config=playwright.f2.config.ts"], env);
} finally {
  if (started) docker(["stop", name], true);
  rmSync(dir, { recursive: true, force: true });
}
