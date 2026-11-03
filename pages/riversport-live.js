import Head from 'next/head';
import Link from 'next/link';
import { useMemo, useState } from 'react';

const sports = [
  { id: 'football', name: 'Calcio', icon: '⚽', regions: 'Italia · Europa · Americhe · Asia · Africa · Mondo', priority: 'Priorità principale', leagues: 'Serie A, Serie B, coppe europee, campionati nazionali e tornei internazionali' },
  { id: 'basket', name: 'Basket', icon: '🏀', regions: 'Europa · Stati Uniti · Asia · Mondo', leagues: 'NBA, EuroLeague e competizioni nazionali e internazionali' },
  { id: 'tennis', name: 'Tennis', icon: '🎾', regions: 'Mondo', leagues: 'ATP, WTA, Slam e tornei internazionali' },
  { id: 'rugby', name: 'Rugby', icon: '🏉', regions: 'Europa · Oceania · Americhe · Mondo', leagues: 'Tornei internazionali e campionati' },
  { id: 'american-football', name: 'Football americano', icon: '🏈', regions: 'Stati Uniti · Europa', leagues: 'NFL e competizioni disponibili' },
  { id: 'cricket', name: 'Cricket', icon: '🏏', regions: 'Asia · Oceania · Regno Unito · Mondo', leagues: 'India, Pakistan, Australia, Inghilterra e tornei internazionali' },
  { id: 'golf', name: 'Golf', icon: '⛳', regions: 'Mondo', leagues: 'Tour internazionali, tornei e classifiche' },
  { id: 'combat', name: 'Combattimento', icon: '🥋', regions: 'Mondo', leagues: 'Taekwondo, kickboxing, boxe e arti marziali' },
  { id: 'volleyball', name: 'Pallavolo', icon: '🏐', regions: 'Europa · Asia · Americhe · Mondo', leagues: 'Campionati e tornei internazionali' },
  { id: 'motorsport', name: 'Motori', icon: '🏎️', regions: 'Mondo', leagues: 'Formula 1, MotoGP e competizioni motoristiche' },
  { id: 'baseball', name: 'Baseball', icon: '⚾', regions: 'Americhe · Asia · Mondo', leagues: 'MLB, campionati asiatici e tornei internazionali' },
  { id: 'badminton', name: 'Badminton', icon: '🏸', regions: 'Asia · Europa · Mondo', leagues: 'Circuiti e tornei internazionali' },
];

