import { useEffect, useState } from 'react';

const DURATA_OFFERTA_MS = 15 * 60 * 1000;
const FINE_ROSSO_MS = 30 * 1000;

function OffertaATempoDemo() {
  const [inizio, setInizio] = useState(null);
  const [adesso, setAdesso] = useState(Date.now());
  const [prezzoBase, setPrezzoBase] = useState('20.00');

  useEffect(() => {
    if (!inizio) return undefined;
    const interval = window.setInterval(() => setAdesso(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [inizio]);

  const rimanente = inizio ? Math.max(0, DURATA_OFFERTA_MS - (adesso - inizio)) : DURATA_OFFERTA_MS;
  const secondi = Math.ceil(rimanente / 1000);
  const scaduta = Boolean(inizio) && rimanente === 0;
  const fascia = secondi > 600 ? { aumento: 0, nome: 'Prezzo iniziale' } : secondi > 300 ? { aumento: 5, nome: 'Fascia 2' } : secondi > 60 ? { aumento: 10, nome: 'Fascia 3' } : { aumento: 15, nome: 'Fascia finale' };
  const prezzo = (Math.max(0, Number(prezzoBase) || 0) + fascia.aumento).toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
  const formatoTempo = (value) => String(Math.floor(value / 60)).padStart(2, '0') + ':' + String(value % 60).padStart(2, '0');
  const urgente = Boolean(inizio) && rimanente <= FINE_ROSSO_MS && !scaduta;

  return (
    <section className="mt-7 rounded-2xl border border-cyan-300 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="rs-offerte-tempo-title">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">RiverSpendShop · RS Spons</p>
      <h2 id="rs-offerte-tempo-title" className="mt-2 text-2xl font-extrabold">⏱️ RS Spons Affrettati</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Offerta dimostrativa di 15 minuti, prezzo a fasce predefinite e timer visibile. Il prezzo aumenta secondo la fascia raggiunta; la disponibilità non viene modificata.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="rounded-xl bg-slate-50 p-4">
          <label htmlFor="rs-timer-prezzo-base" className="block text-sm font-bold text-slate-700">Prezzo iniziale (€)</label>
          <input id="rs-timer-prezzo-base" type="number" min="0" step="0.01" value={prezzoBase} onChange={(event) => setPrezzoBase(event.target.value)} disabled={Boolean(inizio) && !scaduta} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-lg font-bold text-slate-900 disabled:bg-slate-100" />
          <p className="mt-2 text-xs text-slate-500">Regole demo: oltre 10 min +0 € · da 10 a 5 min +5 € · da 5 a 1 min +10 € · ultimo minuto +15 €.</p>
        </div>
        <div className={'rounded-xl border p-4 text-center ' + (urgente ? 'animate-pulse border-red-500 bg-red-50 text-red-700' : scaduta ? 'border-slate-300 bg-slate-100 text-slate-600' : 'border-cyan-300 bg-cyan-50 text-cyan-900')}>
          <p className="text-xs font-extrabold uppercase tracking-wider">{scaduta ? 'Offerta scaduta' : 'Tempo rimanente'}</p>
          <p className="mt-1 font-mono text-4xl font-black tabular-nums" aria-live="polite">{formatoTempo(secondi)}</p>
          <p className="mt-2 text-sm font-bold">{scaduta ? 'Prezzo finale: ' + prezzo : fascia.nome + ' · ' + prezzo}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => { setInizio(Date.now()); setAdesso(Date.now()); }} disabled={Boolean(inizio) && !scaduta} className="rounded-xl bg-cyan-700 px-5 py-3 font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50">▶ Avvia timer 15 minuti</button>
        <button type="button" onClick={() => { setInizio(null); setAdesso(Date.now()); }} className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700">↻ Azzera demo</button>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">Demo locale: non pubblica offerte, non salva campagne e non esegue pagamenti. Per l’uso reale, prezzo e scadenza devono essere salvati e verificati lato server.</p>
    </section>
  );
}

export default function RsSponsPage() {
  const [demoAttiva, setDemoAttiva] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-b from-cyan-100 via-sky-50 to-white px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <a href="/" className="text-sm font-semibold text-cyan-700">← Torna a RiverSpendShop</a>

        <section className="mt-5 rounded-3xl border border-amber-400/70 bg-white/95 p-6 shadow-2xl sm:p-10">
          <div className="flex items-start justify-between gap-4">
            <div className="text-4xl">🎬</div>
            <span className="rounded-full border border-emerald-500/40 bg-emerald-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-700">
              DEMO ATTIVA
            </span>
          </div>

          <p className="mt-4 text-xs font-bold uppercase tracking-[0.25em] text-amber-600">RiverSpend</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">RS Spons</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            La piattaforma pubblicitaria video di RiverSpendShop per aziende, brand e campagne sponsorizzate.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
              <strong>🥇 RS Spons Gold</strong>
              <p className="mt-1 text-sm text-slate-600">Campagne premium e massima visibilità.</p>
            </div>
            <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4">
              <strong>🥈 RS Spons Silver</strong>
              <p className="mt-1 text-sm text-slate-600">Campagne mirate per categorie e pubblico.</p>
            </div>
            <div className="rounded-2xl border border-orange-300 bg-orange-50 p-4">
              <strong>🥉 RS Spons Bronze</strong>
              <p className="mt-1 text-sm text-slate-600">Presenza sponsorizzata essenziale.</p>
            </div>
            <div className="rounded-2xl border border-cyan-300 bg-cyan-50 p-4">
              <strong>📊 Statistiche</strong>
              <p className="mt-1 text-sm text-slate-600">Visualizzazioni, completamenti e click.</p>
            </div>
          </div>

          <div className="mt-7 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-slate-700">
            <strong>Modalità demo:</strong> per ora RS Spons è una vetrina dimostrativa. Gli spot pubblicitari
            saranno contenuti separati dai video caricati dagli utenti e dovranno essere autorizzati/licenziati.
          </div>

          <OffertaATempoDemo />

          <div className="mt-6 rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
            <p className="font-black text-slate-900">🧢 Anche i privati possono sponsorizzare</p>
            <p className="mt-1 text-sm text-slate-600">Hai un cappellino, una borsa, una console o qualsiasi altro prodotto? Carica le foto e RS Spons Creator può preparare automaticamente uno spot professionale da promuovere.</p>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a href="/rs-spons/creator" className="rounded-xl bg-cyan-600 px-5 py-3 text-center font-extrabold text-white shadow-lg hover:bg-cyan-700">
              ✨ Crea automaticamente la pubblicità
            </a>
            <button
              type="button"
              onClick={() => setDemoAttiva(true)}
              className="rounded-xl border border-cyan-300 bg-cyan-50 px-5 py-3 font-extrabold text-cyan-800"
            >
              🎬 Attiva campagna demo
            </button>
          </div>

          {demoAttiva && (
            <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 p-4 font-semibold text-emerald-800">
              ✅ Campagna demo RS Spons attivata. Nessun pagamento e nessuna campagna reale vengono creati.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
