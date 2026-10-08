import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } };

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

async function rawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!supabaseUrl || !serviceRoleKey || !stripeSecretKey || !webhookSecret) {
    return res.status(503).json({ error: 'Stripe webhook non ancora configurato sul server.' });
  }

  const stripe = new Stripe(stripeSecretKey);
  const signature = req.headers['stripe-signature'];
  if (!signature) return res.status(400).json({ error: 'Firma Stripe mancante.' });

  let event;
  try {
    event = stripe.webhooks.constructEvent(await rawBody(req), signature, webhookSecret);
  } catch (err) {
    return res.status(400).json({ error: 'Firma webhook non valida.' });
  }

  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true });
  }

  const session = event.data.object;
  if (session.payment_status !== 'paid') return res.status(200).json({ received: true });

  const orderId = session.metadata?.order_id || session.client_reference_id;
  if (!orderId) return res.status(400).json({ error: 'order_id mancante nel webhook.' });

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { data: order, error: orderError } = await admin
    .from('orders')
    .select('id,total,currency,buyer_id,payment_status')
    .eq('id', orderId)
    .single();

  if (orderError || !order) return res.status(404).json({ error: 'Ordine non trovato.' });

  const amount = Number(session.amount_total || order.total || 0) / 100;
  const currency = String(session.currency || order.currency || 'EUR').toUpperCase();
  const idempotencyKey = 'stripe-' + session.id;

  const { data: paymentOrder, error: paymentOrderError } = await admin
    .from('payment_orders')
    .upsert({
      user_id: order.buyer_id,
      order_reference: order.id,
      amount,
      currency,
      status: 'paid',
      provider: 'stripe',
      provider_order_id: session.id,
      idempotency_key: idempotencyKey,
      metadata: { stripe_session_id: session.id, payment_intent: session.payment_intent || null }
    }, { onConflict: 'idempotency_key' })
    .select('id')
    .single();

  if (paymentOrderError) return res.status(500).json({ error: paymentOrderError.message });

  const { data: existingTx } = await admin
    .from('payment_transactions')
    .select('id')
    .eq('payment_order_id', paymentOrder.id)
    .eq('provider', 'stripe')
    .eq('type', 'payment')
    .limit(1);

  if (!existingTx?.length) {
    const { error: txError } = await admin.from('payment_transactions').insert({
      payment_order_id: paymentOrder.id,
      user_id: order.buyer_id,
      provider: 'stripe',
      provider_transaction_id: String(session.payment_intent || session.id),
      type: 'payment',
      status: 'succeeded',
      amount,
      currency,
      raw_reference: { stripe_session_id: session.id, event_id: event.id }
    });
    if (txError) return res.status(500).json({ error: txError.message });
  }

  const { error: treasuryError } = await admin.rpc('rs_create_treasury_allocation', {
    p_order_id: String(order.id),
    p_payment_id: paymentOrder.id,
    p_gross_amount: amount,
    p_currency: currency,
    p_rule_id: null,
    p_revenue_source_code: 'SHOP_COMMISSION'
  });

  if (treasuryError) return res.status(500).json({ error: treasuryError.message });

  const { error: orderUpdateError } = await admin
    .from('orders')
    .update({ payment_status: 'paid', status: 'confirmed' })
    .eq('id', order.id);

  if (orderUpdateError) return res.status(500).json({ error: orderUpdateError.message });

  return res.status(200).json({ received: true });
}
