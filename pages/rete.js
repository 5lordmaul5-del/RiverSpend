import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function Rete() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let attivo = true;

    async function loadRete() {
      try {
        const readJson = (storage, key) => {
          try {
            const value = JSON.parse(storage.getItem(key) || '[]');
            return Array.isArray(value) ? value : [];
          } catch {
            return [];
          }
        };

        const localItems = readJson(localStorage, 'riverspend-rete');
        const sessionItems = readJson(sessionStorage, 'riverspend-rete');
        let saved = localItems.length ? localItems : sessionItems;

        // Se l'utente è autenticato, la Rete principale arriva dall'account RiverSpend.
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: cloudItems, error: cloudError } = await supabase
            .from('river_net_items')
            .select('product_id, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (!cloudError && Array.isArray(cloudItems)) {
            const ids = cloudItems.map((item) => String(item.product_id));
            if (ids.length) {
              const res = await fetch('/api/products', { cache: 'no-store' });
              const data = await res.json();
              if (res.ok && Array.isArray(data)) {
                saved = data
                  .filter((product) => ids.includes(String(product.id)))
                  .map((product) => ({
                    id: product.id,
                    title: product.titolo,
                    price: Number(product.prezzo || 0),
                    image: product.immagini?.[0] || ''
                  }));
              } else {
                saved = [];
              }
            } else {
              saved = [];
            }
          }
        }

        // Fallback robusto per utenti non autenticati: Rete locale + cookie.
        if (!user && !saved.length) {
          const cookie = document.cookie.split('; ').find((entry) => entry.startsWith('riverspend-rete-ids='));
          const ids = cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : '';
          const parsedIds = ids ? ids.split(',').filter(Boolean) : [];
          if (parsedIds.length) {
            const res = await fetch('/api/products', { cache: 'no-store' });
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
              saved = data
                .filter((product) => parsedIds.some((id) => String(id) === String(product.id)))
                .map((product) => ({
                  id: product.id,
                  title: product.titolo,
                  price: Number(product.prezzo || 0),
                  image: product.immagini?.[0] || ''
                }));
            }
          }
        }

        if (attivo) setItems(saved);
      } catch {
        if (attivo) setItems([]);
      }
    }
    loadRete();
    return () => { attivo = false; };
  }, []);

  async function remove(id) {
    const next = items.filter((item) => String(item.id) !== String(id));
    setItems(next);
    const serialized = JSON.stringify(next);
    localStorage.setItem('riverspend-rete', serialized);
    sessionStorage.setItem('riverspend-rete', serialized);
    document.cookie = 'riverspend-rete-ids=' + encodeURIComponent(next.map((item) => item.id).join(',')) + '; path=/; max-age=31536000; SameSite=Lax';
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('river_net_items').delete().eq('user_id', user.id).eq('product_id', String(id));
        if (error) console.error('RiverSpend Rete cloud delete:', error);
      }
    } catch (error) {
      console.error('RiverSpend Rete cloud sync:', error);
    }
  }

  async function clearAll() {
    setItems([]);
    localStorage.removeItem('riverspend-rete');
    sessionStorage.removeItem('riverspend-rete');
    document.cookie = 'riverspend-rete-ids=; path=/; max-age=0; SameSite=Lax';
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('river_net_items').delete().eq('user_id', user.id);
        if (error) console.error('RiverSpend Rete cloud clear:', error);
      }
    } catch (error) {
      console.error('RiverSpend Rete cloud sync:', error);
    }
  }

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-teal-300 underline">← Torna al RiverSpendShop</Link>
        <header className="mt-6 mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">RiverSpendShop</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">🕸️ La mia rete</h1>
          <p className="mt-2 text-slate-600">{items.length} articol{items.length === 1 ? 'o' : 'i'} nella tua rete.</p>
        </header>

        {items.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold">La rete è vuota</p>
            <p className="mt-2 text-sm text-slate-600">Apri un prodotto e aggiungilo alla rete.</p>
            <Link href="/" className="mt-5 inline-flex rounded-xl bg-teal-500 px-5 py-3 font-bold text-slate-950">Esplora prodotti</Link>
          </section>
        ) : (
          <>
            <div className="mb-5 flex flex-wrap justify-end gap-2">
              <button onClick={clearAll} className="rounded-xl border border-slate-700 px-4 py-2 text-sm">Svuota rete</button>
              <Link href="/checkout" className="rounded-xl bg-teal-500 px-4 py-2 text-sm font-extrabold text-slate-950">🛒 Vai al Checkout</Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {item.image ? <img src={item.image} alt={item.title || 'Prodotto'} className="h-48 w-full object-cover" /> : <div className="flex h-48 items-center justify-center bg-slate-100 text-slate-500">Foto non disponibile</div>}
                  <div className="p-4">
                    <h2 className="font-bold">{item.title || 'Prodotto'}</h2>
                    <p className="mt-2 text-xl font-bold text-teal-700">€ {Number(item.price || 0).toFixed(2)}</p>
                    <div className="mt-4 flex gap-2">
                      <Link href={'/prodotto/' + encodeURIComponent(item.id)} className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-bold text-white">Apri</Link>
                      <button onClick={() => remove(item.id)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700">Rimuovi</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
