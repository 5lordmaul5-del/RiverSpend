# RC224 — MultiTrack & Plugin Engine groundwork

## Added
- Browser multitrack project prototype: multiple audio tracks, local import, simple synchronized playback, per-track mute and gain controls, and JSON project metadata export.
- Plugin API contract prototype and built-in Web Audio graph factory.

## Limitations
- No waveform editing, clip repositioning, automation, timeline ruler, crossfade, mixdown/render, embedded audio export or persisted project storage.
- No track filter application yet. Gain uses browser media-element volume (0–1).
- Project JSON does not embed audio.
- Plugin contract is groundwork only; no arbitrary plugin loading, VST/AU hosting or sandbox implemented.

## Next milestones
1. Web Audio per-track DSP graph and automation.
2. Waveform generation and clip editing (trim, move, fade, split).
3. WAV mixdown/render.
4. Project bundle with audio assets, checksums and manifest.
5. Safe plugin SDK, signed manifests and permissions.
6. RiverBox asset exporter/runtime audio bus.

Run on localhost or HTTPS; open apps/river-issa-studio/multitrack.html.