"use client";
/* eslint-disable @next/next/no-img-element -- Reference images already specify upstream size. */
import { useRef, useState } from "react";
import fixtures from "../infrastructure/fixtures.json";
import {
  campaignInputSchema,
  type CampaignInput,
} from "../application/create-campaign";
import { Button, Header } from "@/shared/components/ui";
import { SimulationNotice } from "@/features/donations/presentation/donation-screens";
import { rupiah } from "@/shared/lib/money";
export function CreateScreen({
  back,
  submit,
}: {
  back: () => void;
  submit: (input: CampaignInput) => void;
}) {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [days, setDays] = useState("60");
  const [location, setLocation] = useState("Bandung, Jawa Barat");
  const [image, setImage] = useState(fixtures.campaigns[0].image);
  const [story, setStory] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const submitted = useRef(false);
  const next = () => {
    const input = {
      title,
      category,
      target: Number(target),
      days: Number(days),
      location,
      image,
      story,
      agree,
    };
    const result = campaignInputSchema.safeParse(input);
    const fields = [
      ["category", "title"],
      ["target", "days", "location"],
      ["image", "story"],
      ["agree"],
    ][step];
    const issue = !result.success
      ? result.error.issues.find((i) => fields.includes(String(i.path[0])))
      : undefined;
    if (issue) {
      setError(issue.message);
      return;
    }
    setError("");
    if (step < 3) setStep((s) => s + 1);
    else if (result.success && !submitted.current) {
      submitted.current = true;
      submit(result.data);
    }
  };
  return (
    <>
      <Header
        title="Galang dana"
        back={() => (step ? setStep((s) => s - 1) : back())}
      />
      <section className="section">
        <SimulationNotice />
        <ol className="steps">
          {["Kategori", "Target", "Cerita", "Tinjau"].map((s, i) => (
            <li
              key={s}
              className={step >= i ? "active" : ""}
              aria-current={step === i ? "step" : undefined}
            >
              {i + 1}. {s}
            </li>
          ))}
        </ol>
        {step === 0 ? (
          <>
            <h2>Siapa yang ingin kamu bantu?</h2>
            <div className="category-options">
              {fixtures.categories.map((c) => (
                <button
                  className={c.block}
                  key={c.id}
                  aria-pressed={category === c.id}
                  onClick={() => {
                    setCategory(c.id);
                    setError("");
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <label className="field">
              Judul kampanye
              <input
                value={title}
                maxLength={150}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ceritakan tujuan bantuanmu"
              />
            </label>
            <p className="muted">Minimal 15 karakter.</p>
          </>
        ) : step === 1 ? (
          <>
            <h2>Tentukan target bantuan</h2>
            <label className="field">
              Target dana (Rp)
              <input
                inputMode="numeric"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="1000000"
              />
            </label>
            <label className="field">
              Durasi (hari)
              <input
                type="number"
                min={1}
                max={365}
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />
            </label>
            <label className="field">
              Lokasi penerima manfaat
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </label>
          </>
        ) : step === 2 ? (
          <>
            <h2>Ceritakan kebutuhan mereka</h2>
            <p className="muted">Pilih foto dari koleksi demo.</p>
            <div className="image-options">
              {fixtures.campaigns.slice(0, 6).map((c) => (
                <button
                  key={c.id}
                  aria-label={`Pilih foto ${c.category}`}
                  aria-pressed={image === c.image}
                  onClick={() => setImage(c.image)}
                >
                  <img src={c.image} alt="" width={160} height={100} />
                </button>
              ))}
            </div>
            <label className="field">
              Cerita kampanye
              <textarea
                value={story}
                maxLength={10000}
                onChange={(e) => setStory(e.target.value)}
              />
            </label>
            <p className="muted">
              Minimal 50 karakter · {story.trim().length} karakter
            </p>
          </>
        ) : (
          <>
            <h2>Periksa kampanyemu</h2>
            <div className="review-preview">
              <img
                src={image}
                alt="Foto kampanye pilihan"
                width={800}
                height={560}
              />
              <h3>{title}</h3>
              <p>
                {location} · {days} hari
              </p>
              <b>{rupiah(Number(target))}</b>
              <p>{story}</p>
            </div>
            <label className="check-field">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              Saya menyatakan informasi ini benar dan bersedia melaporkan
              penggunaan dana secara berkala.
            </label>
            <p className="notice">
              Pengajuan hanya simulasi. Kampanye menunggu review admin demo;
              tidak dipublikasikan ke layanan nyata.
            </p>
          </>
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
      </section>
      <footer className="sticky-action">
        <Button className={step === 3 ? "accent" : ""} onClick={next}>
          {step === 3 ? "Ajukan kampanye SIMULASI" : "Lanjut"}
        </Button>
      </footer>
    </>
  );
}
