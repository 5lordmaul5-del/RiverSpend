# RC-134 — state-store path component preflight

The state-store read and transaction paths now reject pre-existing symlinked or non-directory components. The final directory remains subject to owner and private-permission checks.

This preflight is path-based and does not close a race against concurrent ancestor replacement. It is a narrowing mitigation, not descriptor-anchored race-proof access.

CI verification is pending.