# I.S.S.A. Mixer Console — Feature specification

Scope for the browser Mixer workstream; implement incrementally and test each feature before merge.

## Track editing
- Take management: multiple named takes per track, audition/select, delete, and export; avoid losing takes on track edits.
- Cut/split: split at playhead, non-destructive regions where feasible, selection, undo/redo safety, and clear boundaries.
- Copy track: duplicate source audio with a new independent track ID and URL ownership.
- Clone track: duplicate track settings (fader, pan, EQ, effects, trim, fades, mute/solo) while safely sharing/copying media; never duplicate recorder/graph refs.
- Stereo controls: preserve stereo source, stereo-aware balance/pan, mono fold modes and explicit stereo track workflow.

## Jog wheel / timeline
- Jog wheel with forward/reverse scrub, variable speed, precision step and shuttle; clamp to valid range and trim bounds.
- Provide keyboard-accessible alternatives and avoid triggering playback unexpectedly.

## Metering
- Per-track meter and master meter with peak hold, clipping indication and reset.
- RMS/average level optional; meter visualization must be efficient and clean up animation resources.
- Meter reads from appropriate nodes; document limitations in browser/device routing.

## Click / metronome
- Click enable/disable, BPM, time signature, subdivision, accent and three selectable click timbres (e.g. wood/tick, soft pulse, sharp beat).
- Click monitor output configurable conceptually, including headphones; true independent hardware output only when supported by engine/device.
- Start/stop/tempo changes synchronized to timeline where feasible; protect against timer drift.

## Premaster and stereo master
- Dedicated PREMASTER bus between track/bus summing and stereo Master.
- Separate pre/post-processing controls and metering, routing, inserts, gain staging and bypass.
- Stereo Master final output with limiter/peak protection, meters, and export target.
- Preserve signal order clearly: tracks -> buses -> PREMASTER -> Stereo Master -> output.

## Reliability and testing
- Resource cleanup for audio nodes, object URLs, recorder states and meter animation.
- Test session import/export, cuts, track cloning, take lifecycle, click timing, premaster bypass and browser audio lifecycle.
- No merge/deploy until explicitly approved.


## Research-inspired next-generation features (2026–27 reference review)
This section is a design backlog informed by publicly described contemporary workflows; it is not a claim that these features already exist in I.S.S.A. or that hardware support is available.

### Channel strip and console workflow
- Per-channel selectable processing chain: polarity, trim, HP/LP filters, gate/expander, compressor, limiter, EQ, inserts, sends, pan/width, fader, mute/solo/active, peak/RMS/LUFS meters and clipping reset.
- EQ modes: graphic and parametric EQ, spectrum/RTA display, frequency/gain/Q controls, presets, optional dynamic EQ bands.
- FX rack and insert/send routing with named chains, bypass, wet/dry, preset snapshots and safe recall.
- DCA/VCA-style groups, spill-to-members, mute groups, listen/PAFL bus, talkback and monitor/foldback mixes.
- Flexible matrix and bus routing, stereo/mono fold-down, channel/bus snapshots, scene filters and recall comparison.
- Input-source profiling and configurable channel layouts; show controls appropriate to mono/stereo/multichannel sources and the selected format.

### Spatial/immersive mixing
- Unified 2D/3D spatial panner for stereo, surround and immersive formats, with speaker snapping, source trajectory, rotation, width, distance/depth, height and object metadata where supported.
- Format-specific routing maps and conversion/downmix previews; configurable layouts, speaker calibration/level/delay, bass management and headphone binaural preview (where engine permits).
- Per-source and per-bus routing matrix with destination level, automation, solo audition and route enable toggles.
- Explicit capability detection: browser rendering and hardware output constraints must be disclosed; don't imply discrete surround playback when only stereo output is available.

### Automation and performance
- Automation lanes for volume, pan/spatial position, EQ, dynamics, send levels, mute, FX parameters and bus/master controls.
- Read/Write/Touch/Latch/Trim modes, live automation capture, point/curve editing, interpolation modes, copy/paste, grouping, undo/redo and automation snapshots.
- Scene/snapshot recall with parameter filters, transition time, safe/isolated controls and comparison.
- Macro actions and customizable control surface/key bindings, MIDI mapping if supported, plus a command/search palette.

### AI-assisted but user-controlled tools
- Optional assistive mix analysis: loudness, peaks, spectral imbalance, masking suggestions, noise/voice detection and suggested gain staging; recommendations must be reversible and never silently alter the mix.
- Stem-separation/import workflow and optional voice denoise, alignment, de-essing and dialogue cleanup only when suitable local or supported processing is available.
- AI-assisted Automix suggestions for speech, dialogue and music transitions with preview, editable automation and explicit accept/reject; no automatic destructive edits.

### Video and post-production mixer integration
- Video input/source switching, Preview/Program, multiview, PIP, key/fill, chroma/luma key, DSK/graphics, titles, stills, media playback, transitions and scene presets.
- Audio-follow-video (AFV), video-follow-audio (VFA) and speaker/camera-triggered auto-switching with manual override and delay controls.
- Timecode, frame-rate/project settings, sync offset/delay per source, waveform/video cut detection, audio-to-picture timeline, markers and conform/reconform.
- ISO recording for sources plus program output, proxy/preview, stream/record controls and multi-output aspect-ratio/versioning where supported.
- Network media inputs (e.g. NDI/SRT/RTMP/RTSP) and remote camera/PTZ/tally control only through supported integrations and permissions.
- Broadcast-safe audio meters, LUFS target presets, loudness logging, mix-minus, talkback, monitor outputs and stream encoder status.

### Plugin and compatibility architecture
- Plugin host architecture to investigate: native browser-safe processing first, with clearly isolated future support for external/plugin formats only when platform licensing, runtime and compatibility permit.
- Plugin catalog, search, favorites, categories, preset browser, chain reorder, CPU/load status, bypass and offline render; no claim of VST/AU compatibility in a browser unless actually implemented.
- Audio/video asset management with metadata, waveform/proxy generation, local library, import/export, project backups and versioned session formats.

### Suggested phased build
1. Channel-strip controls, routing matrix, bus/DCA/listen groups and snapshot/recall foundations.
2. Automation engine and spatial panner with format capability checks.
3. Mixer monitoring, metering, calibration/bass-management design and export/format conversions.
4. Video switcher/timeline/audio-follow-video integration and ISO recording workflows.
5. Plugin host exploration, assistive analysis and AI Automix proposals, always previewable and reversible.
