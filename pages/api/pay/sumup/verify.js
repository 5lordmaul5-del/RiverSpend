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

  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'Sessione RiverSpend mancante.' });

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data: { user }, error: userError } = await admin.auth.getUser(token);
    if (userError || !user) return res.status(401).json({ error: 'Sessione RiverSpend non valida.' });

    const { orderId, checkoutId } = req.body || {};
    if (!orderId || !checkoutId) return res.status(400).json({ error: 'orderId e checkoutId sono obbligatori.' });

    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('id,total,currency,buyer_id,status,payment_status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) return res.status(404).json({ error: 'Ordine non trovato.' });
    if (String(order.buyer_id) !== String(user.id)) return res.status(403).json({ error: 'Ordine non appartenente all’account.' });

    if (order.payment_status === 'paid') {
      return res.status(200).json({ ok: true, paid: true, orderId: order.id, message: 'Ordine già pagato.' });
    }

    const response = await fetch(SUMUP_API + '/v0.1/checkouts/' + encodeURIComponent(checkoutId), {
      headers: { Authorization: 'Bearer ' + apiKey }
    });
    const checkout = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        error: checkout?.message || checkout?.detail || 'Impossibile verificare il checkout SumUp.'
      });
    }

    const expectedReference = 'RS-' + String(order.id);
    const amount = Number(order.total || 0);
    const currency = String(order.currency || 'EUR').toUpperCase();

    if (checkout.merchant_code !== merchantCode) {
      return res.status(400).json({ error: 'Checkout SumUp associato a un merchant diverso.' });
    }
    if (checkout.checkout_reference !== expectedReference) {
      return res.status(400).json({ error: 'Riferimento checkout SumUp non corrispondente all’ordine.' });
    }
    if (Math.abs(Number(checkout.amount || 0) - amount) > 0.01 || String(checkout.currency || '').toUpperCase() !== currency) {
      return res.status(400).json({ error: 'Importo o valuta del checkout SumUp non corrispondenti all’ordine.' });
    }

    const successfulTransaction = (checkout.transactions || []).find((tx) => tx?.status === 'SUCCESSFUL');
    const paid = checkout.status === 'PAID' || Boolean(successfulTransaction);

    if (!paid) {
      const state = checkout.status || 'PENDING';
      return res.status(200).json({
        ok: true,
        paid: false,
        state,
        message: state === 'FAILED'
          ? 'Il pagamento SumUp non è andato a buon fine.'
          : 'Pagamento SumUp ancora in attesa.'
      });
    }

    const transactionId = checkout.transaction_id || successfulTransaction?.id || successfulTransaction?.transaction_id;
    const transactionCode = successfulTransaction?.transaction_code || null;
    const idempotencyKey = 'sumup-' + String(transactionId || checkout.id);

    const { data: paymentOrder, error: paymentOrderError } = await admin
      .from('payment_orders')
      .upsert({
        user_id: order.buyer_id,
        order_reference: order.id,
        amount,
        currency,
        status: 'paid',
        provider: 'sumup',
        provider_order_id: String(checkout.id),
        idempotency_key: idempotencyKey,
        metadata: {
          sumup_checkout_id: checkout.id,
          sumup_checkout_reference: checkout.checkout_reference,
          sumup_transaction_id: transactionId || null,
          sumup_transaction_code: transactionCode,
          test_mode: true
        }
      }, { onConflict: 'idempotency_key' })
      .select('id')
      .single();

    if (paymentOrderError) return res.status(500).json({ error: paymentOrderError.message });

    const { data: existingTx } = await admin
      .from('payment_transactions')
      .select('id')
      .eq('payment_order_id', paymentOrder.id)
      .eq('provider', 'sumup')
      .eq('type', 'payment')
      .limit(1);

    if (!existingTx?.length) {
      const { error: txError } = await admin.from('payment_transactions').insert({
        payment_order_id: paymentOrder.id,
        user_id: order.buyer_id,
        provider: 'sumup',
        provider_transaction_id: String(transactionId || checkout.id),
        type: 'payment',
        status: 'succeeded',
        amount,
        currency,
        raw_reference: {
          sumup_checkout_id: checkout.id,
          sumup_checkout_reference: checkout.checkout_reference,
          transaction_id: transactionId || null,
          transaction_code: transactionCode
        }
      });
      if (txError) return res.status(500).json({ error: txError.message });
    }

    const { error: treasuryError } = await admin.rpc('rs_create_treasury_allocation', {
      p_order_id: String(order.id),
      p_payment_id: paymentOrder.id,
      p_gross_amount: amount,
      p_currency: currency,
      p_rule_id: null,
      p_revenue_source_code: 'SHOP_COMMISSION'
    });

    if (treasuryError) {
      return res.status(500).json({ error: 'Pagamento riuscito, ma Treasury non aggiornato.' });
    }

    const { error: updateError } = await admin
      .from('orders')
      .update({ payment_status: 'paid', status: 'confirmed' })
      .eq('id', order.id);

    if (updateError) return res.status(500).json({ error: 'Pagamento riuscito, ma ordine non aggiornato.' });

    return res.status(200).json({
      ok: true,
      paid: true,
      orderId: order.id,
      paymentId: transactionId || checkout.id
    });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Errore nella verifica SumUp.' });
  }
}
