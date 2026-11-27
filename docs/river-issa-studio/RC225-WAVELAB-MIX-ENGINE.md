# RC225 — River ISSA WaveLab & Mix Engine

Prototype browser-local editor: import audio, inspect waveform, set trim boundaries, preview selected region with gain, and export rendered WAV. Processing stays in the browser.

## Scope
- waveform display (channel 1)
- trim boundaries in seconds
- selected-segment preview
- gain
- offline WAV export (16-bit PCM)

## Limitations
Single-file prototype; no clip timeline, fades, multi-track mixdown, undo/history, spectral editing, noise reduction, plugin hosting or cloud upload. Browser memory limits apply. Keep original files separately. Not yet a professional DAW.

## Usage
Open apps/river-issa-studio/wavelab.html in a modern browser, choose an audio file, set start/end, preview, then render/download.
