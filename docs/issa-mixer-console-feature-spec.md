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


## Animation, game creation, and cinematic Hollywood-style VFX
- Cartoon/animation workspace: storyboard, scene/shot planning, 2D frame-by-frame animation, timeline/layers, onion skin, rigs/bones, character libraries, lip-sync, voice recording, motion capture import, camera moves, backgrounds and animatic export.
- 3D animation pipeline: modeling/scene import, materials, lights, cameras, rigging, animation curves, particles, render queue and compositing; capabilities should be staged rather than implied to be fully implemented.
- Game creation workspace: visual scripting/node graph, scene editor, 2D/3D assets, character and object animation, physics/collision, UI/HUD, sound triggers, dialogue, level editor, testing/simulation and build/export pipeline for supported targets.
- Game audio: adaptive music, spatial sound, footsteps/ambience, trigger zones, dialogue mixing, buses and per-game mix snapshots.
- Cinematic VFX toolkit inspired by film workflows: compositing layers/nodes, green/blue screen chroma key, masks, rotoscoping, motion tracking, camera tracking, stabilization, lens distortion, particles, explosions/fire/smoke/water/lightning simulations or procedural equivalents, debris, sparks, muzzle-flash-style fictional effects, magic/fantasy effects, holograms, volumetric fog, depth effects, lens flares, motion blur, optical flow, time remapping, morphing, titles and color grading.
- VFX asset library: reusable presets, materials, particles, templates, transitions and user-authored effects; preview, render settings, GPU/load status, and project-relative assets.
- Film/game scene compositor: combine live-action, animated elements, 3D objects and audio with tracking and timing; node graph and timeline integration.
- Safety and technical guardrails: effects simulation and rendering are creative-media features; implement generic fictional visual effects and safe assets, avoid real-world weapon construction guidance; report rendering/platform limitations and use staged, testable modules.
- Unified media project: video, animation, game cinematics and audio timelines can exchange markers, assets, stems, scene metadata and timecode through documented formats where feasible.


## Motion capture (MOCAP), performance capture and virtual production
- Mocap studio workflow: capture-session setup, calibration, take management, actor/performer metadata, camera/sensor status, sync/timecode and marker-quality checks.
- Capture options to explore: marker-based optical systems, markerless multi-camera pose capture, depth cameras, IMU/wearable sensors, webcam-based capture and compatible motion-capture imports; capability and hardware requirements must be explicit.
- Body motion, facial performance, hand/finger tracking, gaze, expression and voice capture, with separate streams and timecode alignment where supported.
- Retarget captured motion to user-imported or user-created character rigs, bone mapping, proportions correction, foot locking, smoothing, cleanup, interpolation and editing curves.
- Performance capture workflow: record body + face + hands + voice, take review, synchronization, selectable takes, cleanup and export to animation/game/film pipeline.
- Virtual production: green-screen and blue-screen workflow, spill suppression, key edge refinement, masks, foreground/background compositing, camera tracking, lens calibration, virtual backgrounds, live preview and scene lighting match.
- Costume/props/marker preparation guidance: capture suit/marker placement and calibration checklists, lighting and camera setup, safe studio workflow, and reference assets; no proprietary costume or movie assets are included.
- Film-inspired FX and creature/character pipeline: original creature design, digital doubles, fantasy/sci-fi environments, motion retargeting, facial animation, compositing, particle/simulation FX and virtual cameras, inspired by broad workflows used in major productions (not copying protected characters, designs or assets).
- Export/interchange roadmap: investigate formats and pipelines such as FBX, glTF, BVH, USD and supported image/video/audio formats; validate compatibility and licensing per integration.
- Integration: Motion data and scene markers can flow to Cartoon Studio, 3D Animation, Game Studio, VFX compositor, video timeline and I.S.S.A. audio sessions; linked voice, footsteps, Foley, ambience and music tracks.
- Phased build: (1) file import and rig mapping/editing; (2) webcam/markerless capture prototype with clear limitations; (3) hardware/sensor integrations; (4) synchronized multi-modal performance capture and virtual production.


