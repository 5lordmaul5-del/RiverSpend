# RC-163 — Resilience Evidence Ledger

Read-only, bounded ledger for structured evidence records. It differentiates execution states (including `not_run`) and supports SHA-256 integrity checks for record and ledger payloads.

- Types: test, diagnostic, review, incident, check.
- States: not_run, run, blocked, failed, passed, unknown.
- Limits: 500 records, 4096-character text fields.
- Duplicate record IDs are rejected; records are ordered deterministically.
- SHA-256 detects accidental alteration; it is not a signature, trusted timestamp, immutable storage, or proof of execution.
- Evidence entries do not confer certification or authorize actions. Tests have been authored but are not claimed executed in this commit.
