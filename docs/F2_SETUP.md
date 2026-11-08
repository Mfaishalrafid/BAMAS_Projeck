# F2 — database dan akun development

F2 menambahkan PostgreSQL, Prisma, login email/password dan RBAC server. Tampilan F1 di `/` tetap SIMULASI. Buka `/akun` atau Profil → Masuk akun F2 untuk akun server. Jangan memakai data pribadi nyata.

## Menjalankan lokal

Prasyarat: Node.js 24 LTS, npm, PostgreSQL 17 (lokal atau container). Untuk tes integrasi dibutuhkan Docker Linux dengan socket `/var/run/docker.sock` dan Playwright Chromium.

1. Jalankan `npm ci` (otomatis generate Prisma client).
2. Salin `.env.example` ke `.env`. Isi `DATABASE_URL` ke database development kosong milik Anda; gunakan password acak. Jangan memakai database production.
3. Isi `BETTER_AUTH_SECRET` dengan nilai acak minimal 32 byte, misalnya keluaran `openssl rand -hex 32`. Simpan hanya di `.env`, jangan Git/chat/log.
4. Jalankan kotak surat lokal Mailpit (lihat perintah di bawah); isi variabel SMTP dari `.env.example`. Biarkan `BETTER_AUTH_URL=http://localhost:3000` untuk lokal.
5. Atur `MAIL_FROM`, host/port dan mode TLS sesuai lingkungan. Semua akun sekarang wajib verifikasi email; flag lama `AUTH_ALLOW_UNVERIFIED_LOCAL` dihapus.
6. Jalankan `npm run db:migrate`, lalu `npm run dev`. Daftar di `/akun`, buka email verifikasi di kotak surat lokal, klik tautan, lalu login. Akun baru selalu DONOR.

Migrasi tidak mengimpor fixture browser. Database baru tidak memiliki kampanye ACTIVE atau riwayat donasi. Form draft hanya muncul bagi CAMPAIGNER/ADMIN. Untuk pengujian role lokal, operator dapat mengubah field role akun uji melalui `npx prisma studio`; jangan promosikan role melalui browser/API. Workflow pemberian role operasional beserta audit belum tersedia (F3).

Verifikasi dan reset password sudah diimplementasikan. Konfigurasi SMTP lengkap wajib tersedia; konfigurasi yang tidak aman/kurang menghasilkan 503. Akun lama yang belum diverifikasi harus meminta email baru melalui `/akun/kirim-verifikasi`. Production deployment tetap membutuhkan review keamanan dan persetujuan pemilik.

### Kotak surat lokal

```sh
docker run --rm -d --name bamas-mailpit -p 127.0.0.1:1025:1025 -p 127.0.0.1:8025:8025 axllent/mailpit@sha256:aef2aacc11f075ec0fb6874275ee4a421e688e11a96ebb296134d1735c7761ce
```

Buka http://localhost:8025 untuk membaca email uji. SMTP port 1025, tanpa autentikasi/TLS, hanya bila `SMTP_ALLOW_INSECURE_LOCAL=true` dan aplikasi juga localhost. Jangan buka port kotak surat uji ke internet. Stop dengan `docker stop bamas-mailpit`.

### Menghubungkan provider email

- Tentukan penyedia SMTP dan domain pengirim milik pemilik BAMAS; verifikasi domain serta SPF/DKIM (DMARC sesuai kebijakan domain) melalui provider.
- Simpan `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` dan `BETTER_AUTH_SECRET` pada secret/environment settings, bukan Git atau chat.
- Public origin menggunakan `BETTER_AUTH_URL=https://...`, `SMTP_ALLOW_INSECURE_LOCAL=false`. Port 465 biasanya `SMTP_SECURE=true`; port 587 `false` dengan STARTTLS wajib. Sertifikat tidak boleh dilewati.
- Uji koneksi autentikasi SMTP serta penerimaan inbox/spam, verifikasi, kirim ulang, reset dan logout semua device dengan akun uji yang disetujui. Provider belum dikonfigurasi pada sesi implementasi ini; pengiriman inbox publik belum diverifikasi.
- Redact query token dan URL reset pada access log/reverse proxy/analytics. Tidak mempublikasikan capture Mailpit. Jangan mengaktifkan debug SMTP.

### Perilaku pemulihan

`/akun/lupa-password` meminta tautan reset, `/akun/reset-password` menerima tautan dari email dan meminta konfirmasi kata sandi. Tautan reset berlaku 15 menit/sekali pakai, session lama dicabut sesudah berhasil. Verifikasi berlaku 60 menit; verifikasi ulang tidak membuat session. Halaman hasil `/akun/verifikasi` mengarahkan kembali ke login. Pesan permintaan email bersifat umum untuk akun ada/tidak ada.

Jika pengiriman gagal, periksa konfigurasi/provider tanpa menyalin credentials ke log. Signup dapat meninggalkan akun belum terverifikasi saat SMTP gagal; gunakan kirim ulang setelah layanan pulih. Email yang diterima server SMTP belum tentu masuk inbox penerima.

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

Suite integrasi membuat container PostgreSQL dan Mailpit sementara dengan credentials acak, menjalankan migrasi dua kali, memakai server lokal port 3002 dan menghapus kedua container sesudahnya. Alur verifikasi/reset diuji melalui SMTP nyata ke Mailpit tanpa email eksternal. Database development tidak disentuh. Port 3002 harus kosong; jangan menjalankan suite bersamaan. Secret tidak menjadi artifact; trace/screenshot auth dimatikan. Suite F1 memakai port 3001.

## API yang tersedia

| Endpoint | Izin / hasil |
| --- | --- |
| `/api/auth/*` | Better Auth signup/signin/signout/session, send-verification-email, verify-email, request-password-reset, reset-password; rate limit DB |
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
