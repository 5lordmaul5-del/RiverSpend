-- Correct the RSPay Treasury allocation so the 10% platform commission applies
-- to item subtotal only and the buyer-funded shipping amount goes to SHIPPING.
CREATE OR REPLACE FUNCTION public.rs_create_treasury_allocation(
  p_order_id text,
  p_payment_id text,
  p_gross_amount numeric,
  p_currency text DEFAULT 'EUR',
  p_rule_id uuid DEFAULT NULL,
  p_revenue_source_code text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_movement_id uuid;
  v_rule public.rs_treasury_allocation_rules%rowtype;
  v_seller uuid;
  v_river uuid;
  v_shipping uuid;
  v_reserve uuid;
  v_other uuid;
  v_source uuid;
  v_subtotal numeric;
  v_shipping_total numeric;
  v_order_total numeric;
  v_seller_amount numeric;
  v_river_amount numeric;
  v_reserve_amount numeric;
  v_other_amount numeric;
  v_percentage_total numeric;
BEGIN
  IF p_gross_amount IS NULL OR p_gross_amount < 0 THEN
    RAISE EXCEPTION 'Importo non valido';
  END IF;

  SELECT id INTO v_movement_id
  FROM public.rs_treasury_movements
  WHERE payment_id = p_payment_id
  LIMIT 1;

  IF v_movement_id IS NOT NULL THEN
    RETURN v_movement_id;
  END IF;

  SELECT * INTO v_rule
  FROM public.rs_treasury_allocation_rules
  WHERE id = COALESCE(
    p_rule_id,
    (SELECT id FROM public.rs_treasury_allocation_rules
     WHERE active ORDER BY priority ASC, created_at ASC LIMIT 1)
  )
  AND active
  LIMIT 1;

  IF v_rule.id IS NULL THEN
    RAISE EXCEPTION 'Nessuna regola Treasury attiva';
  END IF;

  -- The item allocation percentages exclude shipping. Shipping is a separate pass-through.
  SELECT round(subtotal, 2), round(shipping_total, 2), round(total, 2)
    INTO v_subtotal, v_shipping_total, v_order_total
  FROM public.orders
  WHERE id::text = p_order_id
  LIMIT 1;

  IF v_order_total IS NULL THEN
    RAISE EXCEPTION 'Ordine non trovato per la ripartizione Treasury';
  END IF;
  IF abs(v_order_total - round(p_gross_amount, 2)) > 0.01 THEN
    RAISE EXCEPTION 'Importo pagamento diverso dal totale ordine';
  END IF;

  v_percentage_total := COALESCE(v_rule.seller_percent, 0)
    + COALESCE(v_rule.river_spend_percent, 0)
    + COALESCE(v_rule.reserve_percent, 0)
    + COALESCE(v_rule.other_percent, 0);

  IF abs(v_percentage_total - 100) > 0.01 THEN
    RAISE EXCEPTION 'Le percentuali Treasury su articoli devono sommare al 100%%';
  END IF;

  SELECT id INTO v_seller FROM public.rs_treasury_accounts WHERE code = 'SELLER' AND active LIMIT 1;
  SELECT id INTO v_river FROM public.rs_treasury_accounts WHERE code = 'RIVERSPEND' AND active LIMIT 1;
  SELECT id INTO v_shipping FROM public.rs_treasury_accounts WHERE code = 'SHIPPING' AND active LIMIT 1;
  SELECT id INTO v_reserve FROM public.rs_treasury_accounts WHERE code = 'RESERVE' AND active LIMIT 1;

  IF COALESCE(v_rule.other_percent, 0) > 0 THEN
    SELECT id INTO v_other FROM public.rs_treasury_accounts WHERE account_type = 'other' AND active LIMIT 1;
    IF v_other IS NULL THEN
      RAISE EXCEPTION 'Account Treasury OTHER necessario per la regola attiva';
    END IF;
  END IF;

  IF v_seller IS NULL OR v_river IS NULL OR v_shipping IS NULL OR v_reserve IS NULL THEN
    RAISE EXCEPTION 'Account Treasury obbligatorio mancante';
  END IF;

  v_seller_amount := round(v_subtotal * COALESCE(v_rule.seller_percent, 0) / 100, 2);
  v_river_amount := round(v_subtotal * COALESCE(v_rule.river_spend_percent, 0) / 100, 2);
  v_reserve_amount := round(v_subtotal * COALESCE(v_rule.reserve_percent, 0) / 100, 2);
  v_other_amount := round(v_subtotal * COALESCE(v_rule.other_percent, 0) / 100, 2);

  -- Put any cent-rounding remainder on the seller allocation to balance item proceeds exactly.
  v_seller_amount := v_seller_amount + round(v_subtotal - (v_seller_amount + v_river_amount + v_reserve_amount + v_other_amount), 2);

  IF abs(round(v_seller_amount + v_river_amount + v_reserve_amount + v_other_amount + v_shipping_total, 2) - round(p_gross_amount, 2)) > 0.01 THEN
    RAISE EXCEPTION 'Ripartizione Treasury non bilanciata rispetto al pagamento';
  END IF;

  IF p_revenue_source_code IS NOT NULL THEN
    SELECT id INTO v_source
    FROM public.rs_revenue_sources
    WHERE code = p_revenue_source_code AND active
    LIMIT 1;
  END IF;

  INSERT INTO public.rs_treasury_movements(
    order_id, payment_id, gross_amount, currency, status, allocation_rule_id, revenue_source_id,
    description, metadata
  )
  VALUES(
    p_order_id, p_payment_id, round(p_gross_amount, 2), p_currency, 'reserved', v_rule.id, v_source,
    'RSPay: commissione sul subtotale articoli; spedizione separata',
    jsonb_build_object('item_subtotal', v_subtotal, 'shipping_total', v_shipping_total,
      'platform_commission_percent', v_rule.river_spend_percent, 'shipping_pass_through', true)
  )
  RETURNING id INTO v_movement_id;

  INSERT INTO public.rs_treasury_allocations(movement_id, account_id, amount, currency, allocation_type)
  VALUES
    (v_movement_id, v_seller, v_seller_amount, p_currency, 'seller'),
    (v_movement_id, v_river, v_river_amount, p_currency, 'river_spend'),
    (v_movement_id, v_shipping, v_shipping_total, p_currency, 'shipping'),
    (v_movement_id, v_reserve, v_reserve_amount, p_currency, 'reserve');

  IF COALESCE(v_rule.other_percent, 0) > 0 THEN
    INSERT INTO public.rs_treasury_allocations(movement_id, account_id, amount, currency, allocation_type)
    VALUES (v_movement_id, v_other, v_other_amount, p_currency, 'other');
  END IF;

  RETURN v_movement_id;
EXCEPTION
  WHEN unique_violation THEN
    SELECT id INTO v_movement_id
    FROM public.rs_treasury_movements
    WHERE payment_id = p_payment_id
    LIMIT 1;
    RETURN v_movement_id;
END;
$function$;
