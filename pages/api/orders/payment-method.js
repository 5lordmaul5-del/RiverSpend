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

    // The database function locks the order and writes the selection plus audit event
    // in one transaction, preventing a saved method without its audit trail.
    const { data, error } = await supabase.rpc('rs_select_order_payment_method', {
      p_order_id: orderId.trim(),
      p_actor_user_id: user.id,
      p_payment_method: paymentMethod
    });

    if (error) {
      const message = error.message || '';
      if (/non trovato per questo account/i.test(message)) {
        return res.status(404).json({ error: 'Ordine non trovato per questo account.' });
      }
      if (/solo per un ordine in attesa|non pagato/i.test(message)) {
        return res.status(409).json({ error: 'Il metodo può essere scelto solo per un ordine in attesa e non pagato.' });
      }
      if (/metodo di pagamento non supportato/i.test(message)) {
        return res.status(400).json({ error: 'Metodo di pagamento non supportato.' });
      }
      return res.status(500).json({ error: 'Impossibile salvare il metodo e il relativo storico.' });
    }

    const updated = Array.isArray(data) ? data[0] : data;
    if (!updated) {
      return res.status(409).json({ error: 'L’ordine è cambiato. Ricarica il checkout e riprova.' });
    }

    return res.status(200).json({
      ok: true,
      orderId: updated.order_id,
      paymentMethod: updated.payment_method,
      reference: updated.payment_reference,
      paymentStatus: updated.payment_status
    });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Errore durante la scelta del pagamento.' });
  }
}
