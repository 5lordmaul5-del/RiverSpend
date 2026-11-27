# RC244 — RiverRender Job Scheduler

## Objective
Create a queue-ordering simulation and scheduler architecture blueprint.

## Prototype
- Job entry: name, priority, profile and resource class.
- Priority ordering: High, Normal, Low.
- Simulation output indicates queue position; no real worker is assigned.
- JSON export.

## Scheduler architecture
1. Admission validation and queue persistence.
2. Priority policy plus queue aging/fairness to prevent starvation.
3. Capability matching against worker manifests.
4. Resource budgets and reservation (CPU, GPU, memory, disk, concurrent jobs).
5. Dispatch protocol with idempotent job IDs.
6. Worker heartbeat, telemetry and assignment lease.
7. Cancellation, bounded retries, backoff and failure isolation.
8. Recovery after scheduler restart and stale assignment reconciliation.
9. Audit logs, metrics and user-visible status backed by actual events.

## Safety and reliability
- Never execute arbitrary command strings.
- Scheduler cannot assign to untrusted workers.
- Validate worker capabilities and job constraints.
- Protect queue state and enforce permissions.
- Keep planned/simulated states separate from operational telemetry.

## Limitation
This milestone simulates ordering only. No persistent scheduler, dispatch, worker matching, execution, or rendering is implemented.
