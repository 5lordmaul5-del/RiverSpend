# RC240 — RiverRender Render Engine Architecture

## Objective
Define the architecture and planning surface for RiverRender, without claiming that a rendering engine is operational.

## Prototype
- Queue planning UI: jobs, preset, frame range, priority and notes.
- JSON export for interchange and future orchestration.
- Validation: frame end cannot precede start.

## Engine roadmap
1. **Job graph & validation:** resolve inputs, dependencies, formats and settings; deterministic job fingerprints.
2. **Profiles:** preview/review/final, resolution, FPS, codec/container, color pipeline, audio and output policies.
3. **Chunking:** frame-range segments, worker assignment, ordered assembly and boundary checks.
4. **Cache:** content/settings fingerprint, cache lifecycle, storage limits and invalidation.
5. **Scheduler:** priority, fairness, CPU/GPU/memory/storage constraints, resource reservation and cancellation.
6. **Workers:** local worker first; authenticated remote workers later; explicit compatibility checks.
7. **Resilience:** checkpoints, bounded retry, crash recovery, idempotency and failure classification.
8. **Observability:** progress, ETA estimates, structured logs, metrics, job history and diagnostic bundles.
9. **Quality gate:** output existence/size, metadata validation, frame/audio checks, checksum and review status.
10. **Delivery:** packaging, manifests, destination policy, archival and reproducibility.

## Safety & reliability
- Never execute arbitrary user-provided commands or scripts as render jobs.
- Worker registration/authentication and least privilege are mandatory before remote execution.
- Jobs must be cancellable and resource-limited; retries bounded.
- Treat paths and media metadata as untrusted; validate file access and avoid path traversal.
- Queue UI must distinguish planned, queued, running, failed, cancelled and completed states only when backed by actual engine telemetry. The prototype displays **Planned** only.
- No automatic deployment, billing, or remote worker activation in this milestone.

## Integration
Use adapters for established render/encode engines rather than rebuilding codec stacks prematurely. Engine integration remains a later milestone after requirements, licensing, hardware and test matrix are evaluated.

## RC240 deliverables
- `apps/rivercine-studios/riverrender-queue-planner.html`
- `infra/rivercine/river-render-queue-plan.schema.json`
- `docs/rivercine/RC240-RIVERRENDER-ENGINE-ARCHITECTURE.md`

This milestone is a design/prototype scaffold only; it does not render frames or encode media.
