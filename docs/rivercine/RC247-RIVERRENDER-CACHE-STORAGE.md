# RC247 — RiverRender Cache & Storage Architecture

Defines storage planning categories and retention metadata for source media, proxies, caches, intermediates and final output.

## Design principles
- Content/settings fingerprint cache keys; avoid stale cache reuse.
- Integrity metadata and checksums.
- Quotas, monitoring and predictable eviction.
- Explicit retention and cleanup safeguards.
- Separate temporary/cache space from source and delivery assets.
- Access controls, encryption considerations and backup/restore strategy.
- Atomic output staging and validation before promotion.

## Limitations
Planner and manifest export only. No file-system access, copying, cache creation, cleanup, validation or processing.
