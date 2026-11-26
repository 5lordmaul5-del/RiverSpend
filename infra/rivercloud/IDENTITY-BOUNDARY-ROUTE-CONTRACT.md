# RiverCloud Identity Boundary & Route Contract

Date: 2026-11-26
Branch: `feat/rivercloud-unified-policy-2026-11-26`
Scope: source design and contract consolidation. Not operational verification.

## Trust boundaries
- The loopback bearer-token API authenticates possession of a configured secret. It does not establish end-user identity or role context.
- The proxy API currently trusts forwarded user/group headers only after checking the TCP peer against its configured proxy address. This is a deployment assumption, not a proof of provider authentication.
- Role mapping and permissions are authorization decisions; upstream identity-provider verification must precede header forwarding.
- Actor pseudonyms are for event attribution/privacy, not identity authentication.

## Route contract inventory
| API surface | Route | Method | Permission/auth | Outcome |
|---|---|---|---|---|
| Loopback API | /health | GET | bearer | status only |
| Loopback API | /jobs | GET | bearer | queue listing |
| Loopback API | /deploy | POST | bearer | accept plan only |
| Proxy API | /api/health | GET | trusted peer + mapped role/read_status | status only |
| Proxy API | /api/jobs | GET | trusted peer + mapped role/read_jobs | queue listing |
| Proxy API | /api/plan | POST | trusted peer + mapped role/manage_projects | accept plan only |

## Required upstream proxy conditions
1. Strip client-supplied identity and group headers.
2. Authenticate against the configured provider before forwarding.
3. Forward only canonical, provider-verified subject/group values.
4. Restrict network access so the API can only be reached from the configured proxy.
5. Rotate and protect actor pseudonym secret; do not use it as a login credential.
6. Validate group mapping, least privilege and authorization behavior in tests.

## Consolidation cautions
- Route names differ intentionally and must not be treated as interchangeable aliases.
- The proxy API's plan route grants `manage_projects`; job approval is a separate permission and is not yet wired to plan acceptance.
- Both entry points are plan-only; execution is disabled.
- Shared error catalog is now imported by both API files. This document is not a claim that the tests were run.

## Verification required before staging
- Provider-authentication integration test, including forged/missing/expired identity.
- Proxy peer and header-spoofing tests.
- Role-to-permission matrix tests for all routes.
- API route parity and error behavior tests.
- Approval lifecycle integration and audit event tests.
- Persistence/recovery tests with disposable state files.
