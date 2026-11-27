# River ISSA Studio V1 prototype

Browser prototype for local audio/video capture, basic live Web Audio processing and RiverBox game-audio asset metadata.

## Run
Serve repository on localhost or HTTPS (media capture APIs require a secure context): `python -m http.server 8080`, then visit `/apps/river-issa-studio/`.

## Current
- Mic capture via MediaRecorder, downloadable WebM audio.
- Webcam+audio video capture, downloadable WebM.
- Imported audio playback and live gain/filter/delay processing.
- Game-audio metadata JSON generator.

## Limitations
Prototype only. No multitrack editor, WAV rendering/export pipeline, professional DSP, VST/AU, plugin sandbox, video editing, cloud storage, authentication, or RiverBox integration. Capture requires explicit browser permission; files are local.