# F2 — database dan akun development

F2 menambahkan PostgreSQL, Prisma, login email/password dan RBAC server. Tampilan F1 di `/` tetap SIMULASI. Buka `/akun` atau Profil → Masuk akun F2 untuk akun server. Jangan memakai data pribadi nyata.

## Menjalankan lokal

Prasyarat: Node.js 24 LTS, npm, PostgreSQL 17 (lokal atau container). Untuk tes integrasi dibutuhkan Docker Linux dengan socket `/var/run/docker.sock` dan Playwright Chromium.

1. Jalankan `npm ci` (otomatis generate Prisma client).
2. Salin `.env.example` ke `.env`. Isi `DATABASE_URL` ke database development kosong milik Anda; gunakan password acak. Jangan memakai database production.
3. Isi `BETTER_AUTH_SECRET` dengan nilai acak minimal 32 byte, misalnya keluaran `openssl rand -hex 32`. Simpan hanya di `.env`, jangan Git/chat/log.
4. Biarkan `BETTER_AUTH_URL=http://localhost:3000` dan `AUTH_ALLOW_UNVERIFIED_LOCAL=true` hanya untuk pengembangan lokal.
5. Jalankan `npm run db:migrate`, lalu `npm run dev`. Daftar di `/akun`; akun baru selalu DONOR.

Migrasi tidak mengimpor fixture browser. Database baru tidak memiliki kampanye ACTIVE atau riwayat donasi. Form draft hanya muncul bagi CAMPAIGNER/ADMIN. Untuk pengujian role lokal, operator dapat mengubah field role akun uji melalui `npx prisma studio`; jangan promosikan role melalui browser/API. Workflow pemberian role operasional beserta audit belum tersedia (F3).

Tidak ada verifikasi/reset password lewat email sampai provider email dikonfigurasi. Konfigurasi auth hostname publik sengaja ditolak; jangan menghapus guard untuk deploy. Production deployment tetap membutuhkan review keamanan dan persetujuan pemilik.

## Pemeriksaan

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run test:integration
```

Suite integrasi membuat container PostgreSQL sementara dengan credentials acak, menjalankan migrasi dua kali, memakai server lokal port 3002 dan menghapus container sesudahnya. Database development tidak disentuh. Port 3002 harus kosong; jangan menjalankan suite bersamaan. Secret tidak menjadi artifact; trace/screenshot auth dimatikan. Suite F1 memakai port 3001.

## API yang tersedia

| Endpoint | Izin / hasil |
| --- | --- |
| `/api/auth/*` | Better Auth signup/signin/signout/session; origin sama, rate limit DB |
| GET `/api/me` | Session aktif, profil dan role sendiri |
| GET `/api/admin/overview` | ADMIN, jumlah akun/kampanye saja |
| GET `/api/campaigns?q=&page=` | Publik, ACTIVE saja; 20 per halaman |
| GET `/api/campaigns/[slug]` | ACTIVE publik; private hanya owner/admin |
| POST `/api/campaigns` | CAMPAIGNER/ADMIN; selalu DRAFT milik session |
| GET `/api/me/campaigns` | Kampanye sendiri, maksimal 50 |
| PATCH `/api/me/campaigns/[id]` | Owner CAMPAIGNER/ADMIN dan status masih DRAFT |
| GET/POST `/api/me/bookmarks` | Milik session; hanya kampanye ACTIVE, tambah idempoten |
| DELETE `/api/me/bookmarks/[id]` | Hapus bookmark sendiri; body `{}` |
| GET `/api/me/donations` | Riwayat sendiri, maksimal 50 |
| GET `/api/donations/[id]/status` | Status milik donor sendiri |

Nominal BIGINT diserialisasi sebagai string desimal. Mutasi JSON dibatasi 32 KiB dan memerlukan header Origin yang sama dengan `BETTER_AUTH_URL`. `ownerId`, role dan status tidak diterima dari form draft. Respons error: 401 belum login, 403 role/origin, 404 resource tak terlihat, 409 konflik draft, 413 body terlalu besar, 415 media type, 422 validasi, 429 rate limit, 503 konfigurasi/layanan tidak tersedia. Error internal tidak mengungkap query atau credentials.

Tidak ada endpoint submit/review, membuat pembayaran, mengubah PAID, webhook atau payout pada F2. Pembatasan jumlah riwayat adalah batas awal; pagination dashboard perlu ditambahkan ketika volume data memerlukannya.
