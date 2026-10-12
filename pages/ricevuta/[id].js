import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

export default function RicevutaOrdine() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!router.isReady || !id) return;
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('Accedi al tuo account RiverSpend per consultare questo ordine.');
        const { data: foundOrder, error: orderError } = await supabase
          .from('orders')
          .select('id, created_at, status, payment_status, payment_method, currency, subtotal, shipping_total, donation_total, total')
          .eq('id', String(id))
          .eq('buyer_id', user.id)
          .maybeSingle();
        if (orderError) throw orderError;
        if (!foundOrder) throw new Error('Ordine non trovato o non accessibile dal tuo account.');
        const { data: foundItems, error: itemsError } = await supabase
          .from('order_items')
          .select('product_name, unit_price, quantity, subtotal')
          .eq('order_id', foundOrder.id)
          .order('id', { ascending: true });
        if (itemsError) throw itemsError;
        if (active) {
          setOrder(foundOrder);
          setItems(foundItems || []);
        }
      } catch (err) {
        if (active) setError(err?.message || 'Impossibile caricare la ricevuta.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [router.isReady, id]);

  const euro = (value) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: order?.currency || 'EUR' }).format(Number(value || 0));
  const method = order?.payment_method === 'cash_on_delivery'
    ? 'Contanti alla consegna'
    : order?.payment_method === 'bank_transfer'
      ? 'Bonifico bancario'
      : order?.payment_method || 'Non indicato';
  const date = order?.created_at ? new Date(order.created_at).toLocaleString('it-IT') : '';

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <style jsx global>{`
        @media print {
          body { background: #fff !important; }
          .no-print { display: none !important; }
          .receipt-sheet { border: 0 !important; box-shadow: none !important; margin: 0 !important; max-width: none !important; }
        }
      `}</style>
      <div className="no-print mx-auto mb-4 flex max-w-3xl flex-wrap items-center justify-between gap-3">
        <Link href="/profilo" className="text-teal-800 underline">← Torna al profilo</Link>
        <button type="button" onClick={() => window.print()} disabled={!order || loading} className="rounded-xl bg-teal-700 px-5 py-3 font-bold text-white disabled:opacity-50">
          ⬇️ Scarica / stampa ricevuta
        </button>
      </div>
      <section className="receipt-sheet mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        {loading ? <p>Caricamento ordine…</p> : error ? (
          <div>
            <h1 className="text-2xl font-bold">Ricevuta ordine</h1>
            <p className="mt-4 text-red-700">{error}</p>
          </div>
        ) : order && (
          <>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-700">RiverSpendShop</p>
            <h1 className="mt-2 text-3xl font-black">Riepilogo ordine</h1>
            <p className="mt-2 text-sm text-slate-600">Documento riepilogativo dell’ordine — non è una fattura fiscale né uno scontrino fiscale.</p>
            <div className="mt-6 grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
              <div><span className="text-sm text-slate-500">Numero ordine</span><p className="break-all font-mono font-bold">{order.id}</p></div>
              <div><span className="text-sm text-slate-500">Data ordine</span><p className="font-semibold">{date}</p></div>
              <div><span className="text-sm text-slate-500">Stato ordine</span><p className="font-semibold">{order.status || 'In attesa'}</p></div>
              <div><span className="text-sm text-slate-500">Stato pagamento</span><p className="font-semibold">{order.payment_status === 'paid' ? 'Pagato' : 'Non pagato / da verificare'}</p></div>
              <div className="sm:col-span-2"><span className="text-sm text-slate-500">Metodo selezionato</span><p className="font-semibold">{method}</p></div>
            </div>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead><tr className="border-b border-slate-300"><th className="py-3 pr-3">Prodotto</th><th className="py-3 px-2 text-right">Qtà</th><th className="py-3 px-2 text-right">Prezzo</th><th className="py-3 pl-2 text-right">Subtotale</th></tr></thead>
                <tbody>
                  {items.map((item, index) => <tr key={index} className="border-b border-slate-100"><td className="py-3 pr-3">{item.product_name || 'Prodotto'}</td><td className="py-3 px-2 text-right">{item.quantity}</td><td className="py-3 px-2 text-right">{euro(item.unit_price)}</td><td className="py-3 pl-2 text-right">{euro(item.subtotal)}</td></tr>)}
                </tbody>
              </table>
            </div>
            <div className="ml-auto mt-6 max-w-sm space-y-2 text-sm">
              <div className="flex justify-between gap-4"><span>Prodotti</span><span>{euro(order.subtotal)}</span></div>
              <div className="flex justify-between gap-4"><span>Spedizione</span><span>{euro(order.shipping_total)}</span></div>
              {Number(order.donation_total || 0) > 0 && <div className="flex justify-between gap-4"><span>Donazione</span><span>{euro(order.donation_total)}</span></div>}
              <div className="flex justify-between gap-4 border-t border-slate-300 pt-3 text-lg font-black"><span>Totale ordine</span><span>{euro(order.total)}</span></div>
            </div>
            <p className="mt-10 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">Conserva questo riepilogo per riferimento. Il pagamento è considerato completato solo dopo la relativa verifica. Per un documento fiscale occorre che il venditore emetta il documento previsto dalla normativa applicabile.</p>
          </>
        )}
      </section>
    </main>
  );
}
