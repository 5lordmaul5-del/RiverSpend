import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function RiverMoneyPage() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [serviceError, setServiceError] = useState('');

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive) { setSession(data.session); setLoading(false); }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  const loadWallet = useCallback(async () => {
    if (!session?.access_token) return;
    setServiceError('');
    try {
      const headers = { Authorization: 'Bearer ' + session.access_token };
      const [walletRes, txRes] = await Promise.all([
        fetch('/api/river/wallet', { headers, cache: 'no-store' }),
        fetch('/api/river/transactions?limit=20', { headers, cache: 'no-store' })
      ]);
      const walletData = await walletRes.json();
      const txData = await txRes.json();
      if (!walletRes.ok) throw new Error(walletData.error || 'Wallet non disponibile.');
      if (!txRes.ok) throw new Error(txData.error || 'Movimenti non disponibili.');
      setWallet(walletData);
      setTransactions(Array.isArray(txData.transactions) ? txData.transactions : []);
    } catch (error) {
      setServiceError(error.message || 'Servizio temporaneamente non disponibile.');
    }
  }, [session]);

  useEffect(() => { loadWallet(); }, [loadWallet]);

  async function sendLoginLink(event) {
    event.preventDefault();
    setSending(true); setMessage('');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin + '/river-money' }
    });
    setMessage(error ? error.message : 'Controlla la tua email: ti abbiamo inviato un link sicuro per accedere.');
    setSending(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null); setWallet(null); setTransactions([]);
  }

  const money = (value, currency = 'RiverMoney') => {
    const number = Number(value);
    return Number.isFinite(number) ? number.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + currency : '—';
  };

  return (
    <main className="min-h-screen bg-[#e8fbfa] px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="font-semibold text-teal-800 underline">← Torna a RiverSpend</Link>
        <header className="mt-6 rounded-3xl bg-gradient-to-br from-[#073b43] via-[#087e83] to-[#18b6ad] p-7 text-white shadow-xl sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[.3em] text-amber-200">YOUR SHOP • YOUR FLOW</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">RiverMoney</h1>
          <p className="mt-3 max-w-2xl text-teal-50">Il tuo spazio RiverSpend per consultare saldo e movimenti, quando il wallet sarà attivo sul tuo account.</p>
          <div className="mt-6 inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold">🌊 Portafoglio digitale · Anteprima</div>
        </header>

        {loading ? <section className="mt-6 rounded-2xl bg-white p-6">Caricamento…</section> : !session ? (
          <section className="mt-6 rounded-2xl border border-teal-100 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold">Accedi al tuo account</h2>
            <p className="mt-2 text-slate-600">Per proteggere il portafoglio, accedi con il link sicuro inviato alla tua email. Non mostriamo saldi senza autenticazione.</p>
            <form onSubmit={sendLoginLink} className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="La tua email" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3" />
              <button disabled={sending} className="rounded-xl bg-teal-700 px-5 py-3 font-bold text-white disabled:opacity-50">{sending ? 'Invio…' : 'Invia link di accesso'}</button>
            </form>
            {message && <p className="mt-4 text-sm text-teal-800">{message}</p>}
          </section>
        ) : (
          <>
            <section className="mt-6 rounded-2xl border border-teal-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="text-sm text-slate-500">Account collegato</p><p className="font-semibold">{session.user.email}</p></div>
                <button onClick={signOut} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">Esci</button>
              </div>
              {serviceError ? <p className="mt-5 rounded-xl bg-amber-50 p-4 text-amber-900">{serviceError}</p> : (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[#e8fbfa] p-5"><p className="text-sm text-teal-800">Saldo RiverMoney</p><p className="mt-2 text-2xl font-black">{wallet?.wallet ? money(wallet.wallet.rivermoney) : 'Non ancora attivo'}</p></div>
                  <div className="rounded-2xl bg-amber-50 p-5"><p className="text-sm text-amber-800">Punti RSP</p><p className="mt-2 text-2xl font-black">{wallet?.wallet ? Number(wallet.wallet.rsp).toLocaleString('it-IT') : '—'}</p></div>
                </div>
              )}
              {wallet && !wallet.initialized && <p className="mt-4 text-sm text-slate-600">Il wallet non è ancora stato attivato per questo account. Nessun saldo è stato inventato.</p>}
              <button onClick={loadWallet} className="mt-5 rounded-xl bg-teal-700 px-5 py-3 font-bold text-white">Aggiorna portafoglio</button>
            </section>
            <section className="mt-6 rounded-2xl border border-teal-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">Movimenti</h2>
              {transactions.length ? <ul className="mt-4 divide-y">{transactions.map(item => <li key={item.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span>{item.reason || item.source || 'Movimento'}<span className="block text-xs text-slate-500">{new Date(item.createdAt).toLocaleString('it-IT')}</span></span><strong>{money(item.amount, item.currency)}</strong></li>)}</ul> : <p className="mt-3 text-sm text-slate-600">Nessun movimento disponibile.</p>}
            </section>
          </>
        )}

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-amber-200 bg-white p-5"><h2 className="font-bold">RiverSpend Pay</h2><p className="mt-2 text-sm text-slate-600">Pagamenti in preparazione: nessuna transazione reale è attiva da questa anteprima.</p><span className="mt-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">In preparazione</span></div>
          <div className="rounded-2xl border border-teal-100 bg-white p-5"><h2 className="font-bold">Portafoglio e sicurezza</h2><p className="mt-2 text-sm text-slate-600">Il saldo viene letto dal server solo dopo l'accesso. Non inserire qui dati di carte o credenziali bancarie.</p></div>
        </section>
        <p className="mt-6 text-center text-xs text-slate-500">Versione di anteprima. RiverMoney non è ancora un conto bancario né moneta elettronica e non consente trasferimenti o pagamenti.</p>
      </div>
    </main>
  );
}
