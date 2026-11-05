"use client";
import { useEffect, useState } from "react";
import { Logo, Button } from "./ui";
import { Icon } from "./icon";
export const navigation = [
  ["home", "Beranda", "home"],
  ["explore", "Jelajah", "search"],
  ["create", "Galang", "plus"],
  ["history", "Donasiku", "book"],
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
      <aside className="intro">
        <Logo />
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
          <p className="eyebrow">Jelajahi layar</p>
          {[
            ["home", "Beranda", "Kampanye unggulan, kategori, mendesak"],
            ["explore", "Jelajah", "Cari, filter kategori, urutkan"],
            ["detail", "Detail kampanye", "Progres dana, cerita, kabar, doa"],
            ["donate", "Donasi", "Nominal, metode, doa"],
            ["history", "Riwayat", "Lacak donasi kamu"],
            ["create", "Galang dana", "Buat kampanye baru"],
            ["profile", "Profil", "Kampanye dan simpanan"],
            ["admin", "Admin", "Moderasi kampanye demo"],
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
            <main id="main-content" className="phone-content" key={screen}>
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
        <p className="eyebrow">Identitas visual</p>
        <h2>
          Hangat. Terbuka.
          <br />
          Penuh harapan.
        </h2>
        <p>Warna</p>
        <div className="swatches">
          {["ink", "magenta", "lime", "lilac", "coral", "mint"].map((c) => (
            <span key={c} className={`bg-${c}`} title={c} />
          ))}
        </div>
        <p>Tipografi</p>
        <h2>Bricolage Grotesque</h2>
        <p>Judul & angka · 500–700</p>
        <b>Plus Jakarta Sans</b>
        <p>Teks & UI · 400–700 · dibuat di Indonesia</p>
        <p className="eyebrow">Prinsip</p>
        <ul>
          <li>Tombol selalu berbentuk pil, satu aksi utama per layar.</li>
          <li>Warna pastel menandai kategori, bukan dekorasi acak.</li>
          <li>Status selalu ikon + teks, tidak hanya warna.</li>
        </ul>
        <p>
          <kbd>Esc</kbd> kembali
        </p>
        <p className="notice">SIMULASI — bukan transaksi nyata.</p>
      </aside>
    </div>
  );
}
