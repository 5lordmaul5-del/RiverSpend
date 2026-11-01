import Link from 'next/link';

const cards = [
  { id:'money', name:'RiverMoney', mark:'R$', title:'Il valore digitale dell’ecosistema', desc:'Il progetto di valuta e saldo digitale RiverSpend: un’area pensata per visualizzare il saldo, i movimenti e i vantaggi collegati ai servizi RiverSpend.', color:'from-cyan-950 to-teal-700', note:'In questa fase è una presentazione progettuale: non è ancora un conto, un deposito o denaro elettronico spendibile.' },
  { id:'pay', name:'RiverPay', mark:'↗', title:'Pagamenti semplici e protetti', desc:'Il progetto di pagamento per collegare acquisti, vendite, rimborsi e conferme d’ordine, integrando provider autorizzati e metodi disponibili nel Paese dell’utente.', color:'from-indigo-950 to-blue-700', note:'I pagamenti reali si attivano solo tramite un prestatore di servizi di pagamento autorizzato, con verifiche, contratti e credenziali.' },
  { id:'token', name:'RiverSpendToken', mark:'RS', title:'Il token digitale RiverSpend', desc:'Il progetto di token su blockchain, inizialmente da sviluppare e testare su una rete di prova (testnet), senza fondi reali. In futuro potranno essere valutati trasferimenti e utilità nell’ecosistema.', color:'from-amber-950 to-yellow-700', note:'Un token non equivale automaticamente a euro o a moneta elettronica: eventuale conversione, custodia o scambio richiedono partner e verifiche normative.' }
];

export default function RiverFinance() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-cyan-300 underline">← Torna a RiverSpendShop</Link>
        <header className="mb-8 mt-6 rounded-3xl border border-cyan-800 bg-gradient-to-br from-slate-900 to-cyan-950 p-6 sm:p-10">
          <p className="text-xs font-black uppercase tracking-[.25em] text-cyan-300">YOUR SHOP • YOUR FLOW</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">RiverSpend Finance</h1>
          <p className="mt-4 max-w-3xl leading-7 text-cyan-50">Tre progetti distinti, pensati per dialogare tra loro: valore digitale, pagamenti e token blockchain.</p>
        </header>
        <div className="grid gap-5 lg:grid-cols-3">
          {cards.map((item) => (
            <article id={item.id} key={item.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white text-slate-900 shadow-xl">
              <div className={`flex min-h-44 items-center justify-center bg-gradient-to-br ${item.color} p-6`}>
                {item.id === 'token' ? <img src="/icons/river-spend-token.jpg" alt="Logo RiverSpendToken" className="h-32 w-32 rounded-full object-cover shadow-2xl" /> : <div className="flex h-28 w-28 items-center justify-center rounded-3xl border-2 border-amber-300 bg-white/10 text-5xl font-black text-amber-200 shadow-2xl">{item.mark}</div>}
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-black">{item.name}</h2>
                <h3 className="mt-2 font-bold text-teal-800">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-700">{item.desc}</p>
                <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-xs leading-5 text-amber-950">{item.note}</p>
              </div>
            </article>
          ))}
        </div>
        <section className="mt-7 rounded-3xl border border-cyan-900 bg-slate-900 p-6">
          <h2 className="text-xl font-black text-cyan-200">Come si collegano</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">RiverMoney descrive l’esperienza del valore e del saldo; RiverPay gestisce il flusso dei pagamenti tramite partner; RiverSpendToken è il progetto blockchain separato. Nessun saldo dimostrativo rappresenta fondi reali e nessuna funzione finanziaria è attiva in questa pagina.</p>
        </section>
      </div>
    </main>
  );
}
