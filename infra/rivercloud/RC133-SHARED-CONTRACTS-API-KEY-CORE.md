# RC-133 — Shared contracts and API-key core (prototype)

Date: 26 November 2026

## Deliverables

- Shared v1 service boundary contract for RiverCloud, RiverSSAI, River API, Signals and Shop.
- Test-only API key core with a non-production `rs_test_` prefix, random key material, one-time secret return, domain-separated SHA-256 record digest, constant-time digest comparison, expiry, scopes and revocation-state handling.
- Specialist registry-definition validator with a hard ceiling of 100,000 definitions; definitions are catalog entries, not 100,000 running workers.
- High-risk definitions must declare approval required; registry entries reject additional executable fields such as shell commands.
- Contract regression tests compare API-key scopes and registry capacity with the manifest.

## Limits

This branch does not connect a gateway, durable key database, issuer login, key rotation service, rate-limit engine, RiverSSAI runtime, Signals server, Shop checkout or RiverCloud runner. API-key records are a core utility prototype and must be persisted in a separately reviewed, encrypted/permissioned store before real use. No production key or payment capability is created. Shop checkout is mock-only.

## Reproducible tests

Run from the repository root:

```sh
node --test infra/rivercloud/api-key-core.test.mjs infra/rivercloud/agent-registry-core.test.mjs infra/rivercloud/shared-contracts.test.mjs infra/rivercloud/gateway-mock.test.mjs
```

The test files use Node's built-in test runner and no external packages.


## Mock gateway route harness

The contract manifest and mock route table are checked for drift. Mock routes cover RiverCloud plan/jobs, RiverSSAI registry/invoke, Signals read/send and Shop catalog/mock checkout. API-key scopes are enforced in the harness; POST requests require request IDs and idempotency keys, bodies are bounded, duplicate payloads return the original mock response, and conflicting payloads are rejected.

The harness is an in-memory test adapter only. It is not a production gateway, durable idempotency service, messaging service, catalogue backend or payment processor.


## API-RC-135 — Persistent API-key store prototype

A bounded private file-backed record store is added in `api-key-store.mjs`. It persists digest-only records, supports verification, revocation and metadata listing, and uses atomic snapshot writes with a lock and private-mode checks. See `RC135-API-KEY-STORE.md` for limitations and reproducible tests. This is not an encrypted production credential store.


API-RC-135 focused reconstructed local tests: **7/7 passed** after correcting a redundant directory-creation call in the lock-timeout test fixture. This evidence is not a full checkout or GitHub Actions result; CI remains unverified.
