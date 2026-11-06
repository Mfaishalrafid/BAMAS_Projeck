# Roadmap migrasi

Setiap PR memerlukan review; jangan merge otomatis. Hanya PR-0 diotorisasi saat handover.

| Fase / PR | Hasil | Gate penerimaan |
| --- | --- | --- |
| PR-0 | Audit, baseline, AGENTS, arsitektur, ADR, CI dokumentasi | Pemeriksaan dokumen dan diff; commit/PR; berhenti |
| F1 / PR-1 | Next.js 16, TS strict, Tailwind 4, fondasi fitur | Lockfile, lint, typecheck, build dan tes relevan; persetujuan mulai |
| F1 / PR-2 | Beranda, Jelajah, Detail | Parity teks, layout, navigasi, frame desktop dan mobile |
| F1 / PR-3 | Donasi DEMO | Label SIMULASI pada semua tahap; validasi nominal, success/cancel; tanpa gateway live |
| F1 / PR-4 | Galang Dana dan Admin demo | Fixture/mock terisolasi; workflow demo jelas, bukan klaim RBAC produksi |
| F1 / PR-5 | UI/UX, aksesibilitas, testing, optimisasi | Keyboard/focus/contrast, E2E kritis, screenshot parity dan pengukuran kinerja |
| F2 | PostgreSQL, Prisma, autentikasi, RBAC | Migrasi terversi; tes integrasi session, ownership, penolakan akses |
| F3 | Aturan bisnis dan moderasi | Transisi status, audit log, izin admin dan validasi server teruji |
| F4 | Payment Gateway Sandbox | Signature, replay, duplicate/out-of-order callback, nominal, kegagalan dan rekonsiliasi teruji |
| F5 | Production readiness dan deployment | Security review, backup/restore, rollback, monitoring; persetujuan pemilik sebelum deploy |

Pembayaran nyata dan payout tidak otomatis diizinkan oleh F5. Provider, kebijakan guest, retensi data dan aturan moderasi diputuskan sebelum fase terkait. Bahan visual hilang atau perilaku ambigu menjadi blocker untuk bagian migrasi tersebut; jangan mengganti dengan desain rekaan.
