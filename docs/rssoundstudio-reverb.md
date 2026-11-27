# River Mixer Console: Reverb addition

Adds a per-channel Reverb wet-level slider (0–100%) to the local Web Audio mixer. The effect uses a generated stereo impulse response (bounded to 1.6 seconds) with a decay envelope and a ConvolverNode. Reverb is mixed into the existing channel bus alongside dry audio and delay.

- No audio is uploaded to the server.
- This is an experimental browser effect, not studio-grade room modeling or mastering.
- The UI control is a wet level; it does not expose room size or decay customization.
- Keep playback volume low when testing. Runtime/browser testing has not yet been performed.
