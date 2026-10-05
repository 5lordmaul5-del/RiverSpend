import { useState } from 'react';

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

          <button
            type="button"
            onClick={() => setDemoAttiva(true)}
            className="mt-6 w-full rounded-xl bg-cyan-500 px-5 py-3 font-extrabold text-white shadow-lg transition hover:bg-cyan-600 sm:w-auto"
          >
            🎬 Attiva campagna demo
          </button>

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
