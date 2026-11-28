# RC-39 — isolated API image build validation

This increment adds a Docker build of the RiverCloud API image to the existing isolated CI workflow, followed by inspection of the resulting local image ID.

## Scope and safety

- Build only; no API container or Compose service is started.
- Uses the explicit Dockerfile and repository-root build context.
- No live OIDC provider, production credentials, data, deployment, staging host, or runner is involved.
- A successful build is not an SBOM or vulnerability scan.

## CI evidence

- GitHub Actions push run **45757060159 (#356)** and PR run **45757064289 (#357)** — SUCCESS, 148/148 Node tests and the complete validation suite, including API image build and image inspection.
- No API container or Compose service was started.