## Implementation sequence and acceptance gates for creative-production expansion
- Treat the Animation/Game/Mocap/Virtual Production workspaces as distinct modules sharing a project asset layer and timeline metadata, not one monolithic UI.
- Milestone A — shared project/media foundation: asset catalog, metadata, versioned project schema, import validation, autosave/recovery, timecode/markers, undo/redo and storage quota warnings.
- Milestone B — animation foundation: timeline/layers, storyboard/animatic, keyframes, curves, character/rig import and simple 2D animation playback/export.
- Milestone C — motion-data foundation: import supported motion formats, mapping preview, retargeting configuration, cleanup tools and selectable takes; verify with sample assets.
- Milestone D — accessible capture prototype: webcam/markerless capture experimentation, explicit confidence/quality indicators, local privacy controls and test fixtures.
- Milestone E — green/blue-screen and compositing: keyer, masks, edge/spill controls, layers, tracking data import and render/export tests.
- Milestone F — game authoring prototype: scene/asset browser, simple 2D scene, visual event graph, trigger/audio wiring and playable local preview.
- Milestone G — advanced simulation and integrations: particle/VFX, multi-camera capture, sensor integrations, live virtual production and plugin/integration evaluation.
- Each milestone requires: design/spec, isolated branch, implementation, static/unit tests, documented manual test steps, sample project, review; no merge or production deploy without explicit approval.


## Shared Creative Project Schema v1
- Initial versioned JSON schema is stored at `docs/creative-project-schema-v1.json`.
- Defines project identity/version, timestamps, frame-rate and resolution metadata, typed assets, tracks/clips, markers and optional takes.
- Asset records intentionally describe metadata rather than embedding binary media; storage adapters can remain local or later connect to RiverCloud.
- Importers must validate schema/version, reject unsupported or malformed records gracefully, and preserve unknown metadata where feasible.
- Project saves should use atomic/recoverable writes, autosave snapshots, quota warnings, and exportable backups.
- Privacy defaults: local-first storage; explicit consent before uploading media, motion capture, face/voice data or project assets. Provide delete/export controls and avoid sending capture data to external services by default.
- This schema is a foundation document, not a runtime feature; implementation and validation tests remain outstanding.


## Storyboard, scriptwriting and pre-production workspace
- A dedicated writing workspace inside the shared creative project: screenplay/script editor, story outline, synopsis, logline, treatments, character sheets, dialogue, scene descriptions, shot lists, storyboard panels, shot notes and revision history.
- Structured screenplay support: scene headings (INT./EXT., location, time), action, character cue, dialogue, parentheticals, transitions, sequence/scene numbering and page breaks; keyboard-friendly editing and autosave.
- Storyboard: scene/shot cards with editable descriptions, sketch/image reference slots, framing (wide/medium/close-up etc.), camera angle/movement, lens notes, duration, dialogue/audio cues, lighting, props, continuity notes and status.
- Storyboard board and timeline views; reorder shots, duplicate, link script paragraphs to storyboard panels, annotate, export printable PDF/image/contact-sheet or structured project data where implemented.
- Pre-production tools: cast/character/locations/props lists, costume/production notes, shooting schedule, shot checklist, budget fields, scene breakdown, revisions and approvals.
- AI-assisted brainstorming and draft generation can be optional, with editable output and explicit user acceptance; do not silently replace original writing. Keep user drafts local by default and require consent for external processing.
- Cross-links: storyboard shots can reference animation, mocap takes, video clips, VFX layers, game cutscenes, audio tracks and timeline markers; preserve IDs and project schema linkage.
- Implementation stages: (1) editable script/outline/character/scene documents and autosave; (2) storyboard cards and shot list linked to scenes; (3) export/print and schedule/breakdown tools; (4) timeline and media links.
- Acceptance checks: recover unsaved work after simulated interruption; validate document export; reorder and relink shots without ID loss; verify accessible keyboard controls; test autosave/revision rollback.


