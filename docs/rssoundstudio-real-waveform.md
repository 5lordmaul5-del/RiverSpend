# Real per-track waveform preview

This increment replaces the mixer’s decorative bars with a real waveform envelope decoded from each imported audio file.

## Behavior
- Fetches the browser-local object URL and decodes audio through Web Audio `decodeAudioData`.
- Computes a compact min/max envelope across channels (mono display summary; stereo playback source remains untouched).
- Caps envelope buckets at 1,600 and scales bucket count by duration.
- Draws waveform using Canvas and a gold playhead derived from the shared mixer timeline.
- Click anywhere on the waveform to seek the shared timeline.
- Decoding errors are displayed inline; object URL remains the playback source.
- No audio is uploaded to the server by this preview.

## Limitations
- This is an amplitude-envelope visualization, not spectral analysis or a full DAW clip editor.
- Browser decoding temporarily uses decoded PCM memory; very long files may still consume significant memory.
- Runtime behavior has not been verified in a real browser session.