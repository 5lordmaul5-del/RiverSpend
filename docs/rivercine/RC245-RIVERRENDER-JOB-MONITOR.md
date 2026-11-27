# RC245 — RiverRender Job Monitor

Adds a local browser-session monitor prototype with job registration, manual status labels, counts and JSON export.

## Intended future operational monitor
- Worker heartbeats and availability
- Event-backed progress and status
- Logs, failure codes and telemetry
- Cancel/retry controls with permission and bounded policies
- Persistent data, audit trail and authenticated APIs

## Limitations
The current prototype uses local in-memory browser state only. It is not connected to scheduler, workers, rendering, server telemetry, persistent storage or actual execution. 'Completed' and 'Failed' are manual labels, not verified outcomes.
