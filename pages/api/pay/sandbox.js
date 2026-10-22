import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo non consentito' });
  if (process.env.RS_PAY_SANDBOX_ENABLED !== 'true') {
    return res.status(403).json({ error: 'Sandbox pagamenti non abilitato.' });
  }
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Configurazione Supabase server mancante.' });
  }

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Sessione RiverSpend mancante.' });

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) return res.status(401).json({ error: 'Sessione RiverSpend non valida.' });

  const { orderId } = req.body || {};
  if (!orderId) return res.status(400).json({ error: 'orderId obbligatorio.' });

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id,total,currency,buyer_id,payment_status,status')
    .eq('id', orderId)
    .eq('buyer_id', user.id)
    .single();

  if (orderError || !order) return res.status(404).json({ error: 'Ordine non trovato per questo account.' });
  if (order.payment_status === 'paid') return res.status(409).json({ error: 'Ordine già pagato.' });
  if (!['pending_shipping_quote', 'pending'].includes(order.status)) {
    return res.status(409).json({ error: 'Ordine non disponibile per il test di pagamento.' });
  }

  const amount = Number(order.total || 0);
  if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'Totale ordine non valido.' });

  const idempotencyKey = `sandbox-${order.id}`;
  const { data: paymentOrder, error: paymentOrderError } = await supabase
    .from('payment_orders')
    .upsert({
      user_id: order.buyer_id,
      order_reference: order.id,
      amount,
      currency: order.currency || 'EUR',
      status: 'paid',
      provider: 'sandbox',
      provider_order_id: `SANDBOX-${order.id}`,
      idempotency_key: idempotencyKey,
      metadata: { test_only: true, simulated: true }
    }, { onConflict: 'idempotency_key' })
    .select('id')
    .single();

  if (paymentOrderError) return res.status(500).json({ error: 'Impossibile registrare il pagamento di test.' });

  const { data: existingTx, error: txLookupError } = await supabase
    .from('payment_transactions')
    .select('id')
    .eq('payment_order_id', paymentOrder.id)
    .eq('provider', 'sandbox')
    .eq('type', 'payment')
    .limit(1);

  if (txLookupError) return res.status(500).json({ error: 'Impossibile verificare la transazione di test.' });

  if (!existingTx?.length) {
    const { error: txError } = await supabase.from('payment_transactions').insert({
      payment_order_id: paymentOrder.id,
      user_id: order.buyer_id,
      provider: 'sandbox',
      provider_transaction_id: `SANDBOX-TX-${order.id}`,
      type: 'payment',
      status: 'succeeded',
      amount,
      currency: order.currency || 'EUR',
      raw_reference: { test_only: true, simulated: true }
    });
    if (txError) return res.status(500).json({ error: 'Impossibile registrare la transazione di test.' });
  }

  const { data: treasuryMovement, error: treasuryError } = await supabase.rpc(
    'rs_create_treasury_allocation',
    {
      p_order_id: String(order.id),
      p_payment_id: paymentOrder.id,
      p_gross_amount: amount,
      p_currency: order.currency || 'EUR'
    }
  );

  if (treasuryError) return res.status(500).json({ error: 'Impossibile aggiornare la tesoreria di test.' });

  const { error: orderUpdateError } = await supabase
    .from('orders')
    .update({ payment_status: 'paid', status: 'confirmed' })
    .eq('id', order.id)
    .eq('buyer_id', user.id);

  if (orderUpdateError) return res.status(500).json({ error: 'Impossibile aggiornare lo stato dell’ordine di test.' });

  return res.status(200).json({
    ok: true,
    testOnly: true,
    orderId: order.id,
    paymentOrderId: paymentOrder.id,
    treasuryMovementId: treasuryMovement,
    message: 'Pagamento simulato SOLO TEST: nessun denaro reale movimentato.'
  });
}
