# Session settings bounds

The session importer now clamps master volume to 0–100 and timeline zoom to 1–8, the ranges used by the mixer UI. This prevents malformed session JSON from introducing out-of-range UI state. Browser runtime verification remains pending.