# RC238 — RiverVFX Node Compositor Architecture

## Purpose
Define a typed, shot-oriented graph representation as a foundation for a future compositor. Professional quality and restraint are required; nodes are tools for intentional cinematic work, not novelty filters.

## Node categories
- Source/Plate: footage, still, generated or external assets; metadata/provenance.
- Transform: geometric transforms and coordinate handling.
- Mask/Roto: matte assets, edge metadata, temporal versions.
- Tracking Data: camera/object/planar tracking data references.
- Color Transform: declared color-space transforms and LUT references; color management must be explicit.
- Key/Matte: keying and matte refinement operation descriptors.
- Depth/Z: depth pass and depth-aware operations.
- FX Element: referenced effect asset, parameters, cache and seed metadata.
- Blend/Composite: layer combination and compositing operations.
- Output: review/output targets and format/quality settings.

## Graph invariants (planned validation)
1. Unique node IDs and valid edge endpoints.
2. No cycles in the processing graph unless explicitly supported by a future engine.
3. Type-compatible connections; validation reports incompatibilities.
4. Stable, versioned node contracts and parameter schemas.
5. Explicit color-space assumptions and media provenance.
6. Deterministic parameter/seed metadata where feasible.
7. Graph changes versioned with shot context; dependencies tracked.

## Future execution pipeline
Graph validation → dependency resolution → proxy/preview plan → cache key computation → scheduled execution → temporal QA → review → final output. This is a roadmap, not implemented processing.

## Prototype
HTML allows node metadata creation, connection records and JSON export. It does not execute nodes, composite frames, render or validate graph compatibility yet.
