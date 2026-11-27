# ISSA Plugin Bay roadmap

- Dynamics: compressor, limiter, expander, noise gate.
- EQ/filter: parametric EQ, shelving, HP/LP and spectral tools.
- Spatial: pan, stereo width, HRTF/binaural and game-emitter metadata.
- Time/modulation: delay, echo, chorus, flanger, reverb, convolution.
- Restoration: denoise, de-click, de-hum (future DSP implementation).
- Creative: pitch, time stretch, saturation and distortion.
- Video: color grading, keying, audio sync and transitions.

Plugin contract proposal: signed/versioned manifests, sandboxed DSP, restricted filesystem/network permissions, CPU/memory limits, test fixtures and auditable permissions. VST/AU require a native desktop host; they cannot be loaded directly by this browser prototype.