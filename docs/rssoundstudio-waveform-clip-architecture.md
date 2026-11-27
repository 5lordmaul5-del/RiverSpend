# RiverSoundStudio Waveform & Clip Timeline Architecture

## Scope
This document defines the next safe increment toward a DAW-like editing surface. It does not claim the current mixer has a waveform editor or sample-accurate synchronization.

## Waveform preview
- Decode imported audio using AudioContext.decodeAudioData only after user import.
- Build a bounded display envelope by partitioning samples into buckets and recording min/max values.
- Limit the display envelope to a fixed bucket count (for example, 2,000 per channel) rather than retaining duplicate PCM arrays.
- Prefer mono display envelope for UI; preserve original audio file and stereo playback.
- Release decoded buffers when tracks are removed; avoid decoding every file eagerly.

## Clip model (future increment)
A clip should use a stable ID and contain:
- source track ID
- source start / trim-in
- timeline start
- duration / trim-out
- gain
- optional fade-in / fade-out
- mute state

Keep the imported source immutable; edits should be non-destructive metadata.

## Timeline behavior
- Use a project timeline clock instead of the maximum current time across audio elements.
- When play begins, calculate each clip's scheduled start against a shared AudioContext clock.
- For seek, stop/recreate scheduled sources at the requested timeline offset.
- Treat drift corrections as best-effort browser scheduling, not guaranteed sample-accurate DAW sync.

## Safety / memory
- Audio decoding and waveform calculation should be asynchronous and cancellable where possible.
- Avoid unbounded buffers, autoplay, and microphone permission prompts without an explicit action.
- Provide clear errors for unsupported formats, decoding failure, and recording permission denial.
- Recording/export must remain user-triggered; no silent capture.

## Acceptance checks (future code PR)
1. Import a short audio file and display waveform envelope.
2. Import several files; UI remains responsive and envelope size bounded.
3. Removing a track releases its waveform state.
4. Waveform display is not used as audio playback source.
5. Seek/play behavior clearly identifies current best-effort synchronization limitations.
6. Verify syntax/build and browser behavior before claiming tested.
