import "server-only";
export class ConfigurationError extends Error {
  constructor() {
    super("Layanan akun belum dikonfigurasi.");
  }
}
export function databaseUrl() {
  const value = process.env.DATABASE_URL;
  if (!value) throw new ConfigurationError();
  return value;
}
export function authConfig() {
  const secret = process.env.BETTER_AUTH_SECRET;
  const baseURL = process.env.BETTER_AUTH_URL;
  if (!secret || secret.length < 32 || !baseURL) throw new ConfigurationError();
  const url = new URL(baseURL);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    (!local && url.protocol !== "https:")
  )
    throw new ConfigurationError();
  // Email delivery is not configured in F2. Fail closed away from a local test host.
  if (!local || process.env.AUTH_ALLOW_UNVERIFIED_LOCAL !== "true")
    throw new ConfigurationError();
  return { secret, baseURL: url.origin };
}
