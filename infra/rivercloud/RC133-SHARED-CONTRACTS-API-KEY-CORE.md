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
