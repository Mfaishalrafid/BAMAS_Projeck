# ADR-0001: Stack dan modular monolith

Status: diterima sebagai target oleh pemilik; implementasi mulai PR-1 setelah persetujuan.

Konteks: satu HTML bundle React tidak menyediakan source maintainable; BAMAS perlu migrasi bertahap dengan parity visual.

Keputusan: Next.js 16 App Router, TypeScript strict, Tailwind CSS 4; modular monolith feature-first dengan dependency mengarah ke domain. PostgreSQL + Prisma pada F2. Versi patch/runtime kompatibel diverifikasi dan dikunci saat instalasi PR-1.

Alternatif: mempertahankan bundle menghambat maintainability; SPA terpisah/API terpisah menambah operasi; microservices belum memiliki kebutuhan terukur.

Konsekuensi: satu repository/deployment sederhana, tetapi batas fitur perlu dijaga melalui review dan tes. Server/client boundary wajib eksplisit. Tidak menambah abstraksi tanpa use case.
