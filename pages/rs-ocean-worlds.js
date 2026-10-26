import Head from 'next/head';
import { useState } from 'react';

const worlds = [
  { icon:'🪸', title:'Il Regno dei Coralli', depth:'Superficie · 0–40 m', text:'Barriere coralline, pesci tropicali e una biodiversità straordinaria. Scopri perché gli ecosistemi corallini sono preziosi e vulnerabili.', color:'from-cyan-500 to-teal-950' },
  { icon:'🌿', title:'La Foresta Sottomarina', depth:'Coste e fondali', text:'Foreste di alghe e praterie di fanerogame marine: rifugi per tante specie e alleati nella salute degli oceani.', color:'from-emerald-500 to-green-950' },
  { icon:'🐋', title:'Il Grande Blu', depth:'Mare aperto', text:'Balene, delfini, tartarughe e grandi viaggiatori del mare. Un mondo vasto che ha bisogno di acque pulite e pesca responsabile.', color:'from-blue-500 to-indigo-950' },
  { icon:'✨', title:'Il Mondo Bioluminescente', depth:'Crepuscolo e oscurità', text:'Organismi capaci di produrre luce: una delle meraviglie reali degli oceani, da esplorare attraverso la scienza.', color:'from-violet-500 to-blue-950' },
  { icon:'🌋', title:'Le Sorgenti dell’Abisso', depth:'Fondali profondi', text:'Camini idrotermali e comunità che vivono senza luce solare, grazie all’energia chimica. Un ecosistema sorprendente e delicato.', color:'from-orange-600 to-slate-950' },
  { icon:'⚓', title:'Storie Sommerse', depth:'Relitti e archeologia', text:'Relitti e patrimoni archeologici raccontano storie di navigazione. Esplorazione virtuale e rispetto assoluto dei siti protetti.', color:'from-slate-500 to-cyan-950' }
];

export default function RSOceanWorlds() {
  const [open, setOpen] = useState(null);
  return <>
    <Head>
      <title>RS OCEAN WORLDS — I Mondi Sommersi | RiverSpend</title>
      <meta name="description" content="Esplora i mondi sommersi dell'oceano con RiverSpend: coralli, foreste marine, bioluminescenza e abissi." />
      <meta name="theme-color" content="#031a35" />
    </Head>
    <main className="min-h-screen overflow-hidden bg-[#031322] text-white">
      <section className="relative isolate flex min-h-[520px] items-end overflow-hidden sm:min-h-[650px]">
        <img src="/rs-ocean-worlds.svg" alt="Illustrazione di un viaggio dalle acque illuminate fino agli abissi oceanici" className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#031322] via-[#031322]/35 to-blue-950/10" />
        <div className="mx-auto w-full max-w-6xl px-5 pb-12 pt-24 sm:px-8 sm:pb-16">
          <a href="/" className="mb-8 inline-flex rounded-full border border-white/30 bg-slate-950/50 px-4 py-2 text-sm font-bold">← Torna a RiverSpendShop</a>
          <p className="text-xs font-black uppercase tracking-[.3em] text-cyan-200 sm:text-sm">RiverSpend Ecology presenta</p>
          <h1 className="mt-3 max-w-4xl text-5xl font-black leading-[.95] sm:text-7xl">RS OCEAN<br/><span className="text-cyan-200">WORLDS</span></h1>
          <p className="mt-5 max-w-2xl text-xl font-extrabold sm:text-2xl">I mondi sommersi dell’oceano.</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">Un viaggio dalla luce della superficie alle meraviglie nascoste degli abissi. Scopri gli ecosistemi marini, le creature che li abitano e perché proteggerli è una responsabilità di tutti.</p>
          <a href="#esplora" className="mt-6 inline-flex rounded-full bg-cyan-200 px-6 py-3 font-black text-slate-950 shadow-lg shadow-cyan-950/50">INIZIA L’ESPLORAZIONE ↓</a>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14">
        <div className="mb-7"><p className="text-xs font-black uppercase tracking-[.25em] text-cyan-300">Scendi in profondità</p><h2 id="esplora" className="mt-2 text-3xl font-black sm:text-4xl">Sei mondi da esplorare</h2><p className="mt-3 max-w-2xl leading-6 text-slate-300">Seleziona un mondo per leggere la sua storia. I contenuti sono introduttivi e informativi: non sostituiscono una guida scientifica o un’immersione autorizzata.</p></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {worlds.map((world, i) => <button key={world.title} type="button" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className={`overflow-hidden rounded-2xl border text-left transition hover:-translate-y-1 hover:border-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-200 ${open === i ? 'border-cyan-200 bg-slate-800' : 'border-white/10 bg-slate-900/80'}`}>
            <div className={`flex min-h-36 items-end justify-between bg-gradient-to-br ${world.color} p-5`}><span className="text-5xl drop-shadow">{world.icon}</span><span className="rounded-full border border-white/25 bg-black/20 px-3 py-1 text-xs font-bold">{world.depth}</span></div>
            <div className="p-5"><h3 className="text-xl font-black">{world.title}</h3><p className="mt-2 text-sm text-cyan-200">{open === i ? 'CHIUDI −' : 'ESPLORA +'}</p>{open === i && <p className="mt-3 text-sm leading-6 text-slate-200">{world.text}</p>}</div>
          </button>)}
        </div>
      </section>
      <section className="border-y border-cyan-300/20 bg-gradient-to-r from-blue-950 via-cyan-950 to-teal-950">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 sm:px-8 sm:py-14 md:grid-cols-[1fr_auto] md:items-center">
          <div><p className="text-xs font-black uppercase tracking-[.25em] text-cyan-200">Il nostro impegno</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Save the Ocean 💙</h2><p className="mt-4 max-w-2xl leading-7 text-slate-200">Ridurre la plastica dispersa, rispettare la fauna, proteggere gli habitat e scegliere fonti affidabili sono passi concreti. RiverSpend potrà presentare progetti di conservazione verificati quando saranno disponibili criteri chiari e rendicontazione trasparente.</p></div>
          <div className="rounded-2xl border border-white/15 bg-black/20 p-5 text-center"><span className="text-4xl">🌊💚</span><p className="mt-2 font-black">Un oceano da proteggere</p><p className="mt-1 text-xs text-slate-300">Nessuna raccolta fondi è attiva in questa pagina.</p></div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8"><a href="/rs-event-ddays" className="inline-flex rounded-full border border-emerald-300/40 bg-emerald-950/50 px-5 py-3 font-bold text-emerald-100">🌍 Scopri anche RS EVENT D-DAYS · SAVE THE HEART →</a></section>
      <footer className="border-t border-white/10 px-5 py-6 text-center text-xs text-slate-400">RS OCEAN WORLDS · RiverSpend Ecology · YOUR SHOP • YOUR FLOW</footer>
    </main>
  </>;
}
