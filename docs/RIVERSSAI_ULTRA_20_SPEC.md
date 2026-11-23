# RiverSSAI Ultra 20.0 — Build specification

**Mission:** evolve the existing RiverSSAI 10.0 application into an auditable, tool-capable AI workbench for RiverSpend. This document is a build plan, not a claim that all capabilities are implemented.

## Core operating model
- **Nova / CEO Core:** orchestrates, clarifies objectives, plans, delegates, synthesizes, and reports.
- **Specialist registry:** 90 skill/role slots, with the existing 30-agent catalog retained and expanded only as skills are implemented and tested. A registry entry is a capability profile, not a separate model or autonomous consciousness.
- **Task lifecycle:** intake → plan → delegated analysis → evidence/outputs → review → approval gates → completion report.
- **Safety gates:** owner approval for deployment, payments, fund movement, external publication, deletion, permissions, or consequential actions.
- **Transparency:** distinguish verified tool outputs, model inference, and unverified assumptions.

## Ultra 20.0 modules
1. Orchestrator and task planner
2. Specialist/skill registry (target 90)
3. Project and task workspace
4. Private durable memory with user controls and retention
5. Retrieval/search across permitted project files
6. Tool adapters (GitHub, Vercel, database, web research) with permission scopes
7. Long-running job queue, progress, retry policy and cancellation
8. Multi-provider model routing, quotas, fallback and budget controls
9. Audit log and approval queue
10. Diagnostics and evaluations

## Delivery phases
- **Phase A — foundation:** versioned registry, task plan schema, status reporting, diagnostics and regression tests.
- **Phase B — memory:** structured project memory, retrieval, source provenance, deletion/retention controls.
- **Phase C — tools:** scoped connectors and sandboxed read-only tools first; approval gates for writes.
- **Phase D — durable jobs:** queue, retry/backoff, timeout, cancellation and job recovery.
- **Phase E — quality:** benchmark suite, regression tests, latency/cost metrics, failure reports.
- **Phase F — media:** image/video tools only when provider, quota, security and UI are integrated.

## Acceptance criteria
- Existing authentication and admin access remain intact.
- No secrets in client code or repository.
- Each task exposes its status and final outcome; failures are not disguised as successes.
- Tool outputs are attributed, timestamped and linked where available.
- Write operations require scoped authorization and explicit approval.
- Limits and model/provider availability are displayed honestly.
- Test suite covers unauthorized access, malformed input, timeout, retry, provider errors, approval bypass and memory isolation.

## Current status
The existing 10.0 application remains the baseline. The API currently uses a bounded parallel agent workflow and a configured model/provider. This specification does not itself implement persistent queues, semantic memory, provider fallback, or external tool execution. Those require staged code changes, tests, configuration and deployment verification.
