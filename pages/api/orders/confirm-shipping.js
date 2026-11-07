import { createClient } from '@supabase/supabase-js';

const money = (value) => Math.round(Number(value) * 100) / 100;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo non consentito.' });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return res.status(503).json({ error: 'Servizio ordini non configurato.' });

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Accedi al tuo account venditore.' });

  const admin = createClient(url, serviceKey);
  const { data: auth, error: authError } = await admin.auth.getUser(token);
  if (authError || !auth?.user) return res.status(401).json({ error: 'Sessione non valida.' });

  const orderId = String(req.body?.orderId || '');
  const shipping = money(req.body?.shippingTotal);
  if (!orderId || !Number.isFinite(shipping) || shipping < 0 || shipping > 1000000) {
    return res.status(400).json({ error: 'Ordine o costo di spedizione non valido.' });
  }

  const { data: order, error: orderError } = await admin.from('orders')
    .select('id,buyer_id,status,payment_status,subtotal,donation_total,total')
    .eq('id', orderId).maybeSingle();
  if (orderError || !order) return res.status(404).json({ error: 'Ordine non trovato.' });
  if (order.status !== 'pending_shipping_quote' || order.payment_status !== 'unpaid') {
    return res.status(409).json({ error: 'Questo ordine non è più in attesa di conferma.' });
  }

  const { data: items, error: itemsError } = await admin.from('order_items')
    .select('product_id,quantity,unit_price,subtotal')
    .eq('order_id', orderId);
  if (itemsError || !items?.length) return res.status(400).json({ error: 'Articoli dell’ordine non disponibili.' });

  const productIds = [...new Set(items.map((item) => String(item.product_id)))];
  const { data: products, error: productsError } = await admin.from('products')
    .select('id,seller_id').in('id', productIds);
  if (productsError || !products || products.length !== productIds.length) {
    return res.status(409).json({ error: 'Non riesco a verificare tutti i venditori degli articoli.' });
  }
  if (products.some((product) => String(product.seller_id) !== String(auth.user.id))) {
    return res.status(403).json({ error: 'Può confermare l’ordine soltanto il venditore di tutti gli articoli. Gli ordini multi-venditore richiedono una conferma separata.' });
  }

  const subtotal = money(order.subtotal);
  const donation = money(order.donation_total || 0);
  const computedSubtotal = money(items.reduce((sum, item) => sum + Number(item.unit_price || 0) * Number(item.quantity || 0), 0));
  if (!Number.isFinite(subtotal) || subtotal <= 0 || computedSubtotal !== subtotal) {
    return res.status(409).json({ error: 'Il subtotale degli articoli non coincide con l’ordine. Richiedi assistenza.' });
  }
  const total = money(subtotal + shipping + donation);

  const { data: updated, error: updateError } = await admin.from('orders').update({
    shipping_total: shipping,
    total,
    delivery_status: 'confirmed',
    status: 'pending',
    shipping_confirmed_at: new Date().toISOString(),
    shipping_confirmed_by: auth.user.id
  }).eq('id', orderId).eq('status', 'pending_shipping_quote').eq('payment_status', 'unpaid')
    .select('id,total,shipping_total,status,delivery_status').maybeSingle();

  if (updateError) return res.status(500).json({ error: 'Impossibile salvare la conferma: ' + updateError.message });
  if (!updated) return res.status(409).json({ error: 'Ordine modificato da un’altra operazione. Aggiorna la pagina.' });
  return res.status(200).json({ ok: true, order: updated });
}
