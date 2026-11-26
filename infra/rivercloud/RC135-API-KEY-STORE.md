# API-RC-135 — Persistent API-key record store prototype

Date: 26 November 2026

## Deliverable
- Private, bounded JSON snapshot store for test-prefixed API-key records.
- Stores key digests only; returned plaintext key is not persisted.
- Atomic temp-write, file sync, rename and directory sync.
- Exclusive lock with timeout, bounded snapshot and collection size.
- Owner and private-mode checks for the store directory/file.
- Rejects symlinked directory components and no-follow opens of the store file.
- Revoke is idempotent; list returns metadata without digest.
- Test suite includes concurrent creation, restart verification, scope/expiry/revocation, capacity, unsafe permissions, symlink, lock timeout, malformed snapshot and uncertain durability.

## Limitations
- This is a prototype file store, not a production credential service. It is not encrypted at rest; filesystem permissions are the only storage confidentiality control.
- The path checks are path-based and do not eliminate races against concurrent ancestor replacement. Lock-file cleanup has the same local-path limitation.
- No real key issuer, rotation workflow, identity-provider integration, external audit sink, rate-limit service or Signals/Shop live gateway is wired.
- A directory-sync error after rename is reported as commit durability uncertain; the record may be present even though the caller did not receive the secret. This can leave an unusable record and requires a reviewed recovery policy before real use.

## Reproducible tests
```sh
node --test infra/rivercloud/api-key-core.test.mjs infra/rivercloud/api-key-store.test.mjs infra/rivercloud/agent-registry-core.test.mjs infra/rivercloud/shared-contracts.test.mjs infra/rivercloud/gateway-mock.test.mjs
```

No production keys, credentials, live services or payment operations were used.


## Test correction and local evidence

The first CI attempt exposed a fixture setup error: a test called `mkdir` on the already-created `mkdtemp` root. That redundant call was removed. The seven API-key-store tests then passed in a reconstructed temporary workspace copied from the source and test files (**7/7**). This is not a full checkout and is not GitHub Actions evidence; CI for the corrected commit remains unverified.


## API-RC-135 CI closeout

GitHub Actions **run 45814328503 — SUCCESS, 26/26 Node tests**. The workflow now includes the seven file-store tests alongside the existing API-key core, registry, contract and mock-gateway tests. The store remains a prototype with filesystem-permission-only confidentiality, path/lock race limitations, no encryption-at-rest and no live key/gateway wiring.
