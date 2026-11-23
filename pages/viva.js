import Head from 'next/head';
import Link from 'next/link';

const plans = [
  {
    name: 'RS VIVA Delivery Fast',
    price: '29,90 €',
    period: '/anno',
    label: 'Piano lancio',
    description: 'Consegne locali incluse nelle zone abilitate, con condizioni e limiti chiari.',
    features: ['Consegne locali idonee incluse', 'Priorità di gestione', 'Offerte riservate agli iscritti']
  },
  {
    name: 'RiverSignals Lifetime',
    price: '1,00 €',
    period: 'una tantum',
    label: 'Accesso lifetime',
    description: 'Prezzo commerciale approvato; attivazione subordinata alla verifica del pagamento.',
    features: ['Pagamento una tantum', 'Nessun rinnovo ricorrente']
  }
];

export default function RSVIVA() {
  return (
    <>
      <Head>
        <title>RS VIVA · Membership e pagamenti</title>
        <meta name="description" content="RS VIVA: servizi, membership e pagamenti RiverSpend." />
      </Head>
      <main className="min-h-screen bg-gradient-to-b from-white via-cyan-50 to-white px-4 py-8 text-slate-900">
        <div className="mx-auto max-w-5xl">
          <Link href="/" className="text-sm font-bold text-teal-700 underline">← RiverSpendShop</Link>
          <header className="mt-6 rounded-[2rem] bg-slate-950 p-7 text-white shadow-xl sm:p-10">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-amber-300">RIVERSPEND</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">RS<span className="text-amber-300">VIVA</span><span className="text-amber-300">⚡</span></h1>
            <p className="mt-3 max-w-2xl text-lg leading-7 text-slate-200">Un solo pass per vivere i servizi RiverSpend. Membership, consegne locali e servizi digitali in un ecosistema unico.</p>
          </header>

          <section className="mt-8">
            <div className="mb-4">
              <p className="text-sm font-black uppercase tracking-widest text-teal-700">Membership</p>
              <h2 className="text-2xl font-black">Scegli il tuo VIVA Pass</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {plans.map((plan) => (
                <article key={plan.name} className="rounded-3xl border border-teal-200 bg-white p-6 shadow-sm">
                  <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-900">{plan.label}</span>
                  <h3 className="mt-4 text-xl font-black">{plan.name}</h3>
                  <p className="mt-2 text-3xl font-black text-teal-700">{plan.price}<span className="ml-1 text-sm font-semibold text-slate-500">{plan.period}</span></p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{plan.description}</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    {plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}
                  </ul>
                  <p className="mt-5 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">Attivazione acquisti non ancora disponibile: il piano è pubblicato come listino approvato, non come pagamento completabile.</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-black">Micro-servizi RiverSpend</h2>
            <p className="mt-1 text-sm text-slate-600">Prezzi unitari configurabili per sbloccare servizi e funzioni: 1 €, 2 €, 5 € e 10 €. Il prezzo effettivo sarà mostrato prima di ogni acquisto.</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {['1,00 €', '2,00 €', '5,00 €', '10,00 €'].map((price) => <div key={price} className="rounded-2xl border border-teal-100 bg-teal-50 p-4 text-center text-xl font-black text-teal-800">{price}</div>)}
            </div>
          </section>

          <section className="mt-8 grid gap-5 md:grid-cols-2">
            <article className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-black">Metodi previsti</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>• Contanti alla consegna, con verifica dell'incasso</li>
                <li>• Bonifico istantaneo, con verifica bancaria</li>
                <li>• PostePay, previa configurazione e verifica</li>
                <li>• PayPal, solo con credenziali e flusso attivi</li>
                <li>• Carte e wallet, da attivare con un gestore autorizzato</li>
              </ul>
              <p className="mt-4 text-xs leading-5 text-slate-500">Il checkout esistente registra le richieste d'ordine; la selezione di un metodo non equivale a un pagamento ricevuto.</p>
              <Link href="/checkout" className="mt-5 inline-flex rounded-xl bg-teal-700 px-4 py-3 font-bold text-white">Vai al checkout Shop</Link>
            </article>
            <article className="rounded-3xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-black">Marketplace trasparente</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">Commissione proposta RiverSpend: 10% sulle vendite marketplace, con rendiconto separato per venditore, spedizione, imposte e commissioni.</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">Le scadenze amministrative previste sono 7, 30, 60 o 90 giorni, ma le liquidazioni di fondi dei venditori saranno attivate solo con un modello autorizzato e condizioni contrattuali conformi.</p>
            </article>
          </section>

          <footer className="mt-8 rounded-2xl bg-slate-100 p-4 text-xs leading-5 text-slate-600">
            RS VIVA è il nome commerciale proposto per membership e vantaggi dell'ecosistema. Prezzi e condizioni sono un listino di sviluppo; nessun abbonamento viene attivato e nessun pagamento viene incassato da questa pagina. Prima del lancio saranno completati verifica fiscale, termini di vendita, privacy e integrazione con il prestatore di servizi di pagamento.
          </footer>
        </div>
      </main>
    </>
  );
}
