'use client';

import { useEffect, useMemo, useState } from 'react';
import SplashScreen from './SplashScreen';

const LANGUAGES = [
  ['it', '🇮🇹 Italiano'], ['en', '🇬🇧 English'], ['es', '🇪🇸 Español'], ['fr', '🇫🇷 Français'],
  ['de', '🇩🇪 Deutsch'], ['pt', '🇵🇹 Português'], ['ar', '🇸🇦 العربية'], ['zh', '🇨🇳 中文'],
  ['ja', '🇯🇵 日本語'], ['hi', '🇮🇳 हिन्दी'], ['ru', '🇷🇺 Русский'], ['bn', '🇧🇩 বাংলা'],
  ['ur', '🇵🇰 اردو'], ['tr', '🇹🇷 Türkçe'], ['ko', '🇰🇷 한국어'], ['nl', '🇳🇱 Nederlands'],
  ['pl', '🇵🇱 Polski'], ['uk', '🇺🇦 Українська'], ['vi', '🇻🇳 Tiếng Việt'], ['th', '🇹🇭 ไทย'],
  ['id', '🇮🇩 Bahasa Indonesia'], ['ms', '🇲🇾 Bahasa Melayu'], ['fa', '🇮🇷 فارسی'], ['he', '🇮🇱 עברית'],
  ['ro', '🇷🇴 Română'], ['el', '🇬🇷 Ελληνικά'], ['sv', '🇸🇪 Svenska'], ['da', '🇩🇰 Dansk'],
  ['no', '🇳🇴 Norsk'], ['fi', '🇫🇮 Suomi'], ['cs', '🇨🇿 Čeština'], ['hu', '🇭🇺 Magyar'],
  ['sw', '🇰🇪 Kiswahili'], ['fil', '🇵🇭 Filipino']
];

