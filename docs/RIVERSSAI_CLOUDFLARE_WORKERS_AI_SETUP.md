# RiverSSAI Cloud Core — Cloudflare Workers AI

## Purpose
RiverSSAI chat can run on an open-weight model served by Cloudflare Workers AI. This removes the Groq endpoint and does not use ChatGPT or OpenAI APIs. The user-facing app remains on riverspend.com and calls only the RiverSpend server API; provider credentials stay server-side.

## Required server environment
Set these variables in the Vercel project environment (Preview first, then Production only after approval):

- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID.
- `CLOUDFLARE_API_TOKEN`: server-only API token with the minimum Workers AI permissions required by Cloudflare.
- `RIVER_AI_MODEL`: optional model override; default is `@cf/openai/gpt-oss-20b`.
- Existing RiverSSAI auth/database variables remain required: `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

Never use a `NEXT_PUBLIC_` prefix for the Cloudflare token. Never expose it to browser code or commit it to GitHub.

## Cloudflare endpoint
The server calls the OpenAI-compatible Workers AI endpoint:
`https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/v1/chat/completions`

The request is made only from `pages/api/river-ai/chat.js`, after the existing server-side Supabase session and ORACOLO owner-tier checks.

## Zero-budget boundary
Cloudflare Workers AI currently documents a free allocation of 10,000 Neurons per day on Workers Free. This is a quota, not unlimited inference; requests may fail after the daily allowance is exhausted. Check current account eligibility, model availability, and billing settings before enabling it. No paid overage should be enabled without explicit owner approval.

## What this does and does not mean
- Does: use an open-weight model hosted by Cloudflare, not ChatGPT/OpenAI.
- Does not: make RiverSpend independent of every external cloud vendor. Cloudflare still hosts and executes the model.
- Does not: provide unlimited capacity, guaranteed uptime, image generation, or video generation.
- Supabase is still used for current authentication and memory. Replacing that dependency is a separate migration.
- Image/video generation still requires separately configured model runtimes and is not activated by this chat adapter.

## Activation checklist
1. Create/confirm the Cloudflare account and Workers AI access.
2. Create a restricted API token; do not send the token in chat.
3. Add the three Cloudflare environment values to Vercel Preview first.
4. Run a preview build and an authenticated end-to-end chat test.
5. Verify rate-limit behavior, privacy, logs, and memory isolation.
6. Only then request approval to merge and publish to `https://www.riverspend.com/`.
