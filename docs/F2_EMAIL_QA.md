# QA pelengkap F2 — 2026-11-08

Branch: `feat/bamas-f2-email-recovery`, dari main setelah merge PR #7. Tidak ada migrasi schema tambahan, perubahan F3, pembayaran atau deployment.

## Pemeriksaan

| Pemeriksaan | Hasil |
| --- | --- |
| Lint, TypeScript strict, build Next.js | PASS |
| Unit test | PASS — 10 tes, termasuk konfigurasi SMTP/HTTPS dan penolakan konfigurasi tidak aman |
| Integrasi PostgreSQL + SMTP Mailpit | PASS — 10 skenario, termasuk browser reset password |
| Regresi browser F1 | PASS — 7 tes; frame desktop/mobile, demo dan accessibility tetap lulus |
| Format source | PASS |
| npm audit | PASS — 0 vulnerability saat pemeriksaan |

Integrasi memakai password/secret acak dan database sementara. SMTP benar-benar mengirim ke Mailpit terisolasi; email tidak diteruskan ke internet. Token/credentials tidak menjadi trace atau screenshot. Role/session/draft/bookmark/riwayat baseline F2 tetap diuji.

Cakupan baru: pendaftaran tidak membuat session; email belum diverifikasi tidak dapat login; token verifikasi rusak/kedaluwarsa ditolak; kirim ulang verifikasi; callback eksternal ditolak; verifikasi/replay tidak auto-login; pesan permintaan email tidak membedakan akun ada/tidak ada; UI konfirmasi password; token reset dihapus dari URL; reset berhasil mencabut semua session akun terkait tanpa mencabut akun lain; password lama ditolak; reset token rusak/kedaluwarsa/replay ditolak; password pendek ditolak; dua reset bersamaan hanya satu berhasil; CSRF dan rate limit.

Perbaikan selama validasi: client kotak surat uji semula membawa Origin aplikasi sehingga ditolak Mailpit; test browser semula memilih dua elemen alert (pesan form dan announcer Next). Keduanya diperbaiki tanpa melonggarkan keamanan aplikasi.

## Yang belum dapat dinyatakan selesai

Provider SMTP publik dan domain pengirim belum diberikan/dikonfigurasi. Uji penerimaan inbox/spam pada provider nyata, SPF/DKIM/DMARC dan alur publik HTTPS: **NOT RUN**. Konfigurasi transport publik sudah divalidasi unit test, tetapi itu bukan bukti koneksi SMTP/deliverability provider.

Security review production, load test, backup/restore, reverse proxy dan deployment: **NOT RUN**, gate fase berikutnya. Tidak ada klaim aplikasi sudah live atau siap production. Instruksi konfigurasi dan uji operasional tersedia di [setup F2](F2_SETUP.md).
