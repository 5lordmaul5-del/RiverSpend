import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function PiggyBank() {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deposit, setDeposit] = useState('');
  const [saved, setSaved] = useState(0);

  const productId = router.isReady ? String(router.query.product || '') : '';

  useEffect(() => {
    if (!router.isReady) return;
    if (!productId) {
      setError('Nessun prodotto selezionato.');
      setLoading(false);
      return;
    }

    fetch('/api/products', { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Prodotti non disponibili');
        return data;
      })
      .then((data) => {
        const found = Array.isArray(data) ? data.find((item) => String(item.id) === productId) : null;
        if (!found) throw new Error('Prodotto non trovato.');
        setProduct(found);
        try {
          const value = Number(localStorage.getItem('riverspend-piggybank-' + productId) || 0);
          setSaved(Number.isFinite(value) && value > 0 ? value : 0);
        } catch {}
      })
      .catch((err) => setError(err.message || 'Errore nel caricamento'))
      .finally(() => setLoading(false));
  }, [router.isReady, productId]);

  const price = useMemo(() => Number(product?.prezzo || 0), [product]);
  const remaining = Math.max(0, price - saved);
  const progress = price > 0 ? Math.min(100, (saved / price) * 100) : 0;

  function addDeposit(event) {
    event.preventDefault();
    const amount = Number(String(deposit).replace(',', '.'));
    if (!Number.isFinite(amount) || amount <= 0) return;
    const next = Math.min(price || amount, saved + amount);
    setSaved(next);
    setDeposit('');
    try {
      localStorage.setItem('riverspend-piggybank-' + productId, String(next));
    } catch {}
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-teal-300 underline">← Torna al RiverSpendShop</Link>

        <section className="mt-6 overflow-hidden rounded-3xl border border-amber-400/40 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 shadow-xl">
          <div className="border-b border-amber-400/20 p-6 text-center">
            <div className="text-5xl">🐷💰</div>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.25em] text-amber-300">RiverSpend</p>
            <h1 className="mt-1 text-3xl font-black text-amber-200">PiggyBank</h1>
            <p className="mt-2 text-sm text-slate-300">Metti da parte RiverMoney per il prodotto che desideri.</p>
            <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-left">
              <h2 className="text-base font-black text-amber-200">💡 A cosa serve PiggyBank?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                PiggyBank ti permette di creare un obiettivo per un prodotto che vuoi acquistare e mettere da parte
                gradualmente la somma necessaria. Puoi vedere il prezzo del prodotto, quanto hai già accantonato,
                quanto manca e l'avanzamento verso il tuo obiettivo.
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Nella versione attuale l'importo è un obiettivo salvato sul dispositivo: non è ancora un pagamento reale
                e non viene trasferito denaro. In futuro sarà collegato a RiverSpend Pay.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-300">Caricamento prodotto…</div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="font-semibold text-amber-200">{error}</p>
              <Link href="/" className="mt-5 inline-flex rounded-xl bg-teal-500 px-5 py-3 font-bold text-slate-950">Torna ai prodotti</Link>
            </div>
          ) : (
            <>
              <div className="grid gap-5 p-5 sm:grid-cols-[180px_1fr] sm:p-6">
                <div className="overflow-hidden rounded-2xl bg-white">
                  {product.immagini?.[0] ? (
                    <img src={product.immagini[0]} alt={product.titolo || 'Prodotto'} className="aspect-square h-full w-full object-contain" />
                  ) : (
                    <div className="flex aspect-square items-center justify-center text-sm text-slate-500">Foto non disponibile</div>
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">Prodotto scelto</p>
                  <h2 className="mt-1 text-2xl font-bold">{product.titolo}</h2>
                  <p className="mt-2 text-3xl font-black text-amber-300">€ {price.toFixed(2)}</p>
                  <p className="mt-3 text-sm text-slate-300">{product.categoria || 'Altro'} · {product.condizione || 'Condizione non indicata'}</p>
                </div>
              </div>

              <div className="px-5 pb-6 sm:px-6">
                <div className="rounded-2xl border border-amber-400/30 bg-black/20 p-5">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-400">Nel tuo PiggyBank</p>
                      <p className="text-3xl font-black text-amber-300">€ {saved.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Mancano</p>
                      <p className="text-lg font-bold">€ {remaining.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-700">
                    <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: progress + '%' }} />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{progress.toFixed(0)}% dell'obiettivo</p>

                  <form onSubmit={addDeposit} className="mt-5">
                    <label htmlFor="piggy-deposit" className="text-sm font-semibold">Aggiungi un deposito</label>
                    <div className="mt-2 flex gap-2">
                      <input id="piggy-deposit" inputMode="decimal" value={deposit} onChange={(e) => setDeposit(e.target.value)} placeholder="es. 10,00" className="min-w-0 flex-1 rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-white" />
                      <button type="submit" className="rounded-xl bg-amber-300 px-4 py-3 font-black text-amber-950">+ Deposita</button>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">Questa prima versione registra l'obiettivo sul dispositivo; il pagamento reale verrà collegato al sistema RiverSpend Pay.</p>
                  </form>
                </div>

                {remaining === 0 && price > 0 && (
                  <div className="mt-5 rounded-2xl border border-amber-300 bg-amber-300 p-4 text-center font-bold text-amber-950">
                    🎉 Obiettivo raggiunto! Il prodotto è completamente coperto dal tuo PiggyBank.
                  </div>
                )}

                <Link href={'/prodotto/' + encodeURIComponent(product.id)} className="mt-5 flex w-full items-center justify-center rounded-xl border border-teal-600 px-4 py-3 font-bold text-teal-200">
                  ← Torna al prodotto
                </Link>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
