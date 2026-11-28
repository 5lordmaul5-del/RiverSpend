# RC-410 — RiverSSAI execution boundary review

Source review of the local integration code. This is a gap inventory, not a security certification.

## Verified source-level boundaries
- RC-161 supervisor describes itself as a toy-task executor and explicitly says it is not a hardened sandbox.
- The allowed task kinds are restricted to `echo`, `json_validate`, and `metrics_report`.
- RC-183 WorkerCore accepts injected identity verifier, policy and executor boundaries; the module's docstring says no live provider, sandbox or external-effect executor is supplied.
- Payload ledger defines bounded canonical JSON validation (payload size, depth and node caps) and retry backoff constants.

## Required before production exposure
- [ ] OS/container isolation: namespaces, syscall policy, filesystem confinement and network-deny controls tested independently.
- [ ] Explicit allowlist of executable, arguments and environment; no caller-controlled command path.
- [ ] Resource limits and timeout behavior verified under hostile inputs and subprocess cleanup.
- [ ] Authentication and authorization implementation evaluated independently of injected test verifier.
- [ ] Durable ledger concurrency, crash consistency, backup and restore tested on controlled host.
- [ ] Secret handling, rotation and redaction reviewed.
- [ ] Threat model and incident response procedures reviewed.
- [ ] Deployment acceptance and operational telemetry defined.

## Conclusion
Current CI evidence supports a bounded local integration/test core only. Do not expose the executor to untrusted traffic or treat the current subprocess controls as a production-grade sandbox. Production readiness requires the separate controls and evidence above.
