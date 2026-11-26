# River API quota, idempotency and execution lifecycle specification

Status: design guidance for implementation; not implemented by this document.

## Request lifecycle
1. Authenticate identity and bind tenant/actor server-side.
2. Validate request shape and limits; reject unknown fields.
3. Validate key status, tenant binding and required scope.
4. Resolve idempotency key within tenant+actor+scope; reject conflicting payload hashes; replay a completed result only within configured retention and policy.
5. Atomically reserve quota and rate-limit capacity. A reservation must be uniquely associated with request ID.
6. Dispatch only to an allowlisted provider/model adapter with bounded timeout, cancellation signal and output limit.
7. Complete reservation with actual usage or release/adjust it on failure. Reservation updates must be atomic and safe against retries.
8. Persist outcome and sanitized audit event; do not log prompts, provider secrets, credentials or full outputs by default.
9. Return bounded response and correlation ID.

## Reservation invariants
- A request cannot dispatch without a successful reservation.
- Replays cannot create additional reservations or executions.
- Reservation state transitions are idempotent.
- Tenant/actor/scope are derived from trusted authentication and key records, never caller-supplied body fields.
- Fail-closed when quota storage is unavailable.
- If provider outcome is ambiguous, mark the reservation/request for reconciliation rather than blindly retrying.

## Suggested state model
created -> validated -> reserved -> running -> succeeded|failed|cancelled|timeout
Reservation: reserved -> settled|released|reconciliation_required.

## Test cases to add
- Concurrent requests at the quota boundary.
- Repeated idempotency key with same and different payload.
- Reservation rollback after dispatch failure.
- Timeout and cancellation with provider outcome ambiguity.
- Storage unavailable before reservation and during settlement.
- Cross-tenant idempotency/key attempts.
- Duplicate worker/retry handling.

## Implementation acceptance
Use transactional storage or an equivalent atomic coordination mechanism. In-memory counters are not sufficient for multi-worker production. Do not enable real execution until these invariants are implemented and tested.