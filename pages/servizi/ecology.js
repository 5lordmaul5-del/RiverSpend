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

// Esempi esclusivamente illustrativi: non rappresentano raccolte reali.
const reportingExamples = [
  {
    icon: '🌳',
    title: 'Esempio: campagna alberi',
    cause: 'Progetto ambientale con fondazione partner da identificare',
    collected: 10000,
    beneficiary: 9000,
    solidarity: 1000,
    status: 'Esempio di rendicontazione',
    note: 'Prima di pubblicare una campagna reale saranno indicati il partner, il progetto, le date e i documenti di trasferimento.'
  },
  {
    icon: '🤝',
    title: 'Esempio: emergenza terremoto',
    cause: 'Intervento di emergenza con ente beneficiario da verificare',
    collected: 10000,
    beneficiary: 9000,
    solidarity: 1000,
    status: 'Esempio di rendicontazione',
    note: 'Il beneficiario e il trasferimento saranno pubblicati solo dopo verifica e documentazione. Il fondo solidale potrà sostenere altre cause secondo criteri pubblici.'
  }
];

const euro = (amount) => new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2
}).format(amount);

export default function RiverSpendEcology() {
  const [expanded, setExpanded] = useState(-1);
  const [showExamples, setShowExamples] = useState(true);

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
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">Dall’Italia al mondo, vogliamo unire persone e comunità per sostenere la natura e le persone con progetti concreti, trasparenti e verificabili.</p>
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

      <section id="rendicontazione" className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-extrabold uppercase tracking-[.2em] text-emerald-300">Registro pubblico</p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">Quanto abbiamo raccolto e dove va ogni euro</h2>
            <p className="mt-3 leading-6 text-slate-300">Ogni campagna avrà un rendiconto separato: totale raccolto, 90% destinato al beneficiario indicato e 10% accantonato nel Fondo iniziative RiverSpendShop per sostenere altre cause. Pubblicheremo i trasferimenti documentati e gli aggiornamenti dei progetti.</p>
          </div>
          <button type="button" onClick={() => setShowExamples(!showExamples)} aria-expanded={showExamples} className="shrink-0 rounded-xl border border-teal-700 px-4 py-3 text-sm font-bold text-teal-200 hover:bg-teal-950">{showExamples ? 'Nascondi esempi' : 'Mostra esempi'}</button>
        </div>

        <div className="mt-5 rounded-xl border border-amber-600/50 bg-amber-950/30 p-4 text-sm leading-6 text-amber-100">
          <strong>Importante:</strong> gli importi mostrati qui sotto sono esempi di come apparirà il rendiconto, non sono donazioni realmente raccolte né trasferimenti già effettuati. I dati reali saranno pubblicati solo dopo l’attivazione regolare delle campagne e la verifica dei documenti.
        </div>

        {showExamples && <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {reportingExamples.map((report) => (
            <article key={report.title} className="overflow-hidden rounded-2xl border border-teal-800 bg-slate-900">
              <div className="border-b border-slate-800 p-5">
                <div className="flex items-start gap-3">
                  <span className="text-3xl" aria-hidden="true">{report.icon}</span>
                  <div className="flex-1">
                    <span className="inline-flex rounded-full border border-amber-500/50 px-2.5 py-1 text-xs font-bold text-amber-200">{report.status}</span>
                    <h3 className="mt-3 text-xl font-extrabold">{report.title}</h3>
                    <p className="mt-1 text-sm leading-5 text-slate-400">{report.cause}</p>
                  </div>
                </div>
                <p className="mt-5 text-sm text-slate-400">Totale raccolto nell’esempio</p>
                <p className="text-3xl font-black text-white">{euro(report.collected)}</p>
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-slate-200">90% · Beneficiario della causa</span>
                    <strong className="text-emerald-300">{euro(report.beneficiary)}</strong>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-700"><div className="h-full w-[90%] rounded-full bg-emerald-400" /></div>
                  <p className="mt-1 text-xs text-slate-400">Beneficiario effettivo e ricevuta del trasferimento saranno indicati nel rendiconto reale.</p>
                </div>
                <div>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-slate-200">10% · Fondo iniziative RiverSpendShop</span>
                    <strong className="text-amber-300">{euro(report.solidarity)}</strong>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-700"><div className="h-full w-[10%] rounded-full bg-amber-400" /></div>
                  <p className="mt-1 text-xs text-slate-400">Quota riservata ad altre cause, da rendicontare separatamente quando assegnata.</p>
                </div>
                <p className="rounded-lg bg-slate-950 p-3 text-sm leading-6 text-slate-300">{report.note}</p>
              </div>
            </article>
          ))}
        </div>}

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h3 className="text-lg font-extrabold">Come sarà verificabile ogni movimento</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-300">
            <li>Pubblicazione del nome della campagna, delle date e del totale effettivamente raccolto.</li>
            <li>Calcolo visibile della ripartizione 90% / 10% e indicazione di eventuali costi ulteriori, se previsti e dichiarati.</li>
            <li>Nome del beneficiario, data e prova del trasferimento, oscurando i dati personali e bancari non necessari.</li>
            <li>Registro del Fondo iniziative RiverSpendShop: saldo iniziale, nuove quote del 10%, importi assegnati ad altre cause e saldo residuo.</li>
            <li>Aggiornamenti sull’utilizzo dei fondi e sui risultati comunicati dai partner.</li>
          </ol>
          <p className="mt-4 text-xs leading-5 text-slate-400">Il registro sarà aggiornato con dati verificati. La pagina, da sola, non dimostra che una raccolta o un trasferimento sia avvenuto; la raccolta sarà attivata soltanto dopo aver definito beneficiari, gestione legale e contabile e procedure di rendicontazione.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <h2 className="text-2xl font-black sm:text-3xl">Trasparenza prima di tutto</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><h3 className="font-bold text-teal-200">Partner identificati</h3><p className="mt-2 text-sm leading-6 text-slate-300">Ogni progetto dovrà indicare chi lo realizza e dove.</p></div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><h3 className="font-bold text-teal-200">Fondi rendicontati</h3><p className="mt-2 text-sm leading-6 text-slate-300">Obiettivi, spese e trasferimenti saranno dichiarati.</p></div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4"><h3 className="font-bold text-teal-200">Risultati verificabili</h3><p className="mt-2 text-sm leading-6 text-slate-300">Condivideremo aggiornamenti e prove dei lavori effettivamente svolti.</p></div>
        </div>
      </section>


      <section id="solidale" className="border-y border-rose-900 bg-gradient-to-br from-rose-950 via-slate-950 to-emerald-950">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <p className="text-sm font-extrabold uppercase tracking-[.22em] text-rose-300">RiverSpend Solidale · Idea in preparazione</p>
          <h2 className="mt-3 max-w-4xl text-3xl font-black leading-tight sm:text-5xl">Vicini alle persone, soprattutto nei momenti difficili.</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">Vogliamo progettare iniziative solidali a sostegno di anziani, persone senza dimora, famiglie in difficoltà e comunità colpite da terremoti o alluvioni. Le attività saranno definite con enti e partner verificati.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-2xl border border-rose-800 bg-slate-950/70 p-5"><div className="text-3xl" aria-hidden="true">🤝</div><h3 className="mt-3 text-xl font-extrabold">Aiuto alle persone fragili</h3><p className="mt-2 text-sm leading-6 text-slate-300">Progetti da definire con organizzazioni competenti per sostenere anziani, persone senza dimora e famiglie in difficoltà.</p></article>
            <article className="rounded-2xl border border-rose-800 bg-slate-950/70 p-5"><div className="text-3xl" aria-hidden="true">🏠</div><h3 className="mt-3 text-xl font-extrabold">Accoglienza e abitare</h3><p className="mt-2 text-sm leading-6 text-slate-300">Valutare soluzioni abitative e percorsi di accoglienza insieme a enti locali e partner qualificati.</p></article>
            <article className="rounded-2xl border border-rose-800 bg-slate-950/70 p-5"><div className="text-3xl" aria-hidden="true">🆘</div><h3 className="mt-3 text-xl font-extrabold">Emergenze e ricostruzione</h3><p className="mt-2 text-sm leading-6 text-slate-300">Possibili campagne per terremoti, alluvioni e altre emergenze, con beneficiari e utilizzo dei fondi verificati.</p></article>
          </div>
          <div className="mt-6 rounded-xl border border-amber-600/50 bg-amber-950/30 p-4 text-sm leading-6 text-amber-100"><strong>Stato:</strong> questa sezione presenta idee da sviluppare, non una raccolta attiva. Non inviare denaro: beneficiari, partner, procedure e rendicontazione devono ancora essere definiti.</div>
        </div>
      </section>

            <section id="future-life" className="border-y border-violet-900 bg-gradient-to-br from-violet-950 via-slate-950 to-cyan-950">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <p className="text-sm font-extrabold uppercase tracking-[.22em] text-violet-300">PiggyBank Future Life · RiverSpend Solidale</p>
          <h2 className="mt-3 max-w-4xl text-3xl font-black leading-tight sm:text-5xl">Siamo RiverSpend: un mondo a parte, un mondo nuovo.</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">Unire le persone per trasformare la solidarietà in progetti concreti: aiutare gli ospedali, sostenere chi affronta una malattia e contribuire alla ricerca scientifica per una vita più lunga e in salute.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-2xl border border-violet-800 bg-slate-950/70 p-5">
              <div className="text-3xl" aria-hidden="true">🏥</div>
              <h3 className="mt-3 text-xl font-extrabold">Ospedali più attrezzati</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">Sostenere l'acquisto di letti ospedalieri, sedie a rotelle, strumenti diagnostici e attrezzature richieste da strutture sanitarie verificate.</p>
            </article>
            <article className="rounded-2xl border border-violet-800 bg-slate-950/70 p-5">
              <div className="text-3xl" aria-hidden="true">🧬</div>
              <h3 className="mt-3 text-xl font-extrabold">Ricerca e nuove cure</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">Contribuire a studi seri su malattie gravi, prevenzione, diagnosi precoce e terapie, con istituzioni scientifiche qualificate.</p>
            </article>
            <article className="rounded-2xl border border-violet-800 bg-slate-950/70 p-5">
              <div className="text-3xl" aria-hidden="true">🔭</div>
              <h3 className="mt-3 text-xl font-extrabold">Future Life: longevità</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">Esplorare la ricerca sull'invecchiamento, la rigenerazione dei tessuti e gli anni vissuti in buona salute. L'immortalità resta un orizzonte ipotetico, non un risultato scientifico dimostrato.</p>
            </article>
          </div>
          <div className="mt-6 rounded-2xl border border-violet-700/70 bg-slate-950/80 p-5 sm:p-6">
            <h3 className="text-xl font-extrabold">PiggyBank: progetti sotto controllo</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Per ogni iniziativa pubblicheremo obiettivo, responsabile, budget, fondi effettivamente raccolti, ripartizione prevista, trasferimenti documentati e aggiornamenti. Il modello proposto resta 90% alla causa selezionata e 10% al Fondo iniziative RiverSpendShop per altre cause, con regole chiare e rendicontazione separata.</p>
            <p className="mt-3 text-sm leading-6 text-amber-200">Questa è una proposta in fase di progettazione: non si raccolgono fondi da questa pagina. Prima dell'attivazione saranno verificati partner, autorizzazioni e gestione legale e contabile. I progetti scientifici saranno valutati da soggetti competenti; non saranno promessi risultati medici garantiti.</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 px-4 py-7 text-center text-sm text-slate-400">
        <p className="font-bold text-teal-300">RiverSpend Ecology</p>
        <p className="mt-1">YOUR SHOP • YOUR FLOW</p>
        <p className="mx-auto mt-3 max-w-3xl">Questa pagina presenta campagne in fase di progettazione ed esempi di rendicontazione. Non è una richiesta di pagamento né una dichiarazione di raccolte o trasferimenti già avvenuti.</p>
      </footer>
    </main>
  );
}
