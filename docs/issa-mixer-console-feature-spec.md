# I.S.S.A. Mixer Console — Feature specification

Scope for the browser Mixer workstream; implement incrementally and test each feature before merge.

## Track editing
- Take management: multiple named takes per track, audition/select, delete, and export; avoid losing takes on track edits.
- Cut/split: split at playhead, non-destructive regions where feasible, selection, undo/redo safety, and clear boundaries.
- Copy track: duplicate source audio with a new independent track ID and URL ownership.
- Clone track: duplicate track settings (fader, pan, EQ, effects, trim, fades, mute/solo) while safely sharing/copying media; never duplicate recorder/graph refs.
- Stereo controls: preserve stereo source, stereo-aware balance/pan, mono fold modes and explicit stereo track workflow.

## Jog wheel / timeline
- Jog wheel with forward/reverse scrub, variable speed, precision step and shuttle; clamp to valid range and trim bounds.
- Provide keyboard-accessible alternatives and avoid triggering playback unexpectedly.

## Metering
- Per-track meter and master meter with peak hold, clipping indication and reset.
- RMS/average level optional; meter visualization must be efficient and clean up animation resources.
- Meter reads from appropriate nodes; document limitations in browser/device routing.

## Click / metronome
- Click enable/disable, BPM, time signature, subdivision, accent and three selectable click timbres (e.g. wood/tick, soft pulse, sharp beat).
- Click monitor output configurable conceptually, including headphones; true independent hardware output only when supported by engine/device.
- Start/stop/tempo changes synchronized to timeline where feasible; protect against timer drift.

## Premaster and stereo master
- Dedicated PREMASTER bus between track/bus summing and stereo Master.
- Separate pre/post-processing controls and metering, routing, inserts, gain staging and bypass.
- Stereo Master final output with limiter/peak protection, meters, and export target.
- Preserve signal order clearly: tracks -> buses -> PREMASTER -> Stereo Master -> output.

## Reliability and testing
- Resource cleanup for audio nodes, object URLs, recorder states and meter animation.
- Test session import/export, cuts, track cloning, take lifecycle, click timing, premaster bypass and browser audio lifecycle.
- No merge/deploy until explicitly approved.
