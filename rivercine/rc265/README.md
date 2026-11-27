# RC265 — RiverCine Mixer & Signal Routing Prototype

This PR adds a self-contained UI and declarative model for a virtual mixer. **It is a UI/routing-plan prototype, not a real audio DSP engine.**

## Included
- Channel strips for drum kit, bass, guitar, vocals, keys, ambience and master.
- Level, pan, mute, solo, peak-meter visualization (simulated), channel labeling.
- Signal-flow overview: input → gain → EQ → dynamics → FX sends → bus → master.
- Effect slots and routing destination selector, with validation for duplicate/self-routing and missing destinations.
- Preset structures for Rock, Heavy Metal, Acoustic, Vocal and Immersive.
- JSON schema-like configuration in mixer-config.json.

## Safety / limitations
The interface does not access hardware, record, or process real audio. Meter movement is illustrative. No actual audio device permissions are requested. Next implementation phase must add a tested Web Audio graph, latency management, device selection, and user-controlled permission handling.
