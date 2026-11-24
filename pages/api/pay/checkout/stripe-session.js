import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

function minorUnits(total, currency) {
  const amount = Number(total);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  let digits;
  try {
    digits = new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions().maximumFractionDigits;
  } catch {
    return null;
  }
  const value = Math.round((amount + Number.EPSILON) * (10 ** digits));
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

function fail(res, status, error, code) {
  return res.status(status).json({ ok: false, error, code });
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return fail(res, 405, "Metodo non consentito.", "method_not_allowed");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  const stripeKey = process.env.RIVERPAY_STRIPE_SECRET_KEY;
  if (process.env.RIVERPAY_STRIPE_TEST_MODE !== "true" || !stripeKey || !stripeKey.startsWith("sk_test_")) {
    return fail(res, 503, "Stripe RiverPay non è configurato esclusivamente in modalità test.", "test_provider_not_configured");
  }
  if (!url || !publicKey || !serviceKey) {
    return fail(res, 503, "Configurazione database server incompleta.", "server_not_configured");
  }

  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return fail(res, 401, "Sessione RiverSpend richiesta.", "unauthorized");

  const { orderId } = req.body || {};
  if ((typeof orderId !== "string" && typeof orderId !== "number") || !String(orderId).trim()) {
    return fail(res, 400, "orderId non valido.", "invalid_order");
  }

  try {
    const authClient = createClient(url, publicKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user) return fail(res, 401, "Sessione RiverSpend non valida.", "invalid_session");

    const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: order, error: orderError } = await db
      .from("orders")
      .select("id,total,currency,buyer_id,status,payment_status")
      .eq("id", String(orderId))
      .maybeSingle();
    if (orderError) throw orderError;
    if (!order) return fail(res, 404, "Ordine non trovato.", "order_not_found");
    if (String(order.buyer_id) !== String(authData.user.id)) return fail(res, 403, "Ordine non appartenente a questo account.", "order_forbidden");
    if (order.status !== "pending" || order.payment_status === "paid") return fail(res, 409, "Ordine non disponibile per il checkout.", "order_not_payable");

    const currency = String(order.currency || "EUR").toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency)) return fail(res, 400, "Valuta non valida.", "invalid_currency");
    const amount = minorUnits(order.total, currency);
    if (!amount) return fail(res, 400, "Importo non valido.", "invalid_amount");

    const idempotencyKey = "riverpay-checkout:" + String(order.id) + ":stripe";
    const { data: existing, error: lookupError } = await db
      .from("riverpay_transactions")
      .select("id,status,currency,amount_minor,provider_payment_id,metadata")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();
    if (lookupError) throw lookupError;

    let tx = existing;
    if (!tx) {
      const { data: inserted, error: insertError } = await db
        .from("riverpay_transactions")
        .insert({
          order_id: String(order.id),
          provider: "stripe",
          status: "pending",
          currency,
          amount_minor: amount,
          fee_minor: 0,
          idempotency_key: idempotencyKey,
          metadata: { source: "riverpay_checkout_engine", mode: "test", test_only: true }
        })
        .select("id,status,currency,amount_minor,provider_payment_id")
        .single();
      if (insertError && insertError.code !== "23505") throw insertError;
      tx = inserted;
      if (!tx) {
        const { data: retry, error: retryError } = await db
          .from("riverpay_transactions")
          .select("id,status,currency,amount_minor,provider_payment_id")
          .eq("idempotency_key", idempotencyKey)
          .single();
        if (retryError) throw retryError;
        tx = retry;
      }
    }

    if (tx.currency !== currency || Number(tx.amount_minor) !== amount) {
      return fail(res, 409, "Il totale dell'ordine è cambiato: verifica il checkout prima di riprovare.", "order_amount_changed");
    }
    if (tx.status === "paid") return fail(res, 409, "Questa transazione risulta già pagata.", "already_paid");

    const stripe = new Stripe(stripeKey);
    if (tx.provider_payment_id) {
      const previous = await stripe.checkout.sessions.retrieve(tx.provider_payment_id);
      if (previous.status === "open" && previous.url) {
        return res.status(200).json({ ok: true, mode: "test", url: previous.url, sessionId: previous.id, reused: true });
      }
      if (previous.status === "complete") {
        return fail(res, 409, "Checkout già completato: attendi la conferma webhook.", "checkout_completed");
      }
      if (previous.status === "expired") {
        return fail(res, 409, "La sessione di test è scaduta. Serve riaprire il checkout con una nuova intenzione RiverPay.", "checkout_expired");
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.riverspend.com";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      client_reference_id: String(order.id),
      customer_email: authData.user.email || undefined,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: amount,
          product_data: { name: "Ordine RiverSpend " + String(order.id).slice(0, 24) }
        }
      }],
      metadata: {
        riverpay_transaction_id: tx.id,
        order_id: String(order.id),
        test_only: "true"
      },
      success_url: siteUrl + "/checkout?riverpay=stripe-test-return",
      cancel_url: siteUrl + "/checkout?riverpay=stripe-test-cancel"
    }, { idempotencyKey: "riverpay-session:" + tx.id });

    const { error: updateError } = await db
      .from("riverpay_transactions")
      .update({
        provider_payment_id: session.id,
        metadata: { ...(tx.metadata || {}), source: "riverpay_checkout_engine", mode: "test", test_only: true, checkout_session_id: session.id }
      })
      .eq("id", tx.id)
      .eq("status", "pending");
    if (updateError) throw updateError;

    if (!session.url) return fail(res, 502, "Stripe non ha restituito il link di checkout.", "missing_checkout_url");
    return res.status(200).json({ ok: true, mode: "test", url: session.url, sessionId: session.id, reused: false });
  } catch {
    return fail(res, 500, "Impossibile creare la sessione Stripe di test.", "stripe_checkout_failed");
  }
}
