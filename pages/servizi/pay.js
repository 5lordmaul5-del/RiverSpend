import Link from 'next/link';

const methods = [
  ['💳','Carte','Visa • Mastercard • altre carte supportate dal provider'],
  ['','Apple Pay','Wallet tramite provider di pagamento compatibile'],
  ['G','Google Pay','Wallet tramite provider di pagamento compatibile'],
  ['🅿️','PayPal','Provider separato, per i flussi supportati'],
  ['🟣','Klarna / BNPL','Da attivare in base a paese, KYC e disponibilità'],
  ['🌍','Metodi locali','Selezionati in base al Paese e al provider disponibile'],
];

const flows = [
  ['1. Cliente','Paga nel checkout RiverSpend'],
  ['2. Provider','Incassa e gestisce i fondi'],
  ['3. Venditore','Riceve il ricavato secondo le regole di rilascio'],
  ['4. Corriere','Riceve il compenso dopo consegna verificata'],
  ['5. RiverSpend','Riceve commissioni e utili sul conto aziendale'],
];

export default function RiverSpendPay() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="font-bold text-teal-700 underline">← RiverSpendShop</Link>
        <section className="mt-6 rounded-3xl border border-teal-200 bg-gradient-to-br from-white to-cyan-50 p-6 shadow-sm sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-teal-700">RiverSpend Global Finance</p>
          <h1 className="mt-2 text-4xl font-black sm:text-5xl">💳 RiverPay Global</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">Il centro pagamenti dell'ecosistema RiverSpend: il provider autorizzato gestisce gli incassi e i trasferimenti; RiverSpend coordina ordini, commissioni, consegne, rimborsi e rendicontazione.</p>
          <div className="mt-5 inline-flex rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-black text-amber-900">FASE 1 · Preparazione — nessun pagamento reale attivo</div>
        </section>

        <section className="mt-6">
          <h2 className="text-2xl font-black">Metodi di pagamento previsti</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {methods.map(([icon,title,text]) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="text-3xl">{icon}</div><h3 className="mt-3 text-xl font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>)}
          </div>
          <p className="mt-3 text-sm text-slate-500">I metodi mostrati sono obiettivi di integrazione, non una dichiarazione che siano già attivi. Il checkout mostrerà soltanto quelli realmente abilitati per il Paese, la valuta e l'account.</p>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-2xl font-black">Come circola il denaro</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {flows.map(([title,description],index) => <article key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-black uppercase tracking-wide text-teal-700">Passaggio {index + 1}</div>
              <h3 className="mt-2 font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </article>)}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">Venditori, corrieri e RiverSpend hanno contabilità separate. I pagamenti ai beneficiari vengono rilasciati secondo contratti, consegna verificata, verifiche del provider e regole applicabili; gli utili RiverSpend vengono trasferiti al conto aziendale secondo il calendario concordato.</p>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-2xl font-black">Provider marketplace da valutare</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-teal-200 bg-teal-50 p-5">
              <h3 className="text-lg font-black">Stripe Connect</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">Primo candidato tecnico per onboarding dei venditori, ripartizione dei pagamenti e payout nei Paesi supportati.</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-lg font-black">Adyen for Platforms</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">Alternativa da confrontare per copertura geografica, modello marketplace, costi, riserve e tempi di regolamento.</p>
            </article>
          </div>
          <p className="mt-4 text-sm text-slate-500">La scelta non è ancora approvata: dipende da società, Paesi, KYC, condizioni contrattuali, costi e disponibilità effettiva dei payout. PayPal e SumUp restano separati per i flussi compatibili, non sostituiscono da soli un sistema marketplace di ripartizione.</p>
        </section>

        <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-xl font-black text-amber-950">Sicurezza e stato operativo</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-amber-950">
            <li>Chiavi e credenziali solo sul server, mai nel browser o nel repository.</li>
            <li>Conferma del pagamento soltanto tramite webhook firmato e verificato.</li>
            <li>Registro contabile tracciabile e operazioni idempotenti per evitare doppi addebiti.</li>
            <li>Nessun dato completo della carta o CVV conservato da RiverSpend.</li>
            <li>Incassi e payout reali restano disattivati fino a onboarding, test sandbox, verifiche legali e autorizzazione esplicita.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
