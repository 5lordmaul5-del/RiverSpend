# RC242 — RiverRender Adapter Layer

## Purpose
Define a safe plugin/adapter boundary to integrate mature media engines. This milestone is a configuration planner and contract specification—not executable integration.

## Adapter candidates
- **FFmpeg:** candidate for media probing, encoding, muxing and frame sequences, subject to supported build, licensing review, platform testing and explicit command allowlists.
- **Blender:** candidate for 3D scenes, animation and rendering, subject to version, licensing, hardware and test review.
- Additional adapters only through documented capabilities and safety contract.

## Contract
1. Adapter identifier, version and capability manifest.
2. Supported input/output media, formats, profiles and resource requirements.
3. Typed, allowlisted settings—not arbitrary command strings.
4. Validate inputs and confined paths before execution.
5. Dry-run, explicit execution consent, cancellation and timeout handling.
6. Structured progress events, bounded logs and failure categories.
7. Resource budgets and worker restrictions.
8. Output metadata, existence, integrity and quality checks.

## Planner
The HTML prototype records adapter choice, profile, input/output references and notes, and exports JSON. References are descriptive only; no media is read or written.

## Future implementation gates
License review, isolated worker process, secure argument construction, path traversal tests, media fixtures, timeout/cancellation tests, OS/hardware matrix, monitoring, and verified real outputs. Do not activate actual rendering in this milestone.
