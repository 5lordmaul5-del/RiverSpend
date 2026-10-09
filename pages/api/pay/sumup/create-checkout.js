import { createClient } from '@supabase/supabase-js';

const SUMUP_API = 'https://api.sumup.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo non consentito' });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const apiKey = process.env.SUMUP_API_KEY;
  const merchantCode = process.env.SUMUP_MERCHANT_CODE;

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(503).json({ error: 'Supabase server non configurato.' });
  }
  if (!apiKey || !merchantCode) {
    return res.status(503).json({ error: 'SumUp Sandbox non ancora configurato sul server.' });
  }
  // Fail clearly before fetch: SumUp secret keys must be copied in full, without display ellipses.
  if (apiKey && /[^\x00-\x7F]/.test(apiKey)) {
    return res.status(503).json({ error: 'La variabile SUMUP_API_KEY contiene caratteri non validi (ad esempio …). Inserisci la chiave segreta SumUp completa, copiata senza puntini di sospensione.' });
  }
  if (apiKey && !apiKey.startsWith('sup_sk_')) {
    return res.status(503).json({ error: 'SUMUP_API_KEY non sembra una chiave segreta SumUp: deve essere la chiave completa che inizia con sup_sk_, non una chiave pubblica o di un altro servizio.' });
  }

  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'Sessione RiverSpend mancante.' });

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data: { user }, error: userError } = await admin.auth.getUser(token);
    if (userError || !user) return res.status(401).json({ error: 'Sessione RiverSpend non valida.' });

    const { orderId } = req.body || {};
    if (!orderId) return res.status(400).json({ error: 'orderId obbligatorio.' });

    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('id,total,currency,buyer_id,status,payment_status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) return res.status(404).json({ error: 'Ordine non trovato.' });
    if (String(order.buyer_id) !== String(user.id)) return res.status(403).json({ error: 'Ordine non appartenente all’account.' });
    if (order.status !== 'pending' || order.payment_status === 'paid') {
      return res.status(400).json({ error: 'Ordine non disponibile per il pagamento.' });
    }

    const amount = Number(order.total || 0);
    const currency = String(order.currency || 'EUR').toUpperCase();
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Totale ordine non valido.' });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.riverspend.com';
    const checkoutReference = 'RS-' + String(order.id);

    const response = await fetch(SUMUP_API + '/v0.1/checkouts', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        merchant_code: merchantCode,
        amount,
        currency,
        checkout_reference: checkoutReference,
        description: 'RiverSpendShop ordine ' + String(order.id).slice(0, 12),
        redirect_url: siteUrl + '/checkout?sumup=return&order_id=' + encodeURIComponent(order.id),
        hosted_checkout: { enabled: true }
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.message || data?.detail || 'SumUp non ha creato il checkout.'
      });
    }

    if (!data?.id || !data?.hosted_checkout_url) {
      return res.status(502).json({ error: 'SumUp non ha restituito il link Hosted Checkout.' });
    }

    return res.status(200).json({
      ok: true,
      checkoutId: data.id,
      checkoutReference: data.checkout_reference,
      url: data.hosted_checkout_url
    });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Errore SumUp.' });
  }
}
