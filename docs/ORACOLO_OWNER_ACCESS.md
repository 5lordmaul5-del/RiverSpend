# ORACOLO Owner Access — RiverSpend

## Purpose
Define the verified owner identity used by RiverSSAI, PowerTron and UMPSD.

## Current enforcement
- Supabase Auth validates the bearer token server-side with `auth.getUser(token)`.
- The owner allowlist is the existing `river_ai_owner_access` row matching both `singleton = true` and the authenticated `user_id`.
- The row must retain the expected owner tier `nova_ultra_power_mega`; no email-only or client-side owner claim is trusted.
- The access endpoint returns the display role `oracolo` and the currently supported private-module access capabilities.
- RiverSSAI chat independently validates the same owner allowlist before processing a request.

## Important boundary
The ORACOLO role is an owner identity and private-module authorization foundation. It does not grant the AI model direct write access to GitHub, Supabase tables, Vercel deployments, payment systems, user data, or production infrastructure. Those require explicit server-side tool adapters, per-action authorization, audit records, validation, and confirmation for destructive or externally visible actions.

## Required next implementation stages
1. Add a server-side authorization helper shared by every private API route.
2. Add an audited owner command gateway with narrowly scoped actions (for example, asset replacement and draft code changes).
3. Keep production deployment, data deletion, financial movement, and permission changes behind explicit confirmation.
4. Add tests for unauthenticated, non-owner, owner, expired-token, and service-configuration failure cases.
5. Verify the actual owner UUID in Supabase before any database migration or owner-row change. Never infer the UUID from an email address or browser state.
