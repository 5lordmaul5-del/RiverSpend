# RC-30 consolidation audit — findings and gates

Repository-level audit, not an owner-host runtime test.

## Verified design
- PostgreSQL, Ollama, API and worker Compose topology exists.
- API binds to 127.0.0.1:8787; Ollama and PostgreSQL have no published host ports.
- PostgreSQL/API use an internal network; Ollama also has outbound network for model downloads.
- API and worker containers use read-only filesystem, tmpfs, dropped capabilities and no-new-privileges.
- Owner bootstrap creates environment credentials and refuses to overwrite an existing environment file.
- Bootstrap starts services, downloads selected model and runs a local authenticated smoke test.

## Operational gates
1. Host execution is not evidenced by CI; owner-host preflight and execution still require deliberate local action.
2. Model resource fit must be measured before downloading/using the default model.
3. Prototype is single-owner/admin-token scoped; not a public multi-user identity system. Do not connect customer or live Shop data.
4. Model download requires connectivity, disk, bandwidth and compute.
5. Encrypted backup and restore must be tested in a disposable isolated database.
6. Loopback binding alone does not make public exposure safe. TLS, firewall, proxy and authorization review required before exposure.
7. Checklist/static CI does not prove runtime integration or host validation.

## Finite closure sequence
- Consolidate scripts and compose configuration.
- Owner-host preflight.
- Owner-controlled isolated start.
- Confirm health/readiness, authenticated request, worker and database persistence.
- Verify backup/restore in disposable environment.
- Shutdown/restart checks.
- Record host evidence and limitations.

No merge/deploy authorization. No main, production, credentials or live data changed.