# RC243 — RiverRender Worker Control

## Purpose
Prototype a worker registry/control planning interface and define safe worker lifecycle architecture.

## Prototype behavior
- Registers planned worker entries with type and resource profile.
- Exports JSON for future integration.
- Does not start services, probe hardware, run rendering, or remotely connect.

## Lifecycle design
1. Unregistered -> registered -> health check -> ready -> assigned -> running -> stopping -> stopped.
2. Keep health and readiness distinct from planned registry data.
3. Explicit activation and least privilege.
4. Enforce CPU, memory, GPU, disk, wall-time and concurrency budgets.
5. Use bounded logs, telemetry, cancellation and process cleanup.
6. Local worker first; remote workers only after authenticated protocol and security review.
7. Queue persistence and recovery must be idempotent and tested.

## Threat model
- Never accept arbitrary shell strings from jobs.
- Validate paths, inputs and outputs; prevent traversal and symlink escape.
- Isolate execution, constrain permissions and environment, and avoid secrets in logs.
- Require explicit operator approval for execution activation.
- Prevent unauthorized job submission and worker registration.

## Scope
Design/prototype only. No worker daemon, hardware detection, task execution or rendering is implemented.
