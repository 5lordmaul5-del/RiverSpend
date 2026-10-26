'use client';

import Head from 'next/head';
import { useState } from 'react';

const days = [
  { date:'12 gennaio', name:'Vulcan Day', icon:'🌋', color:'from-orange-600 to-red-950', text:'La forza dei vulcani e il valore della prevenzione.' },
  { date:'21 gennaio', name:'Freezer Day', icon:'❄️', color:'from-cyan-500 to-blue-950', text:'Ghiaccio, ghiacciai e tutela delle riserve d’acqua.' },
  { date:'11 febbraio', name:'Wind Day', icon:'🌬️', color:'from-sky-500 to-indigo-950', text:'Il vento come forza della natura e risorsa rinnovabile.' },
  { date:'20 febbraio', name:'Tornado Day', icon:'🌪️', color:'from-slate-500 to-slate-950', text:'Conoscere i fenomeni estremi e prepararsi in sicurezza.' },
  { date:'11 marzo', name:'Earthquake Day', icon:'🌍', color:'from-amber-600 to-stone-950', text:'Territorio, prevenzione sismica e comunità resilienti.' },
  { date:'18 marzo', name:'Rain Day', icon:'🌧️', color:'from-blue-500 to-slate-950', text:'L’acqua piovana, una risorsa da proteggere.' },
  { date:'10 aprile', name:'Storm Day', icon:'⛈️', color:'from-indigo-500 to-slate-950', text:'Temporali, informazione e comportamenti responsabili.' },
  { date:'17 aprile', name:'Rainbow Day', icon:'🌈', color:'from-fuchsia-500 to-indigo-950', text:'Biodiversità, colori e bellezza degli ecosistemi.' },
  { date:'12 maggio', name:'Sun Day', icon:'☀️', color:'from-yellow-500 to-orange-950', text:'Il sole, l’energia pulita e la vita sulla Terra.' },
  { date:'20 maggio', name:'Biodiversity Day', icon:'🦋', color:'from-emerald-500 to-green-950', text:'Proteggere specie, habitat e impollinatori.' },
  { date:'12 giugno', name:'Lightning Day', icon:'⚡', color:'from-yellow-400 to-slate-950', text:'La potenza dei fulmini e la sicurezza durante i temporali.' },
  { date:'19 giugno', name:'Wave Day', icon:'🌊', color:'from-cyan-500 to-blue-950', text:'Oceani, coste e mari senza rifiuti.' },
  { date:'12 luglio', name:'Hurricane Day', icon:'🌀', color:'from-teal-500 to-slate-950', text:'Cicloni, clima e resilienza delle comunità.' },
  { date:'21 luglio', name:'Ocean Day', icon:'🐋', color:'from-blue-500 to-indigo-950', text:'Difendere gli oceani e la vita marina.' },
  { date:'5 agosto', name:'Flood Day', icon:'💧', color:'from-sky-500 to-blue-950', text:'Prevenzione delle alluvioni e cura dei corsi d’acqua.' },
  { date:'24 agosto', name:'Forest Day', icon:'🌳', color:'from-green-500 to-emerald-950', text:'Foreste, suolo vivo e riforestazione responsabile.' },
  { date:'12 settembre', name:'Landslide Day', icon:'⛰️', color:'from-amber-700 to-stone-950', text:'Proteggere il territorio e ridurre il rischio idrogeologico.' },
  { date:'21 settembre', name:'Earth Day', icon:'🌎', color:'from-emerald-500 to-blue-950', text:'Un impegno condiviso per il futuro del pianeta.' },
  { date:'12 ottobre', name:'Aurora Day', icon:'🌌', color:'from-violet-500 to-indigo-950', text:'Il cielo, la scienza e la protezione dell’ambiente.' },
  { date:'21 ottobre', name:'Snow Day', icon:'❄️', color:'from-cyan-400 to-slate-950', text:'Neve, montagne e ghiacciai in trasformazione.' },
  { date:'12 novembre', name:'River Day', icon:'🏞️', color:'from-teal-500 to-blue-950', text:'Fiumi puliti e tutela degli habitat d’acqua dolce.' },
  { date:'20 novembre', name:'Wildlife Day', icon:'🦊', color:'from-lime-600 to-green-950', text:'Animali selvatici e rispetto degli habitat naturali.' },
  { date:'3 dicembre', name:'Resilience Day', icon:'🛟', color:'from-orange-500 to-red-950', text:'Solidarietà, preparazione e supporto alle comunità.' },
  { date:'17 dicembre', name:'Save the Heart Day', icon:'💚', color:'from-rose-500 to-emerald-950', text:'Un cuore solo per la Terra: impegno e responsabilità.' }
];

