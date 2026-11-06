"use client";
/* Images retain the reference Unsplash URL sizing; no Next image proxy in F1. */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import type { Campaign } from "../domain/campaign";
import { findCampaigns, progress } from "../domain/campaign";
import fixtures from "../infrastructure/fixtures.json";
import { rupiah, compactRupiah } from "@/shared/lib/money";
import { Button, Empty, IconButton, Logo } from "@/shared/components/ui";
import { Icon } from "@/shared/components/icon";
export type CampaignNavigation = (screen: string, id?: string) => void;
export function Category({ id }: { id: string }) {
  const c = fixtures.categories.find((c) => c.id === id);
  return <span className={`badge ${c?.block}`}>{c?.label ?? id}</span>;
}
export function Progress({ campaign: c }: { campaign: Campaign }) {
  return (
    <>
      <div
        className="progress"
        role="progressbar"
        aria-label="Progres donasi"
        aria-valuenow={progress(c)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${progress(c)}%` }} />
      </div>
      <div className="amount-row">
        <span>
          <strong>{compactRupiah(c.raised)}</strong> dari{" "}
          {compactRupiah(c.target)}
        </span>
        <b>{progress(c)}%</b>
      </div>
    </>
  );
}
export function CampaignCard({
  campaign: c,
  navigate,
}: {
  campaign: Campaign;
  navigate: CampaignNavigation;
}) {
  return (
    <button className="campaign-card" onClick={() => navigate("detail", c.id)}>
      <img src={c.image} alt="" loading="lazy" width="800" height="560" />
      <div>
        <Category id={c.category} />
        <h3>{c.title}</h3>
        <p className="muted">
          {c.organizer} {c.verified && "✓"}
        </p>
        <Progress campaign={c} />
        <div className="amount-row">
          <span>{c.donors.toLocaleString("id-ID")} orang baik</span>
          <span>{c.daysLeft} hari lagi</span>
        </div>
      </div>
    </button>
  );
}
export function HomeScreen({
  campaigns,
  navigate,
}: {
  campaigns: Campaign[];
  navigate: CampaignNavigation;
}) {
  const active = campaigns.filter((c) => c.status === "active");
  const featured = active.find((c) => c.id === "banjir-garut") ?? active[0];
  const [notice, setNotice] = useState(false);
  return (
    <div className="home-screen">
      <header className="home-header">
        <Logo />
        <span className="location">
          <Icon name="pin" /> Bandung
        </span>
        <IconButton
          label="Notifikasi"
          icon="bell"
          onClick={() => setNotice(!notice)}
        />
      </header>
      {notice && (
        <p role="status" className="notice">
          Belum ada notifikasi baru.
        </p>
      )}
      <section className="greeting">
        <p className="muted">Halo, Aulia</p>
        <h1>
          Kebaikan kecil,
          <br />
          <span>
            dampak besar.
            <svg
              aria-hidden="true"
              viewBox="0 0 200 10"
              preserveAspectRatio="none"
            >
              <path
                d="M2 7c40-5 90-6 196-2"
                stroke="var(--color-accent)"
                strokeWidth="3.5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>
      </section>
      <button className="search-trigger" onClick={() => navigate("explore")}>
        <Icon name="search" /> Cari kampanye, lembaga, atau lokasi…
      </button>
      <div className="categories">
        {fixtures.categories.map((c, i) => (
          <button key={c.id} onClick={() => navigate("explore", c.id)}>
            <span className={c.block}>
              <Icon
                name={["waves", "book", "health", "food", "water", "social"][i]}
              />
            </span>
            {c.label.split(" ")[0]}
          </button>
        ))}
      </div>
      {featured && (
        <section className="featured">
          <div className="amount-row">
            <span className="eyebrow">● Darurat bencana</span>
            <b>{featured.daysLeft} hari lagi</b>
          </div>
          <button
            className="image-button"
            onClick={() => navigate("detail", featured.id)}
          >
            <img
              src={featured.image}
              alt={featured.title}
              width="800"
              height="560"
              fetchPriority="high"
            />
          </button>
          <h2>{featured.title}</h2>
          <p>{featured.organizer} ✓</p>
          <Progress campaign={featured} />
          <Button onClick={() => navigate("donate", featured.id)}>
            Donasi sekarang
          </Button>
        </section>
      )}
      <section className="section">
        <div className="section-title">
          <h2>Butuh bantuan segera</h2>
          <button onClick={() => navigate("explore")}>Lihat semua →</button>
        </div>
        {active
          .filter((c) => c.urgent && c.id !== featured?.id)
          .map((c) => (
            <CampaignCard key={c.id} campaign={c} navigate={navigate} />
          ))}
      </section>
      <section className="impact">
        <h2>Kebaikan kita, sejauh ini.</h2>
        <strong>{rupiah(active.reduce((s, c) => s + c.raised, 0))}</strong>
        <p>
          terkumpul dari{" "}
          {active.reduce((s, c) => s + c.donors, 0).toLocaleString("id-ID")}{" "}
          orang baik · data demo
        </p>
      </section>
      <section className="section">
        <h2>Pilihan untukmu</h2>
        {active
          .filter((c) => !c.urgent)
          .map((c) => (
            <CampaignCard key={c.id} campaign={c} navigate={navigate} />
          ))}
      </section>
    </div>
  );
}
export function ExploreScreen({
  campaigns,
  navigate,
  initial = "semua",
}: {
  campaigns: Campaign[];
  navigate: CampaignNavigation;
  initial?: string;
}) {
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        event.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) &&
        !target.isContentEditable
      ) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const [category, setCategory] = useState(initial);
  const [sort, setSort] = useState("mendesak");
  const results = findCampaigns(campaigns, query, category, sort);
  return (
    <section className="section explore">
      <h1>Jelajah</h1>
      <label className="search-trigger">
        <Icon name="search" />
        <input
          ref={searchRef}
          aria-label="Cari kampanye"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari kampanye…"
        />
      </label>
      <div className="chips">
        {[{ id: "semua", label: "Semua" }, ...fixtures.categories].map((c) => (
          <button
            key={c.id}
            aria-pressed={category === c.id}
            onClick={() => setCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="section-title">
        <span role="status">{results.length} kampanye</span>
        <select
          aria-label="Urutkan kampanye"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="mendesak">Paling mendesak</option>
          <option value="hampir">Hampir tercapai</option>
          <option value="terbaru">Terbaru</option>
        </select>
      </div>
      {results.length ? (
        results.map((c) => (
          <CampaignCard key={c.id} campaign={c} navigate={navigate} />
        ))
      ) : (
        <Empty>
          <h2>Kampanye tidak ditemukan</h2>
          <p>Coba kata kunci atau kategori lain.</p>
          <Button
            onClick={() => {
              setQuery("");
              setCategory("semua");
            }}
          >
            Reset filter
          </Button>
        </Empty>
      )}
    </section>
  );
}
export function DetailScreen({
  campaign: c,
  navigate,
  back,
  saved,
  toggleSave,
}: {
  campaign?: Campaign;
  navigate: CampaignNavigation;
  back: () => void;
  saved: boolean;
  toggleSave: () => void;
}) {
  const [tab, setTab] = useState("Cerita");
  const [message, setMessage] = useState("");
  if (!c)
    return (
      <Empty>
        <h1>Kampanye tidak ditemukan</h1>
        <Button onClick={back}>Kembali</Button>
      </Empty>
    );
  return (
    <article className="detail">
      <div className="detail-image">
        <img src={c.image} alt={c.title} width="800" height="560" />
        <div className="image-actions">
          <IconButton label="Kembali" icon="back" onClick={back} />
          <span />
          <IconButton
            label="Bagikan"
            icon="share"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(
                  `${location.origin}/?campaign=${encodeURIComponent(c.id)}`,
                );
                setMessage("Tautan kampanye disalin");
              } catch {
                setMessage(
                  "Tidak dapat menyalin tautan. Silakan salin alamat browser.",
                );
              }
            }}
          />
          <IconButton
            label={saved ? "Hapus dari simpanan" : "Simpan"}
            icon="heart"
            aria-pressed={saved}
            onClick={toggleSave}
          />
        </div>
      </div>
      <div className="detail-body">
        <Category id={c.category} />
        {c.urgent && <span className="badge urgent">Mendesak</span>}
        <h1>{c.title}</h1>
        <p className="muted">⌖ {c.location}</p>
        {message && <p role="status">{message}</p>}
        <Progress campaign={c} />
        <div className="amount-row">
          <span>{c.donors.toLocaleString("id-ID")} donatur</span>
          <span>{c.daysLeft} hari lagi</span>
        </div>
        <div className="organizer">
          <Icon name="shield" />
          <div>
            <b>{c.organizer}</b>
            <p>
              {c.verified ? "Penggalang terverifikasi" : "Penggalang dana"} ·
              demo
            </p>
          </div>
        </div>
        <div className="chips" aria-label="Informasi kampanye">
          {["Cerita", "Kabar", "Doa"].map((t) => (
            <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
        <div className="story">
          {tab === "Cerita" ? (
            c.story.map((p) => <p key={p}>{p}</p>)
          ) : tab === "Kabar" ? (
            c.updates.length ? (
              c.updates.map((u) => (
                <section key={u.title}>
                  <small>{u.date}</small>
                  <h2>{u.title}</h2>
                  <p>{u.body}</p>
                </section>
              ))
            ) : (
              <p>Belum ada kabar terbaru.</p>
            )
          ) : c.supporters.length ? (
            c.supporters.map((s, i) => (
              <section key={i}>
                <b>{s.name}</b>
                <p>
                  {rupiah(s.amount)} · {s.ago}
                </p>
                {s.note && <p>{s.note}</p>}
              </section>
            ))
          ) : (
            <p>Belum ada doa.</p>
          )}
        </div>
      </div>
      <footer className="sticky-action">
        <Button className="accent" onClick={() => navigate("donate", c.id)}>
          Donasi sekarang
        </Button>
      </footer>
    </article>
  );
}