const channels = [
  { id:'meteo', name:'Meteo', icon:'🌦️', description:'Previsioni, temperature, mappe, allerte meteo e condizioni in tempo reale.', coverage:'Italia e mondo', status:'Dati da collegare a servizi meteorologici affidabili' },
  { id:'news', name:'Notizie', icon:'📰', description:'Attualità, politica, economia, cronaca, esteri e aggiornamenti verificati.', coverage:'Italia · Europa · Asia · Americhe · Africa · Mondo', status:'Feed editoriali e fonti giornalistiche da configurare' },
  { id:'sport', name:'Sport Live', icon:'🏆', description:'Risultati, calendari, classifiche e statistiche. Calcio come prima priorità, poi gli altri sport.', coverage:'Competizioni nazionali e internazionali', status:'Catalogo sportivo predisposto; collegamento dati live da attivare' },
  { id:'traffico', name:'Traffico e viaggi', icon:'🚦', description:'Traffico, trasporti pubblici, treni, voli, viabilità e condizioni stradali.', coverage:'Italia e destinazioni internazionali', status:'Servizi di mobilità e mappe da collegare' },
  { id:'allerte', name:'Allerte e sicurezza', icon:'🚨', description:'Avvisi ufficiali su meteo estremo, terremoti, incendi, emergenze e protezione civile.', coverage:'Avvisi locali, nazionali e internazionali', status:'Priorità alle fonti ufficiali e agli avvisi verificati' },
  { id:'eventi', name:'Eventi e concerti', icon:'🎟️', description:'Concerti, festival, fiere, mostre, spettacoli, manifestazioni e appuntamenti locali.', coverage:'Città e Paesi di tutto il mondo', status:'Calendari eventi e biglietterie autorizzate da collegare' },
  { id:'cinema', name:'Cinema', icon:'🎬', description:'Uscite, trailer, recensioni, festival, premi e programmazione nelle sale.', coverage:'Cinema italiano e internazionale', status:'Cataloghi e contenuti video con licenze appropriate' },
  { id:'tv', name:'TV e programmi', icon:'📺', description:'Palinsesti, guide TV, programmi, serie, documentari e notizie dal mondo televisivo.', coverage:'Canali e palinsesti disponibili per Paese', status:'Guide TV e collegamenti ufficiali da configurare' },
  { id:'cartoni', name:'Cartoni e animazione', icon:'🧸', description:'Cartoni animati, anime, animazione per bambini, novità e programmazione per famiglie.', coverage:'Produzioni italiane, europee, giapponesi e internazionali', status:'Streaming solo con cataloghi e diritti autorizzati' },
  { id:'moda', name:'Moda e tendenze', icon:'👗', description:'Sfilate, collezioni, stilisti, streetwear, beauty, accessori e tendenze.', coverage:'Milano · Parigi · Londra · New York · Asia · Mondo', status:'Notizie, calendari e contenuti moda da collegare' },
  { id:'musica', name:'Musica', icon:'🎵', description:'Novità musicali, classifiche, artisti, concerti, festival e sessioni dal vivo.', coverage:'Scene musicali di tutto il mondo', status:'Audio e video tramite servizi e diritti autorizzati' },
  { id:'tecnologia', name:'Tecnologia e scienza', icon:'🔬', description:'Innovazione, intelligenza artificiale, spazio, ricerca, ambiente e nuove tecnologie.', coverage:'Ricerca e innovazione internazionali', status:'Fonti scientifiche e tecnologiche da selezionare' },
  { id:'cultura', name:'Cultura e libri', icon:'📚', description:'Libri, arte, musei, mostre, storia, teatro e divulgazione.', coverage:'Italia e mondo', status:'Guide culturali e calendari da collegare' },
  { id:'viaggi', name:'Viaggi e luoghi', icon:'✈️', description:'Destinazioni, turismo, guide, curiosità, condizioni locali e idee di viaggio.', coverage:'Tutto il mondo', status:'Informazioni territoriali e servizi viaggio da collegare' },
  { id:'economia', name:'Economia e mercati', icon:'💹', description:'Economia, imprese, mercati, valute e aggiornamenti finanziari.', coverage:'Mercati internazionali', status:'Dati di mercato da fornitori autorizzati; non è consulenza finanziaria' },
];

