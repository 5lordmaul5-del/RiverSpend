import Head from 'next/head';
import Link from 'next/link';

const plans = [
  { name: 'VIVA GO', price: '9,90 €', period: '/anno', label: 'Consegne', description: 'Il pass base per accedere alle iniziative e alle tariffe dedicate RiverSpend Delivery.', features: ['Accesso alle offerte di consegna dedicate', 'Tracciamento degli ordini quando disponibile', 'Tariffe e condizioni mostrate prima della conferma'] },
  { name: 'VIVA GOGÒ', price: '19,90 €', period: '/anno', label: 'Risparmio', description: 'Un livello aggiuntivo di risparmio sulle consegne idonee.', features: ['Tutti i vantaggi VIVA GO', 'Promozioni dedicate sui costi di consegna', 'Accesso a offerte di spedizione selezionate'] },
  { name: 'VIVA FAST', price: '29,90 €', period: '/anno', label: 'Consegna veloce', description: 'Priorità nella preparazione e gestione delle consegne idonee.', features: ['Tutti i vantaggi VIVA GOGÒ', 'Priorità di gestione degli ordini', 'Consegna veloce nelle zone e fasce orarie abilitate'] },
  { name: 'VIVA SUPER FAST', price: '49,90 €', period: '/anno', label: 'Priorità superiore', description: 'Un livello superiore di priorità per le consegne disponibili.', features: ['Tutti i vantaggi VIVA FAST', 'Priorità superiore nelle fasce disponibili', 'Accesso a opzioni rapide selezionate'] },
  { name: 'VIVA SUPER RAPIDO', price: '89,00 €', period: '/anno', label: 'Massima priorità', description: 'Il livello più alto di priorità per le consegne compatibili con il servizio.', features: ['Tutti i vantaggi VIVA SUPER FAST', 'Massima priorità operativa disponibile', 'Accesso prioritario alle opzioni express abilitate'] }
];

export default function RSVIVA() {
  return (
    <>
      <Head>
        <title>VIVA Delivery · Piani consegna RiverSpend</title>
        <meta name="description" content="VIVA: cinque piani annuali dedicati alle consegne RiverSpend." />
      </Head>
      <main className="min-h-screen bg-gradient-to-b from-white via-cyan-50 to-white px-4 py-8 text-slate-900">
        <div className="mx-auto max-w-5xl">
          <Link href="/" className="text-sm font-bold text-teal-700 underline">← RiverSpendShop</Link>
          <header className="mt-6 rounded-[2rem] bg-slate-950 p-7 text-white shadow-xl sm:p-10">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-amber-300">RIVERSPEND</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">RS<span className="text-amber-300">VIVA</span><span className="ml-2 inline-block text-amber-300 drop-shadow-[0_0_12px_rgba(252,211,77,0.8)]">⚡⚡</span></h1>
            <p className="mt-3 max-w-2xl text-lg leading-7 text-slate-200">Cinque pass annuali dedicati esclusivamente alle consegne RiverSpend.</p>
          </header>


          <section className="mt-8 rounded-3xl border border-amber-200 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-6 text-white shadow-lg">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">Solo consegne · cinque livelli</p>
            <h2 className="mt-2 text-2xl font-black">VIVA è dedicato a RiverSpend Delivery</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-200">Questi piani riguardano esclusivamente spedizioni e consegne. Sono separati dagli abbonamenti e dai livelli di RiverSSAI (Bronze, Silver, Gold e Diamond).</p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm font-bold sm:grid-cols-3">
              {['Consegne locali', 'Spedizioni', 'Consegne rapide'].map((item) => <div key={item} className="rounded-xl border border-white/15 bg-white/10 px-3 py-3">{item}</div>)}
            </div>
            <p className="mt-4 text-xs leading-5 text-amber-100">I vantaggi si applicano soltanto alle consegne compatibili, nelle zone abilitate e secondo disponibilità, peso, dimensioni e condizioni mostrate prima dell'ordine.</p>
          </section>

          <section className="mt-8">
            <div className="mb-4">
              <p className="text-sm font-black uppercase tracking-widest text-teal-700">Piani consegna</p>
              <h2 className="text-2xl font-black">Scegli il tuo VIVA Delivery Pass</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
            VIVA Delivery è una linea di pass annuali dedicata esclusivamente a spedizioni e consegne. Non modifica né sostituisce i piani Bronze, Silver, Gold e Diamond di RiverSSAI. Prezzi e condizioni sono un listino di sviluppo; nessun piano viene attivato e nessun pagamento viene incassato da questa pagina. Prima del lancio saranno completati verifica fiscale, termini di vendita, privacy e integrazione con il prestatore di servizi di pagamento.
          </footer>
        </div>
      </main>
    </>
  );
}
