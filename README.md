# BAMAS_Projeck
Aplikasi penggalangan dana, untuk membantu masyarakat.

Status: F2 — PostgreSQL/Prisma dan akun server dengan RBAC tersedia untuk development lokal. Frontend F1 tetap SIMULASI; belum ada pembayaran nyata. Repository ini meneruskan repository asli, bukan pengganti.

- [Instruksi agent](AGENTS.md)
- [Audit handover](docs/PR0_AUDIT.md) dan [F0 Migoo](docs/AUDIT_BAMAS.md)
- [Arsitektur](docs/ARCHITECTURE.md), [roadmap F1–F5](docs/MIGRATION_ROADMAP.md)
- [ADR stack](docs/adr/0001-stack-and-boundaries.md), [ADR demo/rilis](docs/adr/0002-staged-payments-and-delivery.md)
- [Referensi HTML asli](reference/BAMAS-desain-aplikasi-donasi.html)

## Pemeriksaan PR-0
Jalankan `python3 scripts/check_docs.py` dan `git diff --check`. CI menjalankan pemeriksaan yang sama pada pull request dan push feature branch. Tidak membutuhkan secrets. Tooling frontend tersedia sejak PR-1; lihat perintah pengembangan di bawah.

## Kontribusi dan rilis
Gunakan feature branch dan PR; jangan push ke main atau merge otomatis. Pertahankan desain dan frame ponsel desktop. Jangan commit secrets. F1 hanya SIMULASI; production deployment memerlukan security review dan persetujuan pemilik. Tidak ada pipeline deploy aktif pada PR-0.

## Pengembangan F1
Node.js 24 LTS dan npm. Jalankan `npm ci`, lalu `npm run dev` dan buka http://localhost:3000.
Pemeriksaan: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
`npm start` menjalankan build production secara lokal; ini bukan izin deployment.
Semua data F1 bersifat demo. Tidak ada uang yang ditagih atau disalurkan. Admin demo terbuka untuk mencoba alur; bukan autentikasi produksi.


## Browser, aksesibilitas dan review
Setelah `npm run build`, jalankan `npx playwright install chromium` lalu `npm run test:e2e`. Suite memakai production server **lokal** port 3001. CI menginstal browser/dependensi lalu menjalankan suite yang sama. `npm run format:check` memeriksa source yang dikelola.

`npm start -- --port 3001` dan `npm run audit:browser -- current` menghasilkan screenshot serta JSON pengukuran di `artifacts/` (diabaikan Git). Aset gambar Unsplash memerlukan jaringan; error/kelambatan eksternal bukan bukti backend BAMAS bermasalah.

Data tersimpan di key `bamas-f1-simulation-v1` pada browser. Gunakan Profil → Reset data demo untuk kembali ke fixture awal. Data ini dapat diubah pengguna dan tidak boleh dijadikan ledger. Jangan masukkan data pribadi nyata ke formulir demo.

Lihat [progres F1](docs/F1_PROGRESS.md) dan [laporan QA F1](docs/F1_QA.md). PR disusun bertingkat, tanpa auto-merge. F2 diotorisasi pada 2026-11-07; F3 belum dimulai.

## Backend F2
Lihat [setup dan kontrak API F2](docs/F2_SETUP.md), [ADR autentikasi](docs/adr/0003-f2-database-auth.md), dan [QA F2](docs/F2_QA.md). Login tersedia di `/akun`; akun baru DONOR. Verifikasi email dan reset password tersedia melalui SMTP. Penggunaan publik membutuhkan konfigurasi provider/domain serta pengujian penerimaan email; belum ada deployment. Lihat [QA pelengkap F2](docs/F2_EMAIL_QA.md).

## Preview iPhone
Untuk preview F1 tanpa layanan backend, lihat [panduan preview iPhone](docs/IPHONE_PREVIEW.md). Aktifkan `NEXT_PUBLIC_BAMAS_DEMO_ONLY=true` saat build dan runtime pada proyek preview terpisah.
