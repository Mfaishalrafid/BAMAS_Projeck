# F1 — bukti QA dan batas hasil

## Lingkup
PR-1–PR-5 membangun frontend SIMULASI, tanpa DB, auth, gateway atau deployment. PR bertingkat harus direview berurutan. Tidak ada auto-merge. Referensi HTML tetap byte-for-byte sesuai checksum PR-0.

## Pemeriksaan yang dapat diulang
- `npm ci` menggunakan lockfile exact, Node 24 LTS.
- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
- `npx playwright install chromium` lalu `npm run test:e2e`: server build production lokal port 3001.
- `python3 scripts/check_docs.py`, `git diff --check`, `npm run format:check`.
- Dengan server lokal aktif: `npm run audit:browser -- current`. JSON/screenshot muncul di artifacts, tidak diunggah otomatis.

## Cakupan
Unit: nominal invalid/unsafe, pencarian kategori/lokasi, pending review tersembunyi, pembayaran idempoten, cancelled tidak dapat paid, penyimpanan invalid/duplikat, transisi moderasi.
Browser Chromium: donasi sampai berhasil, reload dan pembatalan; pengajuan empat tahap sampai approve, reload dan reset; empty search; keyboard `/`; fokus setelah navigasi; deep link valid/missing; simpanan bertahan setelah reload; penyimpanan rusak/ditolak; reject admin; frame desktop 414px; overflow pada 320/390/768px; reduced-motion.
Axe WCAG 2 A/AA dan 2.1 AA pada Beranda mobile/desktop, Jelajah/empty, Detail, nominal/metode donasi, Profil, Admin. Hasil otomatis bukan sertifikasi aksesibilitas; screen reader nyata dan perangkat fisik belum diuji.

## Visual
Menggunakan font Bricolage Grotesque/Plus Jakarta Sans lokal, token warna asli, logo, data/cerita kampanye, navigasi, frame 414×868 dan scaling desktop dari referensi. Ikon menggunakan Lucide seperti prototype. Screenshot desktop/mobile diperiksa; tidak mengklaim pixel-identical untuk semua layar. Profile/admin dan transisi masih rekonstruksi komponen, bukan menjalankan bundle lama.
Perubahan disengaja: label SIMULASI; kode pembayaran non-fungsional; pengaturan akun menjelaskan batas F2; moderasi tidak menjanjikan SLA nyata; grafik berlabel ilustrasi; kontras magenta teks/tombol digelapkan setelah temuan axe; fokus/skip link dan reduced motion.
Gambar memakai Unsplash asli, memerlukan jaringan. Render screenshot dapat berbeda ketika gambar belum selesai dimuat; belum review lisensi produksi.

## Pengukuran
Chromium headless, cold context 390×844, production build lokal, tanpa throttling. Resource Timing hanya digunakan untuk transfer same-origin (aset lintas origin dapat melaporkan 0 byte). Hasil ini bukan Core Web Vitals lapangan.
Baseline PR-4: 265367 byte aset same-origin. PR-5 menambah ikon/aksesibilitas/panel visual sehingga perbandingan langsung antarfitur bukan eksperimen optimisasi yang adil.
Eksperimen code splitting pada tampilan PR-5: statis 269447 byte versus dinamis 268699 byte; penghematan sekitar 0,3% tidak membenarkan tambahan kompleksitas, sehingga impor statis dipertahankan.
Optimisasi berikutnya membatasi scanning Tailwind ke src agar bundle HTML referensi tidak menghasilkan utility CSS yang tidak dipakai. Transfer same-origin turun dari 269447 menjadi 263277 byte (−6170 byte, sekitar 2,3%) untuk tampilan/fungsi PR-5 yang sama. CSS dikurangi tanpa mengubah reference HTML. Angka durasi lokal tidak dijadikan klaim percepatan bagi pengguna.

## Batas fase
NOT RUN: Safari/Firefox, screen reader/perangkat fisik, backend integration, RBAC produksi, payment sandbox/live, deployment. Semua memerlukan pekerjaan fase terkait; F2 belum diotorisasi.


## Hasil terakhir (2026-11-06)
PASS: lint, typecheck, 6 unit tests, build, 7 E2E Chromium termasuk axe/keyboard/reload, format, tautan dokumen/checksum dan diff whitespace. Temuan kontras awal diperbaiki, lalu seluruh 7 E2E lulus. Tidak ada JavaScript page error pada audit Beranda. CI hosted dilaporkan terpisah setelah push.


## Artefak review
- [Referensi mobile](qa/reference-mobile.png) / [F1 mobile](qa/f1-mobile.png)
- [Referensi desktop](qa/reference-desktop.png) / [F1 desktop](qa/f1-desktop.png)
- [Ringkasan pengukuran](qa/measurements.json)

Screenshot adalah bukti inspeksi Beranda, bukan tes pixel diff seluruh aplikasi. Waktu status bar desktop dibuat tetap pada implementasi; foto remote dan waktu referensi dapat berbeda.

## Dependency dan secrets
PASS: scan pola secrets terbatas (private key, GitHub token, AWS access key ID, Stripe live key); bukan audit secrets menyeluruh.
`npm audit` awal melaporkan 8 moderate yang berasal dari minimatch 10.2.6 pada typescript-eslint (amplifikasi glob/DoS). Override terbatas pada `@typescript-eslint/typescript-estree → minimatch 11.0.1` memperbaikinya; Node 24 kompatibel, lint diuji ulang PASS. Audit ulang: 0 low/moderate/high/critical. Hapus override ketika upstream sudah menggunakan versi aman; jangan memakai audit fix --force yang menyarankan downgrade Next ESLint config ke 15.

## Stabilitas CI
Pada commit 427f288, run PR 42250241378 PASS tetapi run push 42250174569 FAIL pada kontras teks `.muted` saat masuk admin. CSS memakai opacity 0,5 selama animasi masuk 180ms. Perbaikan mempertahankan gerakan horizontal dengan opacity penuh; helper axe menunggu font dan animasi finite selesai tanpa sleep tetap atau menonaktifkan aturan. Perubahan ini menjaga keterbacaan selama transisi dan mencegah pengukuran pada frame parsial. Suite diuji berulang dengan dua worker seperti runner CI.
PASS setelah perbaikan: lint, typecheck, production build dan 21/21 eksekusi browser (7 skenario × 3 pengulangan, 2 worker). Tidak memakai retry untuk meloloskan hasil.
