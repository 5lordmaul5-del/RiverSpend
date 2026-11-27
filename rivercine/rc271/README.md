# RC271 — RiverCine Timeline Editing Prototype

Adds a timeline editor prototype with:
- Import audio clips
- Timeline positioning via dragging and numeric position
- Trim in/out controls
- Fade-in/fade-out envelopes
- Track volume and pan
- Synchronized playback and WAV mix render
- Browser local save/restore (storage quota applies)

Caveats: experimental browser prototype; undo/redo is incomplete and does not restore audio data robustly. Timeline zoom and drag repositioning are rudimentary. Test on browsers/devices before use. No destructive waveform editing, automation lanes, MIDI, plugin hosting or production-grade project persistence.
