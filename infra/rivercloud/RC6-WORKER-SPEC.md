# RC-6 — Worker profile specification (not an executable worker)

This milestone defines fixed, allowlisted job profiles. It does not clone repositories, execute build commands, access the network, create containers or publish sites.

## Profiles
- `node-static`: declarative profile for a future static-site build.
- `node-tests`: declarative profile for a future test-only job.

## Guardrails in this specification
- Only RiverSpend repository and main branch are declared.
- Staging only; production rejected.
- Immutable 40-character commit SHA required.
- Profile names are allowlisted; arbitrary command strings are not accepted.
- Profiles declare restricted network posture and time budget for future worker design.

## Still required before execution
A dedicated isolated worker host/runtime, resource quotas, network egress enforcement, immutable workspace, safe checkout, fixed command mapping, secrets policy, audit logging, approval gate, integration tests and verified rollback. This module is specification-only.

Test: `node --test infra/rivercloud/worker-spec.test.mjs`
