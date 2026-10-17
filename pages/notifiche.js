import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function Notifiche() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setMessage('');
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) {
        setItems([]);
        setMessage('Accedi al tuo account RiverSpend per ricevere e consultare le notifiche di vendita.');
        return;
      }
      const { data, error } = await supabase
        .from('product_notifications')
        .select('id, product_id, product_title, notification_type, message, created_at, read_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error?.message || 'Non siamo riusciti a caricare le notifiche.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const channel = supabase.channel('riverspend-product-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'product_notifications' }, (payload) => {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user && payload.new?.user_id === user.id) loadNotifications();
        }).catch(() => {});
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadNotifications]);

  async function markRead(id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const now = new Date().toISOString();
    const { error } = await supabase.from('product_notifications').update({ read_at: now }).eq('id', id).eq('user_id', user.id);
    if (error) {
      setMessage('Non siamo riusciti ad aggiornare la notifica.');
      return;
    }
    setItems((current) => current.map((item) => item.id === id ? { ...item, read_at: now } : item));
  }

  async function markAllRead() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const now = new Date().toISOString();
    const { error } = await supabase.from('product_notifications').update({ read_at: now }).eq('user_id', user.id).is('read_at', null);
    if (error) {
      setMessage('Non siamo riusciti ad aggiornare le notifiche.');
      return;
    }
    setItems((current) => current.map((item) => ({ ...item, read_at: item.read_at || now })));
  }

  const unread = items.filter((item) => !item.read_at).length;

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <nav className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="text-teal-800 underline">← RiverSpendShop</Link>
          <Link href="/desideri" className="text-sm font-semibold text-teal-800 underline">♡ Lista dei desideri</Link>
        </nav>
        <header className="mt-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-amber-800">RiverSpend</p>
            <h1 className="mt-2 text-3xl font-extrabold">🔔 Le mie notifiche</h1>
            <p className="mt-2 text-sm text-slate-600">{unread} da leggere</p>
          </div>
          {unread > 0 && <button type="button" onClick={markAllRead} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold">Segna tutte come lette</button>}
        </header>
        {message && <p role="status" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">{message}</p>}
        {loading ? <p className="mt-8 text-slate-600">Carico le notifiche…</p> : !items.length ? (
          <section className="mt-8 rounded-2xl border border-dashed border-slate-300 p-8 text-center">
            <p className="font-bold">Non hai ancora notifiche</p>
            <p className="mt-2 text-sm text-slate-600">Apri un annuncio e scegli “♡ Aggiungi ai desideri” oppure “🔔 Segui annuncio e avvisami se venduto”.</p>
            <Link href="/" className="mt-5 inline-flex rounded-xl bg-teal-500 px-5 py-3 font-bold text-slate-950">Esplora annunci</Link>
          </section>
        ) : (
          <div className="mt-6 space-y-3">
            {items.map((item) => (
              <article key={item.id} className={'rounded-2xl border p-4 ' + (item.read_at ? 'border-slate-200 bg-white' : 'border-amber-300 bg-amber-50')}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl" aria-hidden="true">{item.notification_type === 'product_sold' ? '🔴' : '🔔'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{item.message}</p>
                    <p className="mt-1 text-xs text-slate-500">{new Date(item.created_at).toLocaleString('it-IT')}</p>
                    {item.product_id && <Link href={'/prodotto/' + encodeURIComponent(item.product_id)} className="mt-3 inline-block text-sm font-bold text-teal-800 underline">Apri annuncio →</Link>}
                  </div>
                  {!item.read_at && <button type="button" onClick={() => markRead(item.id)} className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold">Letta</button>}
                </div>
              </article>
            ))}
          </div>
        )}
        <p className="mt-8 text-xs leading-5 text-slate-500">Le notifiche di vendita richiedono l’accesso al tuo account. Gli annunci venduti restano consultabili per un’ora dalla vendita, poi scompaiono dal catalogo.</p>
      </div>
    </main>
  );
}
