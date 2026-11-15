# RiverCloud — local development foundation

This folder starts an isolated PostgreSQL foundation and a private API for RiverCloud development. It remains deliberately separate from the live RiverSpendShop/Supabase project and from the RiverSSAI prototype database.

## Configure

1. Copy `.env.example` to `.env`.
2. Set unique random values for `RIVER_CLOUD_DB_PASSWORD` and `RIVER_CLOUD_API_DB_PASSWORD`.
3. Set `RIVERAUTH_ISSUER_URL` and `RIVERAUTH_PUBLISHABLE_KEY` to the existing identity provider values. These are server-side API settings; never put a service-role or secret key in this file.
4. For backup tests, set the age recipient and keep the private identity file outside the repository.

## Start, stop and restart

Run from this directory:

```sh
docker compose config --quiet
docker compose up -d --wait
docker compose ps
docker compose exec rivercloud-db pg_isready -U rivercloud -d rivercloud
docker compose stop
docker compose up -d --wait
docker compose down
```

The PostgreSQL host port is bound only to `127.0.0.1:55432`. The API has no published host port: it is reachable only by containers on the private Docker network. Do not change the database binding to `0.0.0.0`.

The database joins only the internal network. The API also joins a separate outbound network so it can validate upstream identity tokens; it is not published to the host. A future reverse proxy must be the only public ingress and must enforce TLS, request limits and access controls.

## RiverAuth transition adapter

The first RiverAuth stage deliberately reuses the current Supabase Auth identity issuer. The API validates each bearer token through the issuer's `auth.getUser(token)` endpoint, then uses the immutable user UUID as the RiverCloud subject.

This is an adapter boundary, not a replacement identity provider and not a new login system yet. Existing RiverSpend login/session behavior remains unchanged. Do not migrate users, change tokens, or disable Supabase Auth until a separately reviewed RiverAuth issuer, recovery process, MFA policy, session revocation, key rotation and rollback plan have passed tests.

## Private API surface

- `GET /health`: internal liveness endpoint; returns only service status.
- `GET /v1/me`: validates the bearer token and returns only the caller's RiverCloud profile.
- `PUT /v1/me`: validates the bearer token and creates/updates only the caller's display name.

The API uses parameterized SQL, a dedicated non-superuser database role, a private schema and forced row-level security. It sets a transaction-local subject UUID for each request. It applies a small in-process rate limit, a 4 KiB request-body limit and `Cache-Control: no-store`. It has no public listener mapping, no admin endpoint, no cross-user lookup and no service-role key.

For local testing, the API is available to another container as `http://rivercloud-api:8080`. Do not expose it directly to the Internet.

## Encrypted backup and restore drill

Install Docker Compose and `age`, set `RIVER_CLOUD_AGE_RECIPIENT` in `.env`, then run:

```sh
bash ../../scripts/river-cloud/backup-local.sh
RIVER_CLOUD_AGE_IDENTITY_FILE=/secure/path/age-identity.txt bash ../../scripts/river-cloud/restore-drill-local.sh backups/rivercloud-YYYYMMDDTHHMMSSZ.dump.age
```

The restore drill requires the adjacent SHA-256 file, verifies it, decrypts the custom-format dump directly into a disposable PostgreSQL 17 container with no network, published port or persistent volume, then removes that container. Plaintext dump data is streamed and is not written to the host filesystem.

## Automated checks

The GitHub Actions workflow `.github/workflows/rivercloud-local-validation.yml` validates Compose configuration, starts PostgreSQL and the API, checks readiness, stops and restarts PostgreSQL while checking persisted data, creates an encrypted backup, and restores it into the isolated disposable database.

A passing CI run is required before considering this development stack validated. CI does not validate production performance, public TLS ingress, off-host replication or real user login.

## Multi-machine resilience plan

A single Docker host is a development node, not high availability. The production design remains:

- Node A: primary database and private API.
- Node B: standby database in a separate physical/provider failure domain, with PostgreSQL streaming replication and a tested promotion procedure.
- Node C or an independent backup target: encrypted immutable backups, separate credentials and retention.
- Independent health monitoring, DNS/load-balancer failover, UPS and separate network/power paths where self-hosted.
- Regular restore and failover exercises with documented RPO/RTO.

Do not enable automatic failover with only two voting nodes. A witness/quorum design and split-brain fencing are required before unattended promotion. Backups are not replicas and replicas are not backups.

## Non-goals for this phase

- No connection or migration of production data.
- No public database or API endpoint.
- No new customer login flow or replacement of current Supabase Auth.
- No RiverStorage implementation yet.
- No automatic multi-node failover until fencing, quorum and recovery tests exist.
