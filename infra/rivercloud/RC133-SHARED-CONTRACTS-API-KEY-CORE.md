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


## API-RC-135 CI closeout

GitHub Actions **run 45814328503 — SUCCESS, 26/26 Node tests**. The workflow now includes the seven file-store tests alongside the existing API-key core, registry, contract and mock-gateway tests. The store remains a prototype with filesystem-permission-only confidentiality, path/lock race limitations, no encryption-at-rest and no live key/gateway wiring.


## API-RC-136 — RiverSSAI planning orchestrator

Added a planning-only mock orchestrator with API-key scope verification, active definition lookup, input-schema validation, canonical digest, bounded idempotency and binding-aware approval callback for high-risk definitions. It returns a plan with execution disabled and launches no workers. Tests and limitations are recorded in `API-RC-136-RIVERSSAI-ORCHESTRATOR.md`; CI verification is pending.


## API-RC-136 CI closeout

GitHub Actions **run 45814754280 — SUCCESS, 33/33 Node tests**. The added orchestrator tests are included alongside the API-key core/store, registry, shared-contract and mock-gateway tests. The orchestrator remains planning-only: no worker/process is launched; the approval verifier is a mock callback; maxConcurrency/maxRunSeconds are not runtime-enforced.


## RC-142 — shared bounded canonical JSON

- Replaced the gateway's and RiverSSAI orchestrator's duplicated canonicalizers with a shared strict serializer.
- Enforces depth, byte and node bounds; detects cycles, sparse arrays, non-index array properties, accessors, symbol keys, prototype-sensitive keys and non-JSON values.
- Both mock gateway and planning-only orchestrator reject malformed nested payloads before hashing/idempotency storage.
- Added direct utility and adapter regression tests. This remains mock-only and does not create a live API or agent runtime.
- GitHub Actions verification pending at commit time.
