# Validasi PR-0

- PASS: audit tree main melalui Git; baseline hanya README.
- PASS: pemeriksaan tautan Markdown lokal dan checksum SHA-256 HTML melalui `python3 scripts/check_docs.py`.
- FAIL awal: staged whitespace check mendeteksi whitespace asli HTML. Diselesaikan dengan atribut -whitespace khusus baseline, tanpa mengubah byte referensi.
- PASS setelah perbaikan: pemeriksaan whitespace seluruh diff PR dan validasi checksum.
- PASS: pemindaian pola terbatas pada seluruh file non-Git untuk private key, GitHub token, AWS access key ID dan Stripe live key; bukan audit secrets menyeluruh.
- NOT RUN: lint/typecheck/build/unit/E2E aplikasi karena PR-0 belum memiliki package manifest/source aplikasi.
- NOT RUN: rendering browser dan visual parity; scope F1.
- NOT RUN: CI hosted pada saat laporan lokal ditulis; hasil lokal bukan bukti GitHub Actions berhasil.
- NOT RUN: deployment, database dan payment; di luar scope.
