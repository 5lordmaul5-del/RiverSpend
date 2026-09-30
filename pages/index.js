'use client';

import { useEffect, useMemo, useState } from 'react';
import SplashScreen from './SplashScreen';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [prodotti, setProdotti] = useState([]);
  const [errore, setErrore] = useState('');
  const [menuCategorie, setMenuCategorie] = useState(false);
  const [menuRiverSpend, setMenuRiverSpend] = useState(false);
  const [ricerca, setRicerca] = useState('');
  const [categoriaAttiva, setCategoriaAttiva] = useState('');

  const categorie = ['AUTO','MOTO','SCOOTER','HARLEY & CUSTOM','CAMION & VEICOLI COMMERCIALI','TRATTORI & AGRICOLTURA','EDILIZIA & MACCHINE DA LAVORO','NAUTICA','NAVALE','AERONAUTICA','MILITARIA & STORIA','SPORT','ARTI MARZIALI & COMBATTIMENTO','FITNESS & PALESTRA','OUTDOOR & AVVENTURA','PESCA','INTEGRATORI','ELETTRONICA & INFORMATICA','GAMING','FOTOGRAFIA & VIDEO','MUSICA & AUDIO','ABBIGLIAMENTO','SCARPE','GIOIELLI & OROLOGI','CASA & ARREDAMENTO','CUCINA','FAI DA TE & FERRAMENTA','GIARDINO','ANIMALI','BAMBINI & GIOCATTOLI','LIBRI & CULTURA','ARTE','ANTIQUARIATO','COLLEZIONISMO','HOBBY','VIAGGI & VALIGERIA','UFFICIO & PROFESSIONALE','INDUSTRIA','ENERGIA & SMART HOME','GADGET & REGALI','SERVIZI DIGITALI','ALTRO'];

  const areeRiverSpend = [
    ['Profilo','/profilo'],
    ['RiverSpendShop','/'],
    ['RiverSpend Pay','/servizi/pay'],
    ['RiverSpend Shield','/nova-shield'],
    ['RiverSpend Box','/servizi/box'],
    ['RiverSpend Fidelity','/servizi/fidelity'],
    ['RiverSpend Park','/servizi/park'],
    ['RiverSpend Broadcast','/servizi/broadcast'],
    ['RiverSpend Experience','/servizi/experience'],
    ['RiverSpend Ecology','/servizi/ecology'],
    ['RiverSpend Oracle','/servizi/oracle'],
    ['RiverSpend Recovery','/servizi/recovery'],
    ['RiverSpend Fortress','/servizi/fortress']
  ];

  useEffect(() => {
    let attivo = true;
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category') || '';
    setCategoriaAttiva(cat);

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

  const prodottiVisibili = useMemo(() => {
    const q = ricerca.trim().toLowerCase();
    return prodotti.filter((p) => {
      const testo = [p.titolo, p.descrizione, p.condizione].filter(Boolean).join(' ').toLowerCase();
      const categoriaOk = !categoriaAttiva || testo.includes(categoriaAttiva.toLowerCase());
      const ricercaOk = !q || testo.includes(q);
      return categoriaOk && ricercaOk;
    });
  }, [prodotti, ricerca, categoriaAttiva]);

  return (
    <main className="rs-site min-h-screen bg-slate-950 text-white">
      {showSplash && <SplashScreen onEnter={() => setShowSplash(false)} />}

      <div className={`transition-opacity duration-700 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        <header className="rs-header sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 px-3 py-3">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-2">
            <button type="button" onClick={() => { setMenuCategorie(!menuCategorie); setMenuRiverSpend(false); }} aria-label="Apri categorie" aria-expanded={menuCategorie} className="rounded-xl border border-teal-800 px-3 py-2 text-xl text-teal-200">☰</button>

            <a href="/" className="min-w-0">
              <h1 className="rs-brand text-xl font-bold text-teal-400">RiverSpend<span>Shop</span></h1>
              <p className="text-[10px] text-slate-400">YOUR SHOP • YOUR FLOW</p>
            </a>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2">
                <a href="/profilo" className="rounded-xl border border-teal-800 px-2 py-2 text-xs font-bold text-teal-200">👤 Profilo</a>
                <a href="/desideri" className="rounded-xl border border-teal-800 px-2 py-2 text-xs font-bold text-teal-200">♡ Desideri</a>
              </div>
              <a href="/rete" className="rounded-xl border border-teal-800 px-2 py-2 text-xs font-bold text-teal-200">🕸️ Rete</a>
              <button type="button" onClick={() => { setMenuRiverSpend(!menuRiverSpend); setMenuCategorie(false); }} aria-expanded={menuRiverSpend} className="rounded-xl border border-teal-800 px-2 py-2 text-xs font-bold text-teal-200">RiverSpend ▾</button>
              <a href="/vendi" className="rs-button rs-button-primary rounded-full bg-teal-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-teal-400">+ Vendi</a>
            </div>
          </div>

          <div className="mx-auto mt-3 flex max-w-6xl gap-2">
            <input
              value={ricerca}
              onChange={(e) => setRicerca(e.target.value)}
              placeholder="Cerca nel RiverSpendShop…"
              aria-label="Cerca prodotti"
              className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white"
            />
            {categoriaAttiva && (
              <button type="button" onClick={() => { setCategoriaAttiva(''); window.history.replaceState({}, '', '/'); }} className="rounded-xl border border-teal-800 px-3 text-xs text-teal-200">
                {categoriaAttiva} ✕
              </button>
            )}
          </div>

          {menuCategorie && (
            <div className="absolute left-0 top-full max-h-[75vh] w-[min(88vw,360px)] overflow-y-auto rounded-br-2xl border border-teal-800 bg-slate-900 p-4 shadow-2xl">
              <div className="mb-3 flex items-center justify-between"><strong className="text-teal-200">Categorie RiverSpend</strong><button onClick={() => setMenuCategorie(false)} aria-label="Chiudi">✕</button></div>
              <div className="grid grid-cols-1 gap-1">
                {categorie.map((cat) => (
                  <a key={cat} href={`/?category=${encodeURIComponent(cat)}`} onClick={() => setMenuCategorie(false)} className="rounded-lg px-3 py-2 text-sm text-slate-100 hover:bg-teal-900">
                    {cat} <span className="float-right text-teal-300">›</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {menuRiverSpend && (
            <div className="absolute right-0 top-full max-h-[75vh] w-[min(92vw,360px)] overflow-y-auto rounded-bl-2xl border border-teal-800 bg-slate-900 p-4 shadow-2xl">
              <div className="mb-3 flex items-center justify-between"><strong className="text-teal-200">Il mondo RiverSpend</strong><button onClick={() => setMenuRiverSpend(false)} aria-label="Chiudi">✕</button></div>
              <div className="space-y-1">
                {areeRiverSpend.map(([area, href]) => (
                  <a key={area} href={href} onClick={() => setMenuRiverSpend(false)} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-100 hover:bg-teal-900">
                    <span>{area === 'RiverSpend Shield' ? '🛡️ RS Nova Shield' : area}</span>
                    <span className="text-[10px] text-teal-300">Apri →</span>
                  </a>
                ))}
              </div>
              <a href="/ecosistema" onClick={() => setMenuRiverSpend(false)} className="mt-3 block rounded-lg bg-teal-900 px-3 py-2 text-sm font-semibold text-teal-100">Tutto l’ecosistema →</a>
              <a href="/tutela" onClick={() => setMenuRiverSpend(false)} className="mt-2 block rounded-lg border border-teal-800 px-3 py-2 text-sm font-semibold text-teal-100">Tutela e assistenza →</a>
            </div>
          )}
        </header>

        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="rs-hero mb-8 rounded-3xl border border-teal-800 bg-gradient-to-br from-slate-900 to-sky-950 p-6 sm:p-10">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-teal-300">La tua esperienza sul fiume</p>
            <h2 className="mb-3 text-3xl font-bold sm:text-5xl">La tua rete. Il tuo mercato.</h2>
            <p className="mb-6 max-w-2xl text-slate-300">Scopri gli articoli pubblicati, aggiungili alla rete e metti in vendita i tuoi prodotti.</p>
            <div className="flex flex-wrap gap-3">
              <a href="/vendi" className="rs-button rs-button-primary rounded-xl px-6 py-3 font-bold text-slate-950">Carica prodotto con foto</a>
              <a href="/ecosistema" className="rounded-xl border border-teal-700 px-6 py-3 font-bold text-teal-100">Esplora ecosistema</a>
            </div>
          </div>

          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">Prodotti nel Fiume</h2>
              <p className="text-sm text-slate-400">{prodottiVisibili.length} risultati visibili nel RiverSpendShop</p>
            </div>
            <a href="/rete" className="text-sm font-semibold text-teal-300 underline">La mia rete</a>
          </div>

          {errore ? (
            <div className="rounded-xl border border-amber-700 bg-amber-950/40 p-4 text-amber-200">Il catalogo non è raggiungibile: {errore}</div>
          ) : prodottiVisibili.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center">
              <p className="mb-2 text-lg font-semibold">{prodotti.length === 0 ? 'Ancora nessun prodotto pubblicato' : 'Nessun prodotto corrisponde alla ricerca'}</p>
              <p className="mb-5 text-sm text-slate-400">{prodotti.length === 0 ? 'Accedi e carica il primo articolo con le sue foto.' : 'Cambia ricerca o categoria.'}</p>
              {prodotti.length === 0 ? <a href="/vendi" className="inline-block rounded-xl bg-teal-500 px-6 py-3 font-bold text-slate-950">Vai a Carica prodotto</a> : <button type="button" onClick={() => { setRicerca(''); setCategoriaAttiva(''); window.history.replaceState({}, '', '/'); }} className="rounded-xl border border-teal-800 px-5 py-3 font-semibold text-teal-200">Azzera filtri</button>}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {prodottiVisibili.map((p) => (
                <a href={`/prodotto/${encodeURIComponent(p.id)}`} key={p.id} className="rs-product-card block overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400">
                  {p.immagini?.[0] ? <img src={p.immagini[0]} alt={p.titolo || 'Prodotto'} className="h-40 w-full object-cover sm:h-52" /> : <div className="flex h-40 items-center justify-center bg-slate-800 text-sm text-slate-500 sm:h-52">Foto non disponibile</div>}
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

        <footer className="border-t border-slate-800 bg-slate-950 px-4 py-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div><strong className="text-lg text-teal-300">RiverSpend</strong><p className="text-xs text-slate-400">YOUR SHOP • YOUR FLOW</p></div>
            <nav aria-label="Link di servizio" className="flex flex-wrap gap-x-5 gap-y-3 text-sm">
              <a href="/ecosistema" className="text-teal-200 underline underline-offset-4">Ecosistema</a>
              <a href="/nova-shield" className="text-teal-200">RS Nova Shield</a>
              <a href="/tutela" className="text-slate-300">Tutela e assistenza</a>
              <a href="/vendi" className="text-slate-300">Vendi un prodotto</a>
              <a href="/rete" className="text-slate-300">La mia rete</a><a href="/desideri" className="text-slate-300">Desideri</a>
            </nav>
          </div>
        </footer>
      </div>
    </main>
  );
}
