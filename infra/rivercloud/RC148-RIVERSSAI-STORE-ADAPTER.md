# RC-148 — Store-backed RiverSSAI adapter (test-only)

## Integration
- Reuses the private file-backed API-key store's resolveRecord boundary and the existing planning-only RiverSSAI orchestrator; it does not duplicate key parsing, hashing, scope verification or registry logic.
- Caller-supplied record fields are overwritten with the store-resolved record.
- Store failures fail closed as 503; invalid, expired or revoked keys are denied; scope denial is delegated to the shared orchestrator.
- Covers replay, revocation, expiry, insufficient scope and a binding-aware high-risk mock approval.
- Plans remain mock-only with execution disabled. No worker, model, shell, live API, production credential or payment action is executed.

## Limits
The API-key store is still a private filesystem prototype without encryption at rest and with documented path/lock race limitations. The orchestrator's idempotency remains in-memory; the approval callback is a test boundary, not a durable one-use approval service. This PR is stacked on PR #102 and is not independently mergeable until its base is merged or the dependency is otherwise resolved.
