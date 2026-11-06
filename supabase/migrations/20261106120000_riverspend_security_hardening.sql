-- RiverSpend security hardening: reduce RPC exposure and pin trigger search_path.
-- Applied to the active project on 2026-11-06 and verified immediately.
BEGIN;

REVOKE ALL ON FUNCTION public.rs_admin_insights() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rs_admin_insights() TO authenticated;

REVOKE ALL ON FUNCTION public.rs_fortune_credit(text, text, numeric, bigint, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rs_fortune_credit(text, text, numeric, bigint, jsonb) TO authenticated;

ALTER FUNCTION public.decrement_product_stock_for_order_item()
  SET search_path = public, pg_temp;

COMMIT;
