# RiverSSAI 10.0 — Runnable Core (F1)
Small dependency-free localhost runtime, independent of marketplace, Supabase and Vercel. This is a foundation, **not yet an autonomous AI or connected model**.
## Requirements
Node.js 22+
## Run
```sh
cd river-ai
npm test
npm start
```
Default address: 127.0.0.1:3030
- GET /health — health
- GET /status — configuration and capability status
- GET /tools — declared tool registry (write actions disabled)
- GET /memory — inspect local memory (read-only endpoint)
Memory module supports local add/delete/clear functions for future integrations; these writes are not exposed through HTTP. Memory stores locally with restrictive permissions where supported. Avoid sensitive data.
No provider, secrets, database, public network integration or deployment is enabled. Non-GET methods and unknown routes are rejected.
Next: provider adapters, memory consent/UI, sandboxed tools with approval, evaluation/security testing. Never expose publicly without authentication, TLS, rate limits and review.

## Provider adapter groundwork
A provider-neutral interface and mock adapter exist for tests only. They do not connect to or simulate a live model. Real providers are a future milestone requiring explicit configuration, secrets handling, and tests.

## Task Engine (planning only)
A deterministic task planner creates a reviewable four-step plan, flags keywords associated with sensitive actions, and always sets execution disabled and approval required. It does not run commands, use tools, contact external services, deploy, or modify project state. This is planning groundwork, not agent autonomy.


## RiverGuard (policy foundation)
- Classifies requests into low/medium/high/invalid risk.
- Creates explicit pending approval records and supports approve/reject decisions.
- Approval records never enable execution; execution is not implemented.
- Classification is a conservative heuristic, not a security boundary. Production use requires identity, permission enforcement, audit storage, sandboxing, and independent tests.


## RiverKnowledge
A local file-based knowledge store for explicit user-provided notes. Entries require title/content, size limits, and are not automatically ingested from network sources or learned implicitly. This foundation is not yet integrated into the HTTP runtime or task engine.


## RiverAudit
Structured local event log foundation (JSON Lines) with bounded fields and a small event-type allowlist. It is append-oriented but not tamper-proof; production requires protected storage, integrity controls and review. It is not wired to other modules yet.


## RiverIdentity (static policy foundation)
- Roles: Owner, Admin, Operator, Viewer; unknown roles/permissions default to deny.
- Owner alone has policy/identity management permissions; Admin has operational write permissions but cannot manage policy or identities; Operator can read and plan; Viewer is read-only.
- `src/identity.js` is a static permission registry/check helper, with tests in `test/identity.test.js`.
- This is not authentication, credential management, or a security boundary; it must be integrated and reviewed before real access control is relied on.


## RiverControl (read-only status snapshot)
`src/control.js` exposes a descriptive, read-only snapshot of the foundation modules. It reports local policy and capability status; it does not probe services, authenticate users, execute tasks, or connect to a live provider. Tests are in `test/control.test.js`.


## RiverWatch (local event observation)
- Records normalized local events in a bounded in-memory buffer (up to 200).
- Creates warning/critical alert records; supports acknowledgement and summary counts.
- Inputs are bounded and component names are allowlisted.
- It does not probe processes/services, send notifications, persist events, or remediate automatically. This foundation must be integrated and reviewed before operational use.
Tests: `test/watch.test.js`.


## RiverAutoma (ecosystem manifest)
`src/automa.js` provides a descriptive catalog of planned and in-development services, distinguishing owned/self-hostable components from optional external adapters such as GitHub and Vercel. It is a roadmap manifest only: no installation, provisioning, integration or orchestration is implemented, and execution remains disabled. Tests: `test/automa.test.js`.

**Autonomy target:** progressively replace external source-control, hosting, cloud and deployment dependencies with software that RiverSpend can self-host on infrastructure under its control. External providers remain optional adapters, not falsely represented as already replaced.


## RiverGit (Phase 0 foundation)
A Git-compatible repository manifest and name validator. Git is selected as the underlying version-control engine instead of reinventing its data model. This module does not create repositories, host remotes, authenticate users, push/pull, or back up data yet. Those capabilities require a separately reviewed service implementation and infrastructure. Tests: `test/rivergit.test.js`.


### RiverGit Phase 1 — local bare repository manager

The isolated local module `src/rivergit-local.js` introduces safe name validation, confined storage paths, local bare repository creation via Git (without shell invocation), and listing. Tests use temporary directories. This is a local filesystem foundation only: no HTTP endpoints, authentication, remote hosting, backup, or deployment are wired in.


### RiverGit Phase 2 — minimal local API

`src/rivergit-api.js` provides a small handler for listing and creating local bare repositories at `/api/rivergit/repos`. It supports an optional bearer-token check, GET and POST only, bounded request-body size, validation and JSON responses. It is a module handler, not yet mounted in the main server; do not expose it to the internet. Authentication is a shared token only, not a production identity system. Tests are added but not yet executed.


### RiverGit Phase 3 — loopback service

`src/rivergit-service.js` starts a dedicated service on loopback only (127.0.0.1/::1), with configurable port and optional bearer token, using the API handler. Public binding is rejected. It remains standalone and is not launched automatically by the main application. Tests are written but not yet executed.


### RiverBuild Phase 0 — build planner

`src/riverbuild.js` validates a project/build request and produces a constrained plan for a future isolated runner. It currently supports planning only for node-test and syntax-check types. It does not execute scripts, access the network, or spawn processes. Workspace path confinement is checked at planning time. Tests are written but not yet run.


### RiverBuild Phase 1 — constrained container command planner

`src/riverbuild-runner.js` creates Docker argv plans for the supported test/syntax-check operations, requiring an explicit approval flag. The plan uses a fixed Node image, no network, read-only workspace/root filesystem, dropped capabilities, no-new-privileges, resource/PID limits and a temporary filesystem. This module only generates a command plan: it does not execute Docker. Container isolation still depends on host Docker configuration and is not a complete security guarantee. Tests are written but not run.
