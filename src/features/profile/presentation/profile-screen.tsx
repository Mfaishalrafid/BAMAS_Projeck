"use client";
import { useState } from "react";
import type { Campaign } from "@/features/campaigns/domain/campaign";
import type { Donation } from "@/features/donations/domain/donation";
import { Button, Header, Empty } from "@/shared/components/ui";
import {
  CampaignCard,
  type CampaignNavigation,
} from "@/features/campaigns/presentation/campaign-screens";
import { SimulationNotice } from "@/features/donations/presentation/donation-screens";
import { rupiah } from "@/shared/lib/money";
export function ProfileScreen({
  campaigns,
  donations,
  saved,
  navigate,
  reset,
}: {
  campaigns: Campaign[];
  donations: Donation[];
  saved: string[];
  navigate: CampaignNavigation;
  reset: () => void;
}) {
  const [showSaved, setShowSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [notice, setNotice] = useState("");
  return (
    <section className="section">
      <h1 className="page-title">Profil</h1>
      <SimulationNotice />
      <div className="profile-card">
        <div className="avatar">AR</div>
        <h2>Aulia Rahman</h2>
        <p>Akun demo · Orang Baik · Level 2</p>
        <strong>
          {rupiah(
            donations
              .filter((d) => d.status === "paid")
              .reduce((s, d) => s + d.amount, 0),
          )}
        </strong>
        <p>Total donasi simulasi</p>
      </div>
      <div className="profile-menu">
        <button onClick={() => navigate("myCampaigns")}>
          Kampanye saya <span>→</span>
        </button>
        <button
          onClick={() => setShowSaved(!showSaved)}
          aria-expanded={showSaved}
        >
          Tersimpan ({saved.length}) <span>→</span>
        </button>
        <button onClick={() => navigate("history")}>
          Riwayat donasi <span>→</span>
        </button>
        <button onClick={() => navigate("admin")}>
          Dashboard admin demo <span>→</span>
        </button>
        <button
          onClick={() =>
            setNotice("Notifikasi demo: belum ada notifikasi baru.")
          }
        >
          Notifikasi <span>→</span>
        </button>
        <button
          onClick={() =>
            setNotice(
              "Pengaturan akun tersedia setelah autentikasi pada F2. Saat ini profil menggunakan identitas demo.",
            )
          }
        >
          Pengaturan <span>→</span>
        </button>
        <button onClick={() => setConfirmReset(true)}>
          Reset data demo <span>↻</span>
        </button>
      </div>
      {notice && (
        <p role="status" className="notice">
          {notice}
        </p>
      )}
      {confirmReset && (
        <div className="notice">
          <h2>Reset data demo?</h2>
          <p>
            Donasi, kampanye dan simpanan lokal akan kembali ke contoh awal.
          </p>
          <div className="row-actions">
            <Button
              onClick={() => {
                reset();
                setConfirmReset(false);
                setNotice("Data demo telah direset.");
              }}
            >
              Ya, reset demo
            </Button>
            <Button
              className="secondary"
              onClick={() => setConfirmReset(false)}
            >
              Batal
            </Button>
          </div>
        </div>
      )}
      {showSaved && (
        <section>
          <h2>Kampanye tersimpan</h2>
          {saved.length ? (
            campaigns
              .filter((c) => saved.includes(c.id))
              .map((c) => (
                <CampaignCard key={c.id} campaign={c} navigate={navigate} />
              ))
          ) : (
            <Empty>Belum ada kampanye tersimpan.</Empty>
          )}
        </section>
      )}
    </section>
  );
}
export function MyCampaignsScreen({
  campaigns,
  navigate,
  back,
}: {
  campaigns: Campaign[];
  navigate: CampaignNavigation;
  back: () => void;
}) {
  const mine = campaigns.filter((c) => c.mine);
  return (
    <>
      <Header title="Kampanye saya" back={back} />
      <section className="section">
        <SimulationNotice />
        <Button className="full" onClick={() => navigate("create")}>
          Buat kampanye baru
        </Button>
        {mine.length ? (
          mine.map((c) => (
            <article className="review-card" key={c.id}>
              <h2>{c.title}</h2>
              <p className="notice">
                {c.status === "active"
                  ? "✓ Aktif"
                  : c.status === "review"
                    ? "◷ Menunggu verifikasi"
                    : "× Ditolak"}{" "}
                · demo
              </p>
              {c.status === "active" && (
                <Button onClick={() => navigate("detail", c.id)}>
                  Lihat kampanye
                </Button>
              )}
            </article>
          ))
        ) : (
          <Empty>
            <h2>Belum ada kampanye</h2>
            <p>Mulai galang dana untuk mereka yang membutuhkan.</p>
          </Empty>
        )}
      </section>
    </>
  );
}
