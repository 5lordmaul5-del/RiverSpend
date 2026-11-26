# RiverPay double-entry ledger

This migration provides an internal bookkeeping schema only. It is not a bank account, wallet, escrow, payment instrument, or money-transfer facility.

## Posting invariants (must be implemented before use)
- Each posted journal must balance debits and credits for each currency (sum debit = sum credit).
- Store amounts as integer minor units (e.g. euro cents), never floating-point.
- Posted entries must be immutable; corrections use reversing journals.
- Journal posting should be atomic and idempotent, using the unique transaction/idempotency references.
- Never treat an internal recorded balance as customer funds available for withdrawal.
- Reconcile journal records to PSP settlement and fee reports; accounting and tax review is required.

## Suggested account classes
- PSP clearing (asset)
- RiverSpend fee revenue (revenue)
- Seller payable memorandum account (liability only if the legally/contractually applicable model supports this accounting treatment)
- Refund/chargeback tracking (reviewed accounts and procedures)

Account definitions and recognition timing require accountant review for the selected contract and payment flow.
