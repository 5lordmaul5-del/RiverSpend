# API-RC-136 — RiverSSAI planning-only mock orchestrator

Date: 26 November 2026

## Scope
- Validates the registry on construction and indexes active definition IDs.
- Verifies the caller's test-prefixed API key for `ai:invoke`.
- Validates agent/version, status, bounded request and input-schema shape.
- Canonicalizes the input and computes a domain-separated digest.
- Enforces idempotency with same-input replay and conflicting-input rejection.
- Fails closed on high-risk definitions until a binding-aware approval callback returns explicit true; verifier exceptions are denied.
- Returns a planning envelope only; `executionEnabled=false`. No process, worker, shell, model, network call or handler is launched.

## Limits
This is a mock planning orchestrator, not an operational RiverSSAI runtime. Definition `maxRunSeconds` and `maxConcurrency` are recorded in the plan but not enforced by a runner. The approval callback is a test boundary, not a real approval service. The in-memory idempotency map is not durable and does not replace the gateway store.

## Reproducible tests
```sh
node --test infra/rivercloud/river-ssai-orchestrator.test.mjs
```

No production key, agent process, live service or payment operation is used.


## API-RC-136 CI closeout

GitHub Actions **run 45814754280 — SUCCESS, 33/33 Node tests**. The added orchestrator tests are included alongside the API-key core/store, registry, shared-contract and mock-gateway tests. The orchestrator remains planning-only: no worker/process is launched; the approval verifier is a mock callback; maxConcurrency/maxRunSeconds are not runtime-enforced.


## RC-138 — Registry definition snapshot isolation

- Orchestrator now clones and recursively freezes validated definitions at construction, preventing later caller-side mutation from changing approval/risk/status/schema policy.
- Regression test mutates the original definition and nested schema after construction; the orchestrator retains its validated snapshot.
- CI evidence pending; no test execution is claimed for this commit.


## RC-138 CI closeout

- GitHub Actions run **45815849404 (#53) — SUCCESS**; the contracts job completed successfully on the RC-138 code/test commit.
- The run summary available through the repository integration confirms the job conclusion, but does not expose a test-count transcript; no numeric count is claimed here.
- Regression coverage verifies that mutation of caller-owned definition metadata and nested input-schema objects after orchestrator construction cannot change the validated registry policy.


## RC-139 — Gateway idempotency response isolation

- Gateway now snapshots responses when storing and when returning idempotent write responses.
- Regression test mutates the response object returned to the caller and confirms replay returns an intact cached response.
- Commits: `2265db71` (code), `0a6a1930` (test).
- CI evidence pending; no test execution is claimed for RC-139 yet.


## RC-140 — bounded gateway canonicalization depth

- Gateway canonical JSON traversal now rejects bodies deeper than 32 nested levels, limiting stack exhaustion from deeply nested request structures.
- Added regression coverage with a 40-level nested body; expected fail-closed 400 `body_invalid`.
- Code commit `26ecdc2b`; test commit `ccac1d4e`.
- CI verification pending; no test pass is claimed yet.


## RC-141 — prototype-sensitive gateway keys

- Gateway canonical JSON rejects `__proto__`, `prototype`, and `constructor` property names to reduce prototype-pollution and downstream parser ambiguity risks.
- Added regression coverage for a JSON-owned `__proto__` property and confirms no global prototype mutation.
- CI pending; earlier RC-140 CI failed due to malformed test-source formatting, subsequently repaired. RC-140 depth guard is present.


## RC-142 follow-up — shared canonical JSON bounds

The orchestrator now shares the strict bounded canonical JSON utility with the mock gateway, rejecting sparse/accessor arrays, cyclic/deep structures and other non-JSON input before hashing. Tests added; CI verification pending at commit time.


### RC-142 CI closeout

- GitHub Actions run **45821019210 — SUCCESS, 46/46 tests** (including the new strict canonical JSON utility, gateway and RiverSSAI adapter regressions).
- The preceding attempt **45820922845 failed 44/46** because oversized inputs mapped to HTTP-style status 400 instead of 413. This was corrected to preserve explicit size-limit semantics; no validation was weakened.
- RC-142 remains a shared serializer/security boundary prototype. The mock gateway and orchestrator are not live service runtimes.


## RC-143 — strict registry schema and concurrent idempotency reservation

- Registry input/output schema objects and their field descriptors are now exact, data-only shapes; sparse required arrays and cyclic/extra schema fields are rejected before snapshotting.
- High-risk async approval verification reserves its idempotency slot and capacity before yielding. Concurrent retries with the same key/input share one verification/result; conflicting input is rejected and pending work counts against capacity.
- GitHub Actions run **45832990570 (#113) — SUCCESS, 48/48 tests**. This verified RC-143 before the RC-144 bounded JSON preflight.

## RC-144 — bounded JSON preflight for specialist definitions

- Registry definitions now pass through the shared canonical JSON validator before semantic validation: depth 16, 16 KiB and 2048-node bounds; cyclic references, sparse arrays, accessors, non-JSON values and unsupported array properties fail closed.
- Initial run **45833184587 (#116)** failed one test because the new preflight intentionally returned `definition_json_invalid` instead of the older `schema_contract_invalid` expectation. The assertion was corrected to match the new validation boundary; no security check was weakened.
- GitHub Actions run **45833340221 (#118) — SUCCESS, 49/49 tests**.
- Still a definition catalogue/planning prototype: no live credentials, workers, production API, or real approval service.


## RC-145 — store-backed mock vertical integration

- Added a test-only adapter that resolves a key against the private persistent API-key store, then reuses the existing mock gateway's scope checks, body validation and idempotency logic; it does not duplicate key verification or create a live endpoint.
- Integration coverage verifies scoped send, idempotent replay, persisted revocation, scope denial and missing-store fail-closed behavior.
- Initial RC-145 run **45833616034 (#125) — SUCCESS, 49/49** did not include the new adapter tests because the workflow used an explicit test list. The workflow was corrected to include the adapter integration suite.
- GitHub Actions run **45833702458 (#127) — SUCCESS, 52/52 tests**, including RC-145 integration coverage.
- Adapter and gateway idempotency remain in-memory; store persistence covers API-key records/revocation only. This is test-only and not an operational API or production payment/gateway service.


## RC-146 — full registry catalogue acceptance and performance smoke

- Added a CI smoke test that validates exactly **100000** bounded definitions and confirms the registry count/domain tally without starting processes.
- GitHub Actions run **45833898145 (#131) — SUCCESS, 53/53 tests**. The 100000-definition validation test took approximately **2.11 seconds** in this runner (test duration only; not a general performance guarantee).
- Catalogue maximum remains definitions only; execution, workers, resource limits and real runtime enforcement are not implied.
