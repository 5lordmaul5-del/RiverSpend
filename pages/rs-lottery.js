"use client";

import { useState } from "react";
import Head from "next/head";

const prizeTypes = [
  { icon: "🎁", title: "Buono da 5 €", text: "Un piccolo buono acquisto da utilizzare su RiverSpendShop, se confermato nel regolamento." },
  { icon: "🛍️", title: "Buono da 10 € o 20 €", text: "Premi semplici e sostenibili per ringraziare i clienti, secondo le condizioni che saranno pubblicate." },
  { icon: "💛", title: "Premio fino a 30 €", text: "Un premio di valore contenuto. Eventuali importi superiori saranno valutati solo in futuro, in base al budget disponibile." },
];

const wheelPrizes = [
  { icon: "🎁", label: "Buono da 5 €" },
  { icon: "⭐", label: "500 punti RSP (demo)" },
  { icon: "🏷️", label: "Sconto del 5% (demo)" },
  { icon: "💛", label: "Buono da 10 €" },
  { icon: "🚚", label: "Spedizione gratuita (demo)" },
  { icon: "🎉", label: "Riprova alla prossima" },
  { icon: "🛍️", label: "Buono da 20 €" },
  { icon: "✨", label: "Premio sorpresa (demo)" },
];

export default function RsLotteryPage() {
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState("");
  
  function spinLotteryWheel() {
    if (wheelSpinning) return;
    setWheelSpinning(true);
    setWheelResult("");
    const prize = wheelPrizes[Math.floor(Math.random() * wheelPrizes.length)];
    setWheelRotation((current) => current + 1800 + Math.floor(Math.random() * 360));
    window.setTimeout(() => {
      setWheelResult(prize.label);
      setWheelSpinning(false);
    }, 4200);
  }

  return (
    <>
      <Head>
        <title>RS Lottery | RiverSpend</title>
        <meta name="description" content="Scopri RS Lottery di RiverSpend: un progetto di ringraziamento ai clienti con piccoli buoni acquisto e premi sostenibili, in preparazione." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="min-h-screen bg-[#10091d] text-white">
        <header className="border-b border-violet-300/20 bg-[#10091d]/95 px-4 py-4">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <a href="/" className="text-sm font-bold text-violet-100 hover:text-white">← RiverSpendShop</a>
            <span className="text-xs font-extrabold tracking-[0.18em] text-amber-300">YOUR SHOP • YOUR FLOW</span>
          </div>
        </header>

        <section className="relative overflow-hidden border-b border-violet-300/20 bg-gradient-to-br from-violet-950 via-[#24103f] to-[#10091d] px-4 py-12 sm:py-20">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="relative mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1.5 text-xs font-extrabold tracking-[0.2em] text-amber-200">🎟️ RIVERSPEND PRESENTA</p>
              <h1 className="text-4xl font-black leading-tight sm:text-6xl">RS <span className="text-amber-300">LOTTERY</span></h1>
              <p className="mt-4 max-w-xl text-lg font-semibold leading-7 text-violet-100 sm:text-xl">Un’iniziativa speciale RiverSpend, pensata per trasformare la partecipazione in un’esperienza chiara, coinvolgente e trasparente.</p>
              <p className="mt-4 max-w-xl text-sm leading-6 text-violet-200">Questa pagina presenta il progetto in preparazione. Date, modalità di partecipazione, premi e regolamento definitivi saranno pubblicati prima dell’eventuale avvio.</p>
              <a href="#come-funzionera" className="mt-7 inline-flex items-center justify-center rounded-full bg-amber-300 px-6 py-3 font-extrabold text-violet-950 shadow-lg shadow-amber-950/30 transition hover:bg-amber-200">Scopri come funzionerà ↓</a>
            </div>
            <div className="overflow-hidden rounded-3xl border border-violet-200/30 bg-black/20 p-2 shadow-2xl shadow-violet-950/40">
              <img src="/rs-lottery.jpg" alt="Immagine di presentazione RS Lottery RiverSpend" className="h-64 w-full rounded-2xl object-cover object-center sm:h-80" />
              <div className="flex items-center justify-between gap-3 px-3 py-4">
                <div><p className="font-extrabold">RS Lottery Annuale</p><p className="mt-1 text-xs text-violet-200">Pagina informativa · iniziativa in preparazione</p></div>
                <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-200">In preparazione</span>
              </div>
            </div>
          </div>
        </section>


        <section className="border-y border-amber-300/20 bg-[#180d29] px-4 py-12 sm:py-16">
          <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-2">
            <div>
              <p className="text-xs font-extrabold tracking-[0.22em] text-amber-300">PROVALA ORA</p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">La ruota RS Lottery</h2>
              <p className="mt-3 leading-7 text-violet-100">Premi il pulsante e guarda girare la ruota. Questa è una demo grafica: il risultato è simulato e non assegna premi, buoni, punti o sconti reali.</p>
              <button type="button" onClick={spinLotteryWheel} disabled={wheelSpinning} className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-amber-300 px-6 py-3 font-extrabold text-violet-950 shadow-lg shadow-amber-950/30 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60">
                {wheelSpinning ? "🎡 La ruota gira…" : "🎡 GIRA LA RUOTA"}
              </button>
              {wheelResult && <p role="status" className="mt-4 rounded-xl border border-amber-300/40 bg-amber-300/10 p-4 font-extrabold text-amber-200">Risultato della demo: {wheelResult}</p>}
            </div>
            <div className="flex flex-col items-center">
              <span className="z-10 -mb-3 text-3xl" aria-hidden="true">🔻</span>
              <div className="relative h-72 w-72 max-w-full rounded-full border-8 border-amber-300 shadow-[0_0_35px_rgba(251,191,36,.25)]" style={{ background: "conic-gradient(#7c3aed 0deg 45deg,#f59e0b 45deg 90deg,#0f766e 90deg 135deg,#be185d 135deg 180deg,#2563eb 180deg 225deg,#b45309 225deg 270deg,#6d28d9 270deg 315deg,#047857 315deg 360deg)", transform: `rotate(${wheelRotation}deg)`, transition: wheelSpinning ? "transform 4.2s cubic-bezier(.12,.72,.08,1)" : "none" }}>
                {wheelPrizes.map((prize, index) => <div key={prize.label} className="absolute left-1/2 top-1/2 flex h-24 w-16 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-start text-center text-white" style={{ transform: `translate(-50%,-50%) rotate(${index * 45 + 22.5}deg) translateY(-82px) rotate(-${index * 45 + 22.5}deg)` }}><span className="text-2xl">{prize.icon}</span><span className="mt-1 text-[9px] font-black leading-tight">{prize.label}</span></div>)}
                <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-amber-200 bg-[#170b29] text-center text-xs font-black text-amber-200">RS<br/>LOTTERY</div>
              </div>
              <p className="mt-4 text-center text-xs text-violet-300">Simulazione dimostrativa · nessun premio reale assegnato</p>
            </div>
          </div>
        </section>

        <section id="come-funzionera" className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs font-extrabold tracking-[0.22em] text-amber-300">TUTTO IN CHIARO</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">Come funzionerà</h2>
            <p className="mt-3 max-w-3xl leading-7 text-violet-100">Prima dell'avvio sarà pubblicato un regolamento completo, con i requisiti per partecipare, il periodo valido, le modalità di assegnazione dei codici, la procedura di estrazione e le modalità di comunicazione dei risultati.</p>
            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              {[
                ["01", "Leggi il regolamento", "Le condizioni e le date ufficiali saranno consultabili prima dell'inizio."],
                ["02", "Verifica la partecipazione", "Eventuali requisiti e codici saranno confermati solo attraverso procedure realmente attive e verificabili."],
                ["03", "Consulta gli aggiornamenti", "Date, risultati e istruzioni per i partecipanti saranno comunicati tramite i canali ufficiali indicati nel regolamento."],
              ].map(([n, title, text]) => (
                <article key={n} className="rounded-2xl border border-violet-300/20 bg-white/[0.04] p-5">
                  <span className="text-sm font-black text-amber-300">{n}</span>
                  <h3 className="mt-3 text-lg font-extrabold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-violet-200">{text}</p>
                </article>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-amber-300/30 bg-amber-300/[0.07] p-5">
              <h3 className="font-extrabold text-amber-200">Stato attuale</h3>
              <p className="mt-2 text-sm leading-6 text-violet-100">Al momento questa pagina è informativa: non è aperta alcuna estrazione e non vengono assegnati codici attraverso questa pagina. Nessun acquisto garantisce un premio. Le condizioni saranno definite e verificate prima di annunciare l'iniziativa come attiva.</p>
            </div>
          </div>
        </section>

        <section id="partner-sponsor" className="border-y border-amber-300/20 bg-gradient-to-br from-[#211039] via-[#160b2b] to-[#10091d] px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs font-extrabold tracking-[0.22em] text-amber-300">PARTNER UFFICIALI</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">Piccoli premi, un grande grazie</h2>
            <p className="mt-3 max-w-3xl leading-7 text-violet-100">RS Lottery partirà con premi di valore contenuto, come buoni acquisto da 5 €, 10 €, 20 € o 30 € da utilizzare su RiverSpendShop. Il budget sarà deciso in anticipo e non saranno promessi premi che RiverSpend non può sostenere. Eventuali sponsor potranno contribuire solo dopo un accordo confermato.</p>
            <div className="mt-7 overflow-hidden rounded-3xl border border-amber-300/40 bg-gradient-to-r from-amber-300/10 via-white/[0.04] to-violet-500/10 p-6 sm:p-8">
              <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
                <div>
                  <span className="inline-flex rounded-full border border-amber-300/50 bg-amber-300/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-200">Premi iniziali</span>
                  <h3 className="mt-4 text-2xl font-black sm:text-3xl">Buoni acquisto di piccolo valore</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-100">L'idea iniziale è offrire piccoli buoni da 5 €, 10 €, 20 € o 30 €, compatibilmente con il budget disponibile. Gli importi sono esempi di progetto, non premi già attivi o confermati.</p>
                </div>
                <div className="flex h-28 w-28 items-center justify-center justify-self-center rounded-full border border-amber-300/50 bg-amber-300/10 text-5xl shadow-lg shadow-amber-950/30" aria-label="Buono acquisto">🎁</div>
              </div>
              <p className="mt-5 border-t border-amber-200/20 pt-4 text-xs leading-5 text-violet-200">Nessun premio è ancora confermato. RiverSpend definirà importi, quantità e budget prima dell'eventuale avvio.</p>
            </div>

            <div className="mt-10">
              <p className="text-xs font-extrabold tracking-[0.22em] text-amber-300">RS SPONS</p>
              <h3 className="mt-2 text-2xl font-black sm:text-3xl">Anche il tuo brand può farsi vedere</h3>
              <p className="mt-3 max-w-3xl leading-7 text-violet-200">Possiamo riservare spazi pubblicitari per aziende e attività: banner in evidenza, sponsor di sezione e inserzioni secondarie. Formati, durata, prezzi e condizioni saranno definiti prima di vendere gli spazi.</p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <article className="rounded-2xl border border-amber-300/35 bg-black/20 p-5">
                  <span className="text-2xl" aria-hidden="true">👑</span>
                  <h4 className="mt-3 font-extrabold">Sponsor principale</h4>
                  <p className="mt-2 text-sm leading-6 text-violet-200">Visibilità dedicata vicino al primo premio, dopo accordo ufficiale.</p>
                </article>
                <article className="rounded-2xl border border-violet-200/25 bg-white/[0.04] p-5">
                  <span className="text-2xl" aria-hidden="true">🖼️</span>
                  <h4 className="mt-3 font-extrabold">Banner pubblicitario</h4>
                  <p className="mt-2 text-sm leading-6 text-violet-200">Spazio grafico per promuovere prodotti, servizi o offerte del partner.</p>
                </article>
                <article className="rounded-2xl border border-violet-200/25 bg-white/[0.04] p-5">
                  <span className="text-2xl" aria-hidden="true">🤝</span>
                  <h4 className="mt-3 font-extrabold">Partner di categoria</h4>
                  <p className="mt-2 text-sm leading-6 text-violet-200">Presenza in una sezione tematica, con contenuti e durata concordati.</p>
                </article>
              </div>
              <div className="mt-6 rounded-2xl border border-violet-200/20 bg-white/[0.04] p-5">
                <p className="font-extrabold text-white">Spazi sponsor in preparazione</p>
                <p className="mt-2 text-sm leading-6 text-violet-200">Questa è una presentazione del progetto pubblicitario, non un sistema di acquisto banner attivo. Prima di accettare inserzioni dovremo aggiungere un contatto commerciale verificato, condizioni, prezzi e una procedura per caricare e approvare i materiali.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-violet-300/15 bg-white/[0.025] px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs font-extrabold tracking-[0.22em] text-amber-300">CATEGORIE INDICATIVE</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">Premi piccoli e sostenibili</h2>
            <p className="mt-3 max-w-3xl leading-7 text-violet-200">Per iniziare immaginiamo buoni acquisto di piccolo valore, indicativamente da 5 € a 30 €. Gli importi sono proposte e non costituiscono un impegno finché budget e condizioni non saranno confermati.</p>
            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {prizeTypes.map((prize) => (
                <article key={prize.title} className="rounded-2xl border border-violet-300/20 bg-gradient-to-b from-violet-900/30 to-black/20 p-6">
                  <span className="text-4xl" aria-hidden="true">{prize.icon}</span>
                  <h3 className="mt-4 text-xl font-extrabold">{prize.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-violet-200">{prize.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-black">Date, codici e vincitori</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <article className="rounded-2xl border border-violet-300/20 bg-white/[0.04] p-5">
                <h3 className="font-extrabold text-amber-200">Calendario ufficiale</h3>
                <p className="mt-2 text-sm leading-6 text-violet-200">Le date di apertura, chiusura ed eventuale estrazione non sono ancora confermate. Saranno mostrate qui prima dell'avvio.</p>
              </article>
              <article className="rounded-2xl border border-violet-300/20 bg-white/[0.04] p-5">
                <h3 className="font-extrabold text-amber-200">I miei codici</h3>
                <p className="mt-2 text-sm leading-6 text-violet-200">Quando l'assegnazione dei codici sarà implementata e verificata, potrai accedere al profilo per controllare quelli effettivamente associati alla tua partecipazione.</p>
                <a href="/profilo" className="mt-4 inline-flex rounded-xl border border-violet-200/40 px-4 py-2 text-sm font-bold hover:bg-violet-800/40">Vai al profilo →</a>
              </article>
            </div>
            <p className="mt-7 text-xs leading-5 text-violet-300">Prima di qualsiasi lancio saranno verificati il regolamento e gli adempimenti normativi applicabili. Questa pagina non costituisce un regolamento ufficiale né un invito a partecipare a un'estrazione attiva.</p>
            <div className="mt-9 text-center"><a href="/" className="inline-flex rounded-full border border-violet-200/40 px-6 py-3 text-sm font-extrabold hover:bg-violet-800/40">← Torna a RiverSpendShop</a></div>
          </div>
        </section>
        <footer className="border-t border-violet-300/15 px-4 py-6 text-center text-xs text-violet-300">RiverSpend · YOUR SHOP • YOUR FLOW</footer>
      </main>
    </>
  );
}
