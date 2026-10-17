import Link from 'next/link';

const DENOMINATIONS = [5, 10, 25, 50, 100, 200, 500, 1000];

export default function GiftCardPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-cyan-900/70 bg-gradient-to-r from-slate-950 via-blue-950 to-cyan-950">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
          <Link href="/" className="text-sm font-semibold text-cyan-200 hover:text-white">← Torna a RiverSpendShop</Link>
          <p className="mt-7 text-xs font-extrabold uppercase tracking-[.28em] text-amber-300">YOUR SHOP • YOUR FLOW</p>
          <h1 className="mt-3 text-3xl font-black sm:text-5xl">RiverSpendShop <span className="text-amber-300">Gift Card</span></h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-cyan-50">Regala credito da utilizzare su RiverSpendShop. La stessa Gift Card è progettata per essere disponibile online e nei negozi fisici aderenti, con un unico saldo residuo condiviso.</p>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DENOMINATIONS.map((amount) => (
            <article key={amount} className="relative overflow-hidden rounded-2xl border border-amber-300/40 bg-gradient-to-br from-blue-950 via-slate-900 to-cyan-950 p-5 shadow-lg shadow-cyan-950/20">
              <div className="absolute -right-5 -top-7 h-24 w-24 rounded-full border border-cyan-300/20" />
              <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-200">RiverSpendShop</p>
              <p className="mt-5 text-4xl font-black tracking-tight text-amber-300">{amount === 1000 ? '1.000' : amount}<span className="ml-1 text-2xl">€</span></p>
              <div className="mt-4 border-t border-amber-200/30 pt-3">
                <p className="text-sm font-extrabold tracking-[.18em] text-white">GIFT CARD</p>
                <p className="mt-1 text-[10px] tracking-[.16em] text-cyan-100">YOUR SHOP • YOUR FLOW</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-blue-950 to-slate-900 p-5 sm:p-7">
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-cyan-200">Acquisto digitale</p>
            <h2 className="mt-3 text-xl font-extrabold sm:text-2xl">Compra online, scarica il codice e spendi su RiverSpend</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">Dopo l'attivazione del servizio, il cliente potrà scegliere l'importo, completare il pagamento, ricevere un codice digitale univoco e visualizzarlo nell'area personale. Il codice sarà utilizzabile solo dopo la conferma del pagamento.</p>
            <div className="mt-5 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100">Acquisto digitale in preparazione</div>
          </article>
          <article className="rounded-2xl border border-amber-300/40 bg-gradient-to-br from-slate-900 to-amber-950/40 p-5 sm:p-7">
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-amber-200">Negozi aderenti</p>
            <h2 className="mt-3 text-xl font-extrabold sm:text-2xl">Acquista la carta fisica in negozio</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">Le carte fisiche saranno attivate dal punto vendita autorizzato al momento dell'acquisto. Codice, barcode e QR identificheranno la stessa carta, senza mostrare pubblicamente il saldo o dati segreti.</p>
            <div className="mt-5 rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-100">Distribuzione nei negozi in preparazione</div>
          </article>
        </div>

        <div className="mt-8 rounded-2xl border border-amber-300/40 bg-slate-900 p-5 sm:p-7">
          <div className="flex items-start gap-3">
            <span className="text-2xl" aria-hidden="true">🔐</span>
            <div>
              <h2 className="text-xl font-extrabold">Un unico saldo, online e su carta fisica</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">Quando il sistema sarà operativo, ogni acquisto e ogni utilizzo aggiorneranno il saldo centrale. Le carte dovranno avere codici univoci generati in modo sicuro e le operazioni saranno registrate per evitare doppi utilizzi.</p>
            </div>
          </div>
          <p className="mt-5 rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-100">Importante: al momento acquisto, pagamento, generazione dei codici, attivazione e riscatto non sono ancora disponibili. Questa pagina presenta il servizio previsto; non effettuare pagamenti per le Gift Card finché non sarà annunciata l'attivazione ufficiale.</p>
        </div>
        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex rounded-full bg-gradient-to-r from-amber-200 to-yellow-500 px-6 py-3 text-sm font-extrabold text-slate-950 hover:brightness-110">Torna al RiverSpendShop</Link>
        </div>
      </section>
    </main>
  );
}
