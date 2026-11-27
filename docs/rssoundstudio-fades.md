# RiverSoundStudio — fades and clip preparation

Branch: feat/rssoundstudio-clips-fades-2026-11-27 (stacked on real-waveform PR)

This increment adds per-track Fade In and Fade Out controls (0–10 seconds) to the mixer. The gain envelope is calculated against each audio element's local playback position and refreshed by timeline/time-update events. It remains non-destructive: source audio is not rewritten.

## Current limitations
- This is a track-level fade envelope, not yet a clip-level envelope.
- Trim handles, splitting, clip movement, zoom, take comping and project persistence remain future work.
- Runtime/browser testing is pending; verify fade behavior, simultaneous channels and seek edge cases.
- Changes remain on an isolated branch and are not merged or deployed.
