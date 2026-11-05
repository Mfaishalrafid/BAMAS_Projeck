"use client";
import { useRef, useState } from "react";
import type { Campaign } from "@/features/campaigns/domain/campaign";
import { Button, Empty, Header } from "@/shared/components/ui";
import { rupiah } from "@/shared/lib/money";
import {
  amountError,
  methods,
  type Donation,
  type DonationInput,
} from "../domain/donation";
export function SimulationNotice() {
  return (
    <p className="notice simulation" role="note">
      <b>SIMULASI — bukan transaksi nyata.</b>
      <br />
      Tidak ada dana yang ditagih atau disalurkan.
    </p>
  );
}
export function DonateScreen({
  campaign,
  back,
  submit,
}: {
  campaign?: Campaign;
  back: () => void;
  submit: (input: DonationInput) => void;
}) {
  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<DonationInput["method"] | null>(null);
  const [anonymous, setAnonymous] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const submitted = useRef(false);
  if (!campaign || campaign.status !== "active")
    return (
      <Empty>
        <h1>Kampanye tidak tersedia</h1>
        <Button onClick={back}>Kembali</Button>
      </Empty>
    );
  const next = () => {
    const error =
      step === 0
        ? amountError(amount)
        : !method
          ? "Pilih metode pembayaran simulasi."
          : null;
    if (error) {
      setError(error);
      return;
    }
    setError("");
    setStep((s) => s + 1);
  };
  return (
    <>
      <Header
        title="Donasi"
        back={() => (step ? setStep((s) => s - 1) : back())}
      />
      <div className="section donation-form">
        <SimulationNotice />
        <ol className="steps">
          {["Nominal", "Metode", "Konfirmasi"].map((s, i) => (
            <li
              key={s}
              aria-current={step === i ? "step" : undefined}
              className={step >= i ? "active" : ""}
            >
              {i + 1}. {s}
            </li>
          ))}
        </ol>
        <p className="campaign-summary">
          Untuk <b>{campaign.title}</b>
        </p>
        {step === 0 ? (
          <>
            <h2>Mau berbagi berapa?</h2>
            <div className="amount-options">
              {[10000, 25000, 50000, 100000, 250000, 500000].map((n) => (
                <button
                  key={n}
                  aria-pressed={Number(amount) === n}
                  onClick={() => {
                    setAmount(String(n));
                    setError("");
                  }}
                >
                  {rupiah(n)}
                </button>
              ))}
            </div>
            <label className="field">
              Nominal lainnya (Rp)
              <input
                aria-describedby="amount-help donation-error"
                inputMode="numeric"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
                placeholder="Contoh: 10000"
              />
            </label>
            <p id="amount-help" className="muted">
              Minimal Rp10.000 · maksimal Rp100.000.000
            </p>
            <label className="check-field">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
              />{" "}
              Sembunyikan nama saya (Orang baik)
            </label>
            <label className="field">
              Tulis doa atau dukungan (opsional)
              <textarea
                maxLength={280}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Semoga bantuan ini membawa kebaikan…"
              />
            </label>
          </>
        ) : step === 1 ? (
          <>
            <h2>Pilih metode pembayaran</h2>
            {["QRIS", "E-wallet", "Transfer bank (Virtual Account)"].map(
              (group) => (
                <fieldset key={group} className="method-group">
                  <legend>{group}</legend>
                  {methods
                    .filter((m) => m.group === group)
                    .map((m) => (
                      <label key={m.id} className="method">
                        <span>{m.short}</span>
                        <b>{m.label}</b>
                        <input
                          type="radio"
                          name="method"
                          value={m.id}
                          checked={method === m.id}
                          onChange={() => {
                            setMethod(m.id);
                            setError("");
                          }}
                        />
                      </label>
                    ))}
                </fieldset>
              ),
            )}
          </>
        ) : (
          <>
            <h2>Periksa lagi, ya</h2>
            <dl className="summary">
              {[
                ["Nominal donasi", rupiah(Number(amount))],
                ["Metode", methods.find((m) => m.id === method)?.label],
                ["Nama tampil", anonymous ? "Orang baik" : "Aulia Rahman"],
                ["Biaya admin", "Rp0 — SIMULASI"],
                ["Total simulasi", rupiah(Number(amount))],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            {note && <blockquote className="notice">{note}</blockquote>}
            <p className="muted">
              Ini hanya demonstrasi alur. Jangan mengirim uang ke rekening atau
              kode apa pun.
            </p>
          </>
        )}
        {error && (
          <p id="donation-error" role="alert" className="error">
            {error}
          </p>
        )}
      </div>
      <footer className="sticky-action">
        {step < 2 ? (
          <Button onClick={next}>Lanjut</Button>
        ) : (
          <Button
            className="accent"
            onClick={() => {
              if (submitted.current || !method || amountError(amount)) return;
              submitted.current = true;
              submit({
                campaignId: campaign.id,
                amount: Number(amount),
                method,
                anonymous,
                note: note.trim(),
              });
            }}
          >
            Buat donasi SIMULASI
          </Button>
        )}
      </footer>
    </>
  );
}
export function PaymentScreen({
  donation,
  back,
  pay,
  cancel,
}: {
  donation?: Donation;
  back: () => void;
  pay: () => void;
  cancel: () => void;
}) {
  if (!donation)
    return (
      <Empty>
        <h1>Donasi tidak ditemukan</h1>
        <Button onClick={back}>Kembali</Button>
      </Empty>
    );
  return (
    <>
      <Header title="Pembayaran simulasi" back={back} />
      <section className="section">
        <SimulationNotice />
        <h2>
          {donation.status === "pending"
            ? "Selesaikan simulasimu"
            : donation.status === "paid"
              ? "Simulasi sudah selesai"
              : "Simulasi dibatalkan"}
        </h2>
        <p className="payment-amount">{rupiah(donation.amount)}</p>
        <p>{methods.find((m) => m.id === donation.method)?.label}</p>
        <div className="demo-code">
          <b>DEMO</b>
          <span>{donation.code}</span>
          <p>Bukan QR atau nomor rekening pembayaran.</p>
        </div>
        {donation.status === "pending" && (
          <>
            <Button className="accent full" onClick={pay}>
              Simulasikan pembayaran berhasil
            </Button>
            <Button className="secondary full" onClick={cancel}>
              Batalkan simulasi
            </Button>
          </>
        )}
      </section>
    </>
  );
}
export function SuccessScreen({
  donation,
  home,
  history,
}: {
  donation?: Donation;
  home: () => void;
  history: () => void;
}) {
  return (
    <section className="section success">
      <SimulationNotice />
      <div className="success-mark">✓</div>
      <h1>
        {donation?.status === "paid"
          ? "Terima kasih, orang baik!"
          : "Simulasi belum selesai"}
      </h1>
      <p>Kebaikan kecilmu membawa dampak besar.</p>
      {donation && <p className="payment-amount">{rupiah(donation.amount)}</p>}
      <p>
        Total kampanye dan riwayat demo sudah diperbarui. Tidak ada uang yang
        berpindah.
      </p>
      <Button className="full" onClick={history}>
        Lihat riwayat donasi
      </Button>
      <Button className="secondary full" onClick={home}>
        Kembali ke beranda
      </Button>
    </section>
  );
}
export function HistoryScreen({
  donations,
  campaigns,
  open,
}: {
  donations: Donation[];
  campaigns: Campaign[];
  open: (id: string) => void;
}) {
  const [filter, setFilter] = useState("semua");
  return (
    <section className="section">
      <h1 className="page-title">Donasiku</h1>
      <SimulationNotice />
      <div className="impact">
        <p>Total kebaikanmu · demo</p>
        <strong>
          {rupiah(
            donations
              .filter((d) => d.status === "paid")
              .reduce((s, d) => s + d.amount, 0),
          )}
        </strong>
      </div>
      <div className="chips">
        {[
          ["semua", "Semua"],
          ["paid", "Berhasil"],
          ["pending", "Menunggu"],
          ["cancelled", "Dibatalkan"],
        ].map(([id, label]) => (
          <button
            key={id}
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {donations
        .filter((d) => filter === "semua" || d.status === filter)
        .map((d) => (
          <button
            className="history-item"
            key={d.id}
            onClick={() => open(d.id)}
          >
            <b>
              {campaigns.find((c) => c.id === d.campaignId)?.title ??
                "Kampanye"}
            </b>
            <span>{rupiah(d.amount)}</span>
            <span>
              {d.status === "paid"
                ? "✓ Berhasil"
                : d.status === "pending"
                  ? "◷ Menunggu"
                  : "× Dibatalkan"}{" "}
              · SIMULASI
            </span>
            <small>
              {new Date(d.createdAt).toLocaleDateString("id-ID", {
                timeZone: "Asia/Jakarta",
              })}
            </small>
          </button>
        ))}
      {!donations.some((d) => filter === "semua" || d.status === filter) && (
        <Empty>Belum ada donasi pada kategori ini.</Empty>
      )}
    </section>
  );
}
