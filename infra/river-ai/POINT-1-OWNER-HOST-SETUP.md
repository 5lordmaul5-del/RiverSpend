# RiverSSAI Point 1 — owner-host bootstrap and acceptance
This repeatable bootstrap closes the software-delivery portion of Point 1; it does not claim a host is already provisioned.

## Prerequisites
Linux host with Docker Engine, Compose plugin, curl, openssl and sufficient disk/RAM. Default model Qwen 2.5 7B may be too large or slow for some hosts. Set `RIVER_AI_LOCAL_MODEL` to a compatible Ollama model before running if needed. Host is private; script binds API to localhost only.

## Start
From repository root:
```bash
bash infra/river-ai/start-owner-host.sh
```
Creates mode-0600 environment file with randomly generated database password and bearer token; starts PostgreSQL, Ollama and API; downloads model; starts worker; checks readiness and authenticated chat. Refuses to overwrite existing .env.

## Logs
```bash
docker compose -f infra/river-ai/docker-compose.yml logs --tail=100
```

## Stop/restart
```bash
docker compose -f infra/river-ai/docker-compose.yml down
docker compose -f infra/river-ai/docker-compose.yml up -d
```
Do not use `down -v`; it deletes persistent volumes.

## Limits
Single-owner development runtime, not a hardened public multi-user service. Do not expose publicly without TLS, firewall, authentication review and explicit approval. Model download requires internet/disk; inference consumes host resources and electricity. Separate encrypted backup and tested restore are still required before claiming full operational/recoverable closure.
