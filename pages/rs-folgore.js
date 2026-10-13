"use client";

import Head from "next/head";

export default function RsFolgorePage() {
  return (
    <>
      <Head>
        <title>RS Folgore | RiverSpendShop</title>
        <meta name="description" content="RS Folgore: la missione RiverSpend che porta offerte e sorprese dal cielo." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="min-h-screen bg-slate-950 text-white">
        <header className="border-b border-orange-300/20 bg-slate-950/95 px-4 py-4">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <a href="/" className="text-sm font-bold text-orange-100 hover:text-white">← RiverSpendShop</a>
            <span className="text-xs font-extrabold tracking-[0.18em] text-orange-200">YOUR SHOP • YOUR FLOW</span>
          </div>
        </header>
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-orange-950/60 to-slate-900 px-4 py-10 sm:py-16">
          <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-2">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-orange-300/40 bg-orange-300/10 px-3 py-1.5 text-xs font-extrabold tracking-[0.18em] text-orange-200">✈️ MISSIONE RIVERSPEND</p>
              <h1 className="text-4xl font-black leading-tight sm:text-6xl"><span className="text-orange-300">⚡</span> RS <span className="text-orange-300">Folgore</span> <span className="text-orange-300">⚡</span></h1>
              <p className="mt-4 text-lg font-bold leading-7 text-orange-50">Le offerte arrivano dal cielo.</p>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-200">Ispirata alle missioni di lancio con paracadute, RS Folgore è pensata per portare in evidenza offerte, prodotti selezionati, promozioni lampo e iniziative RiverSpend.</p>
              <a href="/?future=offers" className="mt-6 inline-flex items-center justify-center rounded-full bg-orange-300 px-6 py-3 font-extrabold text-slate-950 hover:bg-orange-200">Vai alle offerte →</a>
            </div>
            <div className="overflow-hidden rounded-3xl border border-orange-300/40 bg-black/30 p-2 shadow-2xl shadow-orange-950/40">
              <img src="/rs-folgore-pacchi.png" alt="Immagine della missione RS Folgore con aereo e pacchi paracadutati" className="max-h-[460px] w-full rounded-2xl object-cover" />
              <div className="p-4">
                <p className="font-extrabold">Missione RS Folgore</p>
                <p className="mt-1 text-xs leading-5 text-orange-100/80">Esperienza in fase di sviluppo</p>
              </div>
            </div>
          </div>
        </section>
        <section className="px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl font-black sm:text-3xl">Cosa porterà la missione?</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                ["🏷️", "Offerte selezionate", "Promozioni e prodotti in evidenza, quando disponibili nel catalogo."],
                ["⚡", "Promozioni lampo", "Iniziative a tempo da pubblicare con prezzi e condizioni chiari."],
                ["🎁", "Sorprese RiverSpend", "Eventuali premi o iniziative speciali saranno annunciati solo quando confermati."]
              ].map(([icon, title, text]) => (
                <article key={title} className="rounded-2xl border border-orange-300/20 bg-white/[0.04] p-5">
                  <span className="text-3xl" aria-hidden="true">{icon}</span>
                  <h3 className="mt-3 font-extrabold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
                </article>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-orange-300/30 bg-orange-300/[0.07] p-5">
              <h3 className="font-extrabold text-orange-200">Stato attuale</h3>
              <p className="mt-2 text-sm leading-6 text-slate-200">La pagina della missione è stata creata per rendere navigabile RS Folgore. Le offerte reali saranno mostrate quando il collegamento al catalogo e i filtri promozionali saranno verificati. Questa pagina non dichiara offerte o premi non ancora attivi.</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/?future=offers" className="inline-flex rounded-full bg-orange-300 px-5 py-3 text-sm font-extrabold text-slate-950 hover:bg-orange-200">Esplora le offerte →</a>
              <a href="/" className="inline-flex rounded-full border border-slate-500 px-5 py-3 text-sm font-extrabold hover:bg-white/10">Torna alla home</a>
            </div>
          </div>
        </section>
        <footer className="border-t border-orange-300/15 px-4 py-6 text-center text-xs text-slate-400">RiverSpend · RS Folgore · YOUR SHOP • YOUR FLOW</footer>
      </main>
    </>
  );
}
