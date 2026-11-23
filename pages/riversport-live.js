import Head from 'next/head';
import Link from 'next/link';
import RiverWorldNews from '../components/RiverWorldNews';
import RiverWorldWeather from '../components/RiverWorldWeather';
import RiverWorldAlerts from '../components/RiverWorldAlerts';
import RiverWorldTopicFeed from '../components/RiverWorldTopicFeed';
import { useMemo, useState } from 'react';

const sports = [
  { id: 'martial-arts', name: 'Arti marziali', icon: '🥋', regions: 'Asia · Europa · Americhe · Africa · Mondo', leagues: 'Taekwondo, Judo, Karate, kickboxing, Muay Thai, MMA, lotta, sumo, discipline tradizionali e arti samurai' },
  { id: 'tennis', name: 'Tennis', icon: '🎾', regions: 'Mondo', leagues: 'ATP, WTA, Slam, tornei e tennis in carrozzina' },
  { id: 'basket', name: 'Basket', icon: '🏀', regions: 'Mondo', leagues: 'NBA, WNBA, EuroLeague, 3x3 e campionati nazionali' },
  { id: 'swimming', name: 'Nuoto e tuffi', icon: '🏊', regions: 'Mondo', leagues: 'Nuoto in vasca e acque libere, tuffi, nuoto artistico e pallanuoto' },
  { id: 'cycling', name: 'Ciclismo e MTB', icon: '🚵', regions: 'Mondo', leagues: 'Strada, pista, BMX, mountain bike, downhill, gravel e ciclocross' },
  { id: 'climbing', name: 'Arrampicata', icon: '🧗', regions: 'Mondo', leagues: 'Lead, boulder, speed, arrampicata outdoor e competizioni' },
  { id: 'baseball', name: 'Baseball e softball', icon: '⚾', regions: 'Americhe · Asia · Mondo', leagues: 'MLB, campionati asiatici, softball e tornei internazionali' },
  { id: 'football', name: 'Calcio', icon: '⚽', regions: 'Italia · Europa · Americhe · Asia · Africa · Mondo', leagues: 'Serie A, campionati nazionali, coppe e tornei internazionali' },
  { id: 'motorsport', name: 'Motori', icon: '🏎️', regions: 'Mondo', leagues: 'Formula 1, MotoGP, Superbike, rally, endurance e kart' },
  { id: 'athletics', name: 'Atletica', icon: '🏃', regions: 'Mondo', leagues: 'Velocità, mezzofondo, maratona, salti, lanci e marcia' },
  { id: 'volleyball', name: 'Pallavolo', icon: '🏐', regions: 'Mondo', leagues: 'Indoor, beach volley e sitting volley' },
  { id: 'rugby', name: 'Rugby', icon: '🏉', regions: 'Mondo', leagues: 'Rugby union, rugby league e sevens' },
  { id: 'american-football', name: 'Football americano', icon: '🏈', regions: 'Americhe · Europa', leagues: 'NFL, college football e campionati internazionali' },
  { id: 'cricket', name: 'Cricket', icon: '🏏', regions: 'Asia · Oceania · Europa · Mondo', leagues: 'Test, ODI, T20 e tornei internazionali' },
  { id: 'golf', name: 'Golf', icon: '⛳', regions: 'Mondo', leagues: 'Tour internazionali, major e classifiche' },
  { id: 'badminton', name: 'Badminton', icon: '🏸', regions: 'Mondo', leagues: 'Circuiti BWF e tornei internazionali' },
  { id: 'table-tennis', name: 'Tennis tavolo', icon: '🏓', regions: 'Mondo', leagues: 'WTT, campionati e tornei' },
  { id: 'gymnastics', name: 'Ginnastica', icon: '🤸', regions: 'Mondo', leagues: 'Artistica, ritmica, trampolino e aerobica' },
  { id: 'winter', name: 'Sport invernali', icon: '⛷️', regions: 'Mondo', leagues: 'Sci alpino, fondo, biathlon, snowboard, pattinaggio e hockey' },
  { id: 'rowing', name: 'Canottaggio e vela', icon: '🚣', regions: 'Mondo', leagues: 'Canottaggio, canoa, kayak, vela e surf' },
  { id: 'equestrian', name: 'Sport equestri', icon: '🐎', regions: 'Mondo', leagues: 'Salto ostacoli, dressage, completo e endurance' },
  { id: 'other', name: 'Altri sport', icon: '🌍', regions: 'Mondo', leagues: 'Hockey, scherma, tiro con l’arco, pattinaggio, triathlon, squash e sport paralimpici' },
];

