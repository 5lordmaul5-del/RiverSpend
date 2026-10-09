import { createClient } from '@supabase/supabase-js';

function paypalBase() {
  return (process.env.PAYPAL_MODE || 'live') === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
}

async function paypalAccessToken() {
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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo non consentito' });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return res.status(503).json({ error: 'Supabase server non configurato.' });
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'Sessione RiverSpend mancante.' });
    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data: { user }, error: userError } = await admin.auth.getUser(token);
    if (userError || !user) return res.status(401).json({ error: 'Sessione RiverSpend non valida.' });
    const { orderId } = req.body || {};
    if (!orderId) return res.status(400).json({ error: 'orderId obbligatorio.' });
    const { data: order, error: orderError } = await admin.from('orders').select('id,total,currency,buyer_id,status,payment_status').eq('id', orderId).single();
    if (orderError || !order) return res.status(404).json({ error: 'Ordine non trovato.' });
    if (String(order.buyer_id) !== String(user.id)) return res.status(403).json({ error: 'Ordine non appartenente all’account.' });
    if (order.status !== 'pending' || order.payment_status === 'paid') return res.status(400).json({ error: 'Ordine non disponibile per il pagamento.' });
    const accessToken = await paypalAccessToken();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.riverspend.com';
    const response = await fetch(paypalBase() + '/v2/checkout/orders', {
      method: 'POST', headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json', 'PayPal-Request-Id': 'riverspend-' + order.id },
      body: JSON.stringify({ intent: 'CAPTURE', purchase_units: [{ reference_id: String(order.id), amount: { currency_code: order.currency || 'EUR', value: Number(order.total || 0).toFixed(2) }, custom_id: String(order.id) }], application_context: { brand_name: 'RiverSpend', user_action: 'PAY_NOW', return_url: siteUrl + '/checkout?paypal=success&order_id=' + encodeURIComponent(order.id), cancel_url: siteUrl + '/checkout?paypal=cancel&order_id=' + encodeURIComponent(order.id) } })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.message || 'PayPal non ha creato l’ordine.' });
    const approve = (data.links || []).find((link) => link.rel === 'approve');
    if (!approve?.href) return res.status(502).json({ error: 'PayPal non ha restituito il link di approvazione.' });
    return res.status(200).json({ ok: true, id: data.id, url: approve.href });
  } catch (error) { return res.status(500).json({ error: error?.message || 'Errore PayPal.' }); }
}
