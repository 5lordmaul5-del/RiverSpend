# RiverSSAI Creative Studio — optional local image runtime
# Set these only on the trusted server deployment. Never expose them as NEXT_PUBLIC_*.
# COMFYUI_BASE_URL=http://<private-runtime-host>:8188
# COMFYUI_CHECKPOINT=sd_xl_base_1.0.safetensors
#
# ComfyUI must be reachable from the RiverSpend server and have the named checkpoint installed.
# Do not expose ComfyUI directly to the public internet. Use a private network/VPN and firewall.
# This adapter queues one 1024x1024 SDXL-style workflow; verify sampler and checkpoint compatibility.
