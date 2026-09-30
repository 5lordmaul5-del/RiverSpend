'use client';

import { useEffect, useState } from 'react';
import SplashScreen from './SplashScreen';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [prodotti, setProdotti] = useState([]);
  const [errore, setErrore] = useState('');

  useEffect(() => {
    let attivo = true;
    fetch('/api/products', { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Catalogo non disponibile');
        return data;
      })
      .then((data) => {
        if (attivo) setProdotti(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (attivo) setErrore(err.message || 'Errore nel caricamento del catalogo');
      });
    return () => { attivo = false; };
  }, []);

  return (
    <main className="rs-site min-h-screen bg-slate-950 text-white">
      {showSplash && <SplashScreen onEnter={() => setShowSplash(false)} />}

      <div className={`transition-opacity duration-700 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        <header className="rs-header sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 px-4 py-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <div>
              <h1 className="rs-brand text-2xl font-bold text-teal-400">RiverSpend<span>Shop</span></h1>
              <p className="text-xs text-slate-400">YOUR SHOP • YOUR FLOW</p>
            </div>
            <a href="/vendi" className="rs-button rs-button-primary rounded-full bg-teal-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-teal-400">
              + Vendi un prodotto
            </a>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="rs-hero mb-8 rounded-3xl border border-teal-800 bg-gradient-to-br from-slate-900 to-sky-950 p-6 sm:p-10">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-teal-300">La tua esperienza sul fiume</p>
            <h2 className="mb-3 text-3xl font-bold sm:text-5xl">La tua rete. Il tuo mercato.</h2>
            <p className="mb-6 max-w-2xl text-slate-300">Scopri gli articoli pubblicati e metti in vendita i tuoi prodotti.</p>
            <a href="/vendi" className="rs-button rs-button-primary inline-block rounded-xl bg-teal-500 px-6 py-3 font-bold text-slate-950">Carica prodotto con foto</a>
          </div>

          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">Prodotti nel Fiume</h2>
              <p className="text-sm text-slate-400">Articoli pubblicati su RiverSpendShop</p>
            </div>
            <a href="/vendi" className="text-sm font-semibold text-teal-300 underline">Vendi</a>
          </div>

          {errore ? (
            <div className="rounded-xl border border-amber-700 bg-amber-950/40 p-4 text-amber-200">
              Il catalogo non è raggiungibile: {errore}. La pubblicazione richiede la configurazione del database.
            </div>
          ) : prodotti.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center">
              <p className="mb-2 text-lg font-semibold">Ancora nessun prodotto pubblicato</p>
              <p className="mb-5 text-sm text-slate-400">Accedi e carica il primo articolo con le sue foto.</p>
              <a href="/vendi" className="inline-block rounded-xl bg-teal-500 px-6 py-3 font-bold text-slate-950">Vai a Carica prodotto</a>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {prodotti.map((p) => (
                <a href={`/prodotto/${encodeURIComponent(p.id)}`} key={p.id} className="rs-product-card block overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400">
                  {p.immagini?.[0] ? (
                    <img src={p.immagini[0]} alt={p.titolo || 'Prodotto'} className="h-40 w-full object-cover sm:h-52" />
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-slate-800 text-sm text-slate-500 sm:h-52">Foto non disponibile</div>
                  )}
                  <div className="p-3">
                    <h3 className="line-clamp-2 font-semibold">{p.titolo}</h3>
                    <p className="mt-2 text-lg font-bold text-teal-300">€ {Number(p.prezzo || 0).toFixed(2)}</p>
                    <p className="text-xs text-slate-400">{p.condizione}</p>
                    <p className="mt-3 text-sm font-semibold text-teal-300">Apri prodotto →</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