const channels = [
  { id:'meteo', name:'Meteo', icon:'🌦️', description:'Previsioni, temperature, mappe, allerte meteo e condizioni in tempo reale.', coverage:'Italia e mondo', status:'Previsioni globali collegate a MET Norway; allerte ufficiali da ampliare per Paese' },
  { id:'news', name:'Notizie', icon:'📰', description:'Attualità, politica, economia, cronaca, esteri e aggiornamenti verificati.', coverage:'Italia · Europa · Asia · Americhe · Africa · Mondo', status:'Ricerca internazionale collegata; copertura dipendente dalle fonti indicizzate' },
  { id:'sport', name:'Sport Live', icon:'🏆', description:'Risultati, calendari, classifiche e statistiche. Tutte le discipline: arti marziali, tennis, nuoto, ciclismo, arrampicata e molto altro.', coverage:'Competizioni nazionali e internazionali', status:'Notizie sportive internazionali collegate; risultati e classifiche live richiedono un provider sportivo' },
  { id:'traffico', name:'Traffico e viaggi', icon:'🚦', description:'Traffico, trasporti pubblici, treni, voli, viabilità e condizioni stradali.', coverage:'Italia e destinazioni internazionali', status:'Servizi di mobilità e mappe da collegare' },
  { id:'allerte', name:'Allerte e sicurezza', icon:'🚨', description:'Avvisi ufficiali su meteo estremo, terremoti, incendi, emergenze e protezione civile.', coverage:'Avvisi locali, nazionali e internazionali', status:'Feed sismico USGS collegato; allerte meteo e protezione civile da integrare per area' },
  { id:'eventi', name:'Eventi e concerti', icon:'🎟️', description:'Concerti, festival, fiere, mostre, spettacoli, manifestazioni e appuntamenti locali.', coverage:'Città e Paesi di tutto il mondo', status:'Calendari eventi e biglietterie autorizzate da collegare' },
  { id:'cinema', name:'Cinema', icon:'🎬', description:'Uscite, trailer, recensioni, festival, premi e programmazione nelle sale.', coverage:'Cinema italiano e internazionale', status:'Ricerca di notizie su cinema e film collegata; streaming e cataloghi video richiedono licenze' },
  { id:'tv', name:'TV e programmi', icon:'📺', description:'Palinsesti, guide TV, programmi, serie, documentari e notizie dal mondo televisivo.', coverage:'Canali e palinsesti disponibili per Paese', status:'Guide TV e collegamenti ufficiali da configurare' },
  { id:'cartoni', name:'Cartoni e animazione', icon:'🧸', description:'Cartoni animati, anime, animazione per bambini, novità e programmazione per famiglie.', coverage:'Produzioni italiane, europee, giapponesi e internazionali', status:'Streaming solo con cataloghi e diritti autorizzati' },
  { id:'moda', name:'Moda e tendenze', icon:'👗', description:'Sfilate, collezioni, stilisti, streetwear, beauty, accessori e tendenze.', coverage:'Milano · Parigi · Londra · New York · Asia · Mondo', status:'Ricerca internazionale di moda e fashion collegata; calendari e immagini editoriali da ampliare' },
  { id:'musica', name:'Musica', icon:'🎵', description:'Novità musicali, classifiche, artisti, concerti, festival e sessioni dal vivo.', coverage:'Scene musicali di tutto il mondo', status:'Audio e video tramite servizi e diritti autorizzati' },
  { id:'tecnologia', name:'Tecnologia e scienza', icon:'🔬', description:'Innovazione, intelligenza artificiale, spazio, ricerca, ambiente e nuove tecnologie.', coverage:'Ricerca e innovazione internazionali', status:'Fonti scientifiche e tecnologiche da selezionare' },
  { id:'cultura', name:'Cultura e libri', icon:'📚', description:'Libri, arte, musei, mostre, storia, teatro e divulgazione.', coverage:'Italia e mondo', status:'Guide culturali e calendari da collegare' },
  { id:'viaggi', name:'Viaggi e luoghi', icon:'✈️', description:'Destinazioni, turismo, guide, curiosità, condizioni locali e idee di viaggio.', coverage:'Tutto il mondo', status:'Informazioni territoriali e servizi viaggio da collegare' },
  { id:'economia', name:'Economia e mercati', icon:'💹', description:'Economia, imprese, mercati, valute e aggiornamenti finanziari.', coverage:'Mercati internazionali', status:'Dati di mercato da fornitori autorizzati; non è consulenza finanziaria' },
];

export default function RiverWorldLive() {
  const [selected, setSelected] = useState('meteo');
  const [query, setQuery] = useState('');
  const [sportSelected, setSportSelected] = useState('martial-arts');
  const current = channels.find(c => c.id === selected) || channels[0];
  const currentSport = sports.find(s => s.id === sportSelected) || sports[0];
  const filtered = useMemo(() => channels.filter(c => (c.name + ' ' + c.description + ' ' + c.coverage).toLowerCase().includes(query.toLowerCase())), [query]);
  const sportFiltered = useMemo(() => sports.filter(s => (s.name + ' ' + s.regions + ' ' + s.leagues).toLowerCase().includes(query.toLowerCase())), [query]);

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
        {selected === 'meteo' && <RiverWorldWeather />}
        {selected === 'news' && <RiverWorldNews />}
        {selected === 'allerte' && <RiverWorldAlerts />}
        {selected === 'cinema' && <RiverWorldTopicFeed section="cinema" />}
        {selected === 'moda' && <RiverWorldTopicFeed section="moda" />}
        {selected === 'musica' && <RiverWorldTopicFeed section="spettacolo" />}
        {selected === 'sport' && <RiverWorldTopicFeed section="sport" />}
        {selected === 'arti-marziali' && <RiverWorldTopicFeed section="arti-marziali" />}
        {selected === 'sport' && <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-extrabold text-[#073b4c]">🏆 RiverSport Live</h2><span className="text-xs text-slate-500">Multisport mondiale · tutte le discipline</span></div>
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
