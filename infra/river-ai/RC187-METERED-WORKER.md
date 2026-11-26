# RC-187 — Metered worker composition
Composition scaffold wiring RC-182 bounded worker runner to RC-186 metered execution. The view extracts positive estimated_tokens from payload and retains payload under work_payload. Auth, task policy, quota database, trusted identity/period resolvers and execution callback are injected.

Prototype safety: executor callbacks must be idempotent or safe for lease retries; task payload is untrusted input and must not provide identity, plan or billing period. Quota commit timing relative to worker completion is not transactional with the task ledger; failure windows remain. Not a deployable service; tests written, not run.
