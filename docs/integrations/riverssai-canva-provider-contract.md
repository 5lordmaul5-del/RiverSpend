# RiverSSAI Canva Provider Contract — safe foundation

This increment adds pure, testable brief normalization, export metadata validation and a fail-closed publication approval gate.

## Implemented in this branch
- `lib/creative/providers/canva-contract.js`: brief contract and validation primitives.
- `lib/creative/providers/canva-contract.test.js`: Node test coverage.

## Not implemented
- Canva OAuth, API calls, export job polling/download, storage, or publishing.
- These require approved runtime access, secure credential infrastructure, and integration testing.

## Suggested local test
Run with a Node version supporting the built-in test runner and ESM:
`node --test lib/creative/providers/canva-contract.test.js`

Publishing is blocked unless a separate approval value is explicitly supplied. No secrets are embedded.
