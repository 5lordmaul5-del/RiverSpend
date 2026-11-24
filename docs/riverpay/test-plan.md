# RiverPay test plan

- Amounts are integer minor units and reject zero/negative values.
- Idempotency: duplicate payment-create request does not create duplicate transaction.
- Webhook authenticity: invalid signature rejected; secrets never logged.
- Replay: repeated event ID is deduplicated.
- State transitions: reject invalid or backward transitions; refunds/disputes handled separately.
- Ledger: journal posting atomic; debits and credits balance by currency; failed posting leaves no partial rows.
- Ledger: posted entries cannot be edited/deleted; corrections use reversal entries.
- Authorization: no client-side direct access to payment/ledger tables; finance/admin access audited.
- Reconciliation: compare transaction totals, provider fees, refunds, disputes and payout reports.
- Provider test mode: test payment, failure, refund, webhook retry, dispute, payout scenario.
- Secrets: test/live separation, rotation and no secret leakage into client bundles or repository.
