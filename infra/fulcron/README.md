# FULCRON — RiverSpend Master System

Fulcron is the umbrella architecture and coordination layer for the RiverSpend ecosystem. It is a design/scaffold, not an active autonomous system yet.

## Mission
Coordinate the ecosystem's systems through explicit interfaces, status reporting, task routing, health checks, and safe recovery—while preserving human approval for high-impact actions.

## Core architecture
- **PowerTron**: agent coordinator; dispatches tasks and gathers results.
- **RiverSSAI 20.0**: local-first inference engine and model runtime.
- **RiverCloud**: hosting/runtime infrastructure.
- **RiverDB**: data, metadata, memory and audit storage.
- **RiverGit**: code/repository workflow.
- **RiverBuild**: isolated build, lint, test and artifact pipeline.
- **River Recovery**: backup, restore and disaster-recovery orchestration.
- **RiverFortress**: operator console, approvals, health and incident view.
- **RiverSpend services**: Market, Pay, Shield, Box, Fidelity, Park, Experience, Ecology, TV, Signals, Video, Games and future modules.

## Rules
1. Local-first; external paid APIs are optional adapters, not mandatory dependencies.
2. No automatic production deployment, financial transactions, credential access, destructive changes or infrastructure spending without explicit human approval.
3. Agents are role definitions and on-demand workers, not permanently running processes by default.
4. Every task has a scope, owner/agent, inputs, outputs, status, audit record and bounded permissions.
5. Fail closed on authorization, uncertain state or unavailable approval service.
6. Never claim unlimited computing: resource limits, hardware, storage, energy and network remain real constraints.

## Staged implementation
- **Stage 0 (this scaffold):** map components, contracts, guardrails and roadmap.
- **Stage 1:** status/health and task registry; manual operator workflows.
- **Stage 2:** local model runtime and PowerTron dispatch in sandbox.
- **Stage 3:** RiverDB persistence, logs, backup and restore tests.
- **Stage 4:** RiverBuild sandbox and reviewed artifact flow.
- **Stage 5:** RiverFortress console and controlled RiverCloud operations.
- **Stage 6:** integrate ecosystem modules gradually, test staging before any production action.

## Not implemented here
No runtime is launched, no model downloaded, no secrets accessed, no deployment performed and no production data modified. This scaffold needs review and tests before use.
