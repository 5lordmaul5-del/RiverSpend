# Session restore hardening

- Restores settings only to tracks with matching names, rather than silently applying by index.
- Supports duplicate track names by matching each saved entry at most once.
- Ignores unmatched loaded tracks and reports the count.
- Clamps numeric settings to expected UI ranges and coerces toggle values to booleans.
- Filters invalid marker entries and sanitizes labels.

This is still a browser prototype and has not been runtime-tested.