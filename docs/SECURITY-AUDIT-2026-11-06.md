# RiverSpend security audit — 2026-11-06

Project reviewed: Supabase project `rkwqmteuxpdgdhgowbpn` (Postgres 17).
Scope: read-only security advisor review, selected function definitions/ACLs, and targeted hardening.

## Changes applied and verified
- Revoked `PUBLIC` and `anon` EXECUTE on `public.rs_admin_insights()`; retained EXECUTE for `authenticated`.
- Revoked `PUBLIC` and `anon` EXECUTE on `public.rs_fortune_credit(text,text,numeric,bigint,jsonb)`; retained EXECUTE for `authenticated`.
- Set a fixed `search_path = public, pg_temp` on trigger function `public.decrement_product_stock_for_order_item()`.
- Verified with `has_function_privilege`: anon cannot execute either RPC; authenticated can. Verified trigger function has fixed search_path.
- Matching SQL migration stored at `supabase/migrations/20261106120000_riverspend_security_hardening.sql` on this backup branch.

## Findings still requiring work
- Supabase security advisor still reports 11 tables with RLS enabled and no policies. These are fail-closed by default; do not add blanket policies. Review each table's intended server-only/admin access before changing.
- Eight SECURITY DEFINER RPCs remain executable by authenticated users. Several contain explicit `auth.uid()` or admin-role checks; audit each caller and authorization condition before changing grants.
- Important unresolved risk: `rs_fortune_credit` still accepts reward amount/type/label from the authenticated client. The client-side wheel chooses the prize. An authenticated caller may manipulate the RPC arguments. Move prize selection and credit calculation to server-side logic before treating RiverMoney/RSP rewards as secure.
- Supabase Auth leaked-password protection advisor remains WARN; this setting needs review in Auth dashboard.
- This audit did not export database data or Storage binaries and is not a full disaster-recovery backup.

## Safety constraints
- No production data was deleted or modified.
- No broad RLS policies were added.
- No plan upgrade, new project, paid branch, or infrastructure change was made.
- Never commit service-role keys, tokens, user records, order data, messages, or private media to this public repository.
