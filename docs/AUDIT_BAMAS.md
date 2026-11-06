# Baseline audit — original BAMAS HTML

**Source inspected:** `BAMAS-desain-aplikasi-donasi.html` uploaded by the project owner, ~584 KiB single HTML file with compacted CSS & JS and an inline `script type="module"`. Static inspection only; no confirmed end-to-end browser execution of the prototype.

## What is observed, not assumed

- `<title>`: `BAMAS — Bantu Masyarakat · Prototipe Aplikasi Donasi`.
- A React app mounts via `createRoot(document.getElementById("root"))`. Bundle contains compiled JSX; `parcelRequire...` runtime indicates a Parcel-style bundled export.
- CSS contains Tailwind-like utility classes and custom design tokens; client code includes animated transitions, responsive desktop mobile-preview shell, and React state/context/reducer.
- Navigation cases from the code: `home`, `explore`, `detail`, `donate`, `payment`, `success`, `history`, `profile`, `create`, `myCampaigns`, `admin`.
- Donation methods rendered in UI: QRIS, GoPay, OVO, DANA, ShopeePay, BCA VA, Mandiri VA, BRI VA.
- User-facing content describes donation flows and amounts; campaign categories include bencana, pendidikan, kesehatan, pangan, lingkungan, sosial.
- State reducer actions include `CREATE_DONATION`, `PAY_DONATION`, `CANCEL_DONATION`, `CREATE_CAMPAIGN`, `REVIEW_CAMPAIGN`, `TOGGLE_SAVE`, `RESET`.
- `localStorage` persistence via key `bamas-prototype-v1` stores `campaigns`, `donations`, `saved`. Seeded campaigns/donations support demonstration.
- `PAY_DONATION` locally updates donation to `paid` and increases campaign aggregates; `REVIEW_CAMPAIGN` locally approves/rejects. **No trusted server payment validation or admin permission enforcement evidenced in this HTML.**
- Example organizer/profile name is a fixed demo string; image sources include Unsplash. Verify license and image production suitability separately.
- Web desktop variant displays an interactive phone prototype framed around 414x868, while smaller viewports show app full-height.

## Primary risks

1. An HTML bundle is the **build output**, not the maintainable source; component and domain boundaries must be reconstructed, not trivially reformatted.
2. Demo donation state could be mistaken for genuine payment, a financial integrity/security risk.
3. Demo admin features are reachable from the interface; must not imply production authorization.
4. Browser storage is device-local, mutable and unsuited for ledger/payment or multi-user sync.
5. No repository, CI, actual DB, deployed backend or authentication configuration provided in the uploaded HTML.

## Candidate success criteria

- Same navigation, screens, texts and visual identity in the new modular React project.
- Explicitly labeled demo checkout; persisted demo data tested and isolated.
- All monetary data as integer IDR amounts; future backend authoritative for real financial state.
- Reliable lint/typecheck/test/build and a PR for migration.
- External media provenance/usage reviewed before production.
