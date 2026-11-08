"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/shared/components/app-shell";
import { Button } from "@/shared/components/ui";
import type { Actor } from "../domain/authorization";
import { canCreateCampaign } from "../domain/authorization";
import type { DraftInput } from "@/features/accounts/application/contracts";
type Campaign = {
  id: string;
  title: string;
  targetIdr: string;
  status: string;
  slug: string;
};
async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const response = await fetch(path, {
    method,
    headers:
      method === "GET" ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(
      data.error?.message ??
        (typeof data.message === "string" ? data.message : "Permintaan gagal."),
    ) as Error & { status: number };
    error.status = response.status;
    throw error;
  }
  return data as T;
}
export function AccountScreen() {
  const router = useRouter();
  const [user, setUser] = useState<Actor | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [register, setRegister] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [bookmarks, setBookmarks] = useState<Campaign[]>([]);
  const [drafts, setDrafts] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<
    { id: string; amountIdr: string; status: string }[]
  >([]);
  const [counts, setCounts] = useState<{
    users: number;
    campaigns: number;
  } | null>(null);
  const load = useCallback(async () => {
    try {
      const { user } = await api<{ user: Actor }>("/api/me");
      setUser(user);
      const [publicRows, saved, owned, history] = await Promise.all([
        api<{ items: Campaign[] }>("/api/campaigns"),
        api<{ items: Campaign[] }>("/api/me/bookmarks"),
        api<{ items: Campaign[] }>("/api/me/campaigns"),
        api<{ items: typeof donations }>("/api/me/donations"),
      ]);
      setCampaigns(publicRows.items);
      setBookmarks(saved.items);
      setDrafts(owned.items);
      setDonations(history.items);
      setCounts(
        user.role === "ADMIN" ? await api("/api/admin/overview") : null,
      );
    } catch (e) {
      if ((e as { status?: number }).status !== 401)
        setError((e as Error).message);
      setUser(null);
      setCounts(null);
      setDonations([]);
      setBookmarks([]);
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    // Synchronize external session data; updates occur after network completion.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  async function authenticate(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await api(`/api/auth/${register ? "sign-up" : "sign-in"}/email`, "POST", {
        email: String(form.get("email")),
        password: String(form.get("password")),
        ...(register
          ? {
              name: String(form.get("name")),
              callbackURL: `${window.location.origin}/akun/verifikasi`,
            }
          : {}),
      });
      if (register) {
        setNotice(
          "Jika pendaftaran memenuhi syarat, email verifikasi dikirim. Periksa kotak masuk sebelum masuk ke akun.",
        );
        setRegister(false);
      } else await load();
    } catch {
      setError(
        "Tidak dapat masuk atau mendaftar. Periksa data, pastikan email sudah diverifikasi, lalu coba lagi.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function changeBookmark(campaign: Campaign, saved: boolean) {
    setBusy(true);
    setError("");
    try {
      await api(
        saved ? `/api/me/bookmarks/${campaign.id}` : "/api/me/bookmarks",
        saved ? "DELETE" : "POST",
        saved ? {} : { campaignId: campaign.id },
      );
      await load();
      setNotice(saved ? "Simpanan dihapus." : "Kampanye disimpan ke akun.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function saveDraft(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const input: DraftInput = {
      title: String(form.get("title")),
      category: String(form.get("category")) as DraftInput["category"],
      story: String(form.get("story")),
      location: String(form.get("location")),
      image:
        "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=560&fit=crop&auto=format&q=70",
      targetIdr: String(form.get("targetIdr")),
      durationDays: Number(form.get("durationDays")),
    };
    try {
      await api("/api/campaigns", "POST", input);
      await load();
      setNotice("Draft tersimpan. Pengajuan dan moderasi tersedia pada F3.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <AppShell
      screen="profile"
      navigate={(screen, id) =>
        router.push(
          screen === "profile"
            ? "/akun"
            : id
              ? `/?campaign=${encodeURIComponent(id)}`
              : `/?screen=${screen}`,
        )
      }
    >
      <section className="section">
        <h1 className="page-title">Akun BAMAS</h1>
        <p className="notice">
          Akun pengembangan F2. Data akun disimpan di server, terpisah dari
          donasi SIMULASI F1. Belum ada pembayaran.
        </p>
        <Link href="/" className="button secondary">
          Kembali ke demo F1
        </Link>
        {loading ? (
          <p role="status">Memuat akun…</p>
        ) : !user ? (
          <>
            <div className="chips">
              <button
                aria-pressed={!register}
                onClick={() => setRegister(false)}
              >
                Masuk
              </button>
              <button aria-pressed={register} onClick={() => setRegister(true)}>
                Daftar
              </button>
            </div>
            <form onSubmit={authenticate}>
              {register && (
                <label className="field">
                  Nama
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={100}
                  />
                </label>
              )}
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
              <label className="field">
                Kata sandi
                <input
                  name="password"
                  type="password"
                  autoComplete={register ? "new-password" : "current-password"}
                  required
                  minLength={12}
                  maxLength={128}
                />
              </label>
              <p className="muted">
                Minimal 12 karakter. Gunakan data uji, bukan data pribadi nyata.
              </p>
              <Button className="full" disabled={busy}>
                {busy ? "Memproses…" : register ? "Daftar akun" : "Masuk akun"}
              </Button>
            </form>
            <p>
              <Link href="/akun/lupa-password">Lupa kata sandi?</Link>
            </p>
            <p>
              <Link href="/akun/kirim-verifikasi">
                Kirim ulang email verifikasi
              </Link>
            </p>
          </>
        ) : (
          <>
            <div className="profile-card">
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              <p>Role: {user.role}</p>
            </div>
            <Button
              className="secondary full"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await api("/api/auth/sign-out", "POST", {});
                  setUser(null);
                  setBookmarks([]);
                  setDrafts([]);
                  setDonations([]);
                  setCounts(null);
                  setNotice("Anda sudah keluar.");
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Keluar akun
            </Button>
            <h2 className="account-heading">Kampanye publik</h2>
            {campaigns.length ? (
              campaigns.map((c) => (
                <article className="review-card" key={c.id}>
                  <h3>{c.title}</h3>
                  <p>Target Rp{BigInt(c.targetIdr).toLocaleString("id-ID")}</p>
                  <Button
                    disabled={busy}
                    onClick={() =>
                      changeBookmark(
                        c,
                        bookmarks.some((b) => b.id === c.id),
                      )
                    }
                  >
                    {bookmarks.some((b) => b.id === c.id)
                      ? "Hapus simpanan"
                      : "Simpan kampanye"}
                  </Button>
                </article>
              ))
            ) : (
              <p>Belum ada kampanye aktif di database.</p>
            )}
            <h2 className="account-heading">
              Simpanan akun ({bookmarks.length})
            </h2>
            {bookmarks.map((c) => (
              <p key={c.id}>{c.title}</p>
            ))}
            <h2 className="account-heading">Riwayat akun</h2>
            {donations.length ? (
              donations.map((d) => (
                <p key={d.id}>
                  Rp{BigInt(d.amountIdr).toLocaleString("id-ID")} · {d.status}
                </p>
              ))
            ) : (
              <p>Belum ada donasi server. Riwayat SIMULASI tetap di demo F1.</p>
            )}
            {canCreateCampaign(user) && (
              <>
                <h2 className="account-heading">Draft kampanye</h2>
                {drafts.map((c) => (
                  <article key={c.id} className="review-card">
                    <h3>{c.title}</h3>
                    <p>{c.status}</p>
                  </article>
                ))}
                <form onSubmit={saveDraft}>
                  <label className="field">
                    Judul kampanye
                    <input
                      name="title"
                      required
                      minLength={15}
                      maxLength={150}
                    />
                  </label>
                  <label className="field">
                    Kategori
                    <select name="category">
                      {[
                        "bencana",
                        "pendidikan",
                        "kesehatan",
                        "pangan",
                        "lingkungan",
                        "sosial",
                      ].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    Target dana (Rp)
                    <input
                      name="targetIdr"
                      inputMode="numeric"
                      pattern="[0-9]+"
                      required
                    />
                  </label>
                  <label className="field">
                    Durasi (hari)
                    <input
                      name="durationDays"
                      type="number"
                      min={1}
                      max={365}
                      defaultValue={30}
                      required
                    />
                  </label>
                  <label className="field">
                    Lokasi
                    <input
                      name="location"
                      minLength={3}
                      maxLength={150}
                      required
                    />
                  </label>
                  <label className="field">
                    Cerita
                    <textarea
                      name="story"
                      minLength={50}
                      maxLength={10000}
                      required
                    />
                  </label>
                  <Button className="full" disabled={busy}>
                    Simpan draft
                  </Button>
                </form>
              </>
            )}
            {counts && (
              <section>
                <h2 className="account-heading">Ringkasan admin</h2>
                <p>
                  {counts.users} akun · {counts.campaigns} kampanye database
                </p>
              </section>
            )}
          </>
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
      </section>
    </AppShell>
  );
}
