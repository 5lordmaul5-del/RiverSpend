# RiverSSAI — milestone 1: avvio verificabile

## Avvio guidato
1. Installa Docker Engine e Docker Compose plugin, e curl.
2. In questa directory: `cp .env.example .env`.
3. Modifica `.env` con password RiverDB e token admin lunghi e casuali. Non condividere il file.
4. Esegui: `./start-riverssai.sh`.
5. Il comando valida configurazione e segreti, costruisce/avvia i servizi e attende il controllo HTTP. Mostra health e readiness.

## Comandi di controllo
- `docker compose ps`
- `curl http://127.0.0.1:8787/health`
- `curl http://127.0.0.1:8787/ready`
- `docker compose logs --tail=100`
- `docker compose down` (arresta, ma conserva i volumi)
- `docker compose down -v` (ATTENZIONE: elimina i volumi e i dati persistenti)

Questo script avvia solo i servizi. Il download del modello e la prova di conversazione sono traguardi successivi. Non fa deploy né tocca servizi o dati live.


## Smoke test request/response (milestones 3–4)
Install `jq`, ensure services are running and the model is available, then run `./test-riverssai-request.sh`. It checks health, readiness, submits an authenticated chat request and validates the returned answer/provider/memory fields. This is a test script; it has not yet been run against a live local runtime in this workspace.


## Milestone 5 — Persistent memory restart check
Install `jq`, start the runtime, then run `./test-memory-restart.sh`. The script writes a unique marker using the authenticated memory endpoint, restarts only the RiverSSAI API service (not volumes or database), then asks Nova to retrieve the marker and validates the response. This is an automated verification procedure; it must be run on a host to confirm the result. Never use `docker compose down -v` for this check.
