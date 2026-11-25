# RiverCloud roadmap

## RC-1 — Core bootstrap (initial scaffold)
Docker Compose, proxy placeholder, installation documentation.

## RC-2 — Routing and HTTPS
Caddy automatic TLS, app route configuration, domain validation.

## RC-3 — Secure deployment pipeline
Git webhook or deploy token, allow-listed repositories/branches, signed webhook validation, job queue, audit log, isolated builds, rollback and health checks. No arbitrary shell commands exposed through web API.

## RC-4 — Panel
Authentication, server metrics, application status, logs, deploy/rollback actions and resource limits.

## RC-5 — Operations
Backup/restore verification, monitoring/alerts, firewall policy, update strategy, capacity planning.

## RC-6 — Migration readiness
Run RiverSpend in staging on RiverCloud; compare reliability, backups, traffic, secrets and rollback. Only then consider production cutover.
