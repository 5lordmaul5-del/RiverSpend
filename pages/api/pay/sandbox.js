import { createClient } from '@supabase/supabase-js';

// Payment simulation must use a separate Supabase project. Never write simulated
// payments, treasury movements, or paid status into the production database.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Metodo non consentito.' });
  }

  if (process.env.RS_PAY_SANDBOX_ENABLED !== 'true') {
    return res.status(403).json({ error: 'Sandbox pagamenti non abilitato.' });
  }
  if (process.env.VERCEL_ENV === 'production') {
    return res.status(403).json({ error: 'Sandbox disabilitato in produzione.' });
  }

  const sandboxUrl = process.env.RS_PAY_SANDBOX_SUPABASE_URL;
  const sandboxServiceRoleKey = process.env.RS_PAY_SANDBOX_SERVICE_ROLE_KEY;
  if (!sandboxUrl || !sandboxServiceRoleKey) {
    return res.status(503).json({
      error: 'Sandbox non configurato: serve un progetto Supabase isolato con credenziali dedicate. Nessun dato è stato modificato.'
    });
  }

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Sessione sandbox mancante.' });

  try {
    const supabase = createClient(sandboxUrl, sandboxServiceRoleKey);
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    const user = authData?.user;
    if (authError || !user) return res.status(401).json({ error: 'Sessione sandbox non valida.' });

    const { data: adminRole, error: roleError } = await supabase
      .from('rs_admin_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (roleError) return res.status(500).json({ error: 'Impossibile verificare il ruolo amministrativo sandbox.' });
    if (!['admin', 'ceo'].includes(String(adminRole?.role || '').toLowerCase())) {
      return res.status(403).json({ error: 'Solo un amministratore autorizzato può eseguire pagamenti simulati.' });
    }

    const { orderId } = req.body || {};
    if (typeof orderId !== 'string' || !orderId.trim()) {
      return res.status(400).json({ error: 'orderId obbligatorio.' });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id,total,currency,buyer_id,payment_status,status')
      .eq('id', orderId.trim())
      .maybeSingle();

    if (orderError) return res.status(500).json({ error: 'Impossibile verificare l’ordine sandbox.' });
    if (!order) return res.status(404).json({ error: 'Ordine sandbox non trovato.' });
    if (order.payment_status === 'paid') return res.status(409).json({ error: 'Ordine sandbox già pagato.' });
    if (order.status !== 'pending' || !['unpaid', 'pending'].includes(String(order.payment_status || '').toLowerCase())) {
      return res.status(409).json({ error: 'Solo gli ordini sandbox in attesa e non pagati possono essere usati.' });
    }

    const amount = Number(order.total || 0);
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'Totale ordine sandbox non valido.' });

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
        metadata: { test_only: true, simulated: true, environment: 'isolated_sandbox' }
      }, { onConflict: 'idempotency_key' })
      .select('id')
      .single();

    if (paymentOrderError) return res.status(500).json({ error: 'Impossibile registrare il pagamento sandbox.' });

    const { data: existingTx, error: existingTxError } = await supabase
      .from('payment_transactions')
      .select('id')
      .eq('payment_order_id', paymentOrder.id)
      .eq('provider', 'sandbox')
      .eq('type', 'payment')
      .limit(1);

    if (existingTxError) return res.status(500).json({ error: 'Impossibile verificare la transazione sandbox esistente.' });

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
        raw_reference: { test_only: true, simulated: true, environment: 'isolated_sandbox' }
      });
      if (txError) return res.status(500).json({ error: 'Impossibile registrare la transazione sandbox.' });
    }

    const { data: updatedOrder, error: orderUpdateError } = await supabase
      .from('orders')
      .update({ payment_status: 'paid', status: 'confirmed' })
      .eq('id', order.id)
      .eq('status', 'pending')
      .in('payment_status', ['unpaid', 'pending'])
      .select('id')
      .maybeSingle();

    if (orderUpdateError) return res.status(500).json({ error: 'Impossibile aggiornare lo stato dell’ordine sandbox.' });
    if (!updatedOrder) return res.status(409).json({ error: 'L’ordine sandbox è cambiato durante il test. Verifica lo stato prima di riprovare.' });

    return res.status(200).json({
      ok: true,
      testOnly: true,
      isolatedSandbox: true,
      orderId: order.id,
      paymentOrderId: paymentOrder.id,
      message: 'Pagamento simulato in ambiente isolato: nessun denaro reale movimentato.'
    });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Errore durante il pagamento sandbox.' });
  }
}
