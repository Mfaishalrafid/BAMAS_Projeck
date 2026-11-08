import "server-only";
import nodemailer from "nodemailer";
import { authConfig } from "@/shared/server/config";
let transport: ReturnType<typeof nodemailer.createTransport> | undefined;
export async function sendAccountEmail(
  to: string,
  url: string,
  purpose: "verify" | "reset",
) {
  const config = authConfig();
  // Never send caller-controlled external links, even if a library hook changes.
  if (new URL(url).origin !== config.baseURL)
    throw new Error("Invalid account link origin");
  const { mail } = config;
  transport ??= nodemailer.createTransport({
    host: mail.host,
    port: mail.port,
    secure: mail.secure,
    requireTLS: mail.requireTLS,
    auth:
      mail.user && mail.pass ? { user: mail.user, pass: mail.pass } : undefined,
    tls: { rejectUnauthorized: true, minVersion: "TLSv1.2" },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    logger: false,
    debug: false,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  const verify = purpose === "verify";
  try {
    const result = await transport.sendMail({
      from: { name: "BAMAS", address: mail.from },
      to: { address: to, name: "" },
      subject: verify
        ? "Verifikasi email akun BAMAS"
        : "Atur ulang kata sandi BAMAS",
      text: `${verify ? "Verifikasi alamat email Anda" : "Atur ulang kata sandi Anda"} melalui tautan berikut:\n\n${url}\n\nTautan berlaku ${verify ? "60" : "15"} menit. ${verify ? "Setelah verifikasi, masuk dengan kata sandi Anda." : "Setelah kata sandi diubah, seluruh sesi lama akan dikeluarkan."}\n\nJika Anda tidak meminta email ini, abaikan. Jangan bagikan tautan ini kepada siapa pun.`,
    });
    if (!result.accepted?.length) throw new Error("Email rejected");
  } catch {
    // Keep SMTP server responses, addresses and tokens out of logs/public errors.
    throw new Error("Pengiriman email akun gagal. Coba lagi nanti.");
  }
}
