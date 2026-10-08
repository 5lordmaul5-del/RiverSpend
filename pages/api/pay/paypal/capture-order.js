import { createClient } from '@supabase/supabase-js';

function paypalBase() { return (process.env.PAYPAL_MODE || 'sandbox') === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'; }
async function accessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID; const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) throw new Error('PayPal non configurato sul server.');
  const basic = Buffer.from(clientId + ':' + secret).toString('base64');
  const response = await fetch(paypalBase() + '/v1/oauth2/token', { method: 'POST', headers: { Authorization: 'Basic ' + basic, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials' });
  const data = await response.json(); if (!response.ok) throw new Error(data?.error_description || 'Autenticazione PayPal non riuscita.'); return data.access_token;
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo non consentito' });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return res.status(503).json({ error: 'Supabase server non configurato.' });
  try {
    const bearer = (req.headers.authorization || '').startsWith('Bearer ') ? req.headers.authorization.slice(7) : '';
    if (!bearer) return res.status(401).json({ error: 'Sessione RiverSpend mancante.' });
    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data: { user }, error: userError } = await admin.auth.getUser(bearer);
    if (userError || !user) return res.status(401).json({ error: 'Sessione RiverSpend non valida.' });
    const { paypalOrderId } = req.body || {}; if (!paypalOrderId) return res.status(400).json({ error: 'paypalOrderId obbligatorio.' });
    const token = await accessToken();
    const response = await fetch(paypalBase() + '/v2/checkout/orders/' + encodeURIComponent(paypalOrderId) + '/capture', { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', 'PayPal-Request-Id': 'capture-' + paypalOrderId } });
    const capture = await response.json(); if (!response.ok) return res.status(response.status).json({ error: capture?.message || 'Pagamento PayPal non completato.' });
    const purchase = capture.purchase_units?.[0]; const orderId = purchase?.reference_id || purchase?.custom_id; const paypalCapture = purchase?.payments?.captures?.[0];
    if (!orderId || !paypalCapture?.id || paypalCapture.status !== 'COMPLETED') return res.status(400).json({ error: 'PayPal non ha restituito una cattura completata.' });
    const { data: order, error: orderError } = await admin.from('orders').select('id,total,currency,buyer_id').eq('id', orderId).eq('buyer_id', user.id).single();
    if (orderError || !order) return res.status(404).json({ error: 'Ordine RiverSpend non trovato.' });
    const amount = Number(order.total || 0); const currency = String(order.currency || 'EUR').toUpperCase();
    const { data: paymentOrder, error: paymentOrderError } = await admin.from('payment_orders').upsert({ user_id: order.buyer_id, order_reference: order.id, amount, currency, status: 'paid', provider: 'paypal', provider_order_id: paypalOrderId, idempotency_key: 'paypal-' + paypalCapture.id, metadata: { paypal_order_id: paypalOrderId, capture_id: paypalCapture.id, test_mode: (process.env.PAYPAL_MODE || 'sandbox') !== 'live' } }, { onConflict: 'idempotency_key' }).select('id').single();
    if (paymentOrderError) return res.status(500).json({ error: paymentOrderError.message });
    const { data: existingTx } = await admin.from('payment_transactions').select('id').eq('payment_order_id', paymentOrder.id).eq('provider', 'paypal').eq('type', 'payment').limit(1);
    if (!existingTx?.length) {
      const { error: txError } = await admin.from('payment_transactions').insert({ payment_order_id: paymentOrder.id, user_id: order.buyer_id, provider: 'paypal', provider_transaction_id: String(paypalCapture.id), type: 'payment', status: 'succeeded', amount, currency, raw_reference: { paypal_order_id: paypalOrderId, capture_id: paypalCapture.id } });
      if (txError) return res.status(500).json({ error: txError.message });
    }
    const { error: treasuryError } = await admin.rpc('rs_create_treasury_allocation', { p_order_id: String(order.id), p_payment_id: paymentOrder.id, p_gross_amount: amount, p_currency: currency, p_rule_id: null, p_revenue_source_code: 'SHOP_COMMISSION' });
    if (treasuryError) return res.status(500).json({ error: 'Pagamento riuscito, ma Treasury non aggiornato.' });
    const { error: updateError } = await admin.from('orders').update({ payment_status: 'paid', status: 'confirmed' }).eq('id', order.id);
    if (updateError) return res.status(500).json({ error: 'Pagamento riuscito, ma ordine non aggiornato.' });
    return res.status(200).json({ ok: true, orderId: order.id, paymentId: paypalCapture.id });
  } catch (error) { return res.status(500).json({ error: error?.message || 'Errore PayPal.' }); }
}
