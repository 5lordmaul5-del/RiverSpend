import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo non consentito' });
  if (!supabaseUrl || !serviceRoleKey || !stripeSecretKey) {
    return res.status(503).json({ error: 'Stripe non ancora configurato sul server.' });
  }

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Autenticazione richiesta.' });

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData?.user) return res.status(401).json({ error: 'Sessione non valida.' });

  const { orderId } = req.body || {};
  if (!orderId) return res.status(400).json({ error: 'orderId obbligatorio.');

  const { data: order, error: orderError } = await admin
    .from('orders')
    .select('id,total,subtotal,shipping_total,donation_total,currency,buyer_id,status,payment_status')
    .eq('id', orderId)
    .single();

  if (orderError || !order) return res.status(404).json({ error: 'Ordine non trovato.' });
  if (String(order.buyer_id) !== String(authData.user.id)) return res.status(403).json({ error: 'Ordine non appartenente all’account.' });
  if (order.status !== 'pending' || order.payment_status === 'paid') {
    return res.status(409).json({ error: 'Ordine non pronto per il pagamento: attendi la conferma del totale e della spedizione.' });
  }

  const { data: items, error: itemsError } = await admin
    .from('order_items')
    .select('product_name,unit_price,quantity,subtotal')
    .eq('order_id', order.id);

  if (itemsError || !items?.length) return res.status(400).json({ error: 'Nessun articolo nell’ordine.' });

  const cents = (value) => Math.round(Number(value || 0) * 100);
  const itemSubtotalCents = items.reduce((sum, item) => sum + cents(item.subtotal ?? (Number(item.unit_price || 0) * Number(item.quantity || 1))), 0);
  const subtotalCents = cents(order.subtotal);
  const shippingCents = cents(order.shipping_total);
  const donationCents = cents(order.donation_total);
  const totalCents = cents(order.total);

  if (itemSubtotalCents !== subtotalCents || itemSubtotalCents + shippingCents + donationCents !== totalCents) {
    return res.status(409).json({ error: 'Il totale dell’ordine non coincide con prodotti, spedizione e donazione. Richiedi una verifica prima di pagare.' });
  }

  const lineItems = items.map((item) => ({
    price_data: {
      currency: String(order.currency || 'EUR').toLowerCase(),
      product_data: { name: item.product_name || 'Prodotto RiverSpend' },
      unit_amount: cents(item.subtotal ?? (Number(item.unit_price || 0) * Number(item.quantity || 1))) / Math.max(1, Math.floor(Number(item.quantity || 1)))
    },
    quantity: Math.max(1, Math.floor(Number(item.quantity || 1)))
  }));

  if (shippingCents > 0) lineItems.push({
    price_data: { currency: String(order.currency || 'EUR').toLowerCase(), product_data: { name: 'Spedizione RiverSpend' }, unit_amount: shippingCents },
    quantity: 1
  });
  if (donationCents > 0) lineItems.push({
    price_data: { currency: String(order.currency || 'EUR').toLowerCase(), product_data: { name: 'Donazione RiverSpend' }, unit_amount: donationCents },
    quantity: 1
  });

  const stripe = new Stripe(stripeSecretKey);
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.riverspend.com';
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: authData.user.email || undefined,
    client_reference_id: String(order.id),
    line_items: lineItems,
    metadata: { order_id: String(order.id), revenue_source: 'SHOP_COMMISSION' },
    success_url: origin + '/checkout?stripe=success&session_id={CHECKOUT_SESSION_ID}',
    cancel_url: origin + '/checkout?stripe=cancelled'
  });

  return res.status(200).json({ ok: true, url: session.url, sessionId: session.id });
}
