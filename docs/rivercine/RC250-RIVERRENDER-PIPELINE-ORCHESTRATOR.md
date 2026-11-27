# RC250 — RiverRender Pipeline Orchestrator

## Purpose
Create a pipeline plan connecting the planned RiverRender modules into a staged workflow.

## Stage sequence
1. Media Input
2. Integrity Gate
3. Project / Graph
4. Scheduler
5. Worker / Adapter
6. Monitor / Recovery
7. Cache / Storage
8. Delivery Gate

## Orchestration policy
- Explicit dependencies and stage boundaries.
- Separate planning, simulated, executing and verified states in any future implementation.
- Fail closed on required integrity and delivery gate failures.
- Bounded retries, concurrency and resource budgets.
- Auditable events and status transitions.
- Final delivery approval required.
- Adapter isolation and future capability-based execution.

## Limitations
The UI creates/export pipeline plans only. It does not invoke the other prototypes, run stages, access files, dispatch workers or render media.
