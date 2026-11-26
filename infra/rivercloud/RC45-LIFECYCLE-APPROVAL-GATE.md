# RC-45 — lifecycle approval gate

## Finding

The RC-17 atomic audit/approval-consumption pathway already recorded an approval-consumed event and the resulting transition together. However, the generic transition helper and legacy facade also allowed `pending -> approved` without token consumption. This was a bypass of the intended approval gate.

## Correction

- Removed `approved` from generic `pending` transition sets.
- Generic direct approval now fails with `approval_required`; the legacy facade denies it too.
- Audit replay accepts an approval transition only as the immediately adjacent, matching transition after `approval_consumed` (matching job ID, consumer/actor and required note).
- A fabricated direct approval event is rejected by replay even if the record hash is recomputed.
- Generic transitions remain available for other allowed states (including rejection/cancellation); the token-consumption path is the only approval path in RC-17.

## Regression coverage

- Direct generic approval rejection and no state/audit mutation.
- Recomputed-hash replay of a direct approval event fails.
- Legacy facade cannot bypass the gate.
- Existing one-use approval consume/transition and separation-of-duties tests continue to exercise the atomic pathway.
- Concurrency, state persistence and audit-chain checks remain covered by the existing test suite.

## Verification status

- Code/test changes are committed on the isolated PR branch only.
- GitHub Actions verification is pending at this update; no local checkout/test pass is claimed.
- No live OIDC login, runner, staging host, production deployment, merge, production data/credentials change, provisioning or spending occurred.

## Reproduce

```sh
node --test infra/rivercloud/rc17-atomic-lifecycle.test.mjs infra/rivercloud/lifecycle.test.mjs infra/rivercloud/approval-bound.test.mjs infra/rivercloud/rc22-approval-identity.test.mjs
```
