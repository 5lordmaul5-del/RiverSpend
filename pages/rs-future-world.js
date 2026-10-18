import Head from 'next/head';

const sectors = [
  {
    number: '01',
    icon: '🏙️',
    name: 'RiverSpend FutureCity',
    label: 'LA CITTÀ DEL FUTURO',
    text: 'La visione della città: ambienti, servizi, energia, ecologia, mobilità e spazi progettati per rendere la vita più semplice, accessibile e sostenibile.',
    href: '/rsfv',
    action: 'Esplora FutureCity',
    accent: 'cyan',
  },
  {
    number: '02',
    icon: '🤖',
    name: 'RS Future Droid',
    label: 'INTELLIGENZA AL SERVIZIO DELLE PERSONE',
    text: 'La famiglia dei droidi nasce dentro FutureCity: assistenza, accoglienza, supporto domestico e interazione uomo-macchina, sviluppati per fasi.',
    href: '/robotics',
    action: 'Scopri i droidi',
    accent: 'gold',
  },
  {
    number: '03',
    icon: '🦾',
    name: 'RS RiverSpend Robotic Droid',
    label: 'LA DIVISIONE ROBOTICA',
    text: 'Nova A1A1 e gli altri modelli progettuali: una sola famiglia, dal droide virtuale ai possibili prototipi fisici. I robot fisici sono concept futuri, non prodotti in vendita.',
    href: '/robotics',
    action: 'Apri la famiglia RS',
    accent: 'teal',
  },
];

