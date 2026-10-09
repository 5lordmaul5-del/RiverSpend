-- RSPay initial checkout economics: buyer-paid shipping, platform commission and tax audit metadata.
-- Additive only; existing orders/products remain readable.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS shipping_price numeric(12,2) NOT NULL DEFAULT 0
  CHECK (shipping_price >= 0);

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS platform_commission_total numeric(12,2) NOT NULL DEFAULT 0
  CHECK (platform_commission_total >= 0),
  ADD COLUMN IF NOT EXISTS provider_fee_total numeric(12,2) NOT NULL DEFAULT 0
  CHECK (provider_fee_total >= 0),
  ADD COLUMN IF NOT EXISTS tax_metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS shipping_price numeric(12,2) NOT NULL DEFAULT 0
  CHECK (shipping_price >= 0),
  ADD COLUMN IF NOT EXISTS platform_commission numeric(12,2) NOT NULL DEFAULT 0
  CHECK (platform_commission >= 0);

ALTER TABLE public.seller_payouts
  ADD COLUMN IF NOT EXISTS shipping_amount numeric(12,2) NOT NULL DEFAULT 0
  CHECK (shipping_amount >= 0),
  ADD COLUMN IF NOT EXISTS tax_metadata jsonb NOT NULL DEFAULT '{}'::jsonb;
