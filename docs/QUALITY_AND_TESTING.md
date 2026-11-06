# Coding quality and testing policy

## Clean code

- Favor small cohesive functions/components, intent-revealing names, explicit types, minimal props.
- Extract shared UI patterns *after* patterns are proven; avoid giant generic component factories.
- Separate fixture, state, formatting, storage and validation from UI components.
- Use `Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', maximumFractionDigits:0 })`; store amounts as integer rupiah.
- No `any`, unused code, duplicate business rule, inline hardcoded payment statuses or secrets.
- Type-specific APIs, input validation and consistent error handling.

## Tests expected

| Area | Key tests |
|---|---|
| Campaign list | active-only public visibility, category/search/sort/empty states |
| Donation calculator | preset/custom amount, minimum/maximum, invalid/non-integer amount, formatting |
| State transitions | pending -> paid only once, cancelled not counted, duplicate events do not double count |
| Demo persistence | reload retains demo campaigns/donations/saved; corrupted localStorage handled |
| Campaign creation | validation, draft/review status, ownership (future server phase) |
| Admin | review approve/reject; non-admin forbidden in backend phase |
| Payment | client cannot mark real payment paid; verified server webhook only; replay safe |
| UX | mobile navigation, focus order, screen reader labels, reduced motion |
| Regression | home, explore, campaign detail, demo donation, history, create, admin flows |

## Quality gates

Before commit/push, execute existing scripts or add documented equivalents to the newly scaffolded app:

- Formatter check (e.g., Prettier)
- ESLint
- `tsc --noEmit`
- Unit/component tests (Vitest and React Testing Library suggested)
- Build (Next.js or Vite, as chosen)
- E2E smoke (Playwright for flows, if installed)
- Secret scan / diff review

Report a concise matrix PASS / FAIL / NOT RUN for every gate. `NOT RUN` is not a pass. Don't enable CI config unless `package.json` commands exist and are proven.

## Optimization methodology

1. Establish baseline (build size, page experience, component profile, query plan).
2. Identify true bottlenecks.
3. Make one focused change at a time.
4. Repeat measurement and regression tests.
5. Roll back if negligible gains or behavior regressions.

Do not blindly add React memo/useMemo/useCallback or caching to everything.
