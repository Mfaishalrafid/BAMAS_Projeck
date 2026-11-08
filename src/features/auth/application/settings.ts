import { z } from "zod";
export class ConfigurationError extends Error {
  constructor() {
    super("Layanan akun belum dikonfigurasi.");
  }
}
type Environment = Record<string, string | undefined>;
const loopback = (host: string) =>
  ["localhost", "127.0.0.1", "[::1]", "::1"].includes(host);
export function readAuthSettings(env: Environment) {
  try {
    const secret = z.string().min(32).parse(env.BETTER_AUTH_SECRET);
    const url = new URL(z.string().parse(env.BETTER_AUTH_URL));
    const local = loopback(url.hostname);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      (!local && url.protocol !== "https:") ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    )
      throw new ConfigurationError();
    const host = z
      .string()
      .trim()
      .min(1)
      .regex(/^[a-zA-Z0-9.:[\]-]+$/)
      .parse(env.SMTP_HOST);
    const port = z.coerce.number().int().min(1).max(65535).parse(env.SMTP_PORT);
    const from = z.email().parse(env.MAIL_FROM);
    const insecure = env.SMTP_ALLOW_INSECURE_LOCAL === "true";
    if (insecure && (!local || !loopback(host))) throw new ConfigurationError();
    if (!["true", "false"].includes(env.SMTP_SECURE ?? ""))
      throw new ConfigurationError();
    const secure = env.SMTP_SECURE === "true";
    const user = env.SMTP_USER;
    const pass = env.SMTP_PASSWORD;
    if ((!insecure && (!user || !pass)) || Boolean(user) !== Boolean(pass))
      throw new ConfigurationError();
    return {
      secret,
      baseURL: url.origin,
      mail: {
        host,
        port,
        from,
        secure,
        requireTLS: !insecure && !secure,
        user,
        pass,
      },
    };
  } catch {
    throw new ConfigurationError();
  }
}
