# Point 13 — Local inference smoke test

This script performs one bounded smoke test only when the owner explicitly sets `RIVERAI_SMOKE_MODEL` to a model already installed in the local Ollama service. It does not download a model or start services.

Run after starting runtime and confirming the installed model inventory:
```bash
RIVERAI_SMOKE_MODEL='installed-model-tag' bash infra/river-ai/inference-smoke-owner.sh
```

Default timeout: 60 seconds; override with `RIVERAI_SMOKE_TIMEOUT`. The command output may contain model-generated text; review locally. Do not provide secrets or private data in the prompt. This test is a basic responsiveness check, not a quality, safety or security certification.
