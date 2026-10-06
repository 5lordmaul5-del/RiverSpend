import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function Checkout() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-teal-300 underline">← Torna al RiverSpendShop</Link>

        <section className="mt-6 rounded-3xl border border-teal-800 bg-slate-900 p-6 shadow-xl sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-teal-300">RiverSpend Pay</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">💳 Checkout RiverSpend</h1>
          <p className="mt-3 leading-7 text-slate-300">
            Qui nascerà il flusso ufficiale di pagamento RiverSpend: ordine, metodo di pagamento,
            conferma, protezione Shield e gestione della spedizione.
          </p>

          <div className="mt-6 grid gap-3">
            {[
              ['🛒', 'Riepilogo ordine', 'Prodotti, quantità e totale'],
              ['📦', 'Consegna', 'Indirizzo e opzioni di spedizione'],
              ['🛡️', 'RiverSpend Shield', 'Protezione dell’acquirente'],
              ['💳', 'Pagamento', 'Provider di pagamento sicuro'],
            ].map(([icon, title, text]) => (
              <article key={title} className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
                <div className="text-2xl">{icon}</div>
                <h2 className="mt-2 font-bold">{title}</h2>
                <p className="mt-1 text-sm text-slate-400">{text}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4">
            <p className="text-sm font-semibold text-amber-200">
              {user ? 'Account RiverSpend collegato' : 'Accedi al tuo account RiverSpend per procedere con un ordine.'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Il pagamento reale verrà collegato in un passaggio successivo, dopo aver verificato il flusso ordine.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/rete" className="rounded-xl border border-teal-700 px-4 py-3 font-bold text-teal-100">
              🕸️ Vai alla Rete
            </Link>
            <Link href="/servizi/pay" className="rounded-xl bg-teal-500 px-4 py-3 font-bold text-slate-950">
              RiverSpend Pay
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
