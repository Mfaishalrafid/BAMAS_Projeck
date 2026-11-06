"use client";
import { useEffect, useRef, useState } from "react";
import { Logo, Button } from "./ui";
import { Icon } from "./icon";
export const navigation = [
  ["home", "Beranda", "home"],
  ["explore", "Jelajah", "compass"],
  ["create", "Galang", "plus"],
  ["history", "Donasiku", "receipt"],
  ["profile", "Profil", "user"],
];
export function AppShell({
  children,
  screen,
  navigate,
}: {
  children: React.ReactNode;
  screen: string;
  navigate: (screen: string, id?: string) => void;
}) {
  const mainRef = useRef<HTMLElement>(null);
  const previousScreen = useRef(screen);
  useEffect(() => {
    if (previousScreen.current !== screen) {
      mainRef.current?.focus({ preventScroll: true });
      mainRef.current?.scrollTo(0, 0);
      previousScreen.current = screen;
    }
  }, [screen]);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const resize = () =>
      setScale(Math.min(1, Math.max(0.6, (innerHeight - 48) / 868)));
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  return (
    <div className="desktop-layout">
      <a className="skip-link" href="#main-content">
        Lewati ke aplikasi
      </a>
      <aside className="intro">
        <div className="desktop-brand">
          <Logo />
          <p>Bantu Masyarakat</p>
        </div>
        <p className="eyebrow magenta">
          Desain aplikasi · prototipe interaktif v1
        </p>
        <h1>
          Donasi yang terasa
          <br />
          <mark>ringan & ceria.</mark>
        </h1>
        <p>
          Aplikasi galang dana terbuka: siapa pun bisa membuat kampanye,
          berdonasi lewat QRIS, e-wallet, atau virtual account, dan memantau
          penyaluran secara transparan.
        </p>
        <p>
          Klik ponsel di samping — <b>semua layar bisa dicoba.</b>
        </p>
        <section className="screen-map">
          <p className="eyebrow">Lompat ke layar</p>
          {[
            ["home", "Beranda", "Kampanye unggulan, kategori, mendesak"],
            ["explore", "Jelajah", "Cari, filter kategori, urutkan"],
            ["detail", "Detail kampanye", "Progres dana, cerita, kabar, doa"],
            ["donate", "Alur donasi", "Nominal → metode → konfirmasi → bayar"],
            ["history", "Riwayat donasi", "Total kebaikan & status transaksi"],
            ["profile", "Profil donatur", "Level, tersimpan, pengaturan"],
            ["create", "Galang dana", "Form 4 langkah dengan validasi"],
            ["admin", "Dashboard admin", "KPI, grafik, verifikasi kampanye"],
          ].map(([id, label, desc], i) => (
            <button
              key={id}
              aria-current={screen === id ? "page" : undefined}
              onClick={() =>
                navigate(
                  id,
                  ["detail", "donate"].includes(id)
                    ? "banjir-garut"
                    : undefined,
                )
              }
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <b>{label}</b>
                <small>{desc}</small>
              </div>
              <span>↗</span>
            </button>
          ))}
        </section>
        <section className="try-card">
          <p className="eyebrow">Coba sendiri</p>
          <h2>Rasakan alur donasi lengkap dalam 30 detik.</h2>
          <p>
            SIMULASI — bukan transaksi nyata. Semua data demo tersimpan di
            perangkatmu.
          </p>
          <Button onClick={() => navigate("donate", "banjir-garut")}>
            Mulai donasi →
          </Button>{" "}
          <Button className="secondary" onClick={() => navigate("admin")}>
            Buka dashboard admin
          </Button>
        </section>
      </aside>
      <div
        className="phone-holder"
        style={{ "--phone-scale": scale } as React.CSSProperties}
      >
        <div className="phone-frame">
          <div className="phone-screen">
            <div className="phone-status" aria-hidden="true">
              <b>9:41</b>
              <span className="camera" />
              <span>▮▮▮ ◉ ▰</span>
            </div>
            <main
              id="main-content"
              className="phone-content"
              key={screen}
              ref={mainRef}
              tabIndex={-1}
              aria-label="Aplikasi BAMAS"
            >
              {children}
            </main>
            {[
              "home",
              "explore",
              "create",
              "history",
              "profile",
              "myCampaigns",
            ].includes(screen) && (
              <nav className="bottom-nav" aria-label="Navigasi utama">
                {navigation.map(([id, label, icon]) => (
                  <button
                    key={id}
                    aria-current={screen === id ? "page" : undefined}
                    onClick={() => navigate(id)}
                    className={id === "create" ? "create-nav" : ""}
                  >
                    <span>
                      <Icon name={icon} />
                    </span>
                    {label}
                  </button>
                ))}
              </nav>
            )}
          </div>
        </div>
      </div>
      <aside className="design-notes">
        <p className="eyebrow">Palet warna</p>
        <div className="swatches">
          {[
            ["ink", "Tinta", "CTA utama, teks"],
            ["magenta", "Magenta", "Aksen & donasi"],
            ["lime", "Lime", "Sukses, sorotan"],
            ["lilac", "Lilac", "Level, QRIS"],
            ["coral", "Coral", "Bencana, darurat"],
            ["mint", "Mint", "Air, keamanan"],
            ["cream", "Cream", "Pangan, tips"],
            ["blush", "Blush", "Kesehatan"],
          ].map(([id, label, hint]) => (
            <div key={id}>
              <span className={`bg-${id}`} />
              <b>{label}</b>
              <small>{hint}</small>
            </div>
          ))}
        </div>
        <p className="eyebrow">Tipografi</p>
        <div className="type-card">
          <section>
            <strong className="display-sample">Aa</strong>
            <b>Bricolage Grotesque</b>
            <small>Judul & angka · 500–700</small>
          </section>
          <section>
            <strong>Aa</strong>
            <b>Plus Jakarta Sans</b>
            <small>Teks & UI · 400–700 · dibuat di Indonesia</small>
          </section>
        </div>
        <p className="eyebrow">Komponen</p>
        <div className="component-card">
          <div>
            <span className="button">Utama</span>
            <span className="button accent">Donasi</span>
            <span className="button secondary">Sekunder</span>
          </div>
          <p>
            <span className="badge bg-coral">BENCANA</span>{" "}
            <span className="badge bg-lime">PENDIDIKAN</span>{" "}
            <span className="badge urgent">MENDESAK</span>
          </p>
          <div className="progress">
            <span style={{ width: "64%" }} />
          </div>
        </div>
        <p className="eyebrow">Prinsip</p>
        <ul>
          <li>Tombol selalu berbentuk pil, satu aksi utama per layar.</li>
          <li>Warna pastel menandai kategori, bukan dekorasi acak.</li>
          <li>Status selalu ikon + teks, tidak hanya warna.</li>
        </ul>
        <p>
          <kbd>Esc</kbd> kembali　 <kbd>/</kbd> cari (di Jelajah)
        </p>
        <p className="notice">SIMULASI — bukan transaksi nyata.</p>
      </aside>
    </div>
  );
}
