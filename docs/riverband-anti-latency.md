# RiverBand AntiLatency Core (initial hardening)

## Honest targets
- Diagnose and report local audio-buffer delay, network round-trip time (RTT), jitter, and dropped frames/underruns where APIs permit.
- Never promise imperceptible global live-jam latency.
- Use separate workflows: **Live Jam** (best-effort, connection/device dependent) and **Remote Take** (click/reference, local capture, synchronization and later alignment).
- A phone's built-in microphone remains a supported entry-level option; device and browser capability limits are displayed.

## Initial strategy
1. Capture capability check: browser, audio input permission, sample rate, audio context latency hints, MIDI availability (where supported).
2. Local monitor path: measure loopback when hardware permits; estimate buffer path only as a lower-bound approximation.
3. Network probe: RTT and jitter estimates from timestamped ping/echo exchanges to the session server; no music audio carried by this probe.
4. Session health: rolling RTT/jitter, packet loss (transport-dependent), audio underruns and drift.
5. Adaptive modes: low-buffer best effort; increase buffer when dropouts occur; clearly warn that lower buffers may increase CPU/dropout risk.
6. Remote Take synchronization: count-in, click/reference, timestamped take metadata, drift measurement and alignment tools.
7. Audio transport research: WebRTC can be evaluated for realtime voice/control, but high-quality music transport may require dedicated WebRTC/UDP infrastructure and careful codec/packetization strategy. Ordinary video conferencing is not the synchronized multitrack engine.

## Buffer estimates
For a buffer of N samples at sample rate R, one buffer duration is N/R seconds. A round-trip estimate is only a rough model and actual device/driver/browser processing, converters, effects, wireless and acoustic propagation add delay. Real measurement is preferable.

## Core helpers
The module `lib/riverband/anti-latency-core.js` contains pure helpers and preset tiers. It is a foundation, not a connected audio/network monitor.
