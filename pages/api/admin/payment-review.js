import { createClient } from '@supabase/supabase-js';

function bearerToken(req) {
  const value = req.headers.authorization || '';
  return value.startsWith('Bearer ') ? value.slice(7) : '';
}

async function requireAdmin(supabase, token) {
  if (!token) return { error: { status: 401, message: 'Sessione RiverSpend mancante.' } };
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return { error: { status: 401, message: 'Sessione RiverSpend non valida.' } };
  const user = data.user;
  const { data: role, error: roleError } = await supabase
    .from('rs_admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();
  if (roleError) return { error: { status: 500, message: 'Impossibile verificare il ruolo amministrativo.' } };
  if (!['admin', 'ceo'].includes(String(role?.role || '').toLowerCase())) {
    return { error: { status: 403, message: 'Accesso riservato agli amministratori autorizzati.' } };
  }
  return { user };
}

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Metodo non consentito.' });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return res.status(503).json({ error: 'Servizio amministrativo non configurato.' });

  try {
    const supabase = createClient(url, serviceRoleKey);
    const auth = await requireAdmin(supabase, bearerToken(req));
    if (auth.error) return res.status(auth.error.status).json({ error: auth.error.message });

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('orders')
        .select('id,buyer_id,status,payment_status,payment_method,payment_reference,currency,subtotal,shipping_total,total,created_at,payment_selected_at')
        .eq('payment_method', 'bank_transfer')
        .eq('payment_status', 'unpaid')
        .eq('status', 'pending')
        .order('payment_selected_at', { ascending: true, nullsFirst: false })
        .limit(100);
      if (error) return res.status(500).json({ error: 'Impossibile caricare gli ordini in attesa.' });
      return res.status(200).json({ orders: data || [] });
    }

    const { orderId, confirmedAmount, confirmedCurrency, bankReference, note } = req.body || {};
    if (typeof orderId !== 'string' || !orderId.trim()) return res.status(400).json({ error: 'ID ordine obbligatorio.' });
    if (typeof bankReference !== 'string' || bankReference.trim().length < 3) return res.status(400).json({ error: 'Inserisci il riferimento verificato dell’accredito.' });
    if (typeof note !== 'string' || note.trim().length < 5) return res.status(400).json({ error: 'Inserisci una nota della verifica effettuata.' });

    const amount = Number(confirmedAmount);
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error: 'Importo accreditato non valido.' });

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id,buyer_id,status,payment_status,payment_method,currency,total')
      .eq('id', orderId)
      .maybeSingle();
    if (orderError) return res.status(500).json({ error: 'Impossibile verificare l’ordine.' });
    if (!order) return res.status(404).json({ error: 'Ordine non trovato.' });
    if (order.payment_method !== 'bank_transfer' || order.status !== 'pending' || order.payment_status !== 'unpaid') {
      return res.status(409).json({ error: 'L’ordine non è più in attesa di un bonifico non pagato.' });
    }

    const expectedCurrency = String(order.currency || 'EUR').toUpperCase();
    if (String(confirmedCurrency || '').toUpperCase() !== expectedCurrency) {
      return res.status(409).json({ error: 'La valuta dell’accredito non coincide con quella dell’ordine.' });
    }
    if (Math.round(amount * 100) !== Math.round(Number(order.total || 0) * 100)) {
      return res.status(409).json({ error: 'L’importo accreditato non coincide con il totale dell’ordine. Non confermare il pagamento.' });
    }

    const { data: verifiedOrderId, error: verifyError } = await supabase.rpc('rs_verify_bank_transfer', {
      p_order_id: order.id,
      p_actor_user_id: auth.user.id,
      p_confirmed_amount: amount,
      p_confirmed_currency: expectedCurrency,
      p_bank_reference: bankReference.trim(),
      p_note: note.trim()
    });

    if (verifyError) {
      const message = verifyError.message || '';
      if (/non trovato/i.test(message)) return res.status(404).json({ error: 'Ordine non trovato.' });
      if (/non coincide|non in attesa/i.test(message)) return res.status(409).json({ error: message });
      return res.status(500).json({ error: 'Verifica non registrata. Controlla l’ordine e riprova.' });
    }

    return res.status(200).json({
      ok: true,
      orderId: order.id,
      paymentStatus: 'paid',
      message: 'Accredito registrato come verificato. Controlla separatamente la riconciliazione Treasury prima di considerare completata la gestione contabile.'
    });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Errore nel controllo amministrativo dei pagamenti.' });
  }
}
