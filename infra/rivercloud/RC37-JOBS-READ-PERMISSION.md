# RC-37 — distinct permission for job details

## Finding
The proxy API route `GET /api/jobs` previously required `read_status`. That permission was also granted to Auditor and Viewer, but the route returned the full queue, including deployment-plan details and attribution metadata.

## Change
- Add `read_jobs` to the explicit RC-13 permission catalog.
- Grant `read_jobs` only to owner, admin and operator.
- Keep `read_status` for the health/status endpoint.
- Remove the raw actor username from the health response.
- Reject queue-detail access for Viewer and Auditor.

## Tests
The RC-34 API tests assert that Viewer and Auditor can read health/status but receive 403 for `/api/jobs`; Viewer also cannot submit plans. Operator remains able to list the queue and submit plans; an Admin can list jobs. RC-13 policy tests cover the permission matrix and unknown-permission denial.\n\n## CI evidence\n- Push run #348 and PR run #349 — SUCCESS, **148/148 Node tests** each, plus bootstrap shell, backup/restore/Python, 1/1 restore race, Compose and Caddy validation. No services were started.

## Limitations
This is still a proxy-header prototype. No OIDC issuer/subject verification, real proxy/API integration test, session revocation, external audit sink, or runner execution is implemented.
