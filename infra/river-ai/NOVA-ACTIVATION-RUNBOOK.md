# Nova activation — owner-host procedure

This is the activation runbook for the isolated RiverSSAI core. It does not claim the runtime is running until the owner-host commands below have completed successfully.

## Host prerequisites
- Linux host with Docker Engine and Docker Compose plugin.
- Internet access for the first Ollama model pull; sufficient disk/RAM for the selected model.
- Run only on a machine controlled by the owner. The API binds to localhost by default.

## Prepare
1. Clone the RiverSpend repository and checkout branch `feat/river-ssai-v1-seven-milestones-startup-2026-11-28`.
2. In `infra/river-ai`, copy `.env.example` to `.env`.
3. Generate a strong database password and a random admin token of at least 32 characters. Put them in `.env`; do not commit or share this file.
4. Review the configured model and local disk capacity.

## Start and test
From `infra/river-ai`:
```bash
bash start-riverssai.sh
bash test-riverssai-v1.sh
```
The consolidated gate may download model weights and performs restarts, but does not delete named volumes. Keep the host online and allow time for model inference.

## Confirm activation
Activation evidence is the actual output from the host:
- `/health` returns HTTP 200 and PostgreSQL connected.
- `/ready` returns HTTP 200 with Ollama/model available.
- Authenticated chat returns a nonempty answer with local provider.
- Recovery test finds its marker after restart.
- Gate ends with `ACCEPTANCE GATE PASSED`.

## Stop
Use `docker compose stop` from this directory. Do not use `down -v`; that deletes persistent volumes.

## Limits
The API is loopback-bound and the Ollama port is not published. This is a starter single-owner runtime, not a reviewed production deployment or a hardened arbitrary-code execution sandbox. Tool policy is deny-by-default and currently does not enable shell, payment, deployment or destructive executors.
