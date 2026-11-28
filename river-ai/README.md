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
A provider-neutral mock adapter and a local-only Ollama adapter contract are available. The Ollama adapter accepts loopback URLs only, bounds prompt/output and generation settings, disables streaming, and uses a timeout. It is tested with an injected mock fetch; it is not integrated into the HTTP server and no model is loaded or connected. External providers remain optional future adapters.

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


### RiverBuild Phase 2 — build reports

`src/riverbuild-report.js` creates normalized report records with UUID, project/type/status, ISO timestamps, duration, exit code, bounded stdout/stderr and bounded notes. It marks execution as verified only for a report marked passed with exit code 0; this is report logic, not proof unless a trusted runner supplies the results. Tests are written but not run.


### RiverBuild Phase 3 — bounded in-memory queue

`src/riverbuild-queue.js` adds an in-memory queue with priority ordering, queue and concurrency limits, queued-job cancellation, manual claim/finish state transitions, bounded history, and summary counts. It validates requests against the Phase 0 planner. It does not execute builds, persist queue state, or automatically claim jobs. Tests are added but not executed.


### RiverBuild Phase 4 — explicit approval gate

Queue jobs now start unapproved. A job must be explicitly approved before `claimNext()` can return it for a worker. This is an in-memory workflow guard, not authentication or an execution authorization boundary. It does not start builds or persist approvals. Tests updated but not executed.


### RiverBuild Phase 5 — coordinator (plan-only)

`src/riverbuild-coordinator.js` claims one approved queue job and prepares a restricted Docker command plan using the runner module. It never executes Docker. It requires a separate worker to perform execution; errors while planning mark the claimed job blocked. Tests are written but not run.

## Hardening progress — 26 November 2026

- RiverBuild Guardian and Worker validation now distinguish standalone Docker flags from option/value pairs, require a single read-only `-v` workspace mount, and reject root users and alternate mount syntax in the Worker validation path.
- The bounded history default listing now respects small configured limits.
- The integrity-anchor regression test now deliberately leaves the report unanchored; the fully anchored path remains a human-review gate only.
- Worker tests now use a complete constrained Docker plan fixture. A test-only executor is injected; no real Docker execution is connected.
- GitHub Actions run **45799828186 (#60) — SUCCESS, 136/136 tests**. Earlier failures #50 (multiple stale assertions/fixtures) and #58 (test-file syntax error) are recorded and not counted as passes.
- The CI workflow now pins checkout and setup-node to immutable commit SHAs; the pin regression test is added. A fresh run on the updated workflow is pending.

**Boundaries remain:** no model/provider is connected; the task engine is planning-only; RiverBuild execution is disabled by default and requires an injected executor; the worker does not start Docker itself; RiverGit local service is not mounted into the main HTTP server; identity is static policy only, not authentication; audit/history are local or in-memory foundations, not durable tamper-proof storage. This core is not production-ready or independent of hardware/provider limits.

## Virtual specialist catalog and planning scheduler — 26 November 2026

- RiverSSAI now exposes a virtual catalog of **100,000 specialist definitions**, generated lazily from bounded role/domain templates. Pagination is capped; no 100,000 processes or separate model instances are created.
- Task plans route to a specialist definition and remain `planned`, with `processCount: 0` and execution disabled.
- A bounded in-memory scheduler supports priorities, queue limits and assignment records marked `assigned_not_started`. It is not connected to a model, worker or executor; its active process count remains zero and its state is not durable.
- Read-only local API endpoints: `GET /specialists` (offset/limit/domain) and `GET /scheduler/status`. The HTTP API has no write endpoint; `scheduler-enqueue` remains disabled in the tool registry.
- The standalone server entrypoint enforces loopback binding. Do not use `createServer()` with a public listener; it is a test/API factory, not an exposure control.
- CI run #82 initially failed 2 tests because assertions assumed 50 domains while the catalog has 53; the tests now derive counts from the catalog. Fresh CI evidence for the correction is pending.

**Limits:** the catalog is virtual, not a real pool of 100,000 agents. No inference, process activation, model loading, tool execution, network access, deployment, financial action or production mutation is implemented.

- GitHub Actions run **45801241769 (#87) — SUCCESS, 146/146 tests** verified the 100,000 virtual specialist catalog, scheduler, task routing and read-only API. The two earlier #82 failures were test assertions that hard-coded the domain count; they were corrected to derive it from the catalog.
- A follow-up bounds domain-filtered pagination offsets; fresh CI for this small correction is pending.

## Local Ollama adapter groundwork — 26 November 2026

- `createOllamaAdapter` only accepts loopback endpoints (`127.0.0.1`, `localhost`, `::1`), requires an explicit model name, uses a bounded non-streaming request, and aborts on timeout.
- The adapter rejects oversized prompts/responses and invalid generation parameters. It never downloads models or invokes tools.
- Tests use a mocked fetch implementation; no live Ollama runtime or model was contacted.
- GitHub Actions **45801702703 (#97) — SUCCESS, 152/152 tests**.

This adapter is a local inference interface foundation, not a connected AI service. The main HTTP API remains read-only and does not expose an inference endpoint.
