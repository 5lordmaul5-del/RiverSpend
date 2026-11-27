# RiverLatency Recovery

Advisory state machine classifies telemetry into stable, warning, degraded or recovering, with bounded event logging and conservative suggested actions. Inputs must come from real monitoring and be interpreted cautiously; missing/stale data is not evidence of healthy audio.

This module does not alter hardware buffers, transmit audio, perform clock synchronization or recover an actual recording/session. Local capture and remote-take are recommendations for future integration. It must not imply that network conditions can be repaired or that latency is eliminated.
