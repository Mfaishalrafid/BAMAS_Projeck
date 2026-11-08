# Preview SIMULASI untuk iPhone

Mode preview F1 diaktifkan dengan `NEXT_PUBLIC_BAMAS_DEMO_ONLY=true` saat build dan runtime. Tampilan/demo/localStorage tetap sama; tautan akun F2 disembunyikan, `/akun/*` diarahkan ke Profil demo, seluruh `/api/*` mengembalikan 404 DEMO_ONLY sebelum mengakses layanan backend. Halaman diberi noindex. Nilai default false menjaga alur F2.

## Hosting preview

Gunakan akun Vercel milik pemilik BAMAS yang terhubung ke repository **Mfaishalrafid/BAMAS_Projeck**. Tidak membuat repository pengganti. Gunakan proyek khusus demo, tanpa database, SMTP, auth secret, gateway atau domain production BAMAS.

Branch sumber perubahan: `feat/bamas-iphone-demo-preview`. Mode ini baru tersedia pada main setelah PR disetujui dan di-merge. Jangan mengaktifkan flag di commit lama lalu menganggap API sudah diblokir. Saat menghubungkan project, pilih commit/branch yang memuat perubahan ini dan pastikan `NEXT_PUBLIC_BAMAS_DEMO_ONLY=true` tersedia bagi deployment yang akan dibuat. Node.js 24.x, framework Next.js, install `npm ci`, build `npm run build`, root repository.

Untuk deployment berjenis **Preview**, gunakan branch non-production pada Git integration atau perintah `vercel` (tanpa `--prod`) dari checkout branch tersebut setelah akun/project sudah terhubung. Jangan menerbitkan deployment production BAMAS. Pengaturan awal akun dan izin GitHub dilakukan pemilik melalui browser; jangan mengirim token/password ke chat.

Buka URL HTTPS deployment berstatus Ready di Safari. Jika Vercel meminta login untuk preview yang dilindungi, gunakan akun pemilik; tidak perlu mengubah akses menjadi publik. Simpan URL deployment yang sama agar localStorage demo konsisten. Safari Share → Add to Home Screen dapat digunakan sebagai pintasan, bukan aplikasi native/offline.

## Validasi sebelum membagikan link

- Beranda, navigasi, Detail dan checkout berlabel SIMULASI berfungsi pada layar 390×844.
- Profil tidak menampilkan login F2; `/akun` menuju Profil demo.
- GET `/api/me` dan POST `/api/auth/sign-up/email` menghasilkan 404 DEMO_ONLY.
- Tidak ada credentials/database/SMTP pada proyek preview.

Tes lokal: `NEXT_PUBLIC_BAMAS_DEMO_ONLY=true npm run build`, lalu `NEXT_PUBLIC_BAMAS_DEMO_ONLY=true npx playwright test --config=playwright.preview.config.ts`. CI menjalankan tes ini setelah tes F2 dengan mode normal.

Belum ada URL hosting sebelum akun Vercel terhubung dan deployment berhasil diverifikasi. Pengujian Chromium mobile tidak sama dengan pengujian perangkat Safari fisik.
