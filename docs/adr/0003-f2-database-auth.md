# ADR-0003 — PostgreSQL, Prisma dan session F2

Status: diterapkan untuk pengembangan lokal F2, 2026-11-07.

## Keputusan
PostgreSQL 17 dengan Prisma 7.10.1 dan adapter `pg`; migrasi SQL terversi menyimpan constraints nominal integer IDR. Prisma 8 masih prerelease saat implementasi dan belum didukung adapter auth. Client digenerate saat install, tidak disimpan dalam Git. Package memakai ES modules agar Prisma client dan test runner konsisten.

Better Auth 1.7.18 dengan adapter Prisma dipilih untuk password hashing, session database, cookie HttpOnly/SameSite dan rate limiting persisten. Auth.js pada handover adalah kandidat, bukan dependency wajib. Menggunakan library menghindari implementasi kriptografi/session sendiri. Login email/password menjadi asumsi default; OAuth belum dikonfigurasi.

Role DONOR diberikan saat pendaftaran. CAMPAIGNER/ADMIN hanya dapat diberikan operator database tepercaya pada development; tidak ada API promosi role. Role dibaca dari database setiap request, tanpa cache role dalam cookie. Pencabutan role langsung berlaku. Ownership diperiksa server, termasuk draft, bookmark, riwayat, dan status donasi.

## Batas dan konsekuensi
Belum tersedia provider pengiriman email. Login tanpa verifikasi email hanya diperbolehkan bila origin localhost dan `AUTH_ALLOW_UNVERIFIED_LOCAL=true`; hostname publik ditolak dengan 503. Ini fondasi development, bukan autentikasi production siap pakai. Verifikasi email, reset password, kebijakan pemulihan akun dan MFA admin perlu diselesaikan sebelum penggunaan publik.

F1 tetap SIMULASI di localStorage. `/akun` mengakses backend F2; data demo tidak dimigrasikan menjadi transaksi nyata. Halaman ini memakai shell, warna, tipografi dan frame F1. Tambahan form akun diperlukan karena prototipe tidak menyediakan autentikasi server; perubahan terbatas pada layar akun dan tautan Profil.

Campaign ACTIVE dan donasi dalam tes hanya fixture database terisolasi. F2 hanya membuat/mengedit DRAFT; submit/moderasi/audit adalah F3. Tidak ada API penetapan PAID atau gateway. Guest donation, ledger, rekonsiliasi dan pembayaran menunggu fase terkait.
