# QA F2 — 2026-11-07

Catatan historis PR #7. Hasil pelengkap verifikasi/reset email ada di [QA F2 email](F2_EMAIL_QA.md); batas localhost tanpa verifikasi di laporan ini telah digantikan.

Lingkup: PostgreSQL 17, Prisma 7, Better Auth, RBAC/ownership dan layar akun lokal. Branch `feat/bamas-f2-database-auth`; tidak ada deploy atau merge otomatis.

## Bukti pemeriksaan

Integrasi memakai database PostgreSQL container sementara, bukan mock. Test fixture akun/role/kampanye/donasi dibuat hanya di database `bamas_test`; tidak diimpor ke data pengguna.

- Migrasi awal dan pengulangan `migrate deploy`: PASS; pengulangan tidak menghasilkan migrasi pending.
- `npm run lint`, `npm run typecheck`, `npm run build`, `npm run format:check`: PASS.
- `npm test`: PASS, 8 tes.
- `npm run test:e2e`: PASS, 7 tes regresi F1 (22,8 detik), termasuk frame desktop/mobile dan accessibility.
- Pemeriksaan staged files terhadap nilai secret lokal serta pengecualian `.env`: PASS.
- `npm run test:integration`: PASS, 6 skenario pada build final (7,6 detik).
- `python3 scripts/check_docs.py` dan `git diff --check`: PASS; checksum HTML referensi tidak berubah.
- `npm audit`: PASS, 0 vulnerability saat pemeriksaan.

Tes mencakup role default DONOR, password hash, cookie HttpOnly/SameSite, akses anonim, role overposting, penolakan admin, draft private, owner editing, nominal BIGINT, bookmark idempoten, isolasi riwayat/status, penolakan mutasi PAID, origin, role revocation, constraint DB, browser login/reload/logout, pencabutan cookie lama, axe dan rate limit database.

Kesalahan yang ditemukan dan diperbaiki: format ESM pada runner Prisma; input nominal pecahan sempat melempar BigInt exception (503) alih-alih validasi 422. Unit test regresi mencakup input nonangka/pecahan/negatif/over-limit. Data ringkasan admin dibersihkan ketika akun berganti/keluar.

## Batas pemeriksaan

Verifikasi email/reset password/provider mail: NOT RUN — provider belum dipilih/dikonfigurasi; auth hostname publik diblokir. Security review production, load test, backup/restore, callback pembayaran dan deployment: NOT RUN, di luar F2. Axe otomatis bukan pengganti review aksesibilitas manual lengkap.

F1 tetap SIMULASI di browser. Akun server baru tidak memiliki riwayat pembayaran. Submit/moderasi dan pemberian role operasional menunggu F3; gateway menunggu F4. Tidak ada klaim kesiapan production.
