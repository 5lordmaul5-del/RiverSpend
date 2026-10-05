export default function RsSponsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-4xl">
        <a href="/" className="text-sm font-semibold text-teal-300">← Torna a RiverSpendShop</a>
        <section className="mt-5 rounded-3xl border border-amber-400/40 bg-gradient-to-br from-slate-900 to-amber-950/30 p-6 shadow-xl sm:p-10">
          <div className="text-4xl">🎬</div>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.25em] text-amber-300">RiverSpend</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">RS Spons</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            La piattaforma pubblicitaria video di RiverSpendShop per aziende, brand e campagne sponsorizzate.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
              <strong>🥇 RS Spons Gold</strong>
              <p className="mt-1 text-sm text-slate-400">Campagne premium e massima visibilità.</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
              <strong>🥈 RS Spons Silver</strong>
              <p className="mt-1 text-sm text-slate-400">Campagne mirate per categorie e pubblico.</p>
            </div>
            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
              <strong>🥉 RS Spons Bronze</strong>
              <p className="mt-1 text-sm text-slate-400">Presenza sponsorizzata essenziale.</p>
            </div>
            <div className="rounded-2xl border border-teal-800 bg-teal-950/40 p-4">
              <strong>📊 Statistiche</strong>
              <p className="mt-1 text-sm text-slate-400">Visualizzazioni, completamenti e click.</p>
            </div>
          </div>
          <div className="mt-7 rounded-2xl border border-slate-700 bg-black/20 p-4 text-sm text-slate-300">
            Gli spot pubblicitari sono contenuti separati dai video caricati dagli utenti e devono essere autorizzati/licenziati.
          </div>
          <button type="button" disabled className="mt-6 w-full cursor-not-allowed rounded-xl bg-teal-500/50 px-5 py-3 font-bold text-slate-950 sm:w-auto">
            Prossimamente · Crea una campagna
          </button>
        </section>
      </div>
    </main>
  );
}
