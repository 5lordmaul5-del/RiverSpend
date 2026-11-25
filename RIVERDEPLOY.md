# RiverDeploy — self-hosted deployment starter

This is the first, deliberately isolated foundation for running RiverSpend outside Vercel.

## What it provides
- Containerized Next.js standalone runtime.
- Docker Compose launch and health checks.
- Runtime configuration through a local environment file.
- Does **not** automatically deploy, change DNS, or replace the production Vercel deployment.

## Prerequisites
A Linux server with Docker Engine and Docker Compose plugin, plus a domain and HTTPS reverse proxy (planned separately).

## Setup
1. Copy `.env.riverdeploy.example` to `.env.riverdeploy`.
2. Fill in the correct environment values. Never commit the private environment file.
3. Build and start:

   ```sh
   docker compose -f docker-compose.riverdeploy.yml up -d --build
   ```

4. Test locally on the server: `curl -I http://localhost:3000`.

## Important
This starter is not yet a production migration. Before routing real traffic, we must validate build and runtime behavior, add TLS/reverse proxy, backups, deploy rollback, monitoring, secrets handling, and a controlled GitHub deploy workflow. Supabase and payment integrations still depend on their own services and credentials; self-hosting the web runtime does not replace those providers.
