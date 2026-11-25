#!/usr/bin/env sh
set -eu
if [ "$(id -u)" -ne 0 ]; then echo "Run as root (sudo)." >&2; exit 1; fi
if ! command -v docker >/dev/null 2>&1; then
  echo "Installing Docker Engine using the official convenience script..."
  curl -fsSL https://get.docker.com | sh
fi
docker compose version >/dev/null
cd "$(dirname "$0")"
if [ ! -f .env ]; then cp .env.example .env; echo "Created .env. Edit RIVERCLOUD_DOMAIN before starting." ; exit 0; fi
docker compose up -d
docker compose ps
