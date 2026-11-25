# RC-12 — stale lock recovery and chained audit prototype

This milestone adds an isolated prototype module for two controls:
- stale lock recovery after an age threshold, only when the lock records a PID that appears not to be alive; quarantine is performed via rename rather than blind unlink;
- event hash-chain helper and verification routine.

Tests are authored for chain integrity and lock-recovery scenarios, but are not runtime-verified here.

## Limits
PID checks are inherently imperfect (PID reuse, namespaces, platform differences and races). Lock recovery is not a production distributed-lock mechanism. The event chain is only tamper-evident if its storage is protected; it is not an external audit sink. Identity authentication, external protected audit, execution isolation, deployment, server provisioning and production remain out of scope.