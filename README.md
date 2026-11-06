# BAMAS_Projeck
Aplikasi penggalangan dana, untuk membantu masyarakat.

Status: F1 — fondasi Next.js tersedia; migrasi layar bertahap. Belum ada backend, autentikasi atau pembayaran nyata. Repository ini meneruskan repository asli, bukan pengganti.

- [Instruksi agent](AGENTS.md)
- [Audit handover](docs/PR0_AUDIT.md) dan [F0 Migoo](docs/AUDIT_BAMAS.md)
- [Arsitektur](docs/ARCHITECTURE.md), [roadmap F1–F5](docs/MIGRATION_ROADMAP.md)
- [ADR stack](docs/adr/0001-stack-and-boundaries.md), [ADR demo/rilis](docs/adr/0002-staged-payments-and-delivery.md)
- [Referensi HTML asli](reference/BAMAS-desain-aplikasi-donasi.html)

## Pemeriksaan PR-0
Jalankan `python3 scripts/check_docs.py` dan `git diff --check`. CI menjalankan pemeriksaan yang sama pada pull request dan push feature branch. Tidak membutuhkan secrets. Tooling frontend tersedia sejak PR-1; lihat perintah pengembangan di bawah.

## Kontribusi dan rilis
Gunakan feature branch dan PR; jangan push ke main atau merge otomatis. Pertahankan desain dan frame ponsel desktop. Jangan commit secrets. F1 hanya SIMULASI; production deployment memerlukan security review dan persetujuan pemilik. Tidak ada pipeline deploy aktif pada PR-0.

## Pengembangan F1 (PR-1)
Node.js 24 LTS dan npm. Jalankan `npm ci`, lalu `npm run dev` dan buka http://localhost:3000.
Pemeriksaan: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
`npm start` menjalankan build production secara lokal; ini bukan izin deployment.
PR-1 menyiapkan fondasi; migrasi layar dimulai PR-2. Semua data F1 bersifat demo.
