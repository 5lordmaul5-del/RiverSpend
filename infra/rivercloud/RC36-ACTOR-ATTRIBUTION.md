# RC-36 — authenticated queue actor attribution (provisional)

**Status: isolated queue/API code and regression tests added; CI verification pending.**

RC-34's proxy/API prototype previously accepted a trusted identity header and enforced RBAC, but the queue job did not retain who submitted it. RC-36 adds a pseudonymous attribution field to API-created jobs and the same transaction's queue event.

- The API derives a keyed HMAC-SHA-256 actor reference from the trusted `X-Forwarded-User` label and passes it with the mapped role snapshot to `queuePlan`.
- The queue validates actor-reference format and role vocabulary before committing.
- New jobs and their `job_created` event store the actor reference and role snapshot; raw subject labels are not persisted in the queue.
- Idempotent retries do not overwrite the original attribution, even if a different actor submits the same plan digest.
- Legacy queue callers may still create unattributed jobs. This increment is not a substitute for RC-17 lifecycle migration or a protected external audit sink.

## Limitations

The actor reference is a keyed HMAC pseudonym of a proxy-supplied username/label, which reduces offline dictionary exposure but is not an authentication proof. It is not bound to an OIDC issuer or stable `sub` claim, and the local queue events are not independently immutable. Before production use, replace the provisional label with an authenticated issuer+subject identity and a keyed pseudonymization scheme, then migrate queue submission into the RC-17 protected lifecycle/audit transaction.

Tests cover format validation, persisted attribution, role snapshot, idempotency and preservation of the first attribution on duplicate plans. CI evidence is pending.


### CI closeout

GitHub Actions run **45743359921 (#340)** passed **147/147 Node tests**, including actor-attribution and malformed-context tests, plus all shell/Python, restore race, Compose and Caddy validations. This verifies commit `f31985e3b1a4d25fd078faccd665a2da21dbe711`. No RiverCloud services were started.


## RC-137 — keyed actor pseudonym

The API now requires a separate actor-pseudonym secret (minimum 32 characters, placeholders rejected) and uses HMAC-SHA-256 instead of an unkeyed hash. Compose and `.env.example` include the placeholder; the real value is not set or modified. The test harness supplies a test-only secret. This still relies on proxy-supplied user labels, does not bind issuer/subject, and is not an external audit mechanism.


## RC-137 — keyed actor pseudonymization (26 November 2026)

- Replaced the provisional unkeyed actor hash with HMAC-SHA-256 using a separate actor-pseudonym secret.
- The API rejects missing, short or `CHANGE_ME` placeholder secrets; the Compose `.env.example` placeholder is not a usable runtime value. No real secret was set or modified.
- GitHub Actions **run 45815034075 — SUCCESS, 257/257 Node tests**.
- Also passed: bootstrap shell syntax, backup/restore/Python syntax, **3/3 restore directory replacement race tests**, Compose validation, API image build/inspection, runtime package-manager absence check, SBOM generation, fixed HIGH/CRITICAL Trivy gate and Caddy validation.
- API image SBOM: **20 components, 6 vulnerability entries**, SHA-256 `1e12c40ef36e0dfcb72b7557bc92c0589651ff490311704612e6d12d908d5b63`. The fixed HIGH/CRITICAL gate passed; this is not a zero-vulnerability or full-repository scan. The SBOM was not retained.
- Caddy validation passed with a formatting warning at line 4. No service was started.
- The pseudonym still derives from a proxy-supplied user label, not a verified issuer+subject, and does not replace authentication or an external audit sink.
