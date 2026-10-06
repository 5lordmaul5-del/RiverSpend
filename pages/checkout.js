import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function Checkout() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [orderId, setOrderId] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
    try {
      const saved = JSON.parse(localStorage.getItem('riverspend-rete') || '[]');
      if (Array.isArray(saved)) setItems(saved);
    } catch {}
  }, []);

  async function createOrder() {
    setError('');
    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Accedi al tuo account RiverSpend prima di creare un ordine.');
      if (!items.length) throw new Error('La Rete è vuota.');

      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, price, stock')
        .in('id', items.map((item) => String(item.id)))
        .eq('status', 'published');

      if (productsError) throw productsError;

      const byId = new Map((products || []).map((product) => [String(product.id), product]));
      const validItems = items.map((item) => byId.get(String(item.id))).filter(Boolean);
      if (validItems.length !== items.length) throw new Error('Uno o più prodotti non sono più disponibili.');

      const subtotal = validItems.reduce((sum, product) => sum + Number(product.price || 0), 0);
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          status: 'pending',
          payment_status: 'unpaid',
          currency: 'EUR',
          subtotal,
          shipping_total: 0,
          donation_total: 0,
          total: subtotal
        })
        .select('id')
        .single();

      if (orderError) throw orderError;

      const orderItems = validItems.map((product) => ({
        order_id: order.id,
        product_id: String(product.id),
        product_name: product.name || 'Prodotto',
        unit_price: Number(product.price || 0),
        quantity: 1,
        subtotal: Number(product.price || 0)
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) {
        await supabase.from('orders').delete().eq('id', order.id);
        throw itemsError;
      }

      setOrderId(order.id);
    } catch (err) {
      setError(err?.message || 'Impossibile creare l’ordine.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-teal-300 underline">← Torna al RiverSpendShop</Link>

        <section className="mt-6 rounded-3xl border border-teal-800 bg-slate-900 p-6 shadow-xl sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-teal-300">RiverSpend Pay</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">💳 Checkout RiverSpend</h1>
          <p className="mt-3 leading-7 text-slate-300">
            Qui nascerà il flusso ufficiale di pagamento RiverSpend: ordine, metodo di pagamento,
            conferma, protezione Shield e gestione della spedizione.
          </p>

          <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
            <h2 className="font-bold">🛒 Riepilogo</h2>
            {items.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">La tua Rete non contiene ancora prodotti da portare al checkout.</p>
            ) : (
              <>
                <div className="mt-3 space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate">{item.title || 'Prodotto'}</span>
                      <strong>€ {Number(item.price || 0).toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between border-t border-slate-700 pt-3 text-lg font-black">
                  <span>Totale</span>
                  <span className="text-teal-300">€ {items.reduce((sum, item) => sum + Number(item.price || 0), 0).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          <div className="mt-6 grid gap-3">
            {[
              ['🛒', 'Riepilogo ordine', 'Prodotti, quantità e totale'],
              ['📦', 'Consegna', 'Indirizzo e opzioni di spedizione'],
              ['🛡️', 'RiverSpend Shield', 'Protezione dell’acquirente'],
              ['💳', 'Pagamento', 'Provider di pagamento sicuro'],
            ].map(([icon, title, text]) => (
              <article key={title} className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
                <div className="text-2xl">{icon}</div>
                <h2 className="mt-2 font-bold">{title}</h2>
                <p className="mt-1 text-sm text-slate-400">{text}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4">
            <p className="text-sm font-semibold text-amber-200">
              {user ? 'Account RiverSpend collegato' : 'Accedi al tuo account RiverSpend per procedere con un ordine.'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Il pagamento reale verrà collegato in un passaggio successivo, dopo aver verificato il flusso ordine.
            </p>
          </div>

          {error && <div className="mt-5 rounded-2xl border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-200">{error}</div>}
          {orderId && <div className="mt-5 rounded-2xl border border-teal-500/40 bg-teal-950/30 p-4 text-sm text-teal-100">✅ Ordine creato. ID: <span className="font-mono">{orderId}</span><br />Stato: <strong>in attesa di pagamento</strong>.</div>}

          <div className="mt-6 flex flex-wrap gap-3">
            {user && items.length > 0 && !orderId && (
              <button type="button" onClick={createOrder} disabled={creating} className="rounded-xl bg-teal-500 px-4 py-3 font-bold text-slate-950 disabled:opacity-60">
                {creating ? 'Creazione ordine…' : '🧾 Crea ordine'}
              </button>
            )}
            <Link href="/rete" className="rounded-xl border border-teal-700 px-4 py-3 font-bold text-teal-100">
              🕸️ Vai alla Rete
            </Link>
            <Link href="/servizi/pay" className="rounded-xl bg-teal-500 px-4 py-3 font-bold text-slate-950">
              RiverSpend Pay
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
