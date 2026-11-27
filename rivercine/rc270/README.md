# RC270 — RiverCine Sync Multitrack Engine (prototype)

A browser-only prototype for a synchronized multitrack workflow.

## Features
- Common project playback start across tracks.
- Per-track volume and stereo pan controls wired into audio playback.
- Audio import and microphone recording (permission required).
- Waveform display.
- Local-browser project save/restore (localStorage, embedded audio blobs).
- Offline-rendered stereo WAV mix export.

## Use
Open index.html in a secure context (HTTPS or localhost). Import audio or record tracks, then play, save/recover, or export a mix.

## Prototype caveats
- No advanced editing, cuts, automation, tempo-aware synchronization, track offset editing (the offset field is currently visual only), MIDI, plugin hosting, or professional DAW features.
- Recordings/imported blobs stored locally can consume significant browser storage; localStorage has quota limits.
- Project playback starts tracks together; exported mix uses a common offline render, but source durations are aligned at zero and no offset editing is currently applied.
- Browser/device compatibility and export duration limits vary. Not production validated.
