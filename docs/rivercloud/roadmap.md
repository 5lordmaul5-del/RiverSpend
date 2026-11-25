# RiverCloud roadmap

## RC-1 — Core scaffold
Docker Compose, proxy and bootstrap.

## RC-2 — Domain routing and HTTPS
Caddy routing to an example service, automatic TLS for configured domain.

## RC-3 — Secure deployment pipeline
Allow-listed repositories/branches, authenticated triggers, webhook signature verification, isolated builds, audit logs, health checks and rollback. Avoid arbitrary shell execution through public APIs and never expose Docker socket.

## RC-4 — RiverCloud Panel
Authenticated server metrics, application status, logs, deployment and rollback controls.

## RC-5 — Operations
Backup/restore testing, monitoring/alerts, firewall, update strategy, capacity planning.

## RC-6 — Migration readiness
Run RiverSpend in staging on RiverCloud, validate reliability, backups, secrets, performance and rollback. Only then consider production cutover.
