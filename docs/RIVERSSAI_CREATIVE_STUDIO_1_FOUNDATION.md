# RiverSSAI Creative Studio 1.0

## Scope
Owner-only creative workspace with Nova Core workflow UI, Image Engine brief preparation, Video Engine integration target, Motion Lab browser-side WEBM slideshow export, and Media Vault local IndexedDB storage.

## Current verified implementation in this branch
- Access is checked using the existing Supabase session and `/api/area-51/access` endpoint.
- Image/video imports are stored in IndexedDB on the current browser/device.
- Motion Lab records a Canvas stream with MediaRecorder and saves a WEBM slideshow in the local vault.
- Image Engine only prepares/copies a creative brief. It does not generate an AI image.
- Video Engine is a documented integration slot. No model runtime or paid provider is configured.
- Vault is local-only, not encrypted cloud storage and not synchronized between devices.

## Planned adapters
1. Image: server-side adapter for a compatible open-weight image model (for example a Stable Diffusion/FLUX-family model), with license and hardware checks.
2. Video: server-side adapter for a compatible Wan-family runtime, only after GPU capacity is measured.
3. Jobs: durable queue, progress/status polling, per-user quotas, cancellation and audit.
4. Storage: authenticated object storage with private buckets, signed URLs, retention and deletion controls.

## Zero-budget operating rule
Do not call paid inference APIs by default. Do not claim AI generation until a real provider/runtime is configured and an end-to-end generation test passes. Browser slideshow export is a media editing feature, not text-to-video AI.
