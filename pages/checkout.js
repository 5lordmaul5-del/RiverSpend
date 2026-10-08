import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function Checkout() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [orderId, setOrderId] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [sendingLink, setSendingLink] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('sandbox');
  const [simulatingPayment, setSimulatingPayment] = useState(false);
  const [sandboxMessage, setSandboxMessage] = useState('');
  const [stripeLoading, setStripeLoading] = useState(false);
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [paypalMessage, setPaypalMessage] = useState('');
  const [codMessage, setCodMessage] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
    try {
      const saved = JSON.parse(localStorage.getItem('riverspend-rete') || '[]');
      if (Array.isArray(saved)) setItems(saved);
    } catch {}
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paypal = params.get('paypal');
    const token = params.get('token');
    if (paypal === 'success' && token) capturePayPalPayment(token);
    if (paypal === 'cancel') setPaypalMessage('Pagamento PayPal annullato. Nessun addebito confermato.');
  }, []);

  async function sendLoginLink(event) {
    event.preventDefault();
    setAuthMessage('');
    if (!email.trim()) return setAuthMessage('Inserisci la tua email.');
    setSendingLink(true);
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin + '/checkout' }
    });
    setAuthMessage(authError ? '❌ ' + authError.message : '✅ Link inviato. Controlla la tua email e poi torna al Checkout.');
    setSendingLink(false);
  }

  async function createOrder() {
    setError('');
    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Accedi al tuo account RiverSpend prima di creare un ordine.');
      if (!items.length) throw new Error('La Rete è vuota.');

      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, price, stock')
        .in('id', items.map((item) => String(item.id)))
        .eq('status', 'published');

      if (productsError) throw productsError;

      const byId = new Map((products || []).map((product) => [String(product.id), product]));
      const validItems = items.map((item) => byId.get(String(item.id))).filter(Boolean);
      if (validItems.length !== items.length) throw new Error('Uno o più prodotti non sono più disponibili.');

      const subtotal = validItems.reduce((sum, product) => sum + Number(product.price || 0), 0);
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          status: 'pending',
          payment_status: 'unpaid',
          currency: 'EUR',
          subtotal,
          shipping_total: 0,
          donation_total: 0,
          total: subtotal
        })
        .select('id')
        .single();

      if (orderError) throw orderError;

      const orderItems = validItems.map((product) => ({
        order_id: order.id,
        product_id: String(product.id),
        product_name: product.name || 'Prodotto',
        unit_price: Number(product.price || 0),
        quantity: 1,
        subtotal: Number(product.price || 0)
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) {
        await supabase.from('orders').delete().eq('id', order.id);
        throw itemsError;
      }

      setOrderId(order.id);
    } catch (err) {
      setError(err?.message || 'Impossibile creare l’ordine.');
    } finally {
      setCreating(false);
    }
  }


  async function startStripePayment() {
    setError('');
    setSandboxMessage('');
    setStripeLoading(true);
    try {
      if (!orderId) throw new Error('Prima crea l’ordine.');
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Sessione RiverSpend non valida. Accedi di nuovo.');
      const response = await fetch('/api/pay/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ orderId })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Stripe TEST non disponibile.');
      if (!result?.url) throw new Error('Stripe non ha restituito il link Checkout.');
      window.location.href = result.url;
    } catch (err) {
      setError(err?.message || 'Impossibile avviare Stripe TEST.');
      setStripeLoading(false);
    }
  }

  async function startPayPalPayment() {
    setError(''); setPaypalMessage(''); setPaypalLoading(true);
    try {
      if (!orderId) throw new Error('Prima crea l’ordine.');
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Sessione RiverSpend non valida. Accedi di nuovo.');
      const response = await fetch('/api/pay/paypal/create-order', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ orderId }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'PayPal non disponibile.');
      window.location.href = result.url;
    } catch (err) { setError(err?.message || 'Impossibile avviare PayPal.'); setPaypalLoading(false); }
  }

  async function capturePayPalPayment(paypalOrderId) {
    setPaypalLoading(true); setError('');
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Accedi di nuovo al tuo account RiverSpend.');
      const response = await fetch('/api/pay/paypal/capture-order', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ paypalOrderId }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Impossibile confermare PayPal.');
      setPaypalMessage('✅ Pagamento PayPal completato. Ordine confermato.');
      setOrderId(result.orderId || orderId);
      try { localStorage.removeItem('riverspend-rete'); setItems([]); } catch {}
    } catch (err) { setError(err?.message || 'Errore nella conferma PayPal.'); }
    finally { setPaypalLoading(false); }
  }

  async function selectCashOnDelivery() {
    setError(''); setCodMessage('');
    if (!orderId) return setError('Prima crea l’ordine.');
    const { error: updateError } = await supabase.from('orders').update({ payment_status: 'cod_pending' }).eq('id', orderId);
    if (updateError) return setError('Impossibile impostare il pagamento alla consegna.');
    setCodMessage('🚚 Pagamento alla consegna selezionato. L’ordine resta in attesa di consegna.');
  }

  async function simulatePayment() {
    setError('');
    setSandboxMessage('');
    setSimulatingPayment(true);
    try {
      if (!orderId) throw new Error('Prima crea l’ordine.');
      const response = await fetch('/api/pay/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Sandbox non disponibile.');
      setSandboxMessage('🧪 Pagamento simulato con successo. Nessun denaro reale è stato movimentato.');
    } catch (err) {
      setError(err?.message || 'Impossibile eseguire il test.');
    } finally {
      setSimulatingPayment(false);
    }
  }

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-teal-600 underline">← Torna al RiverSpendShop</Link>

        <section className="mt-6 rounded-3xl border border-teal-200 bg-white p-6 shadow-xl sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-teal-600">RiverSpend Pay</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">💳 Checkout RiverSpend</h1>
          <p className="mt-3 leading-7 text-slate-600">
            Qui nascerà il flusso ufficiale di pagamento RiverSpend: ordine, metodo di pagamento,
            conferma, protezione Shield e gestione della spedizione.
          </p>

          <div className="mt-6 rounded-2xl border border-teal-100 bg-white p-4">
            <h2 className="font-bold">🛒 Riepilogo</h2>
            {items.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">La tua Rete non contiene ancora prodotti da portare al checkout.</p>
            ) : (
              <>
                <div className="mt-3 space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate">{item.title || 'Prodotto'}</span>
                      <strong>€ {Number(item.price || 0).toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between border-t border-teal-100 pt-3 text-lg font-black">
                  <span>Totale</span>
                  <span className="text-teal-600">€ {items.reduce((sum, item) => sum + Number(item.price || 0), 0).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          <section className="mt-6 rounded-2xl border border-teal-100 bg-white p-4">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-teal-600">RiverSpend Pay</p>
            <h2 className="mt-2 text-xl font-black text-slate-900">💳 Scegli come pagare</h2>
            <p className="mt-1 text-sm text-slate-500">I metodi reali verranno collegati in modo sicuro, uno per volta. Per ora puoi usare solo il test sandbox.</p>
            <div className="mt-4 grid gap-3">
              {[
                ['sandbox','🧪','Pagamento Sandbox','SOLO TEST'],
                ['card','💳','Carta Visa / Mastercard / Amex','In arrivo'],
                ['applepay','','Apple Pay','In arrivo'],
                ['googlepay','G','Google Pay','In arrivo'],
                ['cod','🚚','Pagamento alla consegna','Disponibile'],
                ['bancomat','🇮🇹','PostePay / BANCOMAT Pay','Da configurare'],
                ['klarna','🩷','Klarna / Scalapay','In arrivo'],
                ['global','🌍','Metodi internazionali','In arrivo']
              ].map(([id, icon, title, status]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => ['SOLO TEST','Disponibile TEST','Disponibile','Da configurare'].includes(status) && setSelectedPayment(id)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left ${selectedPayment === id ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white'} ${status === 'In arrivo' ? 'opacity-70' : ''}`}
                >
                  <span className="flex items-center gap-3"><span className="text-xl">{icon}</span><span><strong className="block text-slate-900">{title}</strong><span className="text-xs text-slate-500">{status}</span></span></span>
                  {selectedPayment === id && <span className="font-black text-teal-600">✓</span>}
                </button>
              ))}
            </div>
          </section>

          <div className="mt-6 grid gap-3">
            {[
              ['🛒', 'Riepilogo ordine', 'Prodotti, quantità e totale'],
              ['📦', 'Consegna', 'Indirizzo e opzioni di spedizione'],
              ['🛡️', 'RiverSpend Shield', 'Protezione dell’acquirente'],
              ['💳', 'Pagamento', 'Provider di pagamento sicuro'],
            ].map(([icon, title, text]) => (
              <article key={title} className="rounded-2xl border border-teal-100 bg-white p-4">
                <div className="text-2xl">{icon}</div>
                <h2 className="mt-2 font-bold">{title}</h2>
                <p className="mt-1 text-sm text-slate-500">{text}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-amber-500/40 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-700">
              {user ? 'Account RiverSpend collegato' : 'Accedi al tuo account RiverSpend per procedere con un ordine.'}
            </p>
            {!user && (
              <form onSubmit={sendLoginLink} className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="La tua email" autoComplete="email" className="min-w-0 flex-1 rounded-xl border border-slate-600 bg-white px-4 py-3 text-white outline-none focus:border-teal-500" />
                <button type="submit" disabled={sendingLink} className="rounded-xl bg-teal-500 px-4 py-3 font-bold text-white disabled:opacity-60">
                  {sendingLink ? 'Invio…' : '🔐 Accedi'}
                </button>
              </form>
            )}
            {authMessage && <p className="mt-2 text-sm text-slate-200">{authMessage}</p>}
            <p className="mt-2 text-xs text-slate-500">
              Il pagamento reale verrà collegato in un passaggio successivo, dopo aver verificato il flusso ordine.
            </p>
          </div>

          {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
          {orderId && <div className="mt-5 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-700">✅ Ordine creato. ID: <span className="font-mono">{orderId}</span><br />Stato: <strong>in attesa di pagamento</strong>.</div>}
          {paypalMessage && <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-700">{paypalMessage}</div>}
          {codMessage && <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{codMessage}</div>}
          {sandboxMessage && <div className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-50 p-4 text-sm text-amber-100">{sandboxMessage}</div>}

          <div className="mt-6 rounded-2xl border border-teal-100 bg-white p-4">
            <div className="flex flex-wrap gap-3">
              {user && items.length > 0 && !orderId && (
                <button type="button" onClick={createOrder} disabled={creating} className="rounded-xl bg-teal-500 px-4 py-3 font-bold text-white disabled:opacity-60">
                  {creating ? 'Creazione ordine…' : '🧾 Crea ordine'}
                </button>
              )}

              {selectedPayment === 'card' && (
                <button
                  type="button"
                  onClick={startStripePayment}
                  disabled={!orderId || stripeLoading}
                  className="rounded-xl border border-sky-400 bg-sky-600 px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {stripeLoading ? '⏳ Apertura Stripe TEST…' : '💳 Paga con carta — TEST'}
                </button>
              )}

              {selectedPayment === 'cod' && (
                <button type="button" onClick={selectCashOnDelivery} disabled={!orderId} className="rounded-xl border border-amber-400 bg-amber-500 px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-40">
                  🚚 Conferma pagamento alla consegna
                </button>
              )}

              {selectedPayment === 'paypal' && (
                <button type="button" onClick={startPayPalPayment} disabled={!orderId || paypalLoading} className="rounded-xl border border-sky-400 bg-sky-600 px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-40">
                  {paypalLoading ? '⏳ Apertura PayPal…' : '🅿️ Paga con PayPal — TEST'}
                </button>
              )}

              {selectedPayment === 'bancomat' && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">🇮🇹 <strong>PostePay / BANCOMAT Pay</strong>: predisposto nel checkout; l’integrazione POS/e-commerce Poste verrà collegata dopo l’attivazione del servizio e delle credenziali dell’esercente.</div>
              )}

              {selectedPayment === 'sandbox' && (
                <button
                  type="button"
                  onClick={simulatePayment}
                  disabled={!orderId || simulatingPayment}
                  className="rounded-xl border border-amber-400 bg-amber-500 px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {simulatingPayment ? '⏳ Test pagamento…' : '🧪 Paga ora — SOLO TEST'}
                </button>
              )}

              <Link href="/rete" className="rounded-xl border border-teal-300 px-4 py-3 font-bold text-teal-700">
                🕸️ Vai alla Rete
              </Link>
              <Link href="/servizi/pay" className="rounded-xl bg-teal-500 px-4 py-3 font-bold text-white">
                RiverSpend Pay
              </Link>
            </div>
            {!orderId && user && items.length > 0 && (
              <p className="mt-3 text-xs text-slate-500">Prima premi <strong>Crea ordine</strong>, poi si attiva <strong>🧪 Paga ora — SOLO TEST</strong>.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
