# RiverCloud — local foundation

This folder starts an isolated PostgreSQL foundation for RiverCloud development. It is deliberately separate from the live RiverSpendShop/Supabase project and from the RiverSSAI prototype database.

## Start

1. Copy `.env.example` to `.env`.
2. Set `RIVER_CLOUD_DB_PASSWORD` to a unique, long random password.
3. Run from this directory:

```sh
docker compose up -d
docker compose ps
docker compose exec rivercloud-db pg_isready -U rivercloud -d rivercloud
```

The database is available on the host at `127.0.0.1:55432`. It is not exposed on a public interface. The Docker network is internal. Do not change the port binding to `0.0.0.0`.

## First service boundary

- **RiverCloud DB:** PostgreSQL, portable SQL system of record.
- **RiverCloud API:** not included yet; must be added before application clients connect.
- **RiverAuth:** not included yet; do not expose direct database credentials to browsers.
- **RiverStorage:** provider-neutral object-storage adapter is a separate next step.
- **RiverBackup:** encrypted local export helper is provided; independent off-host copies and restore drills remain mandatory.
- **RiverSSAI:** stays isolated until explicit integration and migration tests are approved.

This is a development foundation, not a production cloud and not a Supabase replacement yet.

## Encrypted backup

Install Docker Compose and `age` on the host, set `RIVER_CLOUD_AGE_RECIPIENT` in `.env`, then run:

```sh
bash ../../scripts/river-cloud/backup-local.sh
```

The script streams a PostgreSQL custom-format dump directly into age encryption, writes a SHA-256 checksum for the encrypted artifact, and never writes a plaintext dump to disk. Keep the age private key separately from the backup storage. Copy encrypted backups to at least two independent destinations and test restores in an isolated database before relying on them.

## Non-goals for this phase

- No connection to production Supabase.
- No migration or deletion of existing customer, product, order, or payment data.
- No public database endpoint.
- No user-facing authentication or API until those layers are implemented and reviewed.
- No AWS dependency or cloud vendor lock-in.
