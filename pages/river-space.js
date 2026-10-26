import Head from 'next/head';

const pillars = [
  { icon: '🌀', title: 'RiverSpace Gravity', text: 'Studiare habitat rotanti e accelerazione artificiale per ridurre alcuni effetti della microgravità durante missioni di lunga durata.' },
  { icon: '🌱', title: 'RiverSpace Habitat', text: 'Un ecosistema abitabile con aria e acqua controllate, riciclo delle risorse e coltivazione di alimenti.' },
  { icon: '☀️', title: 'RiverSpace BioSystem', text: 'Illuminazione circadiana, nutrizione e monitoraggio della salute per sostenere il benessere dell’equipaggio.' },
  { icon: '🛡️', title: 'RiverSpace Shield', text: 'Studiare schermature e procedure contro radiazioni, micrometeoriti e altre emergenze ambientali.' },
];

export default function RiverSpace() {
  return (
    <>
      <Head>
        <title>RiverSpace — Beyond Earth. Beyond Limits.</title>
        <meta name="description" content="RiverSpace: visione e concept per habitat spaziali, gravità artificiale e missioni umane di lunga durata." />
        <meta name="theme-color" content="#061225" />
      </Head>
      <main className="min-h-screen overflow-hidden bg-[#030914] text-white">
        <header className="border-b border-cyan-300/20 bg-[#061225]/95 px-4 py-4 sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <a href="/" className="text-xl font-black tracking-tight sm:text-2xl">RiverSpend<span className="ml-2 text-amber-300">SHOP</span><span className="mt-1 block text-[10px] font-semibold tracking-[.25em] text-cyan-100">YOUR SHOP • YOUR FLOW</span></a>
            <a href="/river-spend-future-city" className="rounded-full border border-cyan-300/40 px-4 py-2 text-sm font-bold text-cyan-100 hover:bg-cyan-300/10">Future City ↗</a>
          </div>
        </header>
        <section className="relative border-b border-cyan-300/20 bg-[radial-gradient(ellipse_at_50%_20%,rgba(14,165,233,.24),transparent_50%),linear-gradient(135deg,#07152a,#030914_65%,#102a40)] px-4 py-14 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-[1.1fr_.9fr]">
            <div>
              <p className="mb-3 inline-flex rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-xs font-extrabold tracking-[.2em] text-cyan-200">NUOVO PROGETTO · CONCEPT</p>
              <h1 className="text-5xl font-black leading-tight sm:text-7xl">River<span className="text-cyan-300">Space</span></h1>
              <p className="mt-3 text-sm font-extrabold tracking-[.22em] text-amber-200 sm:text-base">BEYOND EARTH. BEYOND LIMITS.</p>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-200">Una visione per studiare come rendere possibili missioni umane sempre più lunghe: habitat, sistemi di supporto alla vita e tecnologie per proteggere la salute lontano dalla Terra.</p>
              <a href="#pilastri" className="mt-7 inline-flex rounded-full bg-cyan-300 px-6 py-3 font-extrabold text-slate-950 shadow-lg shadow-cyan-950/40 hover:bg-cyan-200">Esplora i pilastri →</a>
              <p className="mt-4 max-w-2xl text-xs leading-relaxed text-slate-400">Progetto concettuale: non è un veicolo spaziale operativo. Ogni soluzione richiede ricerca scientifica, progettazione, test e verifiche di sicurezza.</p>
            </div>
            <div className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center rounded-[2rem] border border-cyan-300/30 bg-gradient-to-br from-blue-950 via-slate-950 to-cyan-950 p-5 shadow-2xl shadow-cyan-950/40">
              <div className="absolute inset-5 rounded-full border border-cyan-200/20" />
              <div className="absolute inset-12 rounded-full border border-amber-200/20" />
              <div className="absolute right-[18%] top-[19%] h-3 w-3 rounded-full bg-amber-200 shadow-[0_0_24px_8px_rgba(253,230,138,.35)]" />
              <div className="relative text-center">
                <div className="text-8xl drop-shadow-[0_0_25px_rgba(34,211,238,.4)] sm:text-9xl" role="img" aria-label="Astronave e pianeta">🪐</div>
                <div className="mt-5 text-2xl font-black tracking-wide">RIVERSPACE</div>
                <div className="mt-2 text-xs font-bold tracking-[.22em] text-cyan-200">HUMANITY · HABITAT · DEEP SPACE</div>
              </div>
            </div>
          </div>
        </section>
        <section id="pilastri" className="mx-auto max-w-7xl px-4 py-12 sm:px-8 sm:py-16">
          <div className="mb-7">
            <p className="text-xs font-extrabold tracking-[.22em] text-cyan-300">LA VISIONE</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">Quattro pilastri di ricerca</h2>
            <p className="mt-3 max-w-3xl leading-relaxed text-slate-300">Non basta portare una persona lontano: dobbiamo studiare come sostenerne la vita, la salute e la sicurezza lungo il viaggio.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((item) => <article key={item.title} className="rounded-2xl border border-cyan-800/70 bg-gradient-to-b from-[#0b1c31] to-[#07101e] p-5 shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:border-cyan-400/60">
              <div className="text-4xl" aria-hidden="true">{item.icon}</div>
              <h3 className="mt-4 text-lg font-black text-cyan-100">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.text}</p>
            </article>)}
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-8">
          <div className="rounded-3xl border border-amber-300/25 bg-gradient-to-r from-[#101a2d] via-[#0b1b2c] to-[#17202d] p-6 sm:p-9">
            <p className="text-xs font-extrabold tracking-[.2em] text-amber-200">IL NOSTRO METODO</p>
            <h2 className="mt-3 text-2xl font-black sm:text-3xl">Ambizione, metodo scientifico e sicurezza</h2>
            <p className="mt-4 max-w-4xl leading-relaxed text-slate-300">Partiamo dalle conoscenze disponibili, distinguiamo ciò che è già dimostrato dalle ipotesi e scomponiamo la visione in problemi verificabili: gravità, radiazioni, energia, riciclo, cibo e benessere dell’equipaggio.</p>
            <span className="mt-5 inline-flex rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-2 text-xs font-extrabold text-amber-100">STATO: CONCEPT INIZIALE</span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/river-spend-future-city" className="rounded-full border border-cyan-300/40 px-5 py-3 font-bold text-cyan-100 hover:bg-cyan-300/10">← RiverSpend Future City</a>
            <a href="/" className="rounded-full bg-cyan-300 px-5 py-3 font-extrabold text-slate-950 hover:bg-cyan-200">Torna a RiverSpendShop</a>
          </div>
        </section>
      </main>
    </>
  );
}
