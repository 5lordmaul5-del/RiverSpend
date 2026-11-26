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

## Server-side generation adapters (added in this branch)
- `POST /api/river-ai/creative/image` submits a fixed 1024×1024 SDXL-compatible ComfyUI graph. The checkpoint name is server-configured.
- `GET /api/river-ai/creative/image?prompt_id=...` checks ComfyUI history.
- `GET /api/river-ai/creative/image-file?... ` proxies the generated media through owner authentication; ComfyUI is not exposed to the browser.
- `POST /api/river-ai/creative/video` accepts a server-configured ComfyUI API workflow JSON and injects the text prompt into a configured node/input. The workflow must expose its output as videos, gifs or images. Image-to-video source upload is not yet implemented.
- Video status uses the same endpoint with `GET ?prompt_id=...`.
- Image/video generation is available only when the private runtime configuration is present. This repository branch does not configure or host a GPU.

## Required server environment
Image:
- `COMFYUI_BASE_URL`: private runtime origin reachable by the RiverSpend server.
- `COMFYUI_CHECKPOINT`: installed ComfyUI checkpoint filename (defaults to `sd_xl_base_1.0.safetensors`).

Video:
- `COMFYUI_VIDEO_WORKFLOW_JSON`: complete ComfyUI API-format workflow.
- `COMFYUI_VIDEO_PROMPT_NODE_ID`: workflow node containing the positive prompt.
- `COMFYUI_VIDEO_PROMPT_INPUT`: input property name (defaults to `text`).

Security:
- All generation and media proxy endpoints verify the Supabase owner session and owner tier server-side.
- Never use `NEXT_PUBLIC_*` for runtime URLs or secrets.
- Do not expose the ComfyUI port directly to the public internet. Use a private network or a secured tunnel with access controls.
- The server must be able to reach the configured runtime. A laptop's `localhost` is not reachable from Vercel.
- Validate the exact workflow, model and custom nodes locally before enabling generation.
