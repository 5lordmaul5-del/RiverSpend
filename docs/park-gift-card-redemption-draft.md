# RiverSpend Park Gift Card redemption (draft)

This endpoint is intentionally disabled unless all three server environment variables exist:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` — server-only; never prefix with `NEXT_PUBLIC_`, never expose to the browser.
- `RS_PARK_STAFF_TOKEN` — temporary shared staff credential, server-side only.

Endpoint: `POST /api/park-gift/redeem`

Example request body:
```json
{
  "publicCode": "PARK-EXAMPLE",
  "secret": "a-random-secret-of-at-least-24-characters",
  "admissionsUsed": 1,
  "idempotencyKey": "scanner-01-unique-uuid"
}
```

The scanner must send the staff credential in `Authorization: Bearer ...`. Do not place it in page source, query strings, QR contents, or browser-visible configuration. A QR should contain only the public code and a high-entropy secret (or a URL that resolves to those values securely); never put a database hash or service-role key in a QR.

## Important limitations before any live use

- This endpoint is a guarded prototype, not production-ready staff authentication. Replace the shared token with authenticated staff accounts/roles and audit identity before launch.
- The stored `secret_hash` must be SHA-256 of the raw secret for this endpoint to match. Issuance code must generate a cryptographically random secret and store only its SHA-256 hash. Do not create live cards until this has been implemented and reviewed.
- The SQL migration `202610170001_park_admission_gift_cards.sql` has not been applied. Do not apply it to the live RiverSpend Supabase project as part of this draft.
- No payment verification or gift-card issuance endpoint is implemented. A card must only become `active` after a trusted server verifies a confirmed payment; never trust a browser callback.
- The endpoint is not enabled unless the server-only variables are configured. Do not add these variables to the public client.
- Run the duplicate-scan, invalid-secret, expired, blocked, insufficient-admissions, and concurrent-scan tests against an isolated test database before enabling anything.

## Response codes

- `200`: redeemed successfully, with remaining admission count.
- `400`: invalid request.
- `401`: staff credential missing/invalid.
- `404`: unknown code or invalid secret.
- `409`: blocked, expired, exhausted, insufficient admissions, or duplicate request.
- `503`: server configuration is incomplete.
