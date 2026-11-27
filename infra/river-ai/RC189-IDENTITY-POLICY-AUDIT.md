# RC-189 — Fail-closed policy and audit prototype

- Implements an explicit role-to-action allowlist and a fail-closed authorization helper.
- Introduces a minimal SQLite audit trail with event-ID deduplication.
- Provides a combined authorize-and-audit helper.

## Trust boundary
The `Principal` is a data structure, not authentication. Production must obtain it from verified session/token middleware and protect role assignment. Do not accept subject, roles, or authenticated status directly from an untrusted client. This prototype has no authentication provider, token validation, secrets management, rate limiting, or authorization-service wiring.

## Audit limitations
SQLite local file; no tamper-resistant append-only storage, export, retention controls, or cross-node consistency. Details must not contain secrets or personal data. Duplicate event IDs silently retain the first record.

Tests are included but not run in CI. Draft PR only; not merged or deployed.
