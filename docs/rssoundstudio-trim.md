# RiverSoundStudio — non-destructive track trim prototype

Adds per-channel Trim Start and Trim End controls in seconds. Timeline seeks clamp to each channel's selected bounds, and playback is paused and repositioned when the trim end is reached. A zero Trim End means the full source duration. Source files are not modified.

Stacked on the track-fades PR branch. Browser runtime verification pending; confirm interactions across tracks with differing durations and trim bounds. No merge/deployment.
