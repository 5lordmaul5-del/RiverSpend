# RiverCloud State Recovery Fixture Scope — 2026-11-26

Authored-only fixture set: `tests/rivercloud/state-recovery.behavior.test.mjs`.

Coverage targets:
- Corrupt JSON fails closed rather than silently replacing state.
- Oversized state-file rejection at the reader boundary.
- Missing state file returns the documented empty schema.
- Lock cleanup after mutator failure, followed by a subsequent successful mutation fixture.

These are source fixtures, not executed test evidence. They do not establish real filesystem lock correctness, crash recovery, restore capability, or production durability.
