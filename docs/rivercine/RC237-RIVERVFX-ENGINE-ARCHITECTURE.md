# RC237 — RiverVFX Engine Architecture

**Status:** architecture prototype and shot-graph planner only. Not a rendering engine.

## Objective
Establish a shot-centric architecture for professional VFX planning, review, preview, and future rendering. Quality is narrative and artistic first: avoid gimmicks, unstable effects, and arbitrary visual noise.

## Core layers
1. **Project & Shot Graph** — immutable shot identifiers, plate/reference, sequence context, dependencies and version history.
2. **Media ingest** — footage metadata, color-space/transfer-function tagging, proxy creation plan, checksum and provenance.
3. **Tracking & spatial data** — camera/point/planar tracking records, coordinate conventions, lens metadata; future adapters to established tools.
4. **Matte & roto** — matte assets, versioning, edge review, temporal consistency flags.
5. **FX asset layer** — effect assets with source, parameters, seed, cache/proxy state and dependency references.
6. **Compositing graph** — typed nodes and connections, masks, transforms, blend operations, color transforms, depth and auxiliary passes.
7. **Preview / cache / render orchestration** — deterministic job descriptors, frame ranges, resolution tiers, cache keys and retries; actual implementation is future work.
8. **Review & quality gate** — temporal, spatial, compositing, color, performance, provenance and creative review.
9. **Export/interoperability** — versioned project JSON and adapters planned for professional interchange formats and external tools.

## Quality gate
- Shot and plate provenance are recorded.
- Effect intent and art direction are documented.
- Temporal stability and edge quality are reviewed.
- Compositing integration and color-management assumptions are explicit.
- Frame-range, resolution, cache and dependency state are recorded.
- Human creative review is mandatory before final delivery.

## Prototype scope
The current HTML prototype lets users add shots, layers and manual review flags, then export JSON. Flags are not automated quality analysis. No GPU rendering, simulations, tracking, compositing, installers or production integrations exist yet.

## Next technical stages
- RC238: typed node graph and compositing operations schema.
- RC239: media/proxy manifest and color-management metadata.
- RC240: render job queue specification, cache strategy and deterministic execution model.
- RC241: interoperability adapter plan and test fixtures.
