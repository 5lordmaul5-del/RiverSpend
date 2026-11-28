# Point 10 — Owner-host preflight

Before installing or starting RiverSSAI on an owner-controlled machine, run:
```bash
bash infra/river-ai/preflight-owner-host.sh
```

This read-only preflight reports tool availability, Docker daemon/Compose availability, disk and memory summaries, and whether the protected environment file exists (permissions only). It never prints secrets.

It does not install packages, download models, start containers, change settings or write runtime data. Review the output locally and ensure adequate disk, RAM and CPU capacity before proceeding.
