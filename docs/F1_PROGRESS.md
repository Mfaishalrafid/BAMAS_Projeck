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
