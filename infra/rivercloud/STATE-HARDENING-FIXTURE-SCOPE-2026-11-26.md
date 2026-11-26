# RiverCloud State Hardening Fixtures — 2026-11-26

New authored fixture file: `tests/rivercloud/state-hardening.behavior.test.mjs`

Cases:
- Reject symlink state-file reads.
- Reject transaction paths with unsafe directory permissions.
- Reject invalid post-mutation state before commit and preserve the prior/empty snapshot.
- Inject directory-sync failure after rename and explicitly assert the durability-uncertain marker and that commit application is reported.

All fixtures are authored only; they have not been executed. They use disposable directories and controlled injected failures. They do not simulate power-loss semantics, cross-filesystem behavior, production storage, or operational backup/restore. Review and execution in an isolated environment remain required before treating the results as evidence.
