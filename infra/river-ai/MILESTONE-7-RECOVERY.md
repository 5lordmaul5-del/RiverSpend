# Milestone 7 — full recovery gate

Run from `infra/river-ai` on a host with Docker Compose, the stack started, and credentials configured:

```bash
chmod +x test-full-recovery.sh
./test-full-recovery.sh
```

The test writes a unique marker, restarts all Compose services, waits for API readiness including the configured Ollama model, then asks Nova to retrieve the exact marker and phrase.

**Data safety:** uses `docker compose restart` only. It does not remove containers, volumes or database records. Do not run `docker compose down -v`.

**Acceptance evidence:** PASS only when the script exits zero and prints the final PASS line. This test has been authored but not run in this development session because no Docker host is available here.
