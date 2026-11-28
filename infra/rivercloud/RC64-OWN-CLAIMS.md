# RC-64 — own-property identity claim validation

RC-13 now requires every mandatory identity claim to be an own property of the claims object. Inherited properties no longer satisfy issuer, subject, audience, issued/expiry times, or role claim presence.

Regression coverage verifies an object inheriting the claims from its prototype is rejected with `missing_claim`. GitHub Actions run #695 verified the increment (221/221 tests and infrastructure validations).

This remains a claims validation helper, not an actual OIDC/JWKS signature verifier or provider integration.
