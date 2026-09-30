'use client';

import { useEffect, useMemo, useState } from 'react';
import SplashScreen from './SplashScreen';

const servizi = [
  ['RS Profilo', 'Account e identità'], ['RS Park', 'Il parco divertimenti'],
  ['RS ISSA', 'Immersive Sound'], ['RS Fidelity', 'Vantaggi e fedeltà'],
  ['RS Pay', 'Pagamenti'], ['RS Shield', 'Protezione acquisti'],
  ['RS Box', 'Spedizioni e consegne'], ['RS Oracle', 'Informazioni e assistenza'],
  ['RS Experience', 'Esperienze'], ['RS Recovery', 'Recupero e supporto'],
  ['RS Local', 'Attività sul territorio'], ['RS Ecology', 'Sostenibilità']
];

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [prodotti, setProdotti] = useState([]);
  const [errore, setErrore] = useState('');
  const [ricerca, setRicerca] = useState('');

  useEffect(() => {
    let attivo = true;
    fetch('/api/products', { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Catalogo non disponibile');
        return data;
      })
      .then((data) => { if (attivo) setProdotti(Array.isArray(data) ? data : []); })
      .catch((err) => { if (attivo) setErrore(err.message || 'Errore nel caricamento del catalogo'); });
    return () => { attivo = false; };
  }, []);

  const prodottiFiltrati = useMemo(() => {
    const q = ricerca.trim().toLocaleLowerCase('it');
    if (!q) return prodotti;
    return prodotti.filter((p) => [p.titolo, p.descrizione, p.condizione].join(' ').toLocaleLowerCase('it').includes(q));
  }, [prodotti, ricerca]);

  return (
    <main className="rs-site min-h-screen text-white">
      {showSplash && <SplashScreen onEnter={() => setShowSplash(false)} />}
      <div className={`transition-opacity duration-700 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        <header className="rs-header sticky top-0 z-30 border-b px-4 py-3">
          <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3">
            <a href="/" className="no-underline">
              <h1 className="rs-brand text-2xl font-bold text-teal-300">RiverSpend<span>Shop</span></h1>
              <p className="text-[10px] tracking-widest text-slate-400">YOUR SHOP • YOUR FLOW</p>
            </a>
            <label className="order-3 w-full sm:order-none sm:w-auto sm:flex-1 sm:max-w-xl">
              <span className="sr-only">Cerca prodotti</span>
              <input value={ricerca} onChange={(e) => setRicerca(e.target.value)} placeholder="Cerca nel RiverSpendShop…" className="w-full rounded-full border px-4 py-2.5 text-sm" />
            </label>
            <a href="/vendi" className="rs-button rs-button-primary rounded-full px-5 py-3 text-sm font-bold">+ Vendi un prodotto</a>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1500px] gap-5 px-4 py-5 lg:grid-cols-[220px_minmax(0,1fr)_260px]">
          <aside className="rs-glass h-fit rounded-2xl p-4 lg:sticky lg:top-24">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-teal-300">Il tuo fiume</p>
            <nav className="grid grid-cols-2 gap-2 text-sm lg:grid-cols-1">
              <a className="rounded-xl bg-teal-400/10 px-3 py-2 text-teal-200" href="/">⌂ Home</a>
              <a className="rounded-xl px-3 py-2 hover:bg-white/5" href="#catalogo">▦ Categorie</a>
              <a className="rounded-xl px-3 py-2 hover:bg-white/5" href="#catalogo">⌕ Cerca prodotti</a>
              <a className="rounded-xl px-3 py-2 hover:bg-white/5" href="/vendi">🕸 La mia rete</a>
              <a className="rounded-xl px-3 py-2 hover:bg-white/5" href="/vendi">♡ Preferiti</a>
              <a className="rounded-xl px-3 py-2 hover:bg-white/5" href="/vendi">♙ Profilo / Accedi</a>
            </nav>
            <div className="mt-5 rounded-xl border border-teal-800/70 bg-slate-950/50 p-3">
              <p className="text-sm font-semibold">Privati prima di tutto</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">Un mercato per dare nuova vita agli oggetti.</p>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="rs-hero mb-5 rounded-3xl border p-6 sm:p-9">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[.22em] text-teal-300">Benvenuto nel tuo mondo</p>
              <h2 className="mb-3 text-3xl font-bold sm:text-5xl">La tua rete.<br/>Il tuo mercato.</h2>
              <p className="mb-6 max-w-xl text-sm leading-6 text-slate-300">Scopri, pubblica e fai circolare ciò che ami. Il tuo flusso comincia qui.</p>
              <div className="flex flex-wrap gap-3">
                <a href="#catalogo" className="rs-button rs-button-primary rounded-xl px-5 py-3 font-bold">Esplora prodotti</a>
                <a href="/vendi" className="rs-button rounded-xl border border-teal-400/50 bg-slate-950/40 px-5 py-3 font-semibold text-teal-200">Entra nella rete</a>
              </div>
            </div>

            <div id="catalogo" className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div><p className="text-xs font-bold uppercase tracking-widest text-teal-300">RiverSpendShop</p><h2 className="mt-1 text-2xl font-bold">Prodotti nel fiume</h2><p className="text-sm text-slate-400">Novità e articoli pubblicati dalla community</p></div>
              <a href="/vendi" className="text-sm font-semibold text-teal-300 underline">Pubblica un prodotto</a>
            </div>
            {errore ? (
              <div className="rounded-xl border border-amber-700 bg-amber-950/40 p-4 text-amber-200">Il catalogo non è raggiungibile: {errore}</div>
            ) : prodottiFiltrati.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center">
                <p className="mb-2 text-lg font-semibold">{ricerca ? 'Nessun risultato trovato' : 'Ancora nessun prodotto pubblicato'}</p>
                <p className="mb-5 text-sm text-slate-400">{ricerca ? 'Prova con un’altra parola.' : 'Accedi e carica il primo articolo con le sue foto.'}</p>
                {!ricerca && <a href="/vendi" className="inline-block rounded-xl bg-teal-500 px-6 py-3 font-bold text-slate-950">Vai a Carica prodotto</a>}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {prodottiFiltrati.map((p) => (
                  <a href={`/prodotto/${encodeURIComponent(p.id)}`} key={p.id} className="rs-product-card block overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                    {p.immagini?.[0] ? <img src={p.immagini[0]} alt={p.titolo || 'Prodotto'} className="h-36 w-full object-cover sm:h-52" /> : <div className="flex h-36 items-center justify-center bg-slate-800 text-sm text-slate-500 sm:h-52">Foto non disponibile</div>}
                    <div className="p-3"><h3 className="line-clamp-2 font-semibold">{p.titolo}</h3><p className="mt-2 text-lg font-bold text-teal-300">€ {Number(p.prezzo || 0).toFixed(2)}</p><p className="text-xs text-slate-400">{p.condizione}</p><p className="mt-3 text-sm font-semibold text-teal-300">Apri prodotto →</p></div>
                  </a>
                ))}
              </div>
            )}
          </section>

          <aside className="rs-glass h-fit rounded-2xl p-4 lg:sticky lg:top-24">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-teal-300">Oltre il mercato</p>
            <h2 className="mb-3 text-xl font-bold">Ecosistema RS</h2>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
              {servizi.map(([nome, descrizione]) => <a key={nome} href="/vendi" className="rounded-xl border border-white/10 bg-slate-950/40 p-3 hover:border-teal-400/60 hover:bg-teal-400/5"><span className="block text-sm font-bold text-teal-100">{nome}</span><span className="mt-1 block text-[11px] leading-4 text-slate-400">{descrizione}</span></a>)}
            </div>
          </aside>
        </div>
        <footer className="border-t border-teal-900/50 px-4 py-6 text-center text-xs text-slate-500">RiverSpend • YOUR SHOP • YOUR FLOW</footer>
      </div>
    </main>
  );
}
