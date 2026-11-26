# RC-156 — RSCommanderSSAI: Billion-specialist control plane (prototype specification)

## Purpose
RSCommanderSSAI is the supervisory control-plane design for RiverSSAI's virtual specialist registry. The target is a billion logical specialist profiles—not a billion concurrently running processes, model instances, or independently thinking agents.

## Design
- Lazy registry: deterministic IDs and capability descriptors; never materialize the entire catalog.
- Hierarchy: commander -> domain coordinators -> task teams -> specialist profiles.
- Dispatcher: bounded queues, fair scheduling, priority bands, leases, retry budgets, deadlines and backpressure.
- Worker pool: replaceable bounded execution; only admitted tasks are instantiated.
- Clone isolation: shadow/test clones have separate state, identity, policy and credentials; no automatic credential copying.
- Safety gates: task allowlists, approvals for sensitive actions, cancellation, audit events, rate/cost ceilings.
- Persistence: durable task state and idempotency keys required for recovery; prototype interfaces only.
- Telemetry: queue depth, worker saturation, latency, retries, cost estimates, task success/failure and policy blocks.

## Scale model
Registry capacity is an architectural target. Practical active concurrency is constrained by available compute, provider quotas, budget, latency and operational safeguards. Hierarchical sharding and lazy profile generation avoid storing or loading one billion records simultaneously.

## Milestones
1. M0: versioned registry descriptors and IDs.
2. M1: hierarchical commander/dispatcher contracts and bounded queue.
3. M2: worker lease lifecycle, retries, cancellation and idempotency.
4. M3: persistence adapter contract and recovery tests.
5. M4: isolated clone/shadow harness.
6. M5: telemetry and load simulation with synthetic profiles.
7. M6: staged scale testing; no production activation without explicit approval.

## Prototype acceptance gates
- Synthetic catalog generation stays bounded in memory.
- Queue/worker limits are enforced.
- Duplicate task submission is idempotent in test harness.
- Leases expire and recover safely.
- Cancellation and retry budgets are respected.
- Clone tests cannot access production credentials or production resources.
- Benchmarks report actual results, not extrapolated claims.

This document is a blueprint and does not provision resources, launch agents, deploy, or claim billion-agent execution.
