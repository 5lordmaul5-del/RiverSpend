# RiverLatency Monitor

This module scans browser audio capabilities and provides a network HTTP probe when an explicit endpoint is configured.

- Browser scan reports AudioContext availability, sample rate, base/output latency estimates, WebRTC and MediaDevices support.
- Audio device enumeration is best-effort; labels may be hidden until permissions are granted.
- HTTP probe timings are **not** audio latency, RTP jitter, or physical loopback latency.
- It does not control native hardware buffer size. Browser AudioContext latency hints are requests, not guarantees.
- Future integration requires a server endpoint with CORS, cache disabled, and suitable privacy/security policy. Never probe arbitrary URLs automatically.

Use local loopback testing with hardware routing for physical round-trip measurement; network live-jam claims require real RTP/transport testing.
