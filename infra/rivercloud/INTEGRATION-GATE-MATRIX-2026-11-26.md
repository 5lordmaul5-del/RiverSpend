# RiverCloud Integration Gate Matrix — 2026-11-26

Branch: `feat/rivercloud-unified-policy-2026-11-26`

This matrix converts source-review gaps into bounded behavioral tests. It is a planning artifact; tests have not been executed and runtime integrations remain unverified.

## Gate matrix

| Area | Positive case | Negative/adversarial cases | Required evidence | Gate |
|---|---|---|---|---|
| Request contract | Exact four-key request accepted | Unknown key; symbol/accessor; missing key; wrong type | Behavioral tests at both ingress paths | Closed |
| Policy | Allowed project/main/staging + valid SHA | Wrong project/repo/branch/target; malformed SHA; profile drift | Resolver/engine test | Closed |
| Actor normalization | Bounded role + valid pseudonymous actorRef | Caller-supplied roles/ref; malformed ref; role overflow/unknown role | Authentication middleware integration test | Closed |
| API route parity | Equivalent request yields consistent behavior | Permission/error/status divergence between bearer and proxy routes | Route-by-route parity tests | Closed |
| Authentication | Provider verifies signature and issuer/audience/time | Invalid signature; stale claims; wrong issuer/audience; revoked key; rotation | Provider fixture and integration evidence | Closed |
| Proxy trust | Trusted proxy supplies authenticated identity | Direct peer; spoofed headers; unexpected proxy; missing identity/groups | Network and ingress configuration evidence | Closed |
| Approval | Approval bound to plan/environment/commit/policy | Replay; expired; changed plan; duplicate nonce; wrong consumer; concurrency | Behavioral atomic-consumption tests | Closed |
| Queue/lifecycle | Reconcile matching queue and lifecycle records | Digest/ID mismatch; duplicate; concurrent write; corrupt ledger; redaction drift | Disposable fixture tests | Closed |
| Persistence/recovery | Recover valid state after restart | Partial write; corrupt file; interrupted transition; restore mismatch | Controlled fixture and backup/restore tests | Closed |
| Audit chain | Valid transition verifies | Tampering; missing link; inconsistent state | Integrity and tamper tests | Closed |
| Runner/execution | Prepared envelope only | Any attempted execution path remains blocked | Source check and explicit negative test | Closed |
| CI | Relevant tests discoverable and repeatable | Missing coverage, flaky/unsafe test setup | CI configuration and workflow evidence | Closed |

## Sequence to open gates

1. Author behavioral fixture tests for contract, policy and route parity.
2. Integrate identity verification without trusting caller-provided claims or headers.
3. Bind approval actor identities to authenticated principals and immutable plan details.
4. Behavioral-test queue/lifecycle reconciliation, atomic consumption and audit integrity.
5. Test persistence and recovery using disposable fixtures only.
6. Verify CI discovers and reports all tests; test execution requires separate explicit approval.
7. Conduct a staged rehearsal only after prior gates pass and with explicit authorization.

## Safety posture

- No worker execution, deployment, production endpoint, external credential or service configuration is enabled by this matrix.
- Each gate remains **CLOSED** until evidence exists.
- Source-only inspection and authored tests are not runtime validation or security certification.
