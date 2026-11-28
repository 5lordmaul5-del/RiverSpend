# RC-63 — identity-verifier exception fail-closed behavior

The RC-13 claims gate now treats a throwing signature/provenance verification callback as an ordinary verification failure and returns `signature_not_verified`. It no longer propagates verifier exceptions into callers. Only an explicit boolean `true` is accepted.

Regression coverage exercises a verifier callback that throws. GitHub Actions verification is recorded in the progressive report. This is still a validation helper: no real OIDC/JWKS verification, provider login, API-route integration, session revocation or MFA has been implemented by this increment.
