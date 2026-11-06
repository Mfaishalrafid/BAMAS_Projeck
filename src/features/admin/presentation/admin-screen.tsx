"use client";
import { useState } from "react";
import type { Campaign } from "@/features/campaigns/domain/campaign";
import type { Donation } from "@/features/donations/domain/donation";
import { Button, Header } from "@/shared/components/ui";
import { SimulationNotice } from "@/features/donations/presentation/donation-screens";
import { rupiah, compactRupiah } from "@/shared/lib/money";
export function AdminScreen({
  campaigns,
  donations,
  back,
  review,
}: {
  campaigns: Campaign[];
  donations: Donation[];
  back: () => void;
  review: (id: string, approve: boolean) => void;
}) {
  const [message, setMessage] = useState("");
  const pending = campaigns.filter((c) => c.status === "review");
  const active = campaigns.filter((c) => c.status === "active");
  const bars = [38.2, 52.6, 61.4, 74.9, 45.3, 58.8, 41.7];
  return (
    <>
      <Header title="Dashboard admin" back={back} />
      <section className="section">
        <SimulationNotice />
        <p className="notice">
          Mode admin demo terbuka untuk mencoba alur. Belum ada autentikasi atau
          pembatasan akses produksi.
        </p>
        <div className="kpi-grid">
          {[
            [
              "Dana terkumpul",
              compactRupiah(active.reduce((s, c) => s + c.raised, 0)),
            ],
            [
              "Total donatur",
              active.reduce((s, c) => s + c.donors, 0).toLocaleString("id-ID"),
            ],
            ["Kampanye aktif", String(active.length)],
            ["Perlu verifikasi", String(pending.length)],
          ].map(([label, value]) => (
            <div key={label}>
              <p>{label}</p>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        <section className="chart-card">
          <h2>Donasi 7 hari terakhir</h2>
          <p className="muted">Ilustrasi data demo · juta rupiah</p>
          <div
            className="bars"
            role="img"
            aria-label="Grafik contoh: Kamis 38,2; Jumat 52,6; Sabtu 61,4; Minggu 74,9; Senin 45,3; Selasa 58,8; hari ini 41,7 juta rupiah."
          >
            {bars.map((v, i) => (
              <div key={i}>
                <span style={{ height: `${v}px` }} />
                <small>
                  {["Kam", "Jum", "Sab", "Min", "Sen", "Sel", "Hari ini"][i]}
                </small>
              </div>
            ))}
          </div>
        </section>
        <h2>Verifikasi kampanye ({pending.length})</h2>
        {message && (
          <p role="status" className="notice">
            {message}
          </p>
        )}
        {pending.length === 0 && (
          <p className="notice">
            Semua beres. Tidak ada kampanye menunggu verifikasi.
          </p>
        )}
        {pending.map((c) => (
          <article className="review-card" key={c.id}>
            <h3>{c.title}</h3>
            <p>
              {c.organizer} · {c.location}
            </p>
            <p>Target {rupiah(c.target)}</p>
            <details>
              <summary>Lihat cerita</summary>
              {c.story.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </details>
            <div className="row-actions">
              <Button
                onClick={() => {
                  review(c.id, true);
                  setMessage(`Disetujui: ${c.title}`);
                }}
              >
                Setujui
              </Button>
              <Button
                className="secondary"
                onClick={() => {
                  review(c.id, false);
                  setMessage(`Ditolak: ${c.title}`);
                }}
              >
                Tolak
              </Button>
            </div>
          </article>
        ))}
        <h2>Transaksi terbaru · demo</h2>
        {donations.slice(0, 5).map((d) => (
          <div className="history-item" key={d.id}>
            <b>{d.anonymous ? "Orang baik" : "Aulia Rahman"}</b>
            <span>
              {rupiah(d.amount)} ·{" "}
              {d.status === "paid"
                ? "Berhasil"
                : d.status === "pending"
                  ? "Menunggu"
                  : "Dibatalkan"}
            </span>
          </div>
        ))}
      </section>
    </>
  );
}
