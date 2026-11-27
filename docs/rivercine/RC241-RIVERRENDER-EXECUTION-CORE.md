# RC241 — RiverRender Execution Core (safe dry-run)

## Scope
This milestone introduces a minimal Node.js validation/queue-ordering prototype that reads exported RC240 plans. It validates fields and frame ranges and emits a simulated readiness state. It deliberately does **not** launch FFmpeg, Blender, GPU workloads, external commands, or render media.

## Run
Requires Node.js 18+ and no third-party dependencies:

```sh
node apps/rivercine-studios/river-render-core.mjs river-render-queue-plan.json
```

The plan file must use schema `river-render-queue-plan-v1`. Jobs are ordered by priority (High, Normal, Low) and printed as `SIMULATED_READY`.

## Next integration gates before actual rendering
- Choose and evaluate engine/codec adapters, license and supported OS/hardware matrix.
- Implement adapter allowlists (never arbitrary shell command strings), argument construction, path confinement and sandboxing.
- Media probing, validation and storage quota checks.
- Worker lifecycle, process termination, resource budgets, queue persistence and restart recovery.
- Unit tests, fixture media, integration tests, output verification and security review.
- Explicit opt-in for real render execution and separate preview/final output policies.

## Limitations
No rendering, encoding, GPU monitoring, persistent queue, ETA, output verification or remote execution exists in this prototype. The simulated state is not an engine status.
