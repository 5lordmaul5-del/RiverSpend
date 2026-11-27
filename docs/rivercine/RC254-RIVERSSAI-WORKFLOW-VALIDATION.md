# RC254 — Workflow Validation Layer

Browser-only static validator for RiverSSAI Studio workflow JSON.

## Validation checks
- JSON object and workflow array structure.
- Required non-empty string fields: `id`, `module`, `task`.
- Duplicate task IDs.
- Dependency list shape and non-empty string values.
- Dependency resolution by task ID, or by module only when that module uniquely identifies one task.
- Warnings when a module name is shared by multiple tasks.
- Cycle detection across resolved dependency edges.

## Security and scope
Validation output is rendered using DOM text nodes (no HTML injection from user-supplied workflow strings). This is a static check only: no scheduling, execution, persistence, worker, or external model connection is performed.