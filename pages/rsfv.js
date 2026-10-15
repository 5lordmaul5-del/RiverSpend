import Head from 'next/head';

const concepts = [
  { icon: '📱', name: 'FuturPhone RiveЯ1one', area: 'Tecnologia', status: 'IDEA CONCEPT', text: 'Smartphone RiverSpend con possibile integrazione di Hey River e dei servizi dell’ecosistema. Da valutare in futuro.' },
  { icon: '🤖', name: 'RiveR A1A1', area: 'Assistenza alla persona', status: 'CONCEPT FUTURO', text: 'Droide di assistenza pensato per affiancare le persone nelle attività quotidiane, sostenendo autonomia e dignità.' },
  { icon: '🏡', name: 'RiveR Home', area: 'Casa', status: 'IDEA DA STUDIARE', text: 'Soluzioni per una casa più accessibile, efficiente e sostenibile.' },
  { icon: '⚡', name: 'RiveR Energy', area: 'Energia', status: 'IDEA DA STUDIARE', text: 'Idee per ridurre i consumi e valorizzare le energie rinnovabili.' },
  { icon: '🌿', name: 'RiveR Ecology', area: 'Ambiente', status: 'IDEA DA STUDIARE', text: 'Progetti pratici per proteggere fiumi, mari, territorio e biodiversità.' },
  { icon: '🎡', name: 'RiveR Park', area: 'Tempo libero', status: 'CONCEPT', text: 'Esperienze di svago che uniscono natura, accessibilità e tecnologia.' },
];

