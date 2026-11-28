# Point 11 — Local model inventory and selection plan

This point deliberately does not download models. It creates a safe inventory command and selection checklist.

Run:
```bash
bash infra/river-ai/model-inventory-owner.sh
```

Selection guidance:
- Confirm available RAM and free disk first (Point 10).
- Prefer a modest quantized model for initial bring-up; model size and context settings must fit hardware.
- Validate model provenance, license, expected storage, and compatibility before download.
- Start with one model and test basic inference, latency, and resource consumption.
- Keep model download and replacement a deliberate owner action; this script only lists locally installed models and never exposes .env values.

CI does not download or run models.
