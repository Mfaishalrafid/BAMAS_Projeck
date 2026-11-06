# Arsitektur BAMAS

Status: target, belum diimplementasikan. PR-0 hanya dokumentasi dan CI. Baseline adalah HTML bundle React; tidak ada source aplikasi maintainable atau backend pada commit awal.

## Struktur target
Next.js 16 App Router + TypeScript strict + Tailwind CSS 4. Satu deployable modular monolith. `src/app` menangani routing/composition; `src/features/<feature>` menampung presentation, application, domain dan infrastructure sesuai kebutuhan; `src/shared` hanya komponen/utilitas yang benar-benar digunakan lintas fitur. Kandidat fitur dari referensi: campaign, donation, profile, admin. Jangan membuat scaffold pada PR-0.

Presentation memanggil application use cases; domain bebas React, Next.js, Prisma dan provider. Infrastructure mengimplementasikan port repository/payment yang dibutuhkan use case. Composition server menghubungkan adapter. Antarfitur lewat API publik/use case, bukan mengimpor adapter internal. Server Components default; Client Components hanya untuk interaksi/browser state.

F1 menggunakan fixture dan adapter demo terisolasi, dengan label SIMULASI pada checkout dan hasil. localStorage hanya data demo, bukan ledger. Frame ponsel desktop dan tampilan mobile mengikuti referensi, diverifikasi screenshot pada F1.

F2 menggunakan PostgreSQL + Prisma di server, migrasi terversi dan autentikasi/session. Provider auth diputuskan melalui ADR saat F2; Auth.js adalah kandidat dalam handover, bukan dependency terpasang. RBAC dan ownership diperiksa pada setiap operasi server; role awal dalam dokumen model perlu dikonfirmasi sebelum implementasi. Validasi input pada boundary, error publik tanpa detail rahasia.

F3 menambahkan aturan kampanye, moderasi dan audit trail. F4 adapter sandbox terpisah dari demo: signature callback, nominal/referensi, transaksi DB atomik, deduplikasi, transisi status dan rekonsiliasi; browser tidak menetapkan paid. Nominal integer IDR dengan serialisasi aman untuk BIGINT. Tidak menyimpan detail instrumen pembayaran.

F5 membutuhkan security review, backup/restore teruji, observability tanpa PII/secrets, rollback dan persetujuan deployment. Hosting/provider belum dipilih. CI PR-0 memvalidasi dokumentasi; build/test aplikasi ditambahkan PR-1. Tidak ada CD production aktif.

Lihat [roadmap](MIGRATION_ROADMAP.md), [keputusan](adr/0001-stack-and-boundaries.md), dan [audit](PR0_AUDIT.md). Dokumen model/API dari Migoo adalah proposal, bukan kontrak yang sudah diimplementasikan.
