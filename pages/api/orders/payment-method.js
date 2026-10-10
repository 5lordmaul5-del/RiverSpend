import { createClient } from '@supabase/supabase-js';

const allowedMethods = new Set(['cash_on_delivery', 'bank_transfer']);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Metodo non consentito.' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(503).json({ error: 'Checkout server non configurato.' });
  }

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Sessione RiverSpend mancante.' });

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    const user = authData?.user;
    if (authError || !user) return res.status(401).json({ error: 'Sessione RiverSpend non valida.' });

    const { orderId, paymentMethod } = req.body || {};
    if (typeof orderId !== 'string' || !orderId.trim()) {
      return res.status(400).json({ error: 'ID ordine obbligatorio.' });
    }
    if (!allowedMethods.has(paymentMethod)) {
      return res.status(400).json({ error: 'Metodo di pagamento non supportato.' });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id,buyer_id,status,payment_status,total,currency')
      .eq('id', orderId)
      .eq('buyer_id', user.id)
      .maybeSingle();

    if (orderError) return res.status(500).json({ error: 'Impossibile verificare l’ordine.' });
    if (!order) return res.status(404).json({ error: 'Ordine non trovato per questo account.' });
    if (order.status !== 'pending' || !['unpaid', 'pending'].includes(String(order.payment_status || '').toLowerCase())) {
      return res.status(409).json({ error: 'Il metodo può essere scelto solo per un ordine in attesa e non pagato.' });
    }

    const { data: updated, error: updateError } = await supabase
      .from('orders')
      .update({
        payment_method: paymentMethod,
        payment_reference: paymentMethod === 'bank_transfer' ? order.id : null,
        payment_selected_at: new Date().toISOString(),
        payment_status: 'unpaid'
      })
      .eq('id', order.id)
      .eq('buyer_id', user.id)
      .eq('status', 'pending')
      .in('payment_status', ['unpaid', 'pending'])
      .select('id,payment_method,payment_reference,payment_status')
      .maybeSingle();

    if (updateError) return res.status(500).json({ error: 'Impossibile salvare il metodo di pagamento.' });
    if (!updated) return res.status(409).json({ error: 'L’ordine è cambiato. Ricarica il checkout e riprova.' });

    const { error: auditError } = await supabase.from('rs_payment_verification_events').insert({
      order_id: order.id,
      actor_user_id: user.id,
      action: 'payment_method_selected',
      payment_method: paymentMethod,
      amount: Number(order.total || 0),
      currency: order.currency || 'EUR',
      reference: paymentMethod === 'bank_transfer' ? order.id : null
    });

    if (auditError) {
      // Do not claim the audit trail was saved if the event could not be recorded.
      return res.status(500).json({ error: 'Metodo salvato, ma non è stato possibile registrare lo storico. Contatta l’assistenza prima di pagare.' });
    }

    return res.status(200).json({
      ok: true,
      orderId: updated.id,
      paymentMethod: updated.payment_method,
      reference: updated.payment_reference,
      paymentStatus: updated.payment_status
    });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Errore durante la scelta del pagamento.' });
  }
}
