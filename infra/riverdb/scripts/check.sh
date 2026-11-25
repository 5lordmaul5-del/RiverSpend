#!/usr/bin/env sh
set -eu
DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
command -v docker >/dev/null
docker compose -f "$DIR/../docker-compose.yml" config >/dev/null
sh -n "$DIR/backup.sh"
sh -n "$DIR/restore.sh"
echo "RiverDB configuration and shell checks passed."
