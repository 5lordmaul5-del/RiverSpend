import Link from 'next/link';

const sections = [
  ['▶️','Continua a guardare','Riprendi film, serie e video dal punto in cui ti sei fermato.'],
  ['🎬','Film','Film, cortometraggi, trailer e RiverSpend Originals.'],
  ['🎵','Musica','Videoclip, concerti, live session e catalogo musicale.'],
  ['📺','Serie & Creator','Serie, programmi e contenuti dei creator.'],
  ['🔴','Live','Eventi e dirette quando il servizio streaming sarà attivo.'],
  ['⭐','Originals','Produzioni RiverSpend e contenuti commissionati.'],
];

export default function RiverSpendStream() {
  return (
    <main className="min-h-screen bg-[#f2fbfa] px-4 py-6 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="font-bold text-teal-700">🌊 RiverSpend</Link>
          <div className="flex gap-3 text-sm">
            <Link href="/servizi/tv" className="text-slate-700 underline">RiverSpend TV</Link>
            <Link href="/servizi/music" className="text-slate-300 underline">Music</Link>
            <Link href="/servizi/music-distribution" className="text-slate-300 underline">Distribution</Link>
          </div>
        </div>

        <section className="mt-8 rounded-3xl border border-teal-100 bg-gradient-to-br from-white via-[#f2fbfa] to-[#d9f7f4] p-6 shadow-sm sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-teal-700">RiverSpend</p>
          <h1 className="mt-2 text-4xl font-black sm:text-6xl">RiverSpendStream</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">
            La piattaforma streaming dell'ecosistema RiverSpend: film, musica, serie, creator, concerti,
            live e Originals, progettata fin dall'inizio per smartphone, tablet, web e futura TV.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/servizi/tv" className="rounded-xl bg-teal-600 px-5 py-3 font-black text-white shadow-sm hover:bg-teal-700">📺 Esplora RiverSpend TV</Link>
            <Link href="/rs-spons" className="rounded-xl border border-teal-200 bg-white px-5 py-3 font-bold text-teal-800 hover:bg-teal-50">📢 RS Spons</Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ['🎬','Film & Originals','Cinema, corti e produzioni RiverSpend'],
              ['🎵','Music','Videoclip, concerti e contenuti musicali'],
              ['🔴','Live & Creator','Dirette, creator ed eventi'],
            ].map(([icon,title,desc]) => (
              <article key={title} className="rounded-2xl border border-teal-100 bg-white/90 p-4">
                <div className="text-2xl">{icon}</div>
                <h2 className="mt-2 font-bold">{title}</h2>
                <p className="mt-1 text-sm text-slate-600">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map(([icon,title,desc]) => (
            <article key={title} className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
              <div className="text-3xl">{icon}</div>
              <h2 className="mt-3 text-xl font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-3xl border border-teal-100 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">📱📺 Un account, più dispositivi</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {['📱 Smartphone','📲 Tablet','💻 PC / Web','📺 Smart TV / TV platform'].map((x) => (
              <div key={x} className="rounded-xl border border-teal-100 bg-[#f2fbfa] p-4 font-semibold text-slate-800">{x}</div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-600">
            La pagina web è il primo strato. Le app TV dedicate e le integrazioni con gli store/dispositivi
            verranno realizzate e certificate per ciascuna piattaforma: non dichiariamo compatibilità TV finché non è stata realmente implementata e testata.
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-teal-100 bg-[#e8faf7] p-6">
          <h2 className="text-2xl font-black">🛒 Contenuto → vendita</h2>
          <p className="mt-3 text-slate-700">Ogni contenuto potrà collegarsi a prodotti e servizi autorizzati su RiverSpendShop.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-5">
            {['▶️ Guarda','🎵 Ascolta','💿 Compra CD','🎟️ Biglietti','🛒 Shop'].map((x) => (
              <div key={x} className="rounded-xl border border-teal-100 bg-white p-4 text-center font-bold text-slate-800">{x}</div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-amber-200 bg-[#fffaf0] p-6">
          <h2 className="text-xl font-bold">🛡️ Diritti prima dello streaming</h2>
          <p className="mt-2 text-sm leading-6 text-amber-950">
            Film, musica, immagini, master, sincronizzazioni, marchi e altri contenuti passano dal Rights Check.
            RiverSpend pubblica e monetizza solo contenuti per i quali esistono diritti e autorizzazioni adeguati.
          </p>
        </section>
      </div>
    </main>
  );
}
