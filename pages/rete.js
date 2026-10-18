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

        // Unisci la Rete locale con quella cloud: non perdere articoli appena aggiunti
        // se la sincronizzazione cloud è vuota o momentaneamente non disponibile.
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const localSaved = saved;
          const { data: cloudItems, error: cloudError } = await supabase
            .from('river_net_items')
            .select('product_id, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (!cloudError && Array.isArray(cloudItems)) {
            const ids = [...new Set([
              ...cloudItems.map((item) => String(item.product_id)),
              ...localSaved.map((item) => String(item.id))
            ])];
            if (ids.length) {
              const res = await fetch('/api/products', { cache: 'no-store' });
              const data = await res.json();
              if (res.ok && Array.isArray(data)) {
                saved = data
                  .filter((product) => ids.includes(String(product.id)))
                  .map((product) => {
                    const previous = localSaved.find((entry) => String(entry.id) === String(product.id));
                    return {
                      ...(previous || {}),
                      id: product.id,
                      title: product.titolo,
                      price: Number(product.prezzo || 0),
                      image: product.immagini?.[0] || '',
                      stock: Number(previous?.stock ?? product.quantita ?? product.stock ?? 0),
                      deliveryOptions: Array.isArray(product.modalitaConsegna) ? product.modalitaConsegna : (previous?.deliveryOptions || ['home_delivery', 'seller_pickup', 'rs_local']),
                      quantity: Math.max(1, Number(previous?.quantity || 1)),
                      variantName: previous?.variantName || null
                    };
                  });
              }
              // Se il catalogo non risponde, conserva almeno gli articoli salvati localmente.
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
                .map((product) => {
                  const previous = saved.find((entry) => String(entry.id) === String(product.id));
                  return {
                    ...(previous || {}),
                    id: product.id,
                    title: product.titolo,
                    price: Number(product.prezzo || 0),
                    image: product.immagini?.[0] || '',
                    stock: Number(product.quantita ?? product.stock ?? 0),
                    quantity: Math.max(1, Number(previous?.quantity || 1)),
                    variantName: previous?.variantName || null
                  };
                });
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

  function persist(next) {
    setItems(next);
    const serialized = JSON.stringify(next);
    localStorage.setItem('riverspend-rete', serialized);
    sessionStorage.setItem('riverspend-rete', serialized);
    document.cookie = 'riverspend-rete-ids=' + encodeURIComponent([...new Set(next.map((item) => item.id))].join(',')) + '; path=/; max-age=31536000; SameSite=Lax';
  }

  function changeQuantity(item, delta) {
    const key = (entry) => String(entry.id) + '::' + String(entry.variantName || '');
    const next = items.map((entry) => {
      if (key(entry) !== key(item)) return entry;
      const stock = Number(entry.stock || 0);
      const requested = Math.max(1, Number(entry.quantity || 1) + delta);
      return { ...entry, quantity: stock > 0 ? Math.min(stock, requested) : requested };
    });
    persist(next);
  }

  async function remove(id, variantName = null) {
    const next = items.filter((item) => !(String(item.id) === String(id) && String(item.variantName || '') === String(variantName || '')));
    persist(next);
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
          <p className="mt-2 text-slate-600">{items.reduce((sum, item) => sum + Math.max(1, Number(item.quantity || 1)), 0)} pezzi nella tua rete · Totale prodotti: € {items.reduce((sum, item) => sum + Number(item.price || 0) * Math.max(1, Number(item.quantity || 1)), 0).toFixed(2)}</p>
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
                <article key={String(item.id) + '::' + String(item.variantName || '')} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {item.image ? <img src={item.image} alt={item.title || 'Prodotto'} className="h-48 w-full object-cover" /> : <div className="flex h-48 items-center justify-center bg-slate-100 text-slate-500">Foto non disponibile</div>}
                  <div className="p-4">
                    <h2 className="font-bold">{item.title || 'Prodotto'}</h2>
                    {item.variantName && <p className="mt-1 text-sm font-semibold text-teal-800">Variante: {item.variantName}</p>}
                    <p className="mt-2 text-sm text-slate-600">€ {Number(item.price || 0).toFixed(2)} / pezzo</p>
                    <div className="mt-3 flex items-center gap-3">
                      <button type="button" aria-label="Diminuisci quantità" disabled={Number(item.quantity || 1) <= 1} onClick={() => changeQuantity(item, -1)} className="rounded-lg border border-slate-300 px-3 py-2 text-lg font-black disabled:opacity-40">−</button>
                      <span className="min-w-8 text-center font-black">{Math.max(1, Number(item.quantity || 1))}</span>
                      <button type="button" aria-label="Aumenta quantità" disabled={Number(item.stock || 0) > 0 && Number(item.quantity || 1) >= Number(item.stock)} onClick={() => changeQuantity(item, 1)} className="rounded-lg border border-slate-300 px-3 py-2 text-lg font-black disabled:opacity-40">+</button>
                    </div>
                    <p className="mt-2 text-lg font-black text-teal-700">Subtotale: € {(Number(item.price || 0) * Math.max(1, Number(item.quantity || 1))).toFixed(2)}</p>
                    <div className="mt-4 flex gap-2">
                      <Link href={'/prodotto/' + encodeURIComponent(item.id)} className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-bold text-white">Apri</Link>
                      <button onClick={() => remove(item.id, item.variantName)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700">Rimuovi</button>
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
