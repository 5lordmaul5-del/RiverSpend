#!/usr/bin/env sh
set -eu

if [ "$(id -u)" -ne 0 ]; then
  echo "Run as root (sudo)." >&2
  exit 1
fi

cd "$(dirname "$0")"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env. Edit RIVERCLOUD_DOMAIN before continuing."
  exit 0
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed. Install Docker Engine manually from the official documentation; this script will not execute a remote installer." >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose plugin is missing. Install it from the official documentation." >&2
  exit 1
fi

docker info >/dev/null
docker compose up -d
docker compose ps
