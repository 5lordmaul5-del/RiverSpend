'use client';

import { useState } from 'react';

const missions = [
  {
    icon: '🌳',
    title: 'Adotta anche tu un albero',
    body: 'Contribuisci a progetti verificati di piantumazione, cura degli alberi giovani e rigenerazione delle foreste.',
    details: 'Ogni progetto dovrà indicare luogo, partner responsabile, obiettivo, costi e aggiornamenti sulla crescita.'
  },
  {
    icon: '🌱',
    title: 'Ridiamo vita ai terreni',
    body: 'Sosteniamo il recupero di aree degradate e terreni abbandonati, valutando acquisti solo quando sostenibili e legalmente possibili.',
    details: 'Collaboreremo con proprietari, Comuni, enti e organizzazioni locali prima di avviare qualsiasi intervento.'
  },
  {
    icon: '🌊',
    title: 'Proteggiamo mari e fiumi',
    body: 'Promuoviamo iniziative documentate per ridurre i rifiuti e tutelare gli ecosistemi acquatici.',
    details: 'I risultati saranno pubblicati con aggiornamenti, fotografie e rendicontazione del progetto.'
  },
  {
    icon: '🦋',
    title: 'Tutela della biodiversità',
    body: 'Sosteniamo partner affidabili che proteggono habitat e specie locali.',
    details: 'Le iniziative saranno selezionate in base a obiettivi misurabili e verifiche sul campo.'
  }
];

export default function RiverSpendEcology() {
  const [expanded, setExpanded] = useState(-1);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-teal-800/70 bg-slate-950 px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <a href="/" className="text-lg font-black tracking-tight text-white">RiverSpend<span className="text-amber-400">Shop</span></a>
          <a href="/" className="rounded-full border border-teal-700 px-4 py-2 text-sm font-semibold text-teal-200 hover:bg-teal-950">← Torna allo Shop</a>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-teal-800 bg-gradient-to-br from-emerald-950 via-slate-950 to-cyan-950">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
          <p className="mb-3 text-sm font-extrabold uppercase tracking-[.24em] text-emerald-300">RiverSpend Ecology · Insieme per il pianeta</p>
          <h1 className="max-w-4xl text-4xl font-black leading-tight sm:text-6xl">Un mondo più verde. Un futuro condiviso.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">Dall’Italia al mondo, vogliamo unire persone e comunità per sostenere la natura con progetti concreti, trasparenti e verificabili.</p>
          <a href="#missioni" className="mt-7 inline-flex rounded-xl bg-emerald-300 px-5 py-3 font-extrabold text-emerald-950 hover:bg-emerald-200">Scopri le missioni ↓</a>
        </div>
      </section>

      <section id="missioni" className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="mb-7 max-w-3xl">
          <h2 className="text-2xl font-black sm:text-3xl">Piccoli gesti, progetti concreti</h2>
          <p className="mt-3 leading-6 text-slate-300">Queste sono le aree che vogliamo sviluppare con partner qualificati in Italia e a livello internazionale.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {missions.map((mission, index) => (
            <article key={mission.title} className="rounded-2xl border border-teal-800 bg-slate-900/80 p-5 shadow-lg shadow-black/10">
              <div className="text-3xl" aria-hidden="true">{mission.icon}</div>
              <h3 className="mt-3 text-xl font-extrabold">{mission.title}</h3>
              <p className="mt-2 leading-6 text-slate-300">{mission.body}</p>
              <button type="button" onClick={() => setExpanded(expanded === index ? -1 : index)} aria-expanded={expanded === index} className="mt-4 rounded-lg border border-teal-700 px-3 py-2 text-sm font-bold text-teal-200 hover:bg-teal-950">{expanded === index ? 'Chiudi dettagli' : 'Come vogliamo farlo'}</button>
              {expanded === index && <p className="mt-3 rounded-lg bg-slate-950 p-3 text-sm leading-6 text-slate-300">{mission.details}</p>}
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-emerald-900 bg-gradient-to-r from-emerald-950/80 to-teal-950/70">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-[1.2fr_.8fr] sm:items-center sm:py-14">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[.2em] text-emerald-300">Una proposta per tutti</p>
            <h2 className="mt-2 text-3xl font-black">Adotta anche tu un albero</h2>
            <p className="mt-3 max-w-2xl leading-6 text-slate-200">Stiamo progettando una campagna con contributo suggerito di 10 € per sostenere progetti ambientali selezionati. Il contributo non è ancora attivo: prima pubblicheremo partner, obiettivi, costi e modalità di rendicontazione.</p>
          </div>
          <div className="rounded-2xl border border-emerald-700 bg-slate-950/70 p-5">
            <p className="text-sm font-semibold text-slate-300">Contributo suggerito, in fase di progettazione</p>
            <p className="mt-1 text-4xl font-black text-emerald-300">10 €</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">Nessun pagamento viene richiesto da questa pagina. L’importo effettivo destinato agli interventi sarà comunicato con chiarezza quando la campagna sarà attivata.</p>
            <span className="mt-4 inline-flex rounded-full border border-amber-500/60 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-amber-200">Campagna in preparazione</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-black sm:text-3xl">Trasparenza prima di tutto</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><h3 className="font-bold text-teal-200">Partner identificati</h3><p className="mt-2 text-sm leading-6 text-slate-300">Ogni progetto dovrà indicare chi lo realizza e dove.</p></div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><h3 className="font-bold text-teal-200">Fondi rendicontati</h3><p className="mt-2 text-sm leading-6 text-slate-300">Obiettivi, spese e costi amministrativi saranno dichiarati.</p></div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><h3 className="font-bold text-teal-200">Risultati verificabili</h3><p className="mt-2 text-sm leading-6 text-slate-300">Condivideremo aggiornamenti e prove dei lavori effettivamente svolti.</p></div>
        </div>
      </section>

      <footer className="border-t border-slate-800 px-4 py-7 text-center text-sm text-slate-400">
        <p className="font-bold text-teal-300">RiverSpend Ecology</p>
        <p className="mt-1">YOUR SHOP • YOUR FLOW</p>
        <p className="mx-auto mt-3 max-w-3xl">Questa pagina presenta una missione in fase di progettazione. Non è una richiesta di pagamento né una promessa di risultati ambientali già conseguiti.</p>
      </footer>
    </main>
  );
}
