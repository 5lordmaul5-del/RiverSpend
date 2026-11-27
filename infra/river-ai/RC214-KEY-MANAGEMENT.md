# RC214 — Key Management & Access Control

Prototype metadata registry for role-based permissions over key identifiers; it deliberately does NOT hold cryptographic key material.

- Admin-only key metadata registration, granting, revoking and deactivation.
- Roles: admin, agent, operator, viewer.
- Authorization checks and audit events (allow/deny).
- Key IDs are random identifiers; purpose is metadata.

## Limitations
In-memory only, audit log is mutable/non-durable, no identity authentication, no real vault, no secure key rotation or storage. Production use requires authenticated identities, hardened durable audit, external KMS/OS keystore, threat review, and tested policy. Tests authored but not executed. Draft PR; no merge/deploy.