export default function RiverSpendFutureVision() {
  return (
    <>
      <Head>
        <title>RSFV · RiverSpend Future Vision</title>
        <meta name="description" content="RSFV — RiverSpend Future Vision: idee e concept futuri concreti, utili e sostenibili." />
        <meta name="theme-color" content="#06212b" />
      </Head>
      <main className="min-h-screen bg-[#04151d] text-white">
        <header className="border-b border-cyan-400/20 bg-[#061d27]/95 px-4 py-4 sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <a href="/" className="text-xl font-black tracking-tight sm:text-2xl">RiverSpend<span className="ml-2 text-amber-300">SHOP</span><span className="mt-1 block text-[10px] font-semibold tracking-[.25em] text-cyan-100">YOUR SHOP • YOUR FLOW</span></a>
            <a href="/" className="rounded-full border border-cyan-300/50 px-4 py-2 text-sm font-bold text-cyan-100 hover:bg-cyan-400/10">← Torna allo Shop</a>
          </div>
        </header>
        <section className="relative overflow-hidden border-b border-cyan-400/20 bg-[radial-gradient(ellipse_at_top_right,_rgba(8,145,178,.28),_transparent_55%),linear-gradient(135deg,#061b26,#07111c_65%,#102a2d)] px-4 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-[1.15fr_.85fr]">
            <div>
              <p className="mb-3 inline-flex rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-xs font-extrabold tracking-[.2em] text-cyan-200">RSFV · CONCEPT FUTURI</p>
              <h1 className="text-4xl font-black leading-tight sm:text-6xl">RiverSpend <span className="text-cyan-300">Future Vision</span></h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-200">Idee per il domani, con i piedi per terra oggi. Una raccolta di concept che potranno essere studiati, prototipati e realizzati quando ci saranno risorse e condizioni adeguate.</p>
              <a href="#concept" className="mt-7 inline-flex rounded-full bg-cyan-300 px-6 py-3 font-extrabold text-slate-950 shadow-lg shadow-cyan-900/30 hover:bg-cyan-200">Esplora i concept <span className="ml-2">→</span></a>
            </div>
            <div className="mx-auto w-full max-w-md">
              <div className="rounded-[2rem] border border-cyan-300/40 bg-gradient-to-br from-cyan-300/15 via-slate-900 to-amber-300/10 p-6 shadow-2xl shadow-cyan-950/40">
                <div className="flex aspect-square flex-col items-center justify-center rounded-[1.5rem] border border-white/10 bg-[#071923] text-center">
                  <div className="text-8xl drop-shadow-[0_0_25px_rgba(34,211,238,.5)]">🤖</div>
                  <div className="mt-4 text-3xl font-black">RiveR <span className="text-amber-300">A1A1</span></div>
                  <div className="mt-2 text-xs font-bold tracking-[.2em] text-cyan-200">ASSISTENZA ALLA PERSONA</div>
                  <p className="mt-4 max-w-xs px-4 text-sm leading-relaxed text-slate-300">Una mano alla persona fisica, per un mondo più semplice, sicuro e umano.</p>
                  <span className="mt-5 rounded-full border border-amber-300/50 px-3 py-1 text-[10px] font-extrabold tracking-widest text-amber-200">SOLO CONCEPT · NON DISPONIBILE</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-black sm:text-3xl">Il nostro criterio</h2>
            <p className="mt-2 max-w-3xl text-slate-300">Innovazione ambiziosa, ma concreta: niente promesse irrealistiche. Ogni idea indica il proprio stato e richiede studio, costi, test e verifiche prima di diventare un prodotto.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['🧭', 'Utilità reale', 'Partiamo da un bisogno concreto delle persone.'],
              ['🛡️', 'Sicurezza', 'Test, privacy e protezione prima di tutto.'],
              ['🌱', 'Sostenibilità', 'Consideriamo impatto ambientale e durata.'],
              ['🔧', 'Fattibilità', 'Prototipi e sviluppo solo con risorse adeguate.'],
            ].map(([icon, title, body]) => <div key={title} className="rounded-2xl border border-cyan-900 bg-[#081e28] p-5"><div className="text-3xl">{icon}</div><h3 className="mt-3 font-extrabold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-slate-300">{body}</p></div>)}
          </div>
        </section>
        <section id="concept" className="mx-auto max-w-7xl px-4 pb-16 sm:px-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-xs font-extrabold tracking-[.2em] text-cyan-300">RSFCcf · FUTURE CITY</p><h2 className="mt-2 text-2xl font-black sm:text-3xl">Concept futuri</h2></div>
            <span className="rounded-full border border-amber-300/30 px-3 py-1 text-xs font-bold text-amber-200">Idee in fase concettuale</span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {concepts.map((item) => <article key={item.name} className="flex flex-col rounded-2xl border border-cyan-800/80 bg-gradient-to-b from-[#0b2935] to-[#06151e] p-5 shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:border-cyan-400/70">
              <div className="flex items-start justify-between gap-3"><div className="flex h-14 w-14 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-300/10 text-3xl">{item.icon}</div><span className="rounded-full bg-amber-300/10 px-3 py-1 text-[10px] font-extrabold tracking-wide text-amber-200">{item.status}</span></div>
              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-cyan-300">{item.area}</p><h3 className="mt-1 text-xl font-black">{item.name}</h3><p className="mt-3 flex-1 text-sm leading-relaxed text-slate-300">{item.text}</p>
              {item.name === 'RiveR A1A1' && <div className="mt-4 rounded-xl border border-cyan-900 bg-black/20 p-3 text-xs leading-relaxed text-slate-300"><strong className="text-cyan-200">Possibili funzioni da studiare:</strong> supporto nelle attività quotidiane, comandi vocali Hey River, assistenza domestica e promemoria. Le funzioni sanitarie, la movimentazione di persone e l’autonomia richiederebbero progettazione e verifiche specialistiche.</div>}
            </article>)}
          </div>
        </section>
        <footer className="border-t border-cyan-900 bg-[#031018] px-4 py-6 text-center text-xs text-slate-400">RSFV · RiverSpend Future Vision — Idee per il futuro, senza confondere i concept con prodotti già realizzati.</footer>
      </main>
    </>
  );
}
