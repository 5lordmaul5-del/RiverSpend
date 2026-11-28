#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
ENV_FILE="infra/river-ai/.env"
BACKUP_DIR="infra/river-ai/backups"
[[ -f "$ENV_FILE" ]] || { echo "Missing private runtime env file." >&2; exit 1; }
: "${RIVERBACKUP_PASSPHRASE:?Set RIVERBACKUP_PASSPHRASE in the shell; never store it in repository files}"
if [[ ${#RIVERBACKUP_PASSPHRASE} -lt 32 ]]; then echo "Passphrase must be at least 32 characters." >&2; exit 1; fi
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
stamp="$(date -u +%Y%m%dT%H%M%SZ)"
dest="$BACKUP_DIR/riverdb-$stamp.dump.enc"
[[ ! -e "$dest" ]] || { echo "Refusing to overwrite backup." >&2; exit 1; }
umask 077
docker compose --env-file "$ENV_FILE" -f infra/river-ai/docker-compose.yml exec -T riverdb pg_dump -U rivercore -d rivercore --format=custom |
  openssl enc -aes-256-cbc -pbkdf2 -salt -md sha256 -pass env:RIVERBACKUP_PASSPHRASE -out "$dest"
chmod 600 "$dest"
sha256sum "$dest" > "$dest.sha256"
chmod 600 "$dest.sha256"
echo "Encrypted backup created: $dest"
echo "Checksum created. Copy both files to separate, protected storage."
