# RiverSSAI ↔ Canva Connector (integration blueprint)

Status: isolated integration blueprint, not a live Canva API connection yet.

## Objectives
- Make Canva a first-class creative provider in RiverSSAI, with Canva as the design/edit/export workspace.
- Use RiverSSAI for briefs, brand consistency, asset planning, workflow orchestration, validation, and metadata.
- Keep user authorization and Canva OAuth consent explicit; never store access tokens in source code or logs.
- Use Canva Connect APIs only after OAuth scopes, API availability, and user consent are confirmed.

## Capability boundary
Canva tools are available in the ChatGPT workspace when the user has connected/authorized Canva. This does not automatically grant RiverSSAI (the repository/runtime) Canva API access.

## Proposed adapter
- Provider: `canva`
- Interface: `CreativeProvider` (capability-based)
- Operations (only when authorized and supported): create design, search/list designs, read design content, export/download, upload assets, populate templates.
- OAuth: authorization-code flow, minimum scopes, state/PKCE where supported, encrypted token storage, revocation handling.
- Secret handling: credentials supplied through runtime secret manager/environment; redaction in logs.
- Reliability: bounded requests, retries only for safe/idempotent operations, timeouts, rate-limit handling, queueing, and provider-health checks.
- Data governance: user-owned designs remain in Canva; RiverSSAI stores only necessary metadata and user-authorized artifacts.

## RiverSSAI workflow
1. User describes a campaign or asset.
2. RiverSSAI Brand/Creative specialist generates a brief and approved brand constraints.
3. Canva provider checks authorization and supported operations.
4. User-approved create/edit/export operation runs.
5. RiverSSAI validates dimensions, naming, required text, brand palette, and destination.
6. The asset is presented for review; no publishing to RiverSpend without explicit user approval.

## RiverSpend creative targets
- Market banners and RS Spons campaigns.
- App icons and store graphics.
- River Signals stickers and visual packs.
- RiverSpend/RS AI/Cloud presentations and reports.
- Product promotional assets.

## Acceptance gates before live API integration
- OAuth authorization and revocation tests.
- Scope-minimization review.
- Token encryption and log-redaction tests.
- Provider timeout, retry, quota, and rate-limit tests.
- Export format and metadata validation.
- User confirmation for irreversible edits, publishing, or overwriting existing designs.

## Security note
Do not implement credential collection through chat, hard-code tokens, bypass OAuth, or automatically publish/overwrite designs.