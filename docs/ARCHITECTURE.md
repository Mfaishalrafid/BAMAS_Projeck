# Arsitektur BAMAS

Status: fondasi frontend F1 sudah diimplementasikan pada PR-1–PR-5. Bagian backend di bawah tetap target F2–F5. Baseline commit awal hanya README; HTML bundle React disimpan sebagai referensi PR-0.

## Struktur target
Next.js 16 App Router + TypeScript strict + Tailwind CSS 4. Satu deployable modular monolith. `src/app` menangani routing/composition; `src/features/<feature>` menampung presentation, application, domain dan infrastructure sesuai kebutuhan; `src/shared` hanya komponen/utilitas yang benar-benar digunakan lintas fitur. Kandidat fitur dari referensi: campaign, donation, profile, admin. Jangan membuat scaffold pada PR-0.

Presentation memanggil application use cases; domain bebas React, Next.js, Prisma dan provider. Infrastructure mengimplementasikan port repository/payment yang dibutuhkan use case. Composition server menghubungkan adapter. Antarfitur lewat API publik/use case, bukan mengimpor adapter internal. Server Components default; Client Components hanya untuk interaksi/browser state.

F1 menggunakan fixture dan adapter demo terisolasi, dengan label SIMULASI pada checkout dan hasil. localStorage hanya data demo, bukan ledger. Frame ponsel desktop dan tampilan mobile mengikuti referensi, diverifikasi screenshot pada F1.

F2 menggunakan PostgreSQL + Prisma di server, migrasi terversi dan autentikasi/session. Provider auth diputuskan melalui ADR saat F2; Auth.js adalah kandidat dalam handover, bukan dependency terpasang. RBAC dan ownership diperiksa pada setiap operasi server; role awal dalam dokumen model perlu dikonfirmasi sebelum implementasi. Validasi input pada boundary, error publik tanpa detail rahasia.

F3 menambahkan aturan kampanye, moderasi dan audit trail. F4 adapter sandbox terpisah dari demo: signature callback, nominal/referensi, transaksi DB atomik, deduplikasi, transisi status dan rekonsiliasi; browser tidak menetapkan paid. Nominal integer IDR dengan serialisasi aman untuk BIGINT. Tidak menyimpan detail instrumen pembayaran.

F5 membutuhkan security review, backup/restore teruji, observability tanpa PII/secrets, rollback dan persetujuan deployment. Hosting/provider belum dipilih. CI PR-0 memvalidasi dokumentasi; build/test aplikasi ditambahkan PR-1. Tidak ada CD production aktif.

Lihat [roadmap](MIGRATION_ROADMAP.md), [keputusan](adr/0001-stack-and-boundaries.md), dan [audit](PR0_AUDIT.md). Dokumen model/API dari Migoo adalah proposal, bukan kontrak yang sudah diimplementasikan.


## Implementasi F1 saat ini
`src/app/page.tsx` dan layout adalah Server Components; `bamas-app.tsx` mengomposisikan interaksi layar prototype pada satu route. `features/campaigns` memuat model/filter, validasi pengajuan, fixture, dan presentation; `features/donations` memuat validasi nominal/metode dan layar donasi; `features/demo` mengelola reducer simulasi lintas fitur dan adapter localStorage; admin/profile hanya presentation demo. `shared/components` menyimpan shell, ikon dan UI reusable. Tidak ada ORM, endpoint pembayaran atau server authorization.
State layar tetap mengikuti prototype dan deep link kampanye memakai query `campaign`; route per fitur serta adapter database akan dievaluasi pada F2. Semua data lokal tidak dipercaya untuk transaksi nyata. Tes berada di tests (domain/state) dan tests/e2e (browser); CI menjalankan keduanya. Lihat [QA F1](F1_QA.md) untuk cakupan dan pengecualian.
