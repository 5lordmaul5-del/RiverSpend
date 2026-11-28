# RiverSSAI Point 6 — compose configuration validation

This increment adds CI validation of the owner runtime Compose configuration without starting services or touching data.

The validation uses placeholder credentials only and checks:
- Compose syntax/rendering.
- Presence of RiverDB, Ollama, API and worker services.
- API port mapping is loopback-bound (127.0.0.1).
- Private and Ollama egress networks are represented.
- No unexpected wildcard published ports are present.

Run locally from the repository root:
```bash
bash infra/river-ai/validate-compose.sh
```

This is a configuration guard, not a penetration test or runtime deployment. It does not download model weights, start containers, access live credentials, or modify databases.
