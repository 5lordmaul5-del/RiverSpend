# RC269 — RiverCine Multitrack Recorder prototype

Browser recorder with multiple independent audio tracks:
- Add tracks
- Per-track recording via microphone (permission-gated)
- Stop, playback and browser audio controls
- Editable track names and volume/pan UI controls
- Basic waveform extraction/drawing
- Project playback (prototype)
- Download a single recorded track (multi-track mix export not implemented)

## Notes / limitations
- Audio is stored in page memory/object URLs; refresh loses recordings.
- Recordings are independent and not aligned to a shared recording clock; project playback is not a synchronized mix.
- Volume and pan sliders are UI values; volume affects individual playback, pan not wired to audio playback yet.
- No persistent project files, multitrack mix export, MIDI, effects automation or studio-grade monitoring.
- Microphone permissions require HTTPS or localhost.
