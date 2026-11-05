# UI/UX parity checklist — compare against bundled HTML reference

Use the source HTML as reference for page composition and interactions. Do not invent finished features from labels alone.

- [ ] Branding BAMAS — Bantu Masyarakat, app name, Indonesian language, rupiah formatting
- [ ] Typography Plus Jakarta Sans + Bricolage Grotesque, shapes, shadow, spacing, iconography
- [ ] Colors: magenta CTA, lime accent, lilac/cream/mint/coral cards, dark ink text
- [ ] Mobile-first layout and bottom navigation (five tabs)
- [ ] Desktop presentation or suitable replacement preserving demo frame behavior
- [ ] Home: campaign hero/urgency, cards, statistics and CTA
- [ ] Explore: search keyboard shortcut `/`, category filters, sort
- [ ] Detail campaign: story, updates, progress, supporters and donation CTA
- [ ] Donation wizard: nominal, payment method, confirmation, validation
- [ ] Demo payment: method instructions, simulated confirmation and timeout if applicable
- [ ] Success: donation amount/receipt reference and navigation
- [ ] History: paid/pending status, filter, receipt/detail if present
- [ ] Profile: donated amounts, saved campaigns, campaign management links
- [ ] Campaign creation wizard: fields, validation, submitted for review
- [ ] My campaigns: own submissions with active/review/rejected display
- [ ] Admin dashboard: KPI, graphs, review queue, approve/reject **demo-only**
- [ ] Browser refresh & localStorage corrupted data handling (demo mode)
- [ ] Empty/loading/error screens, focus management, keyboard Escape/back and reduced-motion behavior
- [ ] Smoke tests at 390x844 and 1280x900; record screenshots before/after

In each PR, indicate which checkboxes were actually verified versus not run.
