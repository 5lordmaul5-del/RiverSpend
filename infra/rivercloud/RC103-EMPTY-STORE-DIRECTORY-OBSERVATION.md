# RC-103 — Empty-store directory validation observation
Date: 2026-11-26
Branch: feat/rivercloud-core-2026-11-25

## Observation
RC-11 readState currently returns the initial empty state for ENOENT. The directory privacy check occurs after opening the state file, so an absent file in an existing directory can result in the ENOENT path before the directory privacy check runs.

## Potential improvement
When the state file is absent but its parent directory exists, validate the directory's type, ownership and permissions before returning an initial empty state. If the parent directory itself is absent, preserve the documented initial-store behavior. Add tests for missing state files in safe and unsafe existing directories and for a missing parent directory.

## Caveat
This is a hardening observation, not a demonstrated disclosure or exploit. The read-only review did not prove impact beyond the path behavior.

## Implementation status
Documented for focused follow-up. No source change claimed in this note.
