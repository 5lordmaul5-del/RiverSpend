# River API Gateway Core — key-management prototype

This isolated branch adds an in-memory API key-management foundation. It is not a connected gateway and is not production-ready.

## Implemented

- Random high-entropy key generation with `rs_api_` prefix; plaintext is returned once.
- SHA-256 key hashes stored in memory only; no plaintext or hash is exposed in list/audit responses.
- Constant-time hash comparisons while searching the bounded record set.
- Tenant isolation for validation, list, rotate and revoke.
- Allowlisted scopes: `api.read`, `api.write`, `inference`, `scheduler.read`, `scheduler.write`, `rivercloud.read`, `signals.read`, `shop.read`, `shop.write`, `admin`.
- Rotation, revocation, expiry, cumulative quota and per-window rate limit.
- Bounded key records and bounded audit events; audit entries contain no key material.
- Testable clock parameters for policy evaluation.

## Limits

- **In-memory only**: no persistence, database, encryption-at-rest, durable audit, cross-process synchronization or recovery.
- **No HTTP gateway integration**: this module is not mounted in RiverCloud, RiverSSAI, Signals or Shop.
- The key manager does not authenticate a caller or establish tenant identity; a future gateway must obtain tenant identity from a verified auth provider and must not trust client-supplied tenant IDs.
- API key creation, rotation and revocation are local module operations, not externally exposed routes.
- The audit log is bounded and local; it is not tamper-proof or immutable.
- No real secrets, credentials, accounts, external APIs or production data were accessed or changed.

## API shape

`APIKeyManager.createKey({tenantId, scopes, quota, rateLimit, windowMs, expiresAt, createdBy})` returns a key once plus safe metadata.

`validate({key, tenantId, scope, now})` returns an allow/deny result and consumes quota/rate-limit budget only when allowed.

`rotate(keyId, {tenantId, rotatedBy, now})` revokes the old key and returns a new key once.

`revoke(keyId, {tenantId, revokedBy, now})` revokes the key. `listKeys(tenantId)` and `auditEvents({tenantId, limit})` return safe, tenant-scoped metadata.

## Validation

CI uses Node 22 and `node --test`; no dependencies or secrets are required. Fresh workflow evidence is pending.
