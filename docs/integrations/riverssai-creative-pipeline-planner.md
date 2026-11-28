# RiverSSAI Creative Pipeline Planner

Added a pure planner that maps a normalized brief into explicit stages: authorization, design, export, validation, archiving and publication.

## Safety boundaries
- This planner performs no network requests and does not call Canva.
- Authorization is a caller-provided signal only; it is not a substitute for OAuth.
- Design/export/archive stages remain blocked until real adapters exist.
- Publishing remains blocked unless the approval gate is explicitly satisfied.
- Tests cover fail-closed behavior and metadata validation.

## Test
`node --test lib/creative/providers/canva-contract.test.js lib/creative/pipeline.test.js`