export default function RSFutureWorld() {
  return (
    <>
      <Head>
        <title>RS FutureWorld | RiverSpend FutureCity & Droid</title>
        <meta name="description" content="RS FutureWorld unisce RiverSpend FutureCity, RS Future Droid e RS RiverSpend Robotic Droid in una visione integrata del futuro." />
        <meta name="theme-color" content="#061722" />
      </Head>
      <main className="min-h-screen overflow-hidden bg-[#061722] text-white">
        <header className="border-b border-cyan-200/15 bg-[#061722]/95 px-4 py-4 sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <a href="/" className="font-black tracking-tight"><span className="text-cyan-200">RiverSpend</span><span className="ml-2 text-amber-300">FutureWorld</span><span className="mt-1 block text-[10px] font-semibold tracking-[.25em] text-slate-400">YOUR SHOP • YOUR FLOW</span></a>
            <a href="/" className="rounded-full border border-cyan-200/30 px-4 py-2 text-sm font-bold hover:bg-cyan-200/10">← RiverSpendShop</a>
          </div>
        </header>
        <section className="relative border-b border-cyan-200/10 px-4 py-16 sm:px-8 sm:py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_20%,rgba(34,211,238,.18),transparent_38%),radial-gradient(ellipse_at_85%_75%,rgba(251,191,36,.12),transparent_35%),linear-gradient(135deg,#071a27,#08111e_65%,#102a2c)]" />
          <div className="relative mx-auto max-w-7xl">
            <div className="max-w-4xl">
              <span className="inline-flex rounded-full border border-cyan-200/30 bg-cyan-300/10 px-3 py-1 text-xs font-extrabold tracking-[.2em] text-cyan-100">RS · RICERCA, IDEE E INNOVAZIONE</span>
              <h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">Il futuro RiverSpend,<br /><span className="text-cyan-200">un unico mondo.</span></h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">RS FutureWorld collega tre parti dello stesso progetto: la città del futuro, i droidi che potranno aiutare le persone e la divisione robotica che studia i modelli. Non tre mondi separati, ma un ecosistema coordinato.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#settori" className="rounded-full bg-cyan-200 px-6 py-3 font-extrabold text-slate-950 hover:bg-cyan-100">Esplora i tre settori ↓</a>
                <a href="/rsfv#concept" className="rounded-full border border-amber-200/50 px-6 py-3 font-bold text-amber-100 hover:bg-amber-200/10">Idee FutureCity</a>
              </div>
            </div>
            <div className="mt-12 grid max-w-4xl gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-cyan-100/15 bg-black/20 p-4"><div className="text-3xl">🏙️</div><p className="mt-2 font-extrabold">Ambiente</p><p className="mt-1 text-sm text-slate-400">Dove viviamo</p></div>
              <div className="rounded-2xl border border-amber-100/15 bg-black/20 p-4"><div className="text-3xl">🤖</div><p className="mt-2 font-extrabold">Intelligenza</p><p className="mt-1 text-sm text-slate-400">Come ci aiutiamo</p></div>
              <div className="rounded-2xl border border-teal-100/15 bg-black/20 p-4"><div className="text-3xl">🦾</div><p className="mt-2 font-extrabold">Robotica</p><p className="mt-1 text-sm text-slate-400">Con quali tecnologie</p></div>
            </div>
          </div>
        </section>
        <section id="settori" className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-16">
          <div className="mb-8"><p className="text-xs font-extrabold tracking-[.22em] text-amber-200">UN SOLO ECOSISTEMA</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">I tre settori collegati</h2><p className="mt-3 max-w-3xl text-slate-400">Ogni settore mantiene la sua identità e le sue pagine, ma da qui si entra nell'intero progetto e si passa da una parte all'altra.</p></div>
          <div className="grid gap-5 lg:grid-cols-3">
            {sectors.map((sector) => <article key={sector.number} className="group flex flex-col rounded-3xl border border-white/10 bg-gradient-to-b from-[#102b39] to-[#08131f] p-6 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-cyan-200/40">
              <div className="flex items-center justify-between"><span className="text-xs font-black tracking-[.2em] text-cyan-200">SETTORE {sector.number}</span><span className="text-4xl">{sector.icon}</span></div>
              <p className="mt-5 text-[10px] font-extrabold tracking-[.18em] text-amber-200">{sector.label}</p>
              <h3 className="mt-2 text-2xl font-black leading-tight">{sector.name}</h3>
              <p className="mt-4 flex-1 text-sm leading-7 text-slate-300">{sector.text}</p>
              <a href={sector.href} className="mt-6 inline-flex items-center justify-center rounded-full border border-cyan-200/30 px-5 py-3 text-sm font-extrabold text-cyan-100 transition hover:bg-cyan-200 hover:text-slate-950">{sector.action} →</a>
            </article>)}
          </div>
        </section>
        <section className="border-y border-cyan-100/10 bg-[#08131f] px-4 py-12 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[.8fr_1.2fr] md:items-center">
            <div><p className="text-xs font-extrabold tracking-[.22em] text-cyan-200">COME SI COLLEGANO</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">Dalla città al droide.</h2></div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 p-4"><span className="font-extrabold text-cyan-100">1 · Immaginare</span><p className="mt-2 text-sm leading-6 text-slate-400">FutureCity definisce bisogni, luoghi e servizi.</p></div>
              <div className="rounded-2xl border border-white/10 p-4"><span className="font-extrabold text-amber-100">2 · Progettare</span><p className="mt-2 text-sm leading-6 text-slate-400">RS Future Droid individua i compiti utili per le persone.</p></div>
              <div className="rounded-2xl border border-white/10 p-4"><span className="font-extrabold text-teal-100">3 · Sviluppare</span><p className="mt-2 text-sm leading-6 text-slate-400">RS RiverSpend Robotic Droid studia modelli, requisiti e prototipi.</p></div>
            </div>
          </div>
          <p className="mx-auto mt-8 max-w-7xl text-xs leading-6 text-slate-500">Trasparenza: questa sezione presenta la visione e i concept RiverSpend. Funzioni avanzate, robot fisici e infrastrutture future richiedono progettazione, partner, verifiche di sicurezza e risorse; non sono presentati come già realizzati o disponibili in vendita.</p>
        </section>
        <footer className="px-4 py-7 text-center text-xs text-slate-500">RS FutureWorld · RiverSpend FutureCity · RS Future Droid · RS RiverSpend Robotic Droid</footer>
      </main>
    </>
  );
}
