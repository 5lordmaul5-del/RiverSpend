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

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  const user = authData?.user;
  if (authError || !user) return res.status(401).json({ error: 'Sessione RiverSpend non valida.' });

  // La tabella rs_admin_roles è la fonte dei ruoli amministrativi usata dal pannello RSPC.
  // Il controllo avviene lato server con la service-role key, mai con un ruolo nel body.
  const { data: adminRole, error: roleError } = await supabase
    .from('rs_admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (roleError) return res.status(500).json({ error: 'Impossibile verificare il ruolo amministrativo.' });
  if (!['admin', 'ceo'].includes(String(adminRole?.role || '').toLowerCase())) {
    return res.status(403).json({ error: 'Solo un amministratore autorizzato può eseguire pagamenti simulati.' });
  }

  const { orderId } = req.body || {};
  if (!orderId) return res.status(400).json({ error: 'orderId obbligatorio.' });

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id,total,currency,buyer_id,payment_status')
    .eq('id', orderId)
    .single();

  if (orderError || !order) return res.status(404).json({ error: 'Ordine non trovato.' });
  if (order.payment_status === 'paid') return res.status(409).json({ error: 'Ordine già pagato.' });
  if (order.status !== 'pending' || !['unpaid', 'pending'].includes(String(order.payment_status || '').toLowerCase())) {
    return res.status(409).json({ error: 'Solo gli ordini in attesa e non pagati possono essere usati nel sandbox.' });
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

  if (paymentOrderError) return res.status(500).json({ error: paymentOrderError.message });

  const { data: existingTx } = await supabase
    .from('payment_transactions')
    .select('id')
    .eq('payment_order_id', paymentOrder.id)
    .eq('provider', 'sandbox')
    .eq('type', 'payment')
    .limit(1);

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
    if (txError) return res.status(500).json({ error: txError.message });
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

  if (treasuryError) return res.status(500).json({ error: treasuryError.message });

  const { error: orderUpdateError } = await supabase
    .from('orders')
    .update({ payment_status: 'paid', status: 'confirmed' })
    .eq('id', order.id);

  if (orderUpdateError) return res.status(500).json({ error: orderUpdateError.message });

  return res.status(200).json({
    ok: true,
    testOnly: true,
    orderId: order.id,
    paymentOrderId: paymentOrder.id,
    treasuryMovementId: treasuryMovement,
    message: 'Pagamento simulato SOLO TEST: nessun denaro reale movimentato.'
  });
}
