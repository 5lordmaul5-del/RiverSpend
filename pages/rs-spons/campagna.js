import { useMemo, useState } from 'react';

const PLACEMENTS = [
  { id: 'local', label: '📍 RS Local', description: 'Negozi, servizi e attività vicino al pubblico.' },
  { id: 'shop', label: '🛍️ RiverSpendShop', description: 'Prodotti, vetrine e annunci del marketplace.' },
  { id: 'streaming', label: '▶️ RSStreaming', description: 'Spazi pubblicitari nei contenuti video/audio, se disponibili.' },
  { id: 'music', label: '🎵 RSSpons Music Promotion', description: 'Promozione di singoli, album e videoclip.' },
  { id: 'homepage', label: '🏠 Homepage RiverSpend', description: 'Banner in evidenza sulla pagina principale.' },
];
const AREAS = [
  { id: 'local', label: 'Locale · città e dintorni', factor: 1 },
  { id: 'regional', label: 'Regionale · una o più regioni', factor: 2 },
  { id: 'national', label: 'Nazionale · Italia', factor: 4 },
  { id: 'international', label: 'Internazionale · Paesi selezionati', factor: 5 },
  { id: 'world', label: 'Mondiale · tutti i Paesi raggiungibili', factor: 8 },
];
const DURATIONS = [1, 2, 3, 7, 15, 30];
const DAILY_BASE = { local: 2.9, regional: 4.3, national: 11.42, international: 14.28, world: 42.85 };

