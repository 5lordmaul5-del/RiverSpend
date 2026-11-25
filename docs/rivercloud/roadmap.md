# RiverCloud roadmap

## RC-1 — Core scaffold
Docker Compose, proxy and bootstrap.

## RC-2 — Domain routing and HTTPS
Caddy routing to an example service, automatic TLS for configured domain.

## RC-3 — Secure deployment pipeline
Security requirements, policy validator and loopback-only local queue API prototype delivered. Queue persistence exists; runner, webhook, isolated builds, audit logs, health checks and rollback remain pending.

## RC-4 — RiverCloud Panel
Static panel scaffold delivered; authenticated control plane, API, deployment actions and real metrics remain unimplemented.

## RC-5 — Operations
Backup/restore testing, monitoring/alerts, firewall, update strategy, capacity planning.

## RC-6 — Migration readiness
Run RiverSpend in staging on RiverCloud, validate reliability, backups, secrets, performance and rollback. Only then consider production cutover.
