# Critical safety rules: donation product

**PROTOTYPE ONLY**: The original BAMAS HTML can mark a donation as `paid` by dispatching a local reducer action and stores data under `localStorage`. It is a demo, NOT a real transaction.

## Mandatory business invariants for production

1. Client may request checkout, not approve its own donation.
2. Server must authenticate appropriate actions and enforce authorization for admin review and campaign creation updates.
3. Payment status changes must come from verified provider notification + server reconciliation, not user-provided values. Validate signature and amount, matching external payment ID, campaign and order.
4. Webhook handler must be idempotent and retry-safe. Duplicate callbacks must not double-count donors or amounts.
5. Use integer IDR amounts; enforce min/max and validate every input on server; apply transaction handling and DB constraints.
6. Separate `payment intent`, `payment event`, `donation`, `campaign`, and eventual `disbursement`; never use aggregate in mutable browser state as the source of truth.
7. Reject forged/admin requests. Audit campaign review actions (who/when/reason). Principle of least privilege.
8. Keep API keys and secrets exclusively server-side. Store `.env.example` with placeholders only; never commit `.env` or token literals.
9. Rate limit risky endpoints, validate file uploads, protect against XSS/CSRF as applicable, store minimum personal data and have explicit data-retention plan.
10. Follow applicable local regulations and gateway/provider requirements before accepting real donations; request professional/legal/payment compliance review as needed.

## Demo separation

- Visually mark any QRIS/VA code, pay button, and success status in demo mode as 'Simulasi / bukan transaksi nyata'.
- Prevent mixing seed donations with real ledger entries.
- Never call external real gateway without user approval.
- Make `DemoPaymentProvider` and future `RealPaymentProvider` separate adapters with no hidden automatic switch.
