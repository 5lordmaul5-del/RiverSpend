# RC266 — RiverCine Web Audio Engine prototype

Browser prototype using Web Audio API: channel gain, low-pass filter, compressor, stereo panner and analyser meters. Optional microphone input is user initiated and routed to a selected channel.

## Run
Serve via HTTPS or localhost, open index.html, press Start audio engine. Microphone: grant permission, select channel, click Enable microphone. Test tone is optional; lower levels before enabling.

## Limits
Not a DAW: no multitrack recording/export, MIDI, advanced parametric EQ, hardware-specific drivers, or optimized latency management. Microphone permissions are requested only when explicitly clicked. Channel strips are demo destinations, not a production bus architecture.
