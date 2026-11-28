# RC-30 consolidation audit — findings and gates

Audit inspected repository evidence on the Point 1 owner runtime setup, Compose topology and RC-30 checklist. This is a repository-level review; no owner host was provisioned or run.

## Verified repository design
- PostgreSQL + Ollama + API + worker Compose topology exists.
- API host port binds to loopback (127.0.0.1:8787); Ollama and PostgreSQL are not host-published.
- PostgreSQL and API share an internal network; Ollama also has outbound network access for model downloads.
- API/worker use read-only filesystem, tmpfs, dropped capabilities and no-new-privileges in Compose.
- Owner bootstrap generates local environment credentials and refuses to overwrite an existing env file.
- Owner-host bootstrap starts services, pulls the selected model and runs a chat smoke test.

## Critical operational gates before claiming independent production-ready operation
1. **Host execution not yet evidenced:** all CI checks are repository-side; run bootstrap only on the owner-controlled host after resource preflight and explicit owner action.
2. **Model resource fit:** default qwen2.5:7b may exceed practical RAM/compute; select and measure model fit before download.
3. **Single-owner prototype:** fixed owner scope/admin token is not a public-user identity/authorization system. Do not connect customer accounts or live Shop data.
4. **External network and cost:** model download needs connectivity, disk, bandwidth and host resources.
5. **Recovery proof:** encrypted backup and restore must be tested against an isolated disposable database; no live data.
6. **Security:** loopback binding does not make public exposure safe. Require firewall/TLS/reverse proxy, token handling review and access controls before any public exposure.
7. **CI scope:** checklist/static CI successes are not runtime integration or host validation.

## Closure sequence (finite)
- Consolidate and review the scripts and compose configuration.
- Execute preflight on owner hardware.
- Owner-controlled start in isolated mode.
- Confirm health/readiness, authenticated request, worker operation and database persistence.
- Verify encrypted backup and restore in disposable environment.
- Run shutdown and restart checks.
- Record host-specific evidence and unresolved constraints.

## Status
RC-30 campaign PRs are not merge/deploy authorization. No main branch, production, credentials or live data was modified. This audit deliberately does not mark the runtime as operational until owner-host evidence exists.
