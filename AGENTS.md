# BAMAS — instruksi agent

Berlaku untuk seluruh repository. Sumber visual: reference/BAMAS-desain-aplikasi-donasi.html; audit statis F0: docs/AUDIT_BAMAS.md. Jangan mengarang fitur/desain yang tidak tersedia. Laporkan bahan hilang sebagai blocker migrasi visual.

## Lingkup dan workflow
- Pemilik telah menyetujui PR-1 sampai PR-5 untuk F1 pada 2026-11-05. Kerjakan berurutan pada branch/PR bertingkat; tanpa merge otomatis. Berhenti sebelum F2.
- Gunakan feature branch dari repository ini, commit dan PR. Jangan menulis ke main, force push, overwrite pekerjaan pengguna, merge otomatis, atau membuat repository baru.
- Jalankan pemeriksaan relevan; laporkan PASS, FAIL, NOT RUN beserta alasan. Jangan mengklaim tes yang belum dijalankan.
- Tidak boleh commit credentials, secrets, data pribadi, atau .env. Jangan deploy production tanpa persetujuan eksplisit.

## Implementasi fase mendatang
- Next.js 16 App Router, TypeScript strict, Tailwind CSS 4. Modular monolith feature-first dengan presentation → application → domain; infrastructure mengimplementasikan port. PostgreSQL + Prisma baru F2.
- SOLID, DRY, KISS, YAGNI: komponen reusable, separation of concerns, tanpa abstraksi/folder kosong. Jangan mengedit bundle referensi sebagai source aplikasi.
- Pertahankan UI/UX asli, bahasa Indonesia, navigasi dan frame ponsel desktop. Perubahan desain perlu alasan terdokumentasi; perubahan besar perlu persetujuan.
- Optimisasi harus berdasar pengukuran sebelum/sesudah dan pemeriksaan regresi.
- F1 hanya fixture/mock; alur donasi selalu berlabel SIMULASI — bukan transaksi nyata. Tidak ada pembayaran nyata.
- F2 autentikasi dan RBAC server-side; ownership diverifikasi pada setiap mutasi. ORM dan secrets hanya server.
- Nominal integer rupiah; status finansial otoritatif di server. F4 hanya gateway sandbox: callback terverifikasi, idempotensi, validasi nominal dan rekonsiliasi.
- Deploy production F5 memerlukan security review dan persetujuan. Pembayaran live/payout memerlukan persetujuan terpisah.

## Pemeriksaan
PR-0: python3 scripts/check_docs.py dan git diff --check. F1 menambahkan lint, typecheck, unit/component, build, E2E dan visual parity setelah tooling tersedia. Tes negatif RBAC, ownership dan callback wajib pada fase terkait.
