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

export default function RiverSportLive() {
  const [selected, setSelected] = useState('football');
  const [query, setQuery] = useState('');
  const current = sports.find(s => s.id === selected) || sports[0];
  const filtered = useMemo(() => sports.filter(s => (s.name + ' ' + s.regions).toLowerCase().includes(query.toLowerCase())), [query]);

  return <>
    <Head>
      <title>RiverSport Live · RiverSpend</title>
      <meta name="description" content="Risultati, calendari e classifiche sportive: RiverSport Live." />
      <meta name="theme-color" content="#073b4c" />
    </Head>
    <main className="min-h-screen bg-[#eaf7f7] text-slate-800">
      <header className="flex flex-wrap items-center justify-between gap-3 bg-[#073b4c] px-4 py-3 text-white shadow">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-2xl">🌍</div>
          <div><div className="text-xl font-black tracking-wide">RiverSport Live</div><div className="text-xs text-teal-100">IL MONDO DELLO SPORT, IN DIRETTA</div></div>
        </div>
        <nav className="flex flex-wrap gap-2 text-sm">
          <Link href="/riverspace-signals" className="rounded-full border border-white/40 px-3 py-2 hover:bg-white/10">↩ Signals</Link>
          <Link href="/" className="rounded-full border border-white/40 px-3 py-2 hover:bg-white/10">RiverSpendShop</Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6 md:py-9">
        <div className="rounded-3xl bg-gradient-to-br from-[#073b4c] to-[#087e8b] p-5 text-white shadow-lg md:p-8">
          <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wider">RIVERSPEND · SPORTS</div>
          <h1 className="mt-3 text-3xl font-black md:text-4xl">Tutto lo sport. Un solo spazio.</h1>
          <p className="mt-2 max-w-2xl text-sm text-teal-50 md:text-base">Risultati, calendari e classifiche da tutto il mondo. Il calcio è la nostra prima priorità; aggiungeremo progressivamente gli altri sport in base alla copertura dei dati disponibili.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-300 px-3 py-1.5 text-xs font-bold text-emerald-950">Risultati: area gratuita</span>
            <span className="rounded-full border border-white/40 px-3 py-1.5 text-xs font-bold">Streaming: futuro Premium</span>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
          <section className="rounded-2xl bg-white p-4 shadow-sm md:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-extrabold text-[#073b4c]">🏆 Scegli uno sport</h2>
              <span className="text-xs text-slate-500">Copertura in espansione</span>
            </div>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cerca sport o area geografica…" className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-600" />
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {filtered.map(s => <button key={s.id} onClick={() => setSelected(s.id)} className={`rounded-xl border p-3 text-left transition ${selected === s.id ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-200' : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'}`}>
                <span className="text-2xl">{s.icon}</span><span className="mt-1 block text-sm font-bold">{s.name}</span>
                {s.id === 'football' && <span className="mt-1 block text-[10px] font-bold uppercase tracking-wide text-teal-700">Prima priorità</span>}
              </button>)}
            </div>
            {filtered.length === 0 && <p className="mt-4 text-sm text-slate-500">Nessuno sport trovato.</p>}
          </section>

          <aside className="space-y-4">
            <section className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="text-3xl">{current.icon}</div>
              <h2 className="mt-2 text-xl font-extrabold text-[#073b4c]">{current.name}</h2>
              <p className="mt-2 text-sm text-slate-600">{current.regions}</p>
              <div className="mt-4 border-t border-slate-100 pt-3">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Competizioni da coprire</div>
                <p className="mt-1 text-sm text-slate-700">{current.leagues}</p>
              </div>
            </section>
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="font-bold text-amber-950">📡 Dati sportivi</div>
              <p className="mt-1 text-sm text-amber-900">Il collegamento ai risultati live verrà attivato quando sarà scelto un fornitore dati con copertura e costi sostenibili. Questa pagina non mostra punteggi simulati.</p>
            </section>
          </aside>
        </div>

        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-xl font-extrabold text-[#073b4c]">📊 Risultati e classifiche</h2><p className="mt-1 text-sm text-slate-600">Area predisposta per partite in corso, risultati finali, calendario e graduatorie.</p></div>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">In attivazione</span>
          </div>
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
            <div className="text-3xl">⏱️</div>
            <p className="mt-2 font-bold text-slate-700">Risultati ufficiali non ancora collegati</p>
            <p className="mx-auto mt-1 max-w-xl text-sm text-slate-500">Quando collegheremo il servizio dati, qui appariranno gli eventi live e i risultati verificati, con orari locali, punteggi e stato della gara.</p>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-[#073b4c] p-5 text-white">
            <div className="text-2xl">📺</div><h2 className="mt-2 text-lg font-extrabold">RiverSport Premium</h2>
            <p className="mt-1 text-sm text-teal-50">Spazio riservato al futuro streaming sportivo a pagamento, per eventi che RiverSpend sarà autorizzata a distribuire.</p>
            <span className="mt-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold">Progetto futuro · Diritti necessari</span>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="text-2xl">🔐</div><h2 className="mt-2 text-lg font-extrabold text-[#073b4c]">Accesso e pagamenti</h2>
            <p className="mt-1 text-sm text-slate-600">In futuro: abbonamenti, acquisto del singolo evento e pagamenti tramite sistemi RiverSpend autorizzati. Nessun acquisto è attivo in questa fase.</p>
          </div>
        </section>
        <footer className="py-8 text-center text-xs text-slate-500">RiverSport Live · YOUR SHOP • YOUR FLOW · RiverSpend</footer>
      </section>
    </main>
  </>;
}
