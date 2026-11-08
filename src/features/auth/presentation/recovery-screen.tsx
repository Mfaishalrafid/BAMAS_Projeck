"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/shared/components/app-shell";
import { Button } from "@/shared/components/ui";
type Mode = "forgot" | "resend" | "reset" | "verified";
const titles: Record<Mode, string> = {
  forgot: "Lupa kata sandi",
  resend: "Kirim ulang verifikasi",
  reset: "Kata sandi baru",
  verified: "Verifikasi email",
};
export function RecoveryScreen({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const params = new URLSearchParams(window.location.search);
    // Consume the link only in memory; remove tokens from browser URL/history.
    window.history.replaceState(null, "", window.location.pathname);
    if (mode === "reset") {
      const value = params.get("token");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (value && !params.has("error")) setToken(value);
      else setError("Tautan tidak valid atau kedaluwarsa. Minta tautan baru.");
    }
    if (mode === "verified") {
      if (params.has("error"))
        setError(
          "Verifikasi gagal. Tautan mungkin tidak valid atau kedaluwarsa.",
        );
      else setNotice("Proses verifikasi selesai. Silakan masuk ke akun Anda.");
    }
  }, [mode]);
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    if (mode === "reset" && password !== form.get("confirmation")) {
      setError("Konfirmasi kata sandi tidak sama.");
      return;
    }
    setBusy(true);
    const endpoint =
      mode === "reset"
        ? "reset-password"
        : mode === "forgot"
          ? "request-password-reset"
          : "send-verification-email";
    const body =
      mode === "reset"
        ? { token, newPassword: password }
        : {
            email: String(form.get("email")),
            ...(mode === "forgot"
              ? { redirectTo: `${window.location.origin}/akun/reset-password` }
              : { callbackURL: `${window.location.origin}/akun/verifikasi` }),
          };
    try {
      const response = await fetch(`/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        setError(
          response.status === 429
            ? "Terlalu banyak permintaan. Tunggu satu menit lalu coba lagi."
            : mode === "reset"
              ? "Kata sandi belum berubah. Tautan mungkin tidak valid, kedaluwarsa, atau sudah digunakan."
              : "Permintaan belum berhasil. Coba lagi nanti.",
        );
        return;
      }
      setNotice(
        mode === "reset"
          ? "Kata sandi berhasil diubah. Semua sesi lama sudah keluar. Silakan masuk kembali."
          : "Jika alamat email memenuhi syarat, tautan akan dikirim. Periksa kotak masuk dan folder spam.",
      );
      if (mode === "reset") {
        setToken("");
        setDone(true);
      }
    } catch {
      setError("Tidak dapat menghubungi layanan. Coba lagi nanti.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <AppShell
      screen="profile"
      navigate={(screen) =>
        router.push(screen === "profile" ? "/akun" : `/?screen=${screen}`)
      }
    >
      <section className="section">
        <h1 className="page-title">{titles[mode]}</h1>
        {mode !== "verified" && !done && (
          <form onSubmit={submit}>
            {mode === "reset" ? (
              <>
                <label className="field">
                  Kata sandi baru
                  <input
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={12}
                    maxLength={128}
                  />
                </label>
                <label className="field">
                  Konfirmasi kata sandi
                  <input
                    name="confirmation"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={12}
                    maxLength={128}
                  />
                </label>
                <p className="muted">
                  Minimal 12 karakter. Tautan berlaku 15 menit dan hanya dapat
                  digunakan sekali.
                </p>
              </>
            ) : (
              <label className="field">
                Email
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                />
              </label>
            )}
            <Button
              className="full"
              disabled={busy || (mode === "reset" && !token)}
            >
              {busy
                ? "Memproses…"
                : mode === "reset"
                  ? "Simpan kata sandi"
                  : "Kirim tautan"}
            </Button>
          </form>
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="notice">
            {notice}
          </p>
        )}
        <p>
          <Link href="/akun" className="button secondary">
            Kembali ke akun
          </Link>
        </p>
        {mode === "reset" && !done && (
          <p>
            <Link href="/akun/lupa-password">Minta tautan reset baru</Link>
          </p>
        )}
        {mode === "verified" && (
          <p>
            <Link href="/akun/kirim-verifikasi">
              Kirim ulang email verifikasi
            </Link>
          </p>
        )}
      </section>
    </AppShell>
  );
}
