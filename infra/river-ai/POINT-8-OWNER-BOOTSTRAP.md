# Point 8 — Owner bootstrap

This script prepares a first owner-only runtime configuration on the host.

## Preconditions
- Linux host with Docker Engine and Compose plugin.
- OpenSSL available.
- Run from a trusted local shell.

## Execute
```bash
bash infra/river-ai/bootstrap-owner.sh
```

The script:
- Refuses to overwrite an existing `infra/river-ai/.env`.
- Generates strong random PostgreSQL and admin token secrets.
- Writes them to the owner env file and sets permissions to 0600.
- Validates Compose rendering using the env file.
- Does not print secrets, start containers, download models, migrate data, deploy or contact a hosted service.

If validation fails, the generated env file is retained for owner-controlled troubleshooting. Do not upload or paste it into chat/issues/logs.
