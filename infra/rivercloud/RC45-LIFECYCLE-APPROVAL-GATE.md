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


## RC-45 CI closeout (26 November 2026)

- Intermediate runs **45765623540 (#382)** and **45765631060 (#385)** failed as the new gate was introduced: the existing approval/facade tests still attempted generic `pending -> approved`. The failures were not counted as passing evidence; assertions and fixture transitions were corrected.
- Code/test commit `be13c9eff5373f13eb8f2a040608f2af462ff01f`: GitHub Actions **45765635507 (#387) — SUCCESS, 152/152 Node tests**, 0 failures; bootstrap shell, backup/restore and Python syntax, restore directory-replacement race, Compose configuration, API image build/inspection and Caddy validation all passed.
- Documentation closeout commit `370f06a9a292b45911a1859f28d3a84edea2f25f`: GitHub Actions **45765687287 (#392) — SUCCESS** across Node tests, bootstrap shell, backup/restore/Python, restore race, Compose, API image build/inspection and Caddy validation. Exact Node count was not independently extracted from this run's logs; the count above is from #387.
- No RiverCloud services or runner were started. No live deployment, merge, staging host, production credentials/data, provisioning or spending occurred.
