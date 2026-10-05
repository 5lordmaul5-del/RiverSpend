import Link from 'next/link';

const plans = [
  { name: 'Free', icon: '🆓', price: '€0', coverage: 'Pubblicazione base', boost: 'Nessuna promozione garantita' },
  { name: 'Bronze', icon: '🥉', price: '€4,90', coverage: 'Locale', boost: 'Promozione base' },
  { name: 'Silver', icon: '🥈', price: '€14,90', coverage: 'Nazionale', boost: 'Promozione potenziata' },
  { name: 'Gold', icon: '🥇', price: '€29,90', coverage: 'Internazionale', boost: 'Alta priorità promozionale' },
  { name: 'Premium', icon: '💎', price: '€59,90', coverage: 'Mondiale', boost: 'Massima priorità promozionale' }
];

const content = [
  ['🎵','Video musicali','Carica videoclip, lyric video, live session e collega album, CD e merchandise.'],
  ['🎬','Film','Trailer, cortometraggi, film e contenuti autorizzati, con Rights Check prima della pubblicazione.'],
  ['📺','Serie & Creator','Episodi, programmi, creator video e contenuti originali.'],
  ['🔴','Live Streaming','Eventi, concerti, première e dirette, quando sarà attivo il provider streaming.'],
  ['⭐','RiverSpend Originals','Produzioni commissionate o realizzate direttamente da RiverSpend.'],
  ['📢','RS Spons','Promozione separata dal contenuto: campagne pubblicitarie acquistabili per territorio e pubblico.']
];

export default function RiverSpendTV() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <Link href="/ecosistema" className="text-teal-300 underline">← Ecosistema RiverSpend</Link>
        <section className="mt-6 rounded-3xl border border-teal-800 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-950 p-6 sm:p-10">
          <div className="text-5xl">📺</div>
          <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-teal-300">RiverSpend</p>
          <h1 className="mt-2 text-4xl font-black sm:text-5xl">RiverSpend TV</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            Una piattaforma per musica, film, serie, creator, concerti e live. I contenuti appartengono ai rispettivi titolari:
            RiverSpend pubblica, distribuisce e promuove solo con diritti e autorizzazioni verificati.
          </p>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {content.map(([icon,title,desc]) => (
            <article key={title} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="text-3xl">{icon}</div><h2 className="mt-3 text-xl font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{desc}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-7">
          <h2 className="text-2xl font-bold">💰 Tariffe promozione contenuti</h2>
          <p className="mt-2 text-sm text-slate-400">Tariffe iniziali proposte. Non acquistano visualizzazioni: acquistano una fascia di promozione/esposizione. Le visualizzazioni restano reali e misurabili.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-5">
            {plans.map((p) => (
              <div key={p.name} className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
                <div className="text-3xl">{p.icon}</div>
                <h3 className="mt-2 font-black">{p.name}</h3>
                <p className="mt-2 text-2xl font-black text-teal-300">{p.price}</p>
                <p className="mt-2 text-sm font-semibold">{p.coverage}</p>
                <p className="mt-1 text-xs text-slate-400">{p.boost}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-500">I prezzi sono una proposta di lancio e possono essere adattati per durata, budget, territorio, categoria e domanda.</p>
        </section>

        <section className="mt-8 rounded-3xl border border-teal-900 bg-slate-900 p-5 sm:p-7">
          <h2 className="text-2xl font-bold">🛒 Dal video direttamente alla vendita</h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">
            Ogni contenuto potrà avere una vetrina collegata: CD, album, DVD/Blu-ray, merchandise, biglietti o altri prodotti autorizzati.
          </p>
          <div className="mt-5 rounded-2xl bg-slate-950 p-5">
            <p className="font-bold">Esempio videoclip</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-4">
              <span className="rounded-xl border border-slate-700 p-3 text-center">▶ Guarda</span>
              <span className="rounded-xl border border-slate-700 p-3 text-center">🎵 Ascolta</span>
              <span className="rounded-xl border border-slate-700 p-3 text-center">💿 Compra CD</span>
              <span className="rounded-xl border border-slate-700 p-3 text-center">🛒 RiverSpendShop</span>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-5 sm:p-7">
          <h2 className="text-2xl font-bold">📊 Più investimento, più promozione</h2>
          <p className="mt-3 leading-7 text-slate-300">
            I livelli superiori possono aumentare la priorità nelle superfici promozionali, i territori e le opportunità di RS Spons.
            Non garantiamo un numero artificiale di visualizzazioni, click o vendite.
          </p>
          <div className="mt-4 rounded-xl border border-amber-900/60 bg-amber-950/30 p-4 text-sm text-amber-100">
            ⚖️ Prima della pubblicazione: Rights Check su musica, immagini, filmati, master, sincronizzazioni, marchi e materiale promozionale.
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <Link href="/servizi/music" className="rounded-2xl border border-slate-700 bg-slate-900 p-5 hover:border-teal-500">
            <b>🎵 RiverSpend Music</b><p className="mt-2 text-sm text-slate-400">Catalogo e opere musicali.</p>
          </Link>
          <Link href="/servizi/music-distribution" className="rounded-2xl border border-slate-700 bg-slate-900 p-5 hover:border-teal-500">
            <b>📀 Music Distribution</b><p className="mt-2 text-sm text-slate-400">Artisti, label, release e royalties.</p>
          </Link>
          <Link href="/rs-spons" className="rounded-2xl border border-slate-700 bg-slate-900 p-5 hover:border-teal-500">
            <b>📢 RS Spons</b><p className="mt-2 text-sm text-slate-400">Campagne pubblicitarie video.</p>
          </Link>
        </section>
      </div>
    </main>
  );
}