export default function RiverWorldLive() {
  const [selected, setSelected] = useState('meteo');
  const [query, setQuery] = useState('');
  const [sportSelected, setSportSelected] = useState('football');
  const current = channels.find(c => c.id === selected) || channels[0];
  const currentSport = sports.find(s => s.id === sportSelected) || sports[0];
  const filtered = useMemo(() => channels.filter(c => (c.name + ' ' + c.description + ' ' + c.coverage).toLowerCase().includes(query.toLowerCase())), [query]);
  const sportFiltered = useMemo(() => sports.filter(s => (s.name + ' ' + s.regions).toLowerCase().includes(query.toLowerCase())), [query]);

  return <>
    <Head><title>RiverWorld Live · RiverSpend</title><meta name="description" content="Meteo, notizie, sport, cinema, TV, cartoni, moda, eventi e informazioni dal mondo: RiverWorld Live." /><meta name="theme-color" content="#073b4c" /></Head>
    <main className="min-h-screen bg-[#eaf7f7] text-slate-800">
      <header className="flex flex-wrap items-center justify-between gap-3 bg-[#073b4c] px-4 py-3 text-white shadow">
        <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-2xl">🌍</div><div><div className="text-xl font-black tracking-wide">RiverWorld Live</div><div className="text-xs text-teal-100">IL MONDO, SEMPRE AGGIORNATO</div></div></div>
        <nav className="flex flex-wrap gap-2 text-sm"><Link href="/riverspace-signals" className="rounded-full border border-white/40 px-3 py-2 hover:bg-white/10">↩ Signals</Link><Link href="/" className="rounded-full border border-white/40 px-3 py-2 hover:bg-white/10">RiverSpendShop</Link></nav>
      </header>
      <section className="mx-auto max-w-6xl px-4 py-6 md:py-9">
        <div className="rounded-3xl bg-gradient-to-br from-[#073b4c] to-[#087e8b] p-5 text-white shadow-lg md:p-8">
          <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wider">RIVERSPEND · WORLD HUB</div>
          <h1 className="mt-3 text-3xl font-black md:text-4xl">Il mondo, in un solo spazio.</h1>
          <p className="mt-2 max-w-2xl text-sm text-teal-50 md:text-base">Meteo, notizie, sport, cinema, TV, cartoni, moda, musica, eventi e molto altro. Un portale unico che crescerà insieme a RiverSpend TV e RiverSpend Streaming.</p>
          <div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full bg-emerald-300 px-3 py-1.5 text-xs font-bold text-emerald-950">Informazione e risultati gratuiti</span><span className="rounded-full border border-white/40 px-3 py-1.5 text-xs font-bold">Streaming Premium futuro</span></div>
        </div>
        <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-extrabold text-[#073b4c]">Esplora RiverWorld</h2><span className="text-xs text-slate-500">{channels.length} aree tematiche</span></div>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cerca meteo, notizie, cinema, moda, sport…" className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-600" />
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">{filtered.map(c => <button key={c.id} onClick={() => setSelected(c.id)} className={`rounded-xl border p-3 text-left transition ${selected === c.id ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-200' : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'}`}><span className="text-2xl">{c.icon}</span><span className="mt-1 block text-sm font-bold">{c.name}</span></button>)}</div>
          {filtered.length === 0 && <p className="mt-4 text-sm text-slate-500">Nessuna sezione trovata.</p>}
        </section>
        <section className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
          <div className="rounded-2xl bg-white p-5 shadow-sm md:p-6"><div className="text-4xl">{current.icon}</div><h2 className="mt-2 text-2xl font-extrabold text-[#073b4c]">{current.name}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{current.description}</p><div className="mt-4 border-t border-slate-100 pt-3"><div className="text-xs font-bold uppercase tracking-wide text-slate-400">Copertura</div><p className="mt-1 text-sm text-slate-700">{current.coverage}</p></div></div>
          <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><div className="font-bold text-amber-950">📡 Stato dei collegamenti</div><p className="mt-2 text-sm text-amber-900">{current.status}. I contenuti in diretta saranno mostrati solo quando collegati a fonti affidabili e autorizzate.</p><div className="mt-4 rounded-xl bg-white/70 p-3 text-xs text-amber-950">Nessun dato inventato, nessuna diretta simulata e nessun contenuto protetto trasmesso senza licenza.</div></aside>
        </section>
        {selected === 'sport' && <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-extrabold text-[#073b4c]">🏆 RiverSport Live</h2><span className="text-xs text-slate-500">Calcio: prima priorità</span></div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">{sportFiltered.map(s => <button key={s.id} onClick={() => setSportSelected(s.id)} className={`rounded-xl border p-3 text-left ${sportSelected === s.id ? 'border-teal-600 bg-teal-50' : 'border-slate-200 hover:bg-slate-50'}`}><span className="text-xl">{s.icon}</span><span className="mt-1 block text-sm font-bold">{s.name}</span></button>)}</div>
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4"><div className="font-bold text-slate-800">{currentSport.icon} {currentSport.name}</div><p className="mt-1 text-sm text-slate-600">{currentSport.regions}</p><p className="mt-2 text-sm text-slate-600">{currentSport.leagues}</p><p className="mt-3 text-xs font-semibold text-slate-500">Risultati e classifiche ufficiali saranno attivati con un fornitore dati sportivi. Nessun punteggio simulato.</p></div>
        </section>}
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-[#073b4c] p-5 text-white"><div className="text-2xl">📺</div><h2 className="mt-2 text-lg font-extrabold">RiverSpend TV & Streaming</h2><p className="mt-1 text-sm text-teal-50">Spazio futuro per canali, film, serie, cartoni, concerti ed eventi live, con contenuti propri o distribuiti con licenze e diritti regolari.</p><span className="mt-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold">Progetto futuro · Diritti necessari</span></div>
          <div className="rounded-2xl bg-white p-5 shadow-sm"><div className="text-2xl">🔐</div><h2 className="mt-2 text-lg font-extrabold text-[#073b4c]">Accesso e Premium</h2><p className="mt-1 text-sm text-slate-600">In futuro: abbonamenti o acquisto del singolo evento per contenuti che RiverSpend sarà autorizzata a distribuire. Nessun acquisto è attivo in questa fase.</p></div>
        </section>
        <footer className="py-8 text-center text-xs text-slate-500">RiverWorld Live · YOUR SHOP • YOUR FLOW · RiverSpend</footer>
      </section>
    </main>
  </>;
}
