# RiverSoundStudio session save/load

This increment adds JSON session export and restore for mixer settings.

- Export includes master level, timeline zoom, marker positions, and channel settings (faders, pan, EQ, effects, trim, fades, mute/solo).
- Restore applies settings to tracks already imported in the mixer, matching by track name first and index as fallback.
- Audio files themselves are not embedded in the JSON; re-import the audio tracks before restoring.
- Session JSON is local to the user's device; no server upload.

This is an incremental browser prototype and has not been runtime/browser-tested.
