'use client';

import { useEffect, useState } from 'react';

export default function Prodotto({ router }) {
  const [prodotto, setProdotto] = useState(null);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState('');
  const [fotoAttiva, setFotoAttiva] = useState(0);

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
      .then((item) => { if (attivo) setProdotto(item); })
      .catch((err) => { if (attivo) setErrore(err.message || 'Errore nel caricamento.'); })
      .finally(() => { if (attivo) setCaricamento(false); });
    return () => { attivo = false; };
  }, []);

  if (caricamento) {
    return <main className="min-h-screen bg-slate-950 p-6 text-white">Caricamento prodotto…</main>;
  }

  if (errore || !prodotto) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <a href="/" className="text-teal-300 underline">← Torna al RiverSpendShop</a>
        <p className="mt-6">{errore || 'Prodotto non trovato.'}</p>
      </main>
    );
  }

  const immagini = prodotto.immagini || [];

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="inline-block mb-6 text-teal-300 underline">← Torna al RiverSpendShop</a>
        <div className="grid gap-8 md:grid-cols-2">
          <section>
            {immagini.length > 0 ? (
              <>
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                  <img src={immagini[fotoAttiva]} alt={prodotto.titolo} className="h-[360px] w-full object-contain sm:h-[500px]" />
                </div>
                {immagini.length > 1 && (
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {immagini.map((url, index) => (
                      <button key={url + index} type="button" onClick={() => setFotoAttiva(index)} aria-label={'Mostra foto ' + (index + 1)} aria-pressed={fotoAttiva === index} className={'overflow-hidden rounded-lg border-2 ' + (fotoAttiva === index ? 'border-teal-400' : 'border-slate-700')}>
                        <img src={url} alt={'Anteprima ' + (index + 1)} className="h-20 w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
                <p className="mt-2 text-sm text-slate-400">Foto {fotoAttiva + 1} di {immagini.length}</p>
              </>
            ) : (
              <div className="flex h-80 items-center justify-center rounded-2xl bg-slate-900 text-slate-400">Foto non disponibile</div>
            )}
          </section>
          <section>
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-300">RiverSpendShop</p>
            <h1 className="mt-2 text-3xl font-bold">{prodotto.titolo}</h1>
            <p className="mt-4 text-3xl font-bold text-teal-300">€ {Number(prodotto.prezzo || 0).toFixed(2)}</p>
            <p className="mt-3 inline-block rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-200">{prodotto.condizione || 'Condizione non indicata'}</p>
            <div className="mt-8 border-t border-slate-800 pt-6">
              <h2 className="text-xl font-semibold">Descrizione prodotto</h2>
              <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-300">{prodotto.descrizione || 'Nessuna descrizione inserita.'}</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
