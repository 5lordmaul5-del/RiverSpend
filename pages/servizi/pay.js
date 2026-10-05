import Link from 'next/link';

const methods = [
  ['💳','Carte','Visa • Mastercard • altre carte supportate dal provider'],
  ['','Apple Pay','Wallet tramite provider di pagamento compatibile'],
  ['G','Google Pay','Wallet tramite provider di pagamento compatibile'],
  ['🅿️','PayPal','Provider separato, con flusso dedicato'],
  ['🟣','Klarna / BNPL','Da attivare in base a paese, KYC e disponibilità'],
  ['🇮🇹','Metodi locali','Da attivare per mercato e provider'],
];

export default function RiverSpendPay() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="font-bold text-teal-700 underline">← RiverSpendShop</Link>
        <section className="mt-6 rounded-3xl border border-teal-200 bg-gradient-to-br from-white to-cyan-50 p-6 shadow-sm sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-teal-700">RiverSpend</p>
          <h1 className="mt-2 text-4xl font-black sm:text-5xl">💳 RiverSpend Pay</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">Il livello di pagamento dell'ecosistema: checkout, autorizzazioni, conferme, rimborsi, Shield, commissioni e payout.</p>
        </section>
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {methods.map(([icon,title,text]) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="text-3xl">{icon}</div><h2 className="mt-3 text-xl font-black">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>)}
        </section>
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-2xl font-black">🔒 Architettura sicura</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {['1. Ordine','2. Payment Intent','3. Provider / wallet','4. Webhook → conferma'].map((x) => <div key={x} className="rounded-xl bg-slate-50 p-4 font-bold">{x}</div>)}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">RiverSpend non memorizza PAN o CVV. I dati sensibili restano presso provider PCI-compliant. Apple Pay e Google Pay sono wallet/metodi, non sostituti del processore.</p>
        </section>
        <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-xl font-black text-amber-950">🟠 Stato</h2>
          <p className="mt-2 leading-7 text-amber-900">La base dati RiverSpend Pay è stata predisposta. Il passaggio a pagamenti reali richiede configurazione del provider, KYC del merchant, chiavi sandbox/produzione e webhook firmati. Non simuliamo un pagamento come se fosse reale.</p>
        </section>
      </div>
    </main>
  );
}
