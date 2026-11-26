# RC-101 — API identity and attribution gap assessment
Date: 2026-11-26
Branch: feat/rivercloud-core-2026-11-25

## Observed source behavior
- The API server uses a shared bearer token gate for all routes.
- The queue accepts an optional actor context and persists actor references when supplied.
- The server currently calls queuePlan without actor context for POST /deploy.
- Identity claims validation and permission helpers exist in separate prototype modules, but server/API wiring is explicitly absent in README and source comments.
- Approval helpers in RC-22 require externally validated identity claims and a caller-provided issuer verifier; they do not themselves establish OIDC/JWT provenance.

## Risk and containment
This is an architectural gap, not evidence of a live exploit. The prototype remains loopback-bound and is not production-ready. Do not expose this API outside its intended isolated environment or treat shared-token access as individual identity.

## Required design before implementation
1. Define trusted identity object and provenance contract; never derive actor fields from untrusted request JSON.
2. Integrate verified provider claims at API boundary; fail closed if authentication or claim verification is missing.
3. Map authenticated identity to permission catalog per route and action; default deny.
4. Derive actor reference server-side and persist it for queue creation and audit.
5. Separate approve/consume identity and enforce separation-of-duties.
6. Add negative tests: no identity, malformed claims, invalid signature/provider, wrong audience/issuer, expired claims, missing permission, role escalation attempts, spoofed actor JSON and approval actor conflicts.
7. Retain loopback-only restrictions and execution-disabled status until isolated verification and explicit review.

## Status
Assessment only. No API wiring or external authentication was activated in this commit.
