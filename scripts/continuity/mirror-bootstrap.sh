#!/usr/bin/env bash
# RiverSpend repository mirror bootstrap.
# Credentials must be supplied by the user's Git credential manager/SSH agent.
set -euo pipefail
SOURCE_URL="${SOURCE_URL:-https://github.com/5lordmaul5-del/RiverSpend.git}"
MIRROR_URL="${MIRROR_URL:-}"
BACKUP_DIR="${BACKUP_DIR:-$HOME/RiverSpend-mirror.git}"
if [[ -z "$MIRROR_URL" ]]; then echo "Set MIRROR_URL to an independent remote URL." >&2; exit 2; fi
if [[ "$SOURCE_URL" == "$MIRROR_URL" ]]; then echo "Source and mirror URLs must differ." >&2; exit 2; fi
if [[ ! -d "$BACKUP_DIR" ]]; then git clone --mirror "$SOURCE_URL" "$BACKUP_DIR"; else git -C "$BACKUP_DIR" remote set-url origin "$SOURCE_URL"; git -C "$BACKUP_DIR" fetch --prune origin; fi
git -C "$BACKUP_DIR" remote remove backup 2>/dev/null || true
git -C "$BACKUP_DIR" remote add backup "$MIRROR_URL"
echo "Local mirror ready: $BACKUP_DIR"
echo "Configured backup remote. Review target before push; mirror pushes can delete remote refs."
if [[ "${PUSH_MIRROR:-0}" == "1" ]]; then git -C "$BACKUP_DIR" push --mirror backup; echo "Mirror push completed."; else echo "Dry run: no push performed. Set PUSH_MIRROR=1 to push."; fi