export default function RsSponsCampaign() {
  const [placement, setPlacement] = useState('local');
  const [area, setArea] = useState('local');
  const [duration, setDuration] = useState(1);
  const [radius, setRadius] = useState(10);
  const [country, setCountry] = useState('Italia');
  const [budget, setBudget] = useState('20');
  const [campaignName, setCampaignName] = useState('');
  const [goal, setGoal] = useState('visibilità');
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [preview, setPreview] = useState(false);

  const estimate = useMemo(() => {
    const base = (DAILY_BASE[area] || DAILY_BASE.local) * Number(duration);
    const placementFactor = placement === 'homepage' ? 1.5 : placement === 'streaming' ? 1.25 : placement === 'music' ? 1.15 : placement === 'shop' ? 1.05 : 1;
    const radiusFactor = area === 'local' ? ({ 5: 0.8, 10: 1, 25: 1.3, 50: 1.6 }[radius] || 1) : 1;
    return Math.max(2.9, Math.round(base * placementFactor * radiusFactor * 100) / 100);
  }, [area, duration, placement, radius]);
  const money = value => value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });

  function createPreview(event) {
    event.preventDefault();
    setPreview(true);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-cyan-100 via-sky-50 to-white px-4 py-7 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <a href="/rs-spons" className="text-sm font-bold text-cyan-800">← Torna a RS Spons</a>
        <header className="mt-5 rounded-3xl border border-amber-300 bg-white p-6 shadow-xl sm:p-9">
          <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-cyan-800">RiverSpend · Campagne pubblicitarie</span>
          <h1 className="mt-4 text-3xl font-black sm:text-5xl">Crea la tua campagna RSSpons</h1>
          <p className="mt-3 max-w-3xl leading-7 text-slate-600">Scegli il servizio, il territorio, la durata e il budget. Prima di procedere visualizzi una stima trasparente del costo.</p>
        </header>

        <form onSubmit={createPreview} className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <div className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-black">1 · Che cosa vuoi promuovere?</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {PLACEMENTS.map(item => <button key={item.id} type="button" onClick={() => { setPlacement(item.id); setPreview(false); }} className={'rounded-2xl border p-4 text-left transition ' + (placement === item.id ? 'border-cyan-600 bg-cyan-50 ring-2 ring-cyan-100' : 'border-slate-200 bg-white')}>
                  <strong>{item.label}</strong><p className="mt-2 text-sm leading-5 text-slate-600">{item.description}</p>
                </button>)}
              </div>
              <label className="mt-4 block text-sm font-bold">Nome della campagna
                <input value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="Es. Promozione negozio / nuovo singolo" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal" />
              </label>
              <label className="mt-4 block text-sm font-bold">Obiettivo
                <select value={goal} onChange={e => setGoal(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal">
                  <option value="visibilità">Far conoscere il brand / contenuto</option><option value="visite">Portare visite alla pagina</option><option value="vendite">Promuovere un prodotto o servizio</option><option value="ascolti">Ottenere ascolti e visualizzazioni musicali</option>
                </select>
              </label>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-black">2 · Dove vuoi raggiungere il pubblico?</h2>
              <label className="mt-4 block text-sm font-bold">Area geografica
                <select value={area} onChange={e => { setArea(e.target.value); setPreview(false); }} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal">
                  {AREAS.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </label>
              {area === 'local' && <label className="mt-4 block text-sm font-bold">Raggio indicativo
                <select value={radius} onChange={e => { setRadius(Number(e.target.value)); setPreview(false); }} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal">
                  <option value={5}>5 km</option><option value={10}>10 km</option><option value={25}>25 km</option><option value={50}>50 km</option>
                </select>
              </label>}
              {(area === 'international' || area === 'world') && <label className="mt-4 block text-sm font-bold">Paesi / mercato di riferimento
                <input value={country} onChange={e => setCountry(e.target.value)} placeholder="Es. Italia, Francia, Spagna" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal" />
              </label>}
              <p className="mt-3 text-xs leading-5 text-slate-500">La selezione geografica è parte del configuratore. La distribuzione effettiva richiederà la disponibilità di dati territoriali, strumenti di targeting e pubblico attivo nei Paesi scelti.</p>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-black">3 · Durata e budget</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {DURATIONS.map(day => <button key={day} type="button" onClick={() => { setDuration(day); setPreview(false); }} className={'rounded-xl border px-3 py-4 text-center font-extrabold ' + (duration === day ? 'border-cyan-600 bg-cyan-50 text-cyan-900' : 'border-slate-200 bg-white')}>{day} {day === 1 ? 'giorno' : 'giorni'}</button>)}
              </div>
              <label className="mt-4 block text-sm font-bold">Budget che vorresti investire (€)
                <select value={budget} onChange={e => setBudget(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal">
                  {['5','10','20','30','50','100','200','300','500','1000'].map(value => <option key={value} value={value}>{money(Number(value))}</option>)}
                </select>
              </label>
              <label className="mt-4 flex items-start gap-3 text-sm leading-5 text-slate-700">
                <input type="checkbox" checked={rightsConfirmed} onChange={e => setRightsConfirmed(e.target.checked)} className="mt-1 h-4 w-4 accent-cyan-700" />
                <span>Dichiaro di avere i diritti o le autorizzazioni necessarie per i materiali pubblicitari che intendo caricare e promuovere.</span>
              </label>
            </section>
            <button type="submit" className="w-full rounded-2xl bg-cyan-700 px-6 py-4 text-lg font-black text-white shadow-lg hover:bg-cyan-800">📊 Calcola e mostra il riepilogo</button>
          </div>

          <aside className="h-fit rounded-3xl border border-amber-300 bg-white p-5 shadow-xl lg:sticky lg:top-5 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[.2em] text-amber-700">Riepilogo RSSpons</p>
            <h2 className="mt-2 text-2xl font-black">La tua campagna</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3 border-b border-slate-100 pb-3"><span className="text-slate-500">Servizio</span><strong className="text-right">{PLACEMENTS.find(x => x.id === placement)?.label}</strong></div>
              <div className="flex justify-between gap-3 border-b border-slate-100 pb-3"><span className="text-slate-500">Area</span><strong className="text-right">{AREAS.find(x => x.id === area)?.label}</strong></div>
              {area === 'local' && <div className="flex justify-between gap-3 border-b border-slate-100 pb-3"><span className="text-slate-500">Raggio</span><strong>{radius} km</strong></div>}
              <div className="flex justify-between gap-3 border-b border-slate-100 pb-3"><span className="text-slate-500">Durata</span><strong>{duration} {duration === 1 ? 'giorno' : 'giorni'}</strong></div>
              <div className="flex justify-between gap-3 border-b border-slate-100 pb-3"><span className="text-slate-500">Budget indicato</span><strong>{money(Number(budget))}</strong></div>
              <div className="rounded-2xl bg-cyan-50 p-4"><p className="text-sm font-bold text-cyan-900">Stima tariffaria indicativa</p><p className="mt-1 text-3xl font-black text-cyan-950">{money(estimate)}</p><p className="mt-1 text-xs leading-5 text-cyan-900">Stima dimostrativa basata su area, durata e tipo di spazio. Il costo definitivo dovrà essere confermato nel listino ufficiale.</p></div>
            </div>
            {preview && <div className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900">
              <strong>✅ Riepilogo pronto</strong>
              <p className="mt-2">Campagna: {campaignName.trim() || 'Senza nome'} · Obiettivo: {goal}.</p>
              <p className="mt-1">{rightsConfirmed ? 'Dichiarazione sui diritti confermata.' : 'Prima della pubblicazione devi confermare la dichiarazione sui diritti.'}</p>
              <p className="mt-2 font-bold">Questa è una simulazione: non è stato effettuato alcun ordine o pagamento e la campagna non è stata pubblicata.</p>
            </div>}
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">Il configuratore è il primo passaggio. Pagamenti, salvataggio della campagna, approvazione, targeting reale e statistiche devono essere collegati ai servizi di backend prima di vendere campagne effettive.</div>
          </aside>
        </form>
      </div>
    </main>
  );
}
