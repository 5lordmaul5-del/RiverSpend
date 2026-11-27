# RiverLatency Engine

Advisory recommendations and session timing helpers. Does not directly control native/browser buffers.
- Profile suggestions consider reported CPU pressure, dropout count, jitter/loss and sample rate.
- DropoutMonitor detects gaps in caller-provided timestamps; these must represent meaningful observations.
- Sync plan provides count-in and offset metadata for downstream recording code.
- Remote Take is preferred unless conditions are promising and local monitoring is available.
- This module alone does not implement transport, recording, hardware tuning or synchronized capture.
