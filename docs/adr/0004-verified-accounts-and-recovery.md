# ADR-0004 — verifikasi email dan pemulihan akun

Status: diterapkan, pelengkap F2 pada 2026-11-08. Menggantikan pengecualian localhost tanpa verifikasi pada ADR-0003; bukan otorisasi deployment.

## Keputusan
Semua akun, termasuk akun localhost, wajib memverifikasi email sebelum login atau membaca API akun. Flag lama `AUTH_ALLOW_UNVERIFIED_LOCAL` tidak lagi digunakan. Session yang dibuat sebelum perubahan tidak memberi akses API akun apabila email belum diverifikasi.

Better Auth mengelola token dan expiry: tautan verifikasi berlaku 60 menit; reset password 15 menit dan sekali pakai. Verifikasi ulang idempoten tanpa auto-login. Password tetap minimal 12 karakter; reset berhasil mencabut seluruh session user yang bersangkutan. Adapter Prisma menggunakan transaction agar konsumsi token, perubahan hash password dan pencabutan session atomik. RBAC tidak berubah.

Nodemailer mengirim pesan teks lewat SMTP, tanpa ketergantungan pada vendor tertentu. Origin publik harus HTTPS; SMTP harus berautentikasi dengan implicit TLS (`SMTP_SECURE=true`, biasanya 465) atau STARTTLS wajib (`false`, biasanya 587). Validasi sertifikat aktif, minimal TLS 1.2. Transport tanpa TLS hanya diizinkan secara eksplisit ketika origin aplikasi dan host SMTP sama-sama loopback. Mailpit dalam suite integrasi tidak memiliki relay keluar dan image dipin berdasarkan digest.

UI memiliki halaman lupa password, reset, kirim ulang verifikasi dan hasil verifikasi. Callback tetap same-origin, token reset dihapus dari address bar setelah dibaca ke memory, halaman bertoken memakai referrer policy no-referrer/noindex. Respons auth tidak di-cache. Tidak ada token atau credentials pada log/trace CI.

## Batas dan konsekuensi
Email menunggu hasil SMTP dengan timeout. Penerimaan SMTP bukan bukti pesan masuk inbox; tidak ada klaim deliverability publik sebelum diuji dengan provider/domain pemilik. Jika SMTP gagal saat signup, akun mungkin sudah tercipta namun tetap belum terverifikasi; kirim ulang verifikasi setelah SMTP pulih. Tidak ada antrean email/retry otomatis pada F2.

Respons permintaan reset/verifikasi anonim tidak menyatakan apakah email terdaftar; rate limit DB mengurangi penyalahgunaan (5 permintaan/menit per endpoint/IP). Ini bukan jaminan ketahanan terhadap semua timing/traffic analysis; rate limiting terdistribusi, konfigurasi reverse proxy dan security review termasuk gate production.

Tidak ada perubahan bisnis/moderasi F3, gateway, deployment atau merge otomatis.
