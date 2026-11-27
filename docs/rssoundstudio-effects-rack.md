# River Mixer Console: Delay and Compression

This draft adds per-channel Delay and Compressor controls to the browser-local mixer prototype.

- Delay is a simple feedback-delay path with wet level and bounded feedback controls.
- Compressor controls adjust the Web Audio DynamicsCompressor ratio, with conservative fixed threshold/attack/release settings.
- Effects are processed locally in the browser. They are not a professional mastering chain and no project persistence/export is provided.
- Test on headphones at low volume. Effects may change perceived loudness.
- Runtime/browser testing has not yet been performed.
