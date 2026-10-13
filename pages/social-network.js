import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

function readList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export default function RiverSpendSocialMarketplace() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [netIds, setNetIds] = useState([]);
  const [wishIds, setWishIds] = useState([]);
  const [notice, setNotice] = useState('');
  const [mediaIndexes, setMediaIndexes] = useState({});

  useEffect(() => {
    let active = true;
    setNetIds(readList('riverspend-rete').map((item) => String(item.id)));
    setWishIds(readList('riverspend-wishlist').map((item) => String(item.id)));

    fetch('/api/products', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Il Fiume non è disponibile al momento.');
        return data;
      })
      .then((data) => {
        if (active) setProducts(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Errore nel caricamento dei prodotti.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  function productRecord(product) {
    return {
      id: product.id,
      title: product.titolo || 'Prodotto RiverSpend',
      price: Number(product.prezzo || 0),
      image: product.immagini?.[0] || ''
    };
  }

  async function toggleNet(product) {
    const current = readList('riverspend-rete');
    const exists = current.some((item) => String(item.id) === String(product.id));
    const record = productRecord(product);
    const next = exists
      ? current.filter((item) => String(item.id) !== String(product.id))
      : [record, ...current];
    try {
      localStorage.setItem('riverspend-rete', JSON.stringify(next));
      sessionStorage.setItem('riverspend-rete', JSON.stringify(next));
      document.cookie = 'riverspend-rete-ids=' + encodeURIComponent(next.map((item) => item.id).join(',')) + '; path=/; max-age=31536000; SameSite=Lax';
    } catch {
      setNotice('Non riesco a salvare la Rete su questo dispositivo.');
      return;
    }
    setNetIds(next.map((item) => String(item.id)));
    setNotice(exists ? 'Prodotto rimosso dalla Rete.' : 'Prodotto aggiunto alla Rete.');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const query = supabase.from('river_net_items');
        const result = exists
          ? await query.delete().eq('user_id', user.id).eq('product_id', String(product.id))
          : await query.upsert({ user_id: user.id, product_id: String(product.id) }, { onConflict: 'user_id,product_id' });
        if (result.error) console.error('RiverSpend Social Marketplace: sync Rete non riuscita', result.error);
      }
    } catch (err) {
      console.error('RiverSpend Social Marketplace: sync Rete non riuscita', err);
    }
  }

  function toggleWish(product) {
    const current = readList('riverspend-wishlist');
    const exists = current.some((item) => String(item.id) === String(product.id));
    const record = productRecord(product);
    const next = exists
      ? current.filter((item) => String(item.id) !== String(product.id))
      : [record, ...current];
    try {
      localStorage.setItem('riverspend-wishlist', JSON.stringify(next));
      sessionStorage.setItem('riverspend-wishlist', JSON.stringify(next));
      setWishIds(next.map((item) => String(item.id)));
      setNotice(exists ? 'Rimosso da RS Desideri.' : 'Aggiunto a RS Desideri.');
    } catch {
      setNotice('Non riesco a salvare RS Desideri su questo dispositivo.');
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f2e8] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-teal-900/10 bg-[#f5f2e8]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <Link href="/" className="text-sm font-bold text-teal-800 underline underline-offset-4">← RiverSpendShop</Link>
          <Link href="/rete" className="rounded-full border border-teal-700 px-3 py-2 text-sm font-bold text-teal-800">🕸️ La mia Rete</Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-2 pb-10 pt-4 sm:px-5 sm:pt-6">
        <section className="mb-5 rounded-3xl border border-teal-800/20 bg-gradient-to-br from-teal-950 to-slate-900 p-5 text-white shadow-sm sm:mb-7 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-200">YOUR SHOP • YOUR FLOW</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">RiverSpend Social Marketplace</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-teal-50/90">Scorri il Fiume, scopri prodotti pubblicati e aggiungi alla tua Rete ciò che ti interessa.</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-white/10 px-3 py-2">🌊 Fiume continuo</span>
            <span className="rounded-full bg-white/10 px-3 py-2">{products.length} prodotti</span>
          </div>
        </section>

        {notice && <p role="status" className="mb-4 rounded-xl border border-teal-700/20 bg-white px-4 py-3 text-sm text-teal-900">{notice}</p>}
        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center text-slate-600">Il Fiume sta caricando i prodotti…</div>
        ) : error ? (
          <section className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-amber-950">
            <p className="font-bold">Il Fiume è momentaneamente fermo</p>
            <p className="mt-2 text-sm">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-amber-200 px-4 py-2 font-bold">Riprova</button>
          </section>
        ) : products.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-teal-800/30 bg-white p-8 text-center">
            <p className="text-lg font-bold">Il Fiume aspetta i suoi primi prodotti</p>
            <p className="mt-2 text-sm text-slate-600">Gli annunci pubblicati su RiverSpendShop compariranno qui automaticamente.</p>
            <Link href="/vendi" className="mt-5 inline-flex rounded-xl bg-teal-600 px-5 py-3 font-bold text-white">Pubblica un prodotto</Link>
          </section>
        ) : (
          <section aria-label="Fiume continuo dei prodotti" className="space-y-7 sm:space-y-9">
            {products.map((product) => {
              const mediaItems = product.media?.length
                ? product.media.filter((item) => item && item.url)
                : (product.immagini || []).filter(Boolean).map((url) => ({ url, type: 'image' }));
              const activeIndex = mediaIndexes[String(product.id)] || 0;
              const activeMedia = mediaItems[activeIndex] || null;
              const isVideo = activeMedia && String(activeMedia.type || '').toLowerCase().includes('video');
              const goMedia = (direction) => setMediaIndexes((current) => ({
                ...current,
                [String(product.id)]: (activeIndex + direction + mediaItems.length) % mediaItems.length
              }));
              const isSponsored = product.sponsorizzatoFino && new Date(product.sponsorizzatoFino) > new Date();
              return (
              <article key={product.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md">
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-teal-800">RiverSpendShop · {product.venditoreTipo || 'Privato'}</p>
                    {isSponsored && <span className="mt-1 inline-flex rounded-full border border-amber-300 bg-amber-100 px-2 py-1 text-[11px] font-extrabold text-amber-900">★ RS Spons · Sponsorizzato</span>}
                    <p className="mt-1 text-xs text-slate-500">{[product.localita, product.provincia].filter(Boolean).join(', ') || 'Annuncio RiverSpend'}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-900">{product.condizione || 'Articolo'}</span>
                </div>

                <div className="relative bg-white">
                  {activeMedia ? (
                    <div className="flex h-[62vh] min-h-[420px] max-h-[900px] items-center justify-center overflow-hidden bg-white sm:h-[72vh] sm:min-h-[600px]">
                      {isVideo ? (
                        <video key={activeMedia.url} src={activeMedia.url} controls playsInline preload="metadata" className="h-full max-h-[900px] w-full object-contain" aria-label={product.titolo || 'Video del prodotto'} />
                      ) : (
                        <Link href={'/prodotto/' + encodeURIComponent(product.id)} className="flex h-full min-h-[420px] w-full items-center justify-center focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 sm:min-h-[600px]">
                          <img src={activeMedia.url} alt={product.titolo || 'Prodotto in vendita'} loading="lazy" className="max-h-[560px] w-full object-contain" />
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-64 items-center justify-center bg-slate-100 text-slate-500">Foto o video non disponibile</div>
                  )}
                  {mediaItems.length > 1 && (
                    <div className="absolute inset-x-0 bottom-3 flex items-center justify-between px-3">
                      <button type="button" onClick={() => goMedia(-1)} aria-label="Media precedente" className="rounded-full bg-slate-950/80 px-3 py-2 text-sm font-bold text-white shadow">‹</button>
                      <span className="rounded-full bg-slate-950/75 px-3 py-1 text-xs font-bold text-white">{activeIndex + 1} / {mediaItems.length}</span>
                      <button type="button" onClick={() => goMedia(1)} aria-label="Media successivo" className="rounded-full bg-slate-950/80 px-3 py-2 text-sm font-bold text-white shadow">›</button>
                    </div>
                  )}
                </div>

                <div className="p-5 sm:p-7">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-2xl font-extrabold sm:text-3xl">{product.titolo || 'Prodotto RiverSpend'}</p>
                      <p className="mt-2 text-3xl font-black text-teal-800 sm:text-4xl">€ {Number(product.prezzo || 0).toFixed(2)}</p>
                      <p className="mt-1 text-sm text-slate-500">{product.categoria || 'Altro'}{product.descrizione ? ' · ' + product.descrizione : ''}</p>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button type="button" onClick={() => toggleWish(product)} aria-pressed={wishIds.includes(String(product.id))} className={`rounded-xl border px-4 py-4 text-base font-bold ${wishIds.includes(String(product.id)) ? 'border-cyan-600 bg-cyan-50 text-cyan-900' : 'border-slate-300 bg-white text-slate-800'}`}>
                      {wishIds.includes(String(product.id)) ? '♥ RS Desideri' : '♡ RS Desideri'}
                    </button>
                    <button type="button" onClick={() => toggleNet(product)} aria-pressed={netIds.includes(String(product.id))} className={`rounded-xl px-4 py-4 text-base font-extrabold ${netIds.includes(String(product.id)) ? 'bg-teal-950 text-white' : 'bg-teal-500 text-slate-950'}`}>
                      {netIds.includes(String(product.id)) ? '✓ Nella tua Rete' : '🕸️ Aggiungi alla Rete'}
                    </button>
                  </div>
                  <Link href={'/prodotto/' + encodeURIComponent(product.id)} className="mt-4 flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-4 text-lg font-extrabold text-white">🛍️ Vedi nello Shop →</Link>
                </div>
              </article>
              );
            })}
          </section>
        )}
        <footer className="mt-8 pb-5 text-center text-xs text-slate-500">Gli annunci provengono dal catalogo condiviso RiverSpendShop.</footer>
      </div>
    </main>
  );
}
