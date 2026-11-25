# PowerTron coordinator MVP

This milestone is a **routing prototype**, not an autonomous execution engine.

## Run locally
Requires Node.js. From repository root:

```bash
node infra/fulcron/powertron/coordinator.mjs <<'JSON'
{"task_id":"demo-1","scope":"market","request":"audit product publication flow"}
JSON
```

## Tests
```bash
node --test infra/fulcron/powertron/coordinator.test.mjs
```

## Safety boundary
- Routing is deterministic and advisory.
- Roles remain disabled; this script does not start agents.
- No shell, filesystem mutation, network, secrets, payments, production actions or deployment.
- Tasks are not persisted. This is the next integration step, with review and tests first.
