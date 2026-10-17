import Link from 'next/link';

const gifts = [
  { name: 'Gift Single Adulto', people: '1 adulto', entries: 1, price: 30, normal: 30, note: 'Un ingresso per una persona adulta.' },
  { name: 'Gift Single Bambino', people: '1 bambino', entries: 1, price: 20, normal: 20, note: 'Un ingresso per un bambino.' },
  { name: 'Gift Duo Adulti', people: '2 adulti', entries: 2, price: 54, normal: 60, note: 'Due ingressi, con sconto ipotizzato del 10%.' },
  { name: 'Gift Duo Mista', people: '1 adulto + 1 bambino', entries: 2, price: 45, normal: 50, note: 'Due ingressi, con sconto ipotizzato del 10%.' },
  { name: 'Gift Family 3', people: '2 adulti + 1 bambino', entries: 3, price: 72, normal: 80, note: 'Pacchetto famiglia, sconto ipotizzato del 10%.' },
  { name: 'Gift Family 4', people: '2 adulti + 2 bambini', entries: 4, price: 90, normal: 100, note: 'Pacchetto famiglia, sconto ipotizzato del 10%.' },
  { name: 'Gift Family 5', people: '2 adulti + 3 bambini', entries: 5, price: 108, normal: 120, note: 'Pacchetto famiglia, sconto ipotizzato del 10%.' },
  { name: 'Gift Family 6', people: '2 adulti + 4 bambini', entries: 6, price: 126, normal: 140, note: 'Pacchetto famiglia, sconto ipotizzato del 10%.' },
  { name: 'Gift 10 ingressi adulti', people: '10 ingressi adulti', entries: 10, price: 255, normal: 300, note: 'Pacchetto multi-ingresso, sconto ipotizzato del 15%.' },
  { name: 'Gift 10 ingressi bambini', people: '10 ingressi bambini', entries: 10, price: 170, normal: 200, note: 'Pacchetto multi-ingresso, sconto ipotizzato del 15%.' },
  { name: 'Gift 20 ingressi adulti', people: '20 ingressi adulti', entries: 20, price: 510, normal: 600, note: 'Pacchetto multi-ingresso, sconto ipotizzato del 15%.' },
  { name: 'Gift 20 ingressi bambini', people: '20 ingressi bambini', entries: 20, price: 340, normal: 400, note: 'Pacchetto multi-ingresso, sconto ipotizzato del 15%.' },
];

export default function RiverSpendParkGiftCards() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <Link href="/park" className="text-teal-300 underline">← Torna a RiverSpend Park</Link>
        <header className="mt-6 overflow-hidden rounded-3xl border border-amber-700/70 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-950 p-6 sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-amber-300">RiverSpend Park • Regala un’esperienza</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">🎟️ Gift Card d’ingresso</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-200">Scegli un ingresso singolo, un pacchetto famiglia o una Gift da 10 o 20 ingressi. Ogni carta rappresenterà ingressi, non credito in euro.</p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-teal-700 px-4 py-2 text-teal-100">Validità prevista: 12 mesi</span>
            <span className="rounded-full border border-teal-700 px-4 py-2 text-teal-100">QR univoco da integrare</span>
            <span className="rounded-full border border-amber-700 px-4 py-2 text-amber-100">Bozza non in vendita</span>
          </div>
        </header>
        <section className="relative mt-6 overflow-hidden rounded-3xl border border-amber-400/70 shadow-xl" aria-label="Regala un'avventura a RiverSpend Park">
          <img src="/river-spend-park-world.svg" alt="Paesaggio immaginario di RiverSpend Park con castello, montagne russe e fiume" className="h-56 w-full object-cover sm:h-72" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/65 to-transparent" />
          <div className="absolute inset-y-0 left-0 flex max-w-2xl items-center gap-3 p-4 sm:gap-6 sm:p-8">
            <img src="/river-spend-park-mascot.svg" alt="Rivù, mascotte proposta di RiverSpend Park" className="hidden h-44 w-32 shrink-0 object-contain drop-shadow-xl sm:block md:h-56 md:w-40" />
            <div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-amber-300">Un regalo pieno di magia</p><h2 className="mt-2 text-2xl font-black text-white sm:text-4xl">Regala un’avventura da ricordare</h2><p className="mt-3 text-sm leading-6 text-cyan-50 sm:text-base">Dalla prima giostra alla giornata in famiglia: scegli la Gift Card più adatta e immagina già il prossimo viaggio con Rivù.</p><p className="mt-3 text-xs font-semibold text-amber-200">Illustrazioni e mascotte concettuali • acquisti ancora disattivati</p></div>
          </div>
        </section>
        <section className="mt-5 flex items-center gap-4 rounded-2xl border border-amber-700/70 bg-gradient-to-r from-slate-900 to-teal-950 p-4 sm:p-5">
          <img src="/river-spend-park-mascot.svg" alt="Rivù" className="h-24 w-20 shrink-0 object-contain sm:h-32 sm:w-28" />
          <div><p className="text-xs font-extrabold uppercase tracking-[.18em] text-amber-300">La mascotte del parco</p><h2 className="mt-1 text-xl font-black text-white">Conosci Rivù!</h2><p className="mt-1 text-sm leading-6 text-slate-200">Un piccolo spirito del fiume con cappellino blu e oro, pronto a diventare il volto di RiverSpend Park.</p></div>
        </section>
        <div className="my-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gifts.map((gift) => (
            <article key={gift.name} className="flex flex-col rounded-2xl border border-teal-900 bg-slate-900 p-5 shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-full bg-teal-950 px-3 py-1 text-xs font-bold text-teal-200">{gift.entries} {gift.entries === 1 ? 'ingresso' : 'ingressi'}</span>
                <span className="text-xs font-semibold text-amber-200">VALIDITÀ 12 MESI</span>
              </div>
              <h2 className="mt-4 text-xl font-black">{gift.name}</h2>
              <p className="mt-1 text-sm text-slate-300">{gift.people}</p>
              <p className="mt-4 text-3xl font-black text-amber-300">{gift.price.toLocaleString('it-IT')} €</p>
              {gift.normal > gift.price && <p className="mt-1 text-sm text-slate-400">Prezzo senza sconto: <span className="line-through">{gift.normal} €</span></p>}
              <p className="mt-3 flex-1 text-sm leading-6 text-slate-300">{gift.note}</p>
              <button type="button" disabled className="mt-5 w-full cursor-not-allowed rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 font-bold text-slate-400">Acquisto non ancora attivo</button>
            </article>
          ))}
        </div>
        <section className="rounded-2xl border border-amber-800 bg-amber-950/30 p-5">
          <h2 className="text-lg font-bold text-amber-100">Prima dell’attivazione</h2>
          <p className="mt-2 text-sm leading-6 text-amber-50/90">Questo è un listino concettuale: prezzi, sconti e validità devono essere approvati. Il pagamento, la generazione sicura dei codici/QR, il conteggio degli ingressi e la scansione all’entrata non sono ancora collegati. Non sono disponibili acquisti reali.</p>
        </section>
      </div>
    </main>
  );
}
