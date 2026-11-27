# RiverSoundStudio Master Bus

## Changes
- Adds a shared master output gain node so the master fader controls the final output stage rather than multiplying each track independently.
- Adds a master dynamics-compressor stage as peak-control protection.
- Per-channel recording taps remain downstream of each channel compressor and before the master bus.
- Updates the UI copy to describe the processor accurately.

## Limitations
- A browser DynamicsCompressor is not a guaranteed brick-wall limiter; export and playback validation is still required.
- This branch is stacked on the mixer session-settings work and is not merged or deployed.
- Browser/device testing remains pending.
