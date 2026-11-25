# RC-18 — bounded HTTP request handling

The loopback-only queue API now sets explicit Node HTTP request, header, socket-inactivity and keep-alive timeouts, and caps requests per socket. This complements the existing JSON body limit (8 KiB), content-type check and token check.

- request timeout: 15 seconds
- headers timeout: 10 seconds
- socket inactivity timeout: 15 seconds
- keep-alive timeout: 5 seconds
- max requests per socket: 100

These are resource bounds for the queue API; they are not a substitute for an authenticated OIDC front door or network isolation.

## Evidence

Two tests were run in a reconstructed isolated workspace using copies of the reviewed state-store/server/queue/engine sources and the revised server test file: **2/2 passed**. This was not a checkout of the repository. Latest GitHub Actions evidence for these changes is pending/unavailable.
