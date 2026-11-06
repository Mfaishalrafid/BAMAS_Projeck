# Progres F1

Otorisasi pemilik: PR-1 sampai PR-5, 2026-11-05. Tanpa merge otomatis atau deployment. PR bertingkat: PR-1 berbasis PR-0, PR-2 berbasis PR-1, dan seterusnya. Setelah base di-merge, retarget PR berikutnya ke main sebelum merge; pastikan diff tetap benar.

## PR-1
Fondasi Next.js 16.4.5 (Node minimum upstream 20.9; proyek memilih Node 24 LTS), TypeScript strict, Tailwind 4, ESLint, unit runner Node/tsx, dan CI. Lockfile adalah sumber versi exact. Tidak ada DB/auth/payment.

## Kelanjutan
PR-2: migrasi visual Beranda/Jelajah/Detail. PR-3: donasi SIMULASI. PR-4: galang dana/admin demo. PR-5: aksesibilitas, E2E dan pengukuran.

Kuota sesi lima jam tidak dapat dibaca oleh agent. Kelanjutan otomatis setelah reset tidak dijamin; gunakan branch, commit, dan catatan ini untuk resume.

PR-1 validasi lokal: PASS lint (tanpa warning), typecheck, unit (1 tes), production build. UI placeholder hanya fondasi, bukan klaim parity visual. Browser/E2E NOT RUN pada PR-1; dijadwalkan PR-2/PR-5.

## PR-2
Beranda, Jelajah (query/kategori/urut), Detail (cerita/kabar/doa, simpan, bagikan), shell responsive dengan frame 414×868, font lokal dan fixture asli direkonstruksi ke komponen TSX; tidak menggunakan runtime bundle vendor. PASS smoke Chromium: pencarian Garut menghasilkan satu kampanye aktif dan membuka detail yang benar. Screenshot referensi/migrasi 390×844 dan 1440×1000 diperiksa; struktur, warna dan frame dipertahankan. Parity belum pixel-identical: ikon, panel desktop, spacing dan animasi perlu penyempurnaan PR-5. Link layar PR-3/4 masih placeholder hingga PR berikutnya. Gambar memakai URL Unsplash asli; izin produksi belum diverifikasi.

## PR-3
Donasi 3 tahap, metode demo, pembayaran eksplisit SIMULASI, success, riwayat/filter dan pembatalan. Nominal sesuai batas referensi; idempotensi dan larangan membayar transaksi cancelled ditangani reducer murni. Penyimpanan `bamas-f1-simulation-v1` tervalidasi Zod, tidak membaca key prototype lama; kegagalan storage diberi pesan. Kode SIM bukan QR/rekening valid, perubahan disengaja untuk menghindari pembayaran nyata.
PASS: lint, typecheck, 5 unit tests, production build, E2E Chromium pembayaran→reload→riwayat→pembatalan. Percobaan E2E awal gagal karena dev origin, selector ambigu dan indikator dev menutupi navigasi; suite sekarang memakai production server lokal port 3001 dan selector scoped, lalu lulus. Ini bukan deployment.

## PR-4
Galang dana 4 tahap dengan validasi, foto fixture, review dan persetujuan; kampanye saya; profil, simpanan dan reset terkonfirmasi; dashboard admin demo dengan KPI, grafik ilustrasi dan approve/reject. Kampanye review/rejected tidak muncul di Jelajah. Moderasi hanya transisi review→active/rejected, bukan otorisasi produksi. Tidak menjanjikan verifikasi nyata 1×24 jam seperti teks prototype; diganti penjelasan SIMULASI. Grafik diberi label ilustrasi, bukan analytics aktual.
PASS PR-4: lint, typecheck, 6 unit tests, production build, 2 E2E Chromium (donasi dan pengajuan→moderasi→reload→reset). RBAC/auth production NOT RUN karena F2 belum diimplementasikan.


## PR-5
Memulihkan ikon Lucide, panel palet/tipografi/komponen desktop dan garis judul referensi; menambah skip link, fokus navigasi dan shortcut pencarian. Perbaikan kontras berdasarkan axe. CI menjalankan E2E Chromium terhadap production build lokal. Script audit menghasilkan screenshot/Resource Timing. Scanning Tailwind dibatasi src: aset same-origin berkurang sekitar 2,3% pada perbandingan PR-5 yang sama. Eksperimen dynamic import tidak dipertahankan karena manfaat hanya sekitar 0,3%.
Laporan terperinci dan batas cakupan: [F1_QA.md](F1_QA.md). Tidak ada merge, deploy, auth/backend atau pembayaran nyata. F2 menunggu persetujuan baru.
PASS PR-5 final: lint, typecheck, 6 unit, build, 7 E2E Chromium, format, dokumentasi/checksum, whitespace, scan pola secrets terbatas. Audit npm semula 8 moderate transitif tooling; override terarah diuji lint dan audit ulang menghasilkan 0 vulnerability. Bukti screenshot dan pengukuran tersimpan di docs/qa.
Follow-up PR-5: memperbaiki hasil axe yang tidak stabil selama fade-in; teks tetap opacity penuh, audit menunggu animasi/font selesai. PASS 21/21 eksekusi browser (3× suite, 2 worker), lint/typecheck/build. Arsitektur diperbarui sesuai implementasi F1.
