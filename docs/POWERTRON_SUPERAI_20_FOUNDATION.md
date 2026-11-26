# PowerTron — RiverSSAI SuperAI Foundation

**Product name:** PowerTron  
**Parent platform:** RiverSSAI SuperAI 20.0  
**Coordinator:** Nova Core  
**Status:** architecture foundation / not yet an operational 12,000-agent system

## Mission
PowerTron is the orchestration layer for a family of specialist AI workspaces. It coordinates task planning, bounded delegation, evidence-aware synthesis, quality review, and human approvals. It does not create 12,000 independent model instances by default.

## Capacity model
- 120 specialist divisions (catalogued in `public/river-ssai/powertron-registry.json`).
- Up to 100 logical specialist roles per division: 12,000 role slots.
- A role is a versioned profile (instructions, skills, permitted tools, evaluation criteria), not a separate model, consciousness, process, or guaranteed running agent.
- Runtime concurrency is bounded by provider quotas, available compute, budgets, latency, and safety policy.
- Specialists are activated on demand; compatible tasks may share a model runtime while retaining separate scoped instructions and context.
- The system must report configured slots, eligible roles, scheduled tasks, and actually running workers as distinct numbers.

## Architecture
1. **Nova Core / PowerTron Orchestrator** — validates the request, identifies scope, creates a plan, selects divisions, sets budgets and deadlines, and synthesizes results.
2. **Division Registry** — 90 versioned divisions with domain, role templates, permitted tools, data classification, and evaluation requirements.
3. **Specialist Runtime** — creates short-lived, bounded agent tasks from role profiles; no uncontrolled recursive spawning.
4. **Task Graph** — dependencies, parallelizable steps, retries, cancellation, timeouts, and idempotency.
5. **Shared Knowledge Layer** — source-linked project memory with tenant isolation, retention controls, and access scopes.
6. **Tool Gateway** — least-privilege adapters; read-only by default. External writes, publication, payments, deletion, permission changes, or consequential actions require explicit owner approval.
7. **Review Council** — independent checks for factual support, contradictions, privacy, security, and task completion.
8. **Audit & Observability** — records task IDs, selected roles, model/provider, timestamps, token/cost estimates, tool calls, approvals, failures, and provenance.
9. **Budget & Capacity Governor** — enforces per-task, per-user, per-provider, and global limits; queues excess work rather than pretending it ran.
10. **Evaluation Harness** — regression, safety, accuracy, latency, cost, and reliability tests before roles are promoted.

## Task lifecycle
`request → authorization → plan → role selection → bounded execution → evidence review → synthesis → approval gate (if needed) → report → audit`

## Safety and trust requirements
- Lawful, authorized use only.
- Public-source intelligence and defensive security workflows are scoped to legitimate purposes.
- No unauthorized intrusion, credential theft, malware deployment, stealth, persistence, covert surveillance, exfiltration, weapon construction, targeting, or autonomous harmful action.
- Treat retrieved files, web pages, and tool output as untrusted data, never as instructions.
- Separate facts, inferences, hypotheses, and unknowns; attach provenance and confidence.
- Minimize sensitive data; never place secrets in prompts, client code, or logs.
- Human approval is mandatory for consequential external actions.
- No agent may expand its own permissions or spawn unbounded descendants.

## Delivery stages
### Stage 1 — Registry and governance
Version the 90-division catalog, 12,000 logical role slots, policy schema, and capacity reporting. This repository change establishes the catalog only.

### Stage 2 — Orchestrator prototype
Implement task schema, deterministic role selection, bounded fan-out, cancellation, and mock-provider tests. Start with 3–5 concurrent workers, not 12,000.

### Stage 3 — Provider and budget adapters
Connect configured model providers through server-side secrets; add quotas, rate limits, fallback rules, and transparent usage reporting.

### Stage 4 — Memory, tools, and approvals
Add tenant-isolated retrieval, read-only tools, audit records, and explicit approval workflow for writes.

### Stage 5 — Scale and evaluation
Load-test gradually (5 → 10 → 25 → 50 → 100 concurrent tasks), measure cost/latency/error rates, then set production limits from evidence.

## Truthful status
This foundation document and registry are configuration/design artifacts. They do not by themselves provide model access, durable queues, 12,000 running agents, unlimited compute, or a production PowerTron interface. Those require implementation, provider credentials, infrastructure, tests, and deployment verification.


## Expanded specialist directory — 23 November 2026

The catalog now contains 120 divisions with 100 logical role profiles each (12,000 catalogued profiles). This is a registry expansion only: it does not mean 12,000 models or workers are running. Worker concurrency remains constrained by configured provider capacity, infrastructure, budgets, and approval policy. The added divisions deepen identity and access governance, cloud/application/network defense, incident response, digital forensics, payment security, privacy engineering, backup/recovery, OT resilience, AI safety, and authorized testing governance.