function LanguageSelector() {
  const [language, setLanguage] = useState('it');
  useEffect(() => {
    let saved = '';
    try { saved = localStorage.getItem('riverspend-language') || ''; } catch {}
    const browserCode = (navigator.language || 'it').toLowerCase().split('-')[0];
    const initial = LANGUAGES.some(([code]) => code === saved) ? saved :
      (LANGUAGES.some(([code]) => code === browserCode) ? browserCode : 'en');
    setLanguage(initial);
    document.documentElement.lang = initial;
  }, []);
  function changeLanguage(event) {
    const next = event.target.value;
    setLanguage(next);
    document.documentElement.lang = next;
    try { localStorage.setItem('riverspend-language', next); } catch {}
    window.dispatchEvent(new CustomEvent('riverspend:language-change', { detail: { language: next } }));
  }
  return (
    <select value={language} onChange={changeLanguage} aria-label="Scegli la lingua"
      className="max-w-[112px] rounded-full border border-teal-700 bg-slate-900 px-2 py-1.5 text-xs font-semibold text-teal-100">
      {LANGUAGES.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
    </select>
  );
}

export default function Home() {
  const [showSplash, setShowSplash] = useState(false);
  const [prodotti, setProdotti] = useState([]);
  const [errore, setErrore] = useState('');
  const [menuCategorie, setMenuCategorie] = useState(false);
  const [menuRiverSpend, setMenuRiverSpend] = useState(false);
  const [ricerca, setRicerca] = useState('');
  const [categoriaAttiva, setCategoriaAttiva] = useState('');

  const categorie = [
    'AUTO & VEICOLI','Auto','Moto','Scooter','Harley & Custom','Camion & Veicoli commerciali','Trattori & Agricoltura','Edilizia & Macchine da lavoro','Ricambi & Accessori auto','Ricambi & Accessori moto',
    'NAUTICA & TRASPORTI','Nautica','Navale','Barche & Gommoni','Motori marini','Aeronautica','Militaria & Storia',
    'SPORT & BENESSERE','Sport','Arti marziali & Combattimento','Fitness & Palestra','Outdoor & Avventura','Pesca','Caccia & Accessori consentiti','Integratori',
    'TECNOLOGIA','Elettronica & Informatica','Smartphone & Telefonia','Computer & Notebook','Gaming','Console & Videogiochi','Fotografia & Video','Musica & Audio','TV & Home cinema',
    'MODA & ACCESSORI','Abbigliamento','Scarpe','Borse & Accessori','Gioielli & Orologi','Bellezza & Cura personale',
    'CASA & VITA','Casa & Arredamento','Cucina','Elettrodomestici','Fai da te & Ferramenta','Giardino','Illuminazione','Tessile casa',
    'FAMIGLIA & ANIMALI','Animali','Bambini & Giocattoli','Prima infanzia',
    'CULTURA & TEMPO LIBERO','Libri & Cultura','Arte','Antiquariato','Collezionismo','Hobby & Modellismo','Viaggi & Valigeria',
    'LAVORO & IMPRESA','Ufficio & Professionale','Industria','Attrezzature professionali','Energia & Smart Home','Servizi digitali',
    'COLLEZIONI & REGALI','Gadget & Regali','Vintage & Second hand','Altro'
  ];

  const areeRiverSpend = [
    ['Profilo','/profilo'],
    ['RiverSpendShop','/'],
    ['RS Shield','/nova-shield'],
    ['RS Fidelity','/servizi/fidelity'],
    ['RS Nova Shield','/nova-shield'],
    ['RS Local','/servizi/local'],
    ['RiverSpend Pay','/servizi/pay'],
    ['RiverSpend Box','/servizi/box'],
    ['RiverSpend Park','/park'],
    ['RiverSpend Broadcast','/servizi/broadcast'],
    ['RiverSpend TV','/servizi/tv'],
    ['RiverSpend Experience','/servizi/experience'],
    ['RiverSpend Ecology','/servizi/ecology'],
    ['RiverSpend Oracle','/servizi/oracle'],
    ['RiverSpend Recovery','/servizi/recovery'],
    ['RiverSpend Fortress','/servizi/fortress'],
    ['RiverSpend SurroundSpaceAroundExperience','/servizi/experience']
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
      const testo = [p.titolo, p.descrizione, p.condizione, p.categoria].filter(Boolean).join(' ').toLowerCase();
      const categoriaOk = !categoriaAttiva || (p.categoria || '').toLowerCase() === categoriaAttiva.toLowerCase() || testo.includes(categoriaAttiva.toLowerCase());
      const ricercaOk = !q || testo.includes(q);
      return categoriaOk && ricercaOk;
    });
  }, [prodotti, ricerca, categoriaAttiva]);

  return (
    <main className="rs-site min-h-screen bg-slate-950 text-white">
      {showSplash && <SplashScreen onEnter={() => { try { sessionStorage.setItem('rs-opening-seen', '1'); } catch {} setShowSplash(false); }} />}

      <div className={`transition-opacity duration-700 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        <header className="rs-header sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 px-3 py-3">
          <div className="mx-auto max-w-6xl">
            <div className="flex justify-center">
              <a href="/" aria-label="RiverSpendShop, pagina iniziale" className="inline-flex flex-col items-center rounded-2xl border border-teal-800/80 bg-slate-900/70 px-6 py-2 shadow-lg shadow-teal-950/30">
                <h1 className="rs-brand text-2xl font-extrabold leading-tight text-teal-400">RiverSpend</h1>
                <span className="text-sm font-semibold italic text-amber-300">Shop</span>
                <p className="mt-1 text-[9px] tracking-wide text-slate-400">YOUR SHOP • YOUR FLOW</p>
              </a>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <button type="button" onClick={() => { setMenuCategorie(!menuCategorie); setMenuRiverSpend(false); }} aria-label="Apri categorie" aria-expanded={menuCategorie} className="rounded-xl border border-teal-800 px-3 py-2 text-xl text-teal-200">☰</button>
              <a href="/rete" className="rounded-xl border border-teal-800 px-3 py-2 text-sm font-bold text-teal-200">🕸️ Rete</a>
              <button type="button" onClick={() => { setMenuRiverSpend(!menuRiverSpend); setMenuCategorie(false); }} aria-expanded={menuRiverSpend} className="rounded-xl border border-teal-800 px-3 py-2 text-sm font-bold text-teal-200">RiverSpend ▾</button>
              <a href="/vendi" className="rs-button rs-button-primary rounded-full bg-teal-500 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-teal-400">+ Vendi</a>
            </div>
            <div className="mt-2 flex items-center justify-end gap-3 text-xs">
              <a href="/profilo" className="text-teal-200">👤 Profilo</a>
              <a href="/desideri" className="text-teal-200">♡ Desideri</a>
              <LanguageSelector />
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
          <div className="rs-hero mb-5 rounded-2xl border border-teal-800 bg-gradient-to-br from-slate-900 to-sky-950 px-5 py-4 sm:px-7 sm:py-5">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-teal-300 sm:text-xs">La tua esperienza sul fiume</p>
            <h2 className="mb-2 text-2xl font-bold sm:text-3xl">La tua rete. Il tuo mercato.</h2>
            <p className="mb-3 max-w-2xl text-sm leading-5 text-slate-300 sm:text-base">Scopri gli articoli pubblicati, aggiungili alla rete e metti in vendita i tuoi prodotti.</p>
            <div className="flex flex-wrap gap-3">
              <a href="/vendi" className="rs-button rs-button-primary rounded-xl px-4 py-2.5 text-sm font-bold text-slate-950">Carica prodotto con foto</a>
              <a href="/ecosistema" className="rounded-xl border border-teal-700 px-4 py-2.5 text-sm font-bold text-teal-100">Esplora ecosistema</a>
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
                  {p.immagini?.[0] ? <div className="flex h-40 w-full items-center justify-center overflow-hidden bg-white p-2 sm:h-52 sm:p-3"><img src={p.immagini[0]} alt={p.titolo || 'Prodotto'} className="h-full w-full object-contain" /></div> : <div className="flex h-40 items-center justify-center bg-white text-sm text-slate-500 sm:h-52">Foto non disponibile</div>}
                  <div className="p-3">
                    <h3 className="line-clamp-2 font-semibold">{p.titolo}</h3>
                    <p className="mt-2 text-lg font-bold text-teal-300">€ {Number(p.prezzo || 0).toFixed(2)}</p>
                    <p className="text-xs text-slate-400">{p.categoria || 'Altro'} · {p.condizione}</p>
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
