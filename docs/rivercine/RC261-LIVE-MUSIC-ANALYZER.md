# RC261 — RiverSSAI Live Music Analyzer

Experimental live audio analyzer for monophonic fundamental-frequency estimation, note-name mapping and CSV export.

## Prototype capabilities
- Uses getUserMedia for microphone/audio-interface capture.
- Basic time-domain autocorrelation-like frequency estimate, mapped to nearest MIDI pitch and note name.
- Live level meter, note event history and CSV export.

## Limits
- Simplified algorithm; no robust polyphonic analysis, chords, noise suppression, calibration, pitch confidence, note-duration quantization, score generation or direct SSAI integration.
- Device/browser permissions and secure context required; external interfaces may be selectable through the browser's audio input settings.
- Pitch estimation is experimental and can misread harmonics or noise.
