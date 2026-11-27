# RC239 — RiverCine Media Pipeline

## Goals
Create an organized, provenance-aware media ingest foundation that avoids accidental relinking and supports future proxy and color-managed processing.

## Manifest fields
Asset identifier/name/path, duration, source timecode, frame size, frame rate, color-tag declaration, planned proxy preset and notes/status.

## Planned pipeline stages
- Ingest inventory and metadata inspection.
- Identity/fingerprint checks for reliable relinking (future).
- Missing/offline media status and relink workflow (future).
- Ingest modes: reference, copy, transcode, proxy creation, copy+proxy (future execution).
- Proxy presets: quarter/half resolution and quality-aware formats (future engine implementation).
- Color-management declaration and transform handling; do not guess unknown source color space.
- Preserve originals and distinguish proxies from full-resolution media; final output should resolve original/high-resolution sources.

## Safety/reliability design
- No destructive source overwrite in ingest pipeline.
- Explicit destination and confirmation for copy/transcode operations.
- Asset identity checks and checksum/fingerprint verification.
- Offline-media status rather than silently substituting assets.
- Proxy-to-original mapping and frame-rate/duration consistency.
- Metadata completeness warnings before downstream work.

## Prototype scope
The browser prototype records media metadata, planned proxy settings, and exports JSON. It does not inspect actual file headers, copy files, transcode, generate proxies, relink or render.
