# RC-16 — test, security, backup and recovery readiness

## Readiness gates
- Unit/integration tests and evidence recorded.
- Threat-model/security review, dependency and supply-chain review.
- Secret scanning and rotation plan; no repository secrets.
- Resource, timeout, filesystem and network boundaries reviewed.
- Backup encryption, retention, separation and monitoring documented.
- Restore test in isolated environment with evidence; RPO/RTO documented.
- Incident response and operational monitoring plan.

## Backup/restore protocol (not executed)
1. Document data, volumes, configs, key material and dependencies.
2. Use encrypted backup destination with access separate from host credentials.
3. Record snapshot identifiers, checksums and retention.
4. Restore to an isolated environment, not production.
5. Verify integrity and application behavior; record elapsed time and recovery gaps.
6. Clean isolated restore environment and preserve audit evidence.

## Status
Checklist and helper/test files are authored. No live backups, restores, scans or runtime tests have been executed. This milestone is planning/prototype only, not a certification or production-ready system.
