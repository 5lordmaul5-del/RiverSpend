'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

export default function Prodotto() {
  const [prodotto, setProdotto] = useState(null);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState('');
  const [fotoAttiva, setFotoAttiva] = useState(0);
  const [inRete, setInRete] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let attivo = true;
    const id = window.location.pathname.split('/').filter(Boolean).pop();

    fetch('/api/products', { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Prodotto non disponibile');
        const trovato = (Array.isArray(data) ? data : []).find((item) => String(item.id) === decodeURIComponent(id || ''));
        if (!trovato) throw new Error('Questo prodotto non è disponibile.');
        return trovato;
      })
      .then((item) => {
        if (!attivo) return;
        setProdotto(item);
        try {
          const rete = JSON.parse(localStorage.getItem('riverspend-rete') || '[]');
          const desideri = JSON.parse(localStorage.getItem('riverspend-wishlist') || '[]');
          setInRete(Array.isArray(rete) && rete.some((x) => String(x.id) === String(item.id)));
          setWishlist(Array.isArray(desideri) && desideri.some((x) => String(x.id) === String(item.id)));
        } catch {
          setInRete(false);
          setWishlist(false);
        }
      })
      .catch((err) => { if (attivo) setErrore(err.message || 'Errore nel caricamento.'); })
      .finally(() => { if (attivo) setCaricamento(false); });

    return () => { attivo = false; };
  }, []);

  const immagini = prodotto?.immagini || [];
  const record = useMemo(() => prodotto ? ({
    id: prodotto.id,
    title: prodotto.titolo,
    price: Number(prodotto.prezzo || 0),
    image: prodotto.immagini?.[0] || ''
  }) : null, [prodotto]);

  function toggleRete() {
    if (!record) return;
    try {
      const current = JSON.parse(localStorage.getItem('riverspend-rete') || '[]');
      const safe = Array.isArray(current) ? current : [];
      const exists = safe.some((x) => String(x.id) === String(record.id));
      const next = exists ? safe.filter((x) => String(x.id) !== String(record.id)) : [record, ...safe];
      localStorage.setItem('riverspend-rete', JSON.stringify(next));
      setInRete(!exists);
      setFeedback(exists ? 'Rimosso dalla rete.' : '✅ Aggiunto alla tua rete.');
    } catch {
      setFeedback('Impossibile salvare la rete su questo dispositivo.');
    }
  }

  function toggleWishlist() {
    if (!record) return;
    try {
      const current = JSON.parse(localStorage.getItem('riverspend-wishlist') || '[]');
      const safe = Array.isArray(current) ? current : [];
      const exists = safe.some((x) => String(x.id) === String(record.id));
      const next = exists ? safe.filter((x) => String(x.id) !== String(record.id)) : [record, ...safe];
      localStorage.setItem('riverspend-wishlist', JSON.stringify(next));
      setWishlist(!exists);
      setFeedback(exists ? 'Rimosso dalla lista dei desideri.' : '✅ Aggiunto ai desideri.');
    } catch {
      setFeedback('Impossibile salvare i desideri su questo dispositivo.');
    }
  }

  if (caricamento) {
    return <main className="min-h-screen bg-white p-6 text-slate-800">Caricamento prodotto…</main>;
  }

  if (errore || !prodotto) {
    return (
      <main className="min-h-screen bg-white p-6 text-slate-800">
        <Link href="/" className="text-teal-300 underline">← Torna al RiverSpendShop</Link>
        <p className="mt-6">{errore || 'Prodotto non trovato.'}</p>
      </main>
    );
  }

  return (
    <main className="rs-product-page min-h-screen bg-white px-4 py-6 text-slate-800">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="inline-block mb-6 text-teal-300 underline">← Torna al RiverSpendShop</Link>

        <div className="grid gap-8 md:grid-cols-2">
          <section>
            {immagini.length > 0 ? (
              <>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <img src={immagini[fotoAttiva]} alt={prodotto.titolo} className="h-[360px] w-full object-contain sm:h-[500px]" />
                </div>
                {immagini.length > 1 && (
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {immagini.map((url, index) => (
                      <button key={url + index} type="button" onClick={() => setFotoAttiva(index)} aria-label={'Mostra foto ' + (index + 1)} aria-pressed={fotoAttiva === index} className={'overflow-hidden rounded-lg border-2 ' + (fotoAttiva === index ? 'border-teal-400' : 'border-slate-200')}>
                        <img src={url} alt={'Anteprima ' + (index + 1)} className="h-20 w-full bg-white object-contain p-1" />
                      </button>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-sm text-slate-600">Foto {fotoAttiva + 1} di {immagini.length}</p>
              </>
            ) : (
              <div className="flex h-80 items-center justify-center rounded-2xl bg-slate-900 text-slate-400">Foto non disponibile</div>
            )}
          </section>

          <section>
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-300">RiverSpendShop</p>
            <h1 className="mt-2 text-3xl font-bold">{prodotto.titolo}</h1>
            <p className="mt-4 text-3xl font-bold text-teal-300">€ {Number(prodotto.prezzo || 0).toFixed(2)}</p>
            <p className="mt-3 inline-block rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{prodotto.condizione || 'Condizione non indicata'}</p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={toggleRete} className="rounded-xl bg-teal-500 px-4 py-3 font-bold text-slate-950">
                {inRete ? '✓ Nella mia rete' : '🕸️ Aggiungi alla rete'}
              </button>
              <button type="button" onClick={toggleWishlist} className="rounded-xl border border-teal-800 px-4 py-3 font-semibold text-teal-100">
                {wishlist ? '♥ Nei desideri' : '♡ Aggiungi ai desideri'}
              </button>
            </div>

            <Link href="/rete" className="mt-3 inline-block text-sm text-teal-300 underline">Apri la mia rete →</Link>

            {feedback && <p className="mt-3 rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm text-teal-200">{feedback}</p>}

            <div className="mt-8 border-t border-slate-800 pt-6">
              <h2 className="text-xl font-semibold">Descrizione prodotto</h2>
              <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-600">{prodotto.descrizione || 'Nessuna descrizione inserita.'}</p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-3"><p className="text-xs text-slate-500">Protezione</p><p className="mt-1 font-semibold text-teal-200">RS Nova Shield</p></div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-3"><p className="text-xs text-slate-500">Pagamento</p><p className="mt-1 font-semibold text-teal-200">RiverSpend Pay</p></div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
