# RC-8 — Audit and approval foundation (prototype)

## Included
- Allowlisted event names and local append-only hash-linked ledger prototype.
- Ledger verification detects hash alteration and chain breaks.
- File persistence defaults to restrictive directory/file permissions.
- This prototype is not tamper-proof against a host administrator; production must export logs to an independent protected destination.

## Approval design (not yet connected)
- Approval must be bound to an immutable commit, project, profile, target, digest and expiry.
- Approver identity and decision must be authenticated.
- Denied/expired approvals must not be executable.
- Production releases require a separate explicit approval and are not supported in this prototype.
- Prevent replay and enforce one-use approvals.

## Build/health/rollback design
- Worker output is treated as untrusted.
- Secrets must be redacted from logs and artifacts.
- Health checks must be bounded, explicit and fail closed.
- Rollback only to a previously verified immutable artifact, with separate authorization.

## Limitations
No build execution, approval service, webhook, deployment, external log sink, rollback or production integration is implemented. Tests have not been executed in the runtime environment.
