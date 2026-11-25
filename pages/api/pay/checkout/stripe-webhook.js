import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const config = { api: { bodyParser: false } };

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

function fail(res, status, error) {
  return res.status(status).json({ ok: false, error });
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  const stripeKey = process.env.RIVERPAY_STRIPE_SECRET_KEY;
  const webhookSecret = process.env.RIVERPAY_STRIPE_WEBHOOK_SECRET;
  if (process.env.RIVERPAY_STRIPE_TEST_MODE !== "true" || !stripeKey?.startsWith("sk_test_") || !webhookSecret || !url || !serviceKey) {
    return fail(res, 503, "Webhook RiverPay Stripe test non configurato.");
  }

  const signature = req.headers["stripe-signature"];
  if (!signature) return fail(res, 400, "Firma Stripe mancante.");

  const stripe = new Stripe(stripeKey);
  let event;
  try {
    event = stripe.webhooks.constructEvent(await readRawBody(req), signature, webhookSecret);
  } catch {
    return fail(res, 400, "Firma webhook Stripe non valida.");
  }

  if (event.livemode === true) return fail(res, 403, "Evento Stripe live rifiutato dal webhook test.");

  if (event.type !== "checkout.session.completed") {
    return res.status(200).json({ received: true, ignored: true });
  }

  const session = event.data.object;
  if (session.payment_status !== "paid") {
    return res.status(200).json({ received: true, ignored: true });
  }

  const transactionId = session.metadata?.riverpay_transaction_id;
  const orderId = session.metadata?.order_id;
  if (!transactionId || !orderId || session.mode !== "payment" || session.livemode === true || session.metadata?.test_only !== "true") {
    return fail(res, 400, "Metadati checkout mancanti o non validi.");
  }

  try {
    const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: tx, error: txError } = await db
      .from("riverpay_transactions")
      .select("id,order_id,provider,provider_payment_id,status,currency,amount_minor,metadata")
      .eq("id", transactionId)
      .maybeSingle();
    if (txError) throw txError;
    if (!tx || tx.provider !== "stripe" || String(tx.order_id) !== String(orderId)) {
      return fail(res, 404, "Transazione RiverPay non trovata.");
    }
    if (tx.provider_payment_id && tx.provider_payment_id !== session.id) {
      return fail(res, 409, "La sessione Stripe non corrisponde alla transazione.");
    }
    if (String(session.currency || "").toUpperCase() !== tx.currency ||
        Number(session.amount_total) !== Number(tx.amount_minor)) {
      return fail(res, 409, "Importo o valuta Stripe non corrispondono alla transazione.");
    }

    const { data: priorEvent, error: eventLookupError } = await db
      .from("riverpay_events")
      .select("id,processed_at")
      .eq("provider", "stripe")
      .eq("provider_event_id", event.id)
      .maybeSingle();
    if (eventLookupError) throw eventLookupError;
    if (priorEvent?.processed_at) return res.status(200).json({ received: true, duplicate: true });

    if (!priorEvent) {
      const { error: eventInsertError } = await db.from("riverpay_events").insert({
        provider: "stripe",
        provider_event_id: event.id,
        transaction_id: tx.id,
        event_type: event.type,
        payload: { checkout_session_id: session.id, amount_total: session.amount_total, currency: session.currency }
      });
      if (eventInsertError && eventInsertError.code !== "23505") throw eventInsertError;
    }

    if (tx.status !== "paid") {
      const { data: updatedTx, error: updateError } = await db
        .from("riverpay_transactions")
        .update({
          status: "paid",
          provider_payment_id: session.id,
          metadata: { ...(tx.metadata || {}), test_only: true, stripe_payment_intent: session.payment_intent || null, stripe_event_id: event.id }
        })
        .eq("id", tx.id)
        .eq("status", "pending")
        .select("id,status,provider_payment_id")
        .maybeSingle();
      if (updateError) throw updateError;

      // A concurrent webhook may have changed the transaction after the initial read.
      // Verify the persisted state before marking this provider event processed.
      if (!updatedTx) {
        const { data: confirmedTx, error: confirmError } = await db
          .from("riverpay_transactions")
          .select("id,status,provider_payment_id")
          .eq("id", tx.id)
          .maybeSingle();
        if (confirmError) throw confirmError;
        if (!confirmedTx || confirmedTx.status !== "paid" || confirmedTx.provider_payment_id !== session.id) {
          throw new Error("Transaction state not confirmed after conditional update.");
        }
      }
    } else if (tx.provider_payment_id !== session.id) {
      return fail(res, 409, "Transazione già pagata da una sessione differente.");
    }

    const { error: markEventError } = await db
      .from("riverpay_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("provider", "stripe")
      .eq("provider_event_id", event.id);
    if (markEventError) throw markEventError;

    // Test webhook records only the RiverPay transaction. It does not mark a Shop order paid
    // or trigger fulfillment, treasury allocation, seller payout, or any live-money workflow.
    return res.status(200).json({ received: true, testOnly: true });
  } catch {
    return fail(res, 500, "Impossibile registrare l'evento Stripe in RiverPay.");
  }
}
