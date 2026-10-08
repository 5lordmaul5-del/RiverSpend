import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

function paypalBase() {
  return (process.env.PAYPAL_MODE || 'sandbox') === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
}

async function accessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) throw new Error('PayPal non configurato sul server.');
  const basic = Buffer.from(clientId + ':' + secret).toString('base64');
  const response = await fetch(paypalBase() + '/v1/oauth2/token', { method: 'POST', headers: { Authorization: 'Basic ' + basic, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials' });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error_description || 'Autenticazione PayPal non riuscita.');
  return data.access_token;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const auth = req.headers.authorization || '';
    const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!bearer) return res.status(401).json({ error: 'Sessione RiverSpend mancante.' });
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(bearer);
    if (userError || !user) return res.status(401).json({ error: 'Sessione RiverSpend non valida.' });
    const { paypalOrderId } = req.body || {};
    if (!paypalOrderId) return res.status(400).json({ error: 'paypalOrderId obbligatorio.' });

    const token = await accessToken();
    const captureResponse = await fetch(paypalBase() + '/v2/checkout/orders/' + encodeURIComponent(paypalOrderId) + '/capture', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', 'PayPal-Request-Id': 'capture-' + paypalOrderId }
    });
    const capture = await captureResponse.json();
    if (!captureResponse.ok) return res.status(captureResponse.status).json({ error: capture?.message || 'Pagamento PayPal non completato.' });

    const purchase = capture.purchase_units?.[0];
    const orderId = purchase?.reference_id || purchase?.custom_id;
    const paypalCapture = purchase?.payments?.captures?.[0];
    if (!orderId || !paypalCapture?.id || paypalCapture.status !== 'COMPLETED') return res.status(400).json({ error: 'PayPal non ha restituito una cattura completata.' });

    const { data: order, error: orderError } = await supabaseAdmin.from('orders').select('id,total,currency,buyer_id').eq('id', orderId).eq('buyer_id', user.id).single();
    if (orderError || !order) return res.status(404).json({ error: 'Ordine RiverSpend non trovato.' });

    await supabaseAdmin.from('payment_orders').upsert({ order_id: order.id, provider: 'paypal', provider_order_id: paypalOrderId, status: 'paid', metadata: { test_mode: (process.env.PAYPAL_MODE || 'sandbox') !== 'live', capture_id: paypalCapture.id } }, { onConflict: 'order_id,provider' });
    await supabaseAdmin.from('payment_transactions').insert({ order_id: order.id, provider: 'paypal', provider_transaction_id: paypalCapture.id, type: 'charge', status: 'succeeded', amount: Number(order.total || 0), currency: order.currency || 'EUR', metadata: { paypal_order_id: paypalOrderId } });

    const { error: treasuryError } = await supabaseAdmin.rpc('rs_create_treasury_allocation', { p_order_id: String(order.id), p_payment_id: String(paypalCapture.id), p_gross_amount: Number(order.total || 0), p_currency: order.currency || 'EUR', p_revenue_source_code: 'SHOP_COMMISSION' });
    if (treasuryError) return res.status(500).json({ error: 'Pagamento riuscito, ma aggiornamento Treasury non completato.', paymentId: paypalCapture.id });

    const { error: updateError } = await supabaseAdmin.from('orders').update({ payment_status: 'paid', status: 'confirmed', updated_at: new Date().toISOString() }).eq('id', order.id);
    if (updateError) return res.status(500).json({ error: 'Pagamento riuscito, ma aggiornamento ordine non completato.', paymentId: paypalCapture.id });
    return res.status(200).json({ ok: true, orderId: order.id, paymentId: paypalCapture.id });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Errore PayPal.' });
  }
}