export default function RSEventDDays() {
  const [selected, setSelected] = useState(null);
  return (
    <>
      <Head>
        <title>RS EVENT D-DAYS — SAVE THE HEART | RiverSpend</title>
        <meta name="description" content="24 giornate per la Terra, più RiverSpend Day: il fiume tra le forze della natura." />
        <meta name="theme-color" content="#062b36" />
      </Head>
      <main className="min-h-screen bg-slate-950 text-white">
        <section className="relative isolate overflow-hidden border-b border-emerald-300/30">
          <img src="/rs-event-ddays.svg" alt="Illustrazione della Terra con un cuore luminoso, oceani e foglie" className="absolute inset-0 -z-20 h-full w-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950/30 via-slate-950/55 to-slate-950" />
          <div className="mx-auto flex min-h-[440px] max-w-6xl flex-col justify-end px-5 pb-10 pt-24 sm:min-h-[520px] sm:px-8 sm:pb-16">
            <a href="/" className="mb-5 w-fit rounded-full border border-white/30 bg-slate-950/50 px-4 py-2 text-sm font-bold">← Torna a RiverSpendShop</a>
            <p className="text-xs font-black uppercase tracking-[.28em] text-emerald-200 sm:text-sm">RiverSpend presenta</p>
            <h1 className="mt-2 max-w-4xl text-4xl font-black leading-[.98] sm:text-6xl md:text-7xl">RS EVENT D-DAYS<br/><span className="text-emerald-300">SAVE THE HEART</span></h1>
            <p className="mt-5 max-w-2xl text-lg font-semibold text-white sm:text-2xl">24 giornate per la Terra. Un solo cuore per il futuro.</p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">Un calendario annuale che unisce natura, consapevolezza, iniziative RiverSpend e offerte speciali. Ogni giornata racconta una forza della natura e un modo concreto per prenderci cura del pianeta. In più, RiverSpend Day celebra ogni anno l’anniversario ufficiale del progetto.</p>
            <a href="#calendario" className="mt-6 inline-flex w-fit rounded-full bg-emerald-300 px-6 py-3 font-black text-slate-950 shadow-lg shadow-emerald-950/50">SCOPRI LE 24 GIORNATE ↓</a>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-300/25 bg-emerald-950/50 p-5"><div className="text-3xl">🌍</div><h2 className="mt-2 text-lg font-black">24 D-Days</h2><p className="mt-1 text-sm text-slate-300">Due giornate al mese, distribuite per evitare le principali festività nazionali del 2027.</p></div>
            <div className="rounded-2xl border border-cyan-300/25 bg-cyan-950/40 p-5"><div className="text-3xl">🏷️</div><h2 className="mt-2 text-lg font-black">Offerte D-Days</h2><p className="mt-1 text-sm text-slate-300">Spazio dedicato a Offerta del Giorno, Offertona D-Days e iniziative RS Spons quando saranno collegate a offerte reali.</p></div>
            <div className="rounded-2xl border border-rose-300/25 bg-rose-950/30 p-5"><div className="text-3xl">💚</div><h2 className="mt-2 text-lg font-black">Save the Heart</h2><p className="mt-1 text-sm text-slate-300">Sensibilizzazione ambientale e sostegno a progetti verificati, con destinazione e rendicontazione trasparenti.</p></div>
          </div>
        </section>

        <section id="river-spend-day" className="mx-auto max-w-6xl px-4 pb-10 pt-2 sm:px-8 sm:pb-14">
          <div className="relative overflow-hidden rounded-3xl border border-cyan-200/50 bg-gradient-to-br from-cyan-950 via-teal-950 to-emerald-950 shadow-2xl shadow-cyan-950/40">
            <img src="/rs-event-ddays.svg" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-35" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-teal-950/45" />
            <div className="relative grid gap-5 p-6 sm:p-9 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[.28em] text-cyan-200">L’evento speciale RiverSpend</p>
                <h2 className="mt-2 text-3xl font-black leading-tight sm:text-5xl">🌊 RiverSpend Day</h2>
                <p className="mt-2 text-lg font-extrabold text-emerald-200 sm:text-2xl">Il fiume tra le forze della natura.</p>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-100 sm:text-base">La festa annuale del Fiume RiverSpend e l’anniversario del progetto: celebriamo l’acqua che dà vita, la forza che scorre e la natura che ci unisce. Questa ricorrenza speciale si aggiunge alle 24 giornate D-Days.</p>
                <p className="mt-3 inline-flex rounded-full border border-amber-200/40 bg-amber-950/50 px-3 py-2 text-xs font-bold text-amber-100">📅 Data ufficiale: sarà annunciata quando RiverSpend diventerà operativo.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 md:w-56 md:grid-cols-1">
                <div className="rounded-xl border border-white/15 bg-slate-950/50 p-3 text-center"><span className="text-2xl">🌊</span><p className="mt-1 text-xs font-black">FESTA DEL FIUME</p></div>
                <div className="rounded-xl border border-white/15 bg-slate-950/50 p-3 text-center"><span className="text-2xl">💚</span><p className="mt-1 text-xs font-black">SAVE THE HEART</p></div>
                <div className="col-span-2 rounded-xl border border-white/15 bg-slate-950/50 p-3 text-center md:col-span-1"><span className="text-2xl">🎁</span><p className="mt-1 text-xs font-black">ANNIVERSARIO E SUPER OFFERTE</p></div>
              </div>
            </div>
          </div>
        </section>

        <section id="calendario" className="mx-auto max-w-6xl scroll-mt-5 px-4 pb-12 sm:px-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-xs font-black uppercase tracking-[.25em] text-emerald-300">Calendario proposto</p><h2 className="mt-1 text-3xl font-black sm:text-4xl">Le 24 giornate · 2027</h2></div>
            <span className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-slate-300">Date da confermare prima del lancio</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {days.map((day, index) => <button key={day.name} type="button" onClick={() => setSelected(selected === index ? null : index)} className={`group overflow-hidden rounded-2xl border text-left transition hover:-translate-y-0.5 hover:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 ${selected === index ? 'border-emerald-200 bg-slate-800' : 'border-white/10 bg-slate-900'}`}>
              <div className={`flex items-center gap-4 bg-gradient-to-r ${day.color} p-4`}><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-black/15 text-3xl">{day.icon}</span><div><p className="text-xs font-bold uppercase tracking-widest text-white/75">{day.date}</p><h3 className="mt-1 text-lg font-black leading-tight">{day.name}</h3></div><span className="ml-auto text-xl" aria-hidden="true">{selected === index ? '−' : '+'}</span></div>
              {selected === index && <div className="p-4"><p className="text-sm leading-6 text-slate-200">{day.text}</p><p className="mt-3 text-xs font-bold text-emerald-300">INIZIATIVA RS EVENT D-DAYS</p></div>}
            </button>)}
          </div>
        </section>

        <section className="border-y border-emerald-300/20 bg-gradient-to-br from-emerald-950 via-slate-900 to-cyan-950">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 sm:py-14 md:grid-cols-2 md:items-center">
            <div><p className="text-xs font-black uppercase tracking-[.25em] text-emerald-300">Offerte e iniziative</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Una giornata speciale, un’occasione concreta.</h2><p className="mt-4 leading-7 text-slate-200">Qui troveranno spazio le offerte effettivamente pubblicate, con prezzo, scadenza e condizioni visibili. I countdown partiranno solo quando saranno collegati a un’offerta reale: nessuna promozione fittizia.</p></div>
            <div className="rounded-3xl border border-white/15 bg-slate-950/60 p-6"><div className="text-4xl">⚡</div><h3 className="mt-2 text-2xl font-black">Offertona D-Days</h3><p className="mt-2 text-sm leading-6 text-slate-300">Sezione pronta per le promozioni della giornata e per gli eventuali contenuti RS Spons.</p><a href="/rs-spons" className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">SCOPRI RS SPONS →</a></div>
          </div>
        </section>

        <section id="save-the-heart" className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="rounded-3xl border border-rose-300/25 bg-gradient-to-br from-rose-950/70 to-emerald-950/60 p-6 sm:p-10">
            <div className="text-5xl">💚🌍</div><p className="mt-4 text-xs font-black uppercase tracking-[.25em] text-emerald-300">Save the Heart</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">La solidarietà deve essere trasparente.</h2>
            <p className="mt-4 max-w-3xl leading-7 text-slate-200">RiverSpend potrà promuovere progetti per foreste, oceani, biodiversità e prevenzione dei rischi naturali. Prima di attivare raccolte di denaro saranno indicati il beneficiario verificato, la destinazione dei fondi e la rendicontazione dei trasferimenti.</p>
            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">{['Foreste 🌳','Oceani 🌊','Biodiversità 🦋','Resilienza 🛟'].map(label => <div key={label} className="rounded-xl border border-white/10 bg-black/20 px-3 py-4 text-center text-sm font-bold">{label}</div>)}</div>
            <p className="mt-6 rounded-xl border border-amber-200/20 bg-amber-950/30 p-4 text-sm leading-6 text-amber-100">Le donazioni online non sono ancora attive. Non inviare denaro tramite questa pagina: la funzione sarà attivata solo dopo aver definito un beneficiario affidabile e un processo verificabile.</p>
          </div>
        </section>
        <footer className="border-t border-white/10 px-5 py-6 text-center text-xs text-slate-400">RS EVENT D-DAYS · SAVE THE HEART · RiverSpend — YOUR SHOP • YOUR FLOW</footer>
      </main>
    </>
  );
}
