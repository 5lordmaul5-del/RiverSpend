# RC-23 — RBAC permission catalog guard

The RC-13 permission helper now rejects permission names that are not in the explicit catalog (`manage_users`, `manage_projects`, `approve_jobs`, `read_audit`, `read_status`) before evaluating role grants. This closes the wildcard-owner edge case where a privileged role could return true for an unknown permission name.

- Unknown permissions fail closed for every role, including owner.
- This helper remains a prototype and is not wired to the HTTP routes.
- Reproducible test: `node --test infra/rivercloud/rc13-identity.test.mjs`.
