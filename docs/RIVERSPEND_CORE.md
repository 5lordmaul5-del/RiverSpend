# RiverSpend Core

RiverSpend Core is the shared, server-side integration layer for the RiverSpend ecosystem.

## First implementation

- Central provider registry for Supabase, PayPal, SumUp, Web Push, and River AI.
- Server-side environment-variable access only.
- Safe readiness reporting: status and missing-variable counts only.
- Provider credentials are never stored in browser code, public database tables, Git, or API responses.

## Security rules

1. Store provider secrets as Vercel Environment Variables (or a dedicated secrets manager).
2. Never use `NEXT_PUBLIC_` for a private key, token, client secret, or service-role key.
3. Do not return credential values from status endpoints or admin pages.
4. Keep each provider's permissions and webhook verification separate.
5. Only mark a payment as paid after a verified provider callback/capture.
6. Never treat a configured key as proof that a merchant account is approved or live.

## Current provider registry

| Provider | Environment variables | Ecosystem services |
| --- | --- | --- |
| Supabase | NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY | Shop, Signals, Pay, Box, Panel Control |
| PayPal | PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_MODE | Pay, Shop, Signals |
| SumUp | SUMUP_API_KEY, SUMUP_MERCHANT_CODE | Pay, Shop |
| Web Push | PUSH_SEND_SECRET, WEB_PUSH_VAPID_PUBLIC_KEY, WEB_PUSH_VAPID_PRIVATE_KEY | Signals, Shop, Park |
| River AI | GROQ_API_KEY | River AI, Signals, Shop |

## Use from server code

Import from `lib/riverspend-core` only in server-side modules:

```js
import { getCoreStatus, isProviderReady, getProviderSecret } from "@/lib/riverspend-core";

const integrations = getCoreStatus(); // safe metadata, no secret values
if (isProviderReady("paypal")) {
  const clientId = getProviderSecret("paypal", "PAYPAL_CLIENT_ID");
}
```

Do not import this module into client components or browser bundles.

## Rollout plan

1. Establish this registry and keep current payment routes working.
2. Migrate PayPal and SumUp routes to the Core adapters one at a time.
3. Add an authenticated owner-only integration status panel in RS Panel Control.
4. Connect other RiverSpend applications to the Core through authenticated server-to-server requests.
5. Add new providers only when the relevant account, API credentials, legal requirements, and webhook configuration are ready.

The initial registry does not activate payments by itself. Payment processing remains subject to provider onboarding, credentials, webhooks, and end-to-end verification.
