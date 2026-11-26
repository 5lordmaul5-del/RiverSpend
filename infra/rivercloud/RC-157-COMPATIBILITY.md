# RC-157 — Compatibility Adapter Layer
This layer adapts the read-only diagnostic report and control observatory into the RC-156 common contract.

- Normalizes both outputs using `rivercloud.contract.v1`.
- Validates outputs before and after normalization.
- Fail-closed behavior: adapter exceptions become bounded error envelopes.
- No execution, deployment, authorization, external I/O, or credentials.
- Test file is authored but has not been run in this environment.

