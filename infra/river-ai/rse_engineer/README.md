# RSEngineer — RC-170 prototype

RSEngineer is the engineering intake and task-validation foundation for the RiverSSAI/RiverPython ecosystem.

## Responsibilities
- Architecture and implementation work planning
- Bug triage, tests, code review and security review
- Integration planning, hardening and documentation
- Produce reviewable work; require human approval for sensitive changes

## Prototype scope
This module validates and creates structured engineering tasks only. It does **not** execute code, modify files, run shell commands, access networks, persist tasks, or deploy. Tasks default to requiring approval.

## Run tests
From this folder:

```python -m unittest -v
```

## Safety boundaries
- allowlisted task categories and priority values
- bounded title/description fields
- explicit boolean approval flag
- no execution/deployment/merge authority
- UUID task IDs; in-memory data only

This is a starter component, not a production agent or security sandbox. It is isolated on its own branch and is not integrated into RiverSSAI yet.
