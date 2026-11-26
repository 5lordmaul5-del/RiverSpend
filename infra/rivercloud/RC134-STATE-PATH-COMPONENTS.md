# RC-134 — state-store path component preflight

The state-store read and transaction paths now reject pre-existing symlinked or non-directory components. The final directory remains subject to owner and private-permission checks.

This preflight is path-based and does not close a race against concurrent ancestor replacement. It is a narrowing mitigation, not descriptor-anchored race-proof access.

CI verification is pending.

## RC-135 — CI regression correction

The RC-134 path-component preflight now emits `state_directory_component_not_regular` for symlinked ancestor components. Two older tests still expected the previous generic `state_directory_not_regular` error. Their expectations were aligned with the new error contract; the code path remains fail-closed. CI verification is pending.
