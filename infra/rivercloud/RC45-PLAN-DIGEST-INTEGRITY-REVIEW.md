# RC-45/RC-141 — Lifecycle plan digest integrity

Date: 26 November 2026
Scope: isolated RiverCloud branch; prototype hardening only. No execution, deployment, merge or production change.

## Finding
The earlier RC-45 review identified that the lifecycle stored a caller-supplied digest beside a redacted plan, without proving that the digest represented the stored plan.

## RC-141 remediation
- The lifecycle boundary now derives SHA-256 from the bounded, redacted plan that it actually persists. A supplied digest is accepted only if it matches that computed value; it is no longer authoritative.
- Reads recompute the plan digest and reject plan changes that do not match the audit-bound digest.
- Redaction rejects oversized arrays/objects/strings, excessive depth, non-JSON values, sparse/accessor arrays, accessor properties, symbols and non-plain objects instead of silently truncating or executing getters.
- Approval records continue to bind to the lifecycle job digest, now derived from the persisted plan representation.

## Limits
This digest covers the **redacted prototype plan**, not a separate secret-bearing execution payload. The execution runner remains disabled. JSON key order is retained and affects the digest; this is not a general-purpose canonical JSON implementation. The hash-chained audit ledger is unkeyed and not an external immutable sink, so a local attacker with write access to the state can rewrite the full ledger. OIDC/RBAC and real staging remain blockers.

## Regression closeout — 26 November 2026
- Caller digest mismatch rejected before commit.
- Post-creation plan mutation detected on read.
- Redaction capacity and accessor input fail closed.
- GitHub Actions **run 45853593027 (#917) — SUCCESS, 262/262 Node tests; 5/5 restore safety tests** on RC-141 test head.
- Approval and lifecycle tests now use a digest derived from the bounded redacted plan; the cross-process one-use approval race test also passes.
