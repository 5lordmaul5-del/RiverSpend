# RC-43 — Idempotent API response disclosure review (26 Nov 2026)

## Finding
The RC-34 `POST /api/plan` handler returns the full queue job object for both first submissions and idempotent duplicate submissions. Queue idempotency is digest-based, not actor-scoped. A second authenticated operator submitting an identical plan receives the pre-existing job object, including its original pseudonymous actorRef and actorRoles snapshot.

## Assessment
This preserves original attribution and prevents overwriting it (a positive property), but it may unnecessarily disclose another actor's attribution metadata and stored plan details to a caller who is authorized to submit plans. The current authorization permission `manage_projects` is not equivalent to permission to read arbitrary job details.

## Recommended hardening
- Keep digest-based idempotency and immutable original attribution.
- For duplicate POST responses, return a minimal acknowledgement (duplicate, digest/job identifier, accepted state) rather than the full stored job.
- Add API-level tests for duplicate submissions from a different operator and assert no plan or attribution data is disclosed.
- Keep full job-detail read access behind the explicit `read_jobs` permission.
- Define whether job identifiers/digests themselves are considered sensitive before exposing them.

## Scope and safety
Static review only; this file records a proposed finding, not a code fix or test result. No deployment, merge, provider registration, credential change, runner execution, provisioning or spending.
