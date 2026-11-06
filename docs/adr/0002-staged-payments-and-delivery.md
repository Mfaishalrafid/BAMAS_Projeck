# ADR-0002: Isolasi demo dan rilis bertahap

Status: diterima sebagai batas fase.

Konteks: prototype dapat mengubah status pembayaran di localStorage; ini bukan validasi pembayaran atau otorisasi.

Keputusan: F1 demo berlabel SIMULASI; F2 server/auth; F3 aturan bisnis; F4 gateway sandbox; F5 deployment hanya setelah review keamanan dan persetujuan. Adapter demo terpisah dari provider. PR-0 CI dokumentasi saja, tanpa deployment.

Alternatif pembayaran langsung ditolak karena tidak ada validasi server, idempotensi dan review. Konsekuensi: pengujian sandbox dan persetujuan terpisah untuk live/payout; tidak memigrasikan saldo demo ke produksi.
