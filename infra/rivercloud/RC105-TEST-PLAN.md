# RC-105 — Focused test plan
Date: 2026-11-26

## Storage empty-state validation
- Missing file under an existing private directory should return schema-1 empty state.
- Missing file under an existing permissive directory should fail closed.
- Missing file when the parent directory itself is missing should preserve empty-state semantics only if explicitly intended; this behavior must be documented and tested.
- Parent directory symlink and owner mismatch cases must fail closed.

## Backup/restore boundaries
- Test member count and total expanded byte limits at and just beyond their limits using temporary fixtures.
- Test malformed/truncated archive and checksum file.
- Test unusual path encodings and deep nested path handling.
- Test restore extraction failure cleanup without affecting pre-existing data; restore target must remain a newly created disposable target.

## Identity/API
- Add explicit negative tests for absent actor context and non-authorized roles before considering wiring.
- Ensure current shared-token endpoint is documented as prototype authentication, not user identity or RBAC.

## Safety boundary
All tests use isolated temporary directories and synthetic data. No live data, deployment, production credentials, or external services.