## RiverSSAI + RiverCloud integration across all I.S.S.A. audio/video creative programs
- Unified, optional assistant entry point ("Ask RiverSSAI") in every audio/video creative workspace: Mixer, SoundStudio, Video Studio, media analyzer/catalog, script/storyboard, animation, mocap, VFX, game cinematics and virtual production.
- Assistant capability registry with workspace-specific permissions and context adapters; RiverSSAI must not receive project/media data unless the user explicitly enables that context for the task.
- Audio assistance: project/track summaries, loudness/peak/spectral checks, clipping/noise/masking detection, mix suggestions, automation proposals, dialog cleanup workflow guidance, metadata/transcript assistance and reversible actions previewed before application.
- Video assistance: clip/transcript/frame analysis where supported, scene/shot summaries, rough-cut suggestions, caption drafts, continuity/shot-list matching, VFX planning, storyboard-to-timeline linking and export preset guidance.
- Story/script/animation assistance: idea-to-outline, screenplay formatting, character/scene/shot suggestions, storyboard text and animatic planning; all generated text remains editable and user-approved.
- MOCAP assistance: take summaries, data-quality indicators, retargeting/cleanup suggestions and capture troubleshooting; biometric/face/voice/motion data is sensitive and stays local unless explicitly consented to a selected processing route.
- RiverCloud integration adapter: project save/load/sync, asset metadata, versioning, recovery snapshots, permission-aware sharing and optional collaboration; distinguish local/offline mode from cloud-connected status and never silently upload binary media.
- Resilience: local-first mode when Cloud/AI/network/quota unavailable; queued sync with conflict handling, explicit upload/download status, retry controls and integrity checks. Avoid oversized duplicate transfers and provide bandwidth/storage controls.
- AI service architecture: RiverSSAI core, tool adapters and policy/permission layer separated from media processing engines; no assumption that all models run locally or that cloud AI is free/unlimited.
- UX: consistent AI panel, task-specific tools, context preview, data sent indicator, editable proposals, apply/undo, audit history, disable/reset controls and plain-language limitations.
- Implementation stages: (1) shared assistant interface + permissions/context contract; (2) local audio/video utility tools and mock adapters; (3) RiverCloud project/metadata sync adapter with offline/recovery tests; (4) transcript/shot/storyboard assistance; (5) expanded media analysis and optional model-provider integrations.
- Acceptance checks: tests for context consent, least-privilege tools, no upload on local-only mode, offline degradation, quota/transfer handling, sync conflicts, undo/reversible suggestions and data deletion/export.
- Roadmap/spec only: these integrations are not represented as deployed or functional until code, tests and manual verification exist.


## I.S.S.A. WorldForge — 3D/4D world, city and environment creation; game/console integration
- Create original 3D assets and environments: objects, props, architecture, terrain, buildings, roads, vegetation, interiors, vehicles, creatures, characters and modular kits; primitive/blockout tools, sculpting/modeling, materials/textures, lighting, camera, scene graph and hierarchy.
- City/world builder: terrain and biome tools, modular urban layouts, zoning and road/path networks, procedural generation with editable seeds/rules, buildings, landmarks, interiors, weather, day/night, sky, water and environment systems. Generated layouts remain editable and support undo/redo.
- 4D definition for this project: time-varying 3D scenes—animation, world evolution, dynamic weather/environment, simulation, time-based events and state changes—rather than implying a separate universal 4D hardware format.
- Simulation/physics: collision, rigid bodies, simple fluids/particles, vegetation/environment simulation and interactive objects, staged according to browser/device capabilities.
- Scene/world formats and pipeline: investigate glTF/GLB and other supported exchange formats; asset validation, LOD, texture/material budgets, compression, metadata, provenance and licensing checks.
- Shared asset/project library connected to Creative Project Schema and RiverCloud adapters: local-first import/export, optional sync, versioning, recovery, asset IDs and permission-aware sharing; no automatic uploads of large binary scenes.
- RiverSSAI World Assistant: optional scene/world generation prompts, procedural rule suggestions, environment planning, debugging, optimization and accessibility guidance; preview editable changes, explicit acceptance, and undo.
- Game integration pipeline: publish/export scenes, models, terrain, materials, animation, audio, collision, scripts/events and metadata into RiverSpaceGalaxyGames/game projects, with compatibility manifests and validation reports.
- RiverBox console pipeline: console target profiles, input/controller mapping, performance budgets, resolution/frame-rate settings, memory/asset budgets, platform abstraction, build packaging and testing. Console build/export remains subject to actual SDK, licensing and hardware access; do not claim compatibility before verification.
- RiverSpaceGalaxyGames and future RiverBox console share project/asset identifiers and versioned manifests; runtime/gameplay and console OS/hardware are separate layers, with secure update and permissions design.
- Multiplayer/world sharing, server-authoritative simulation, identity and safety moderation are future stages, not implied by world editing alone.
- Milestones: (1) 3D scene graph + basic primitives/materials/camera and import/export prototype; (2) terrain and modular city blockout; (3) animated/time-evolving scene components (4D); (4) asset manifest and game export prototype; (5) controller/console target profile and build validation; (6) advanced procedural simulation, world sharing and hardware integrations.
- Acceptance gates: open/save project and asset IDs; deterministic procedural seed test; export/import round-trip for supported assets; device-performance profiling; game-target manifest validation; explicit cloud consent and offline behavior.
- Roadmap only until implemented and tested. The term 4D denotes time-dependent scene content, not a promise of holographic/physical 4D output.
