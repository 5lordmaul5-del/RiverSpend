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
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [codMessage, setCodMessage] = useState('');
  const [transferMessage, setTransferMessage] = useState('');
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [paypalMessage, setPaypalMessage] = useState('');

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data, error }) => {
      if (active && !error) setUser(data?.user || null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user || null);
    });
    try {
      const saved = JSON.parse(localStorage.getItem('riverspend-rete') || '[]');
      if (Array.isArray(saved)) setItems(saved);
    } catch {}
    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paypal = params.get('paypal');
    const token = params.get('token');
    if (paypal === 'success' && token) capturePayPalPayment(token);
    if (paypal === 'cancel') setPaypalMessage('Pagamento PayPal annullato. Nessun pagamento è stato confermato.');
    try { localStorage.removeItem('riverspend-sumup-checkout'); } catch {}
  }, []);

  async function sendLoginLink(event) {
    event.preventDefault();
    setAuthMessage('');
    if (!email.trim()) return setAuthMessage('Inserisci la tua email.');
    setSendingLink(true);
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin + '/checkout' }
      });
      setAuthMessage(authError
        ? '❌ ' + (authError.message.includes('rate limit') ? 'Limite temporaneo di invio email raggiunto. Riprova più tardi.' : authError.message)
        : '✅ Link inviato. Aprilo dalla stessa email e torna al Checkout.');
    } catch (err) {
      setAuthMessage('❌ ' + (err?.message || 'Impossibile inviare il link di accesso.'));
    } finally {
      setSendingLink(false);
    }
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


  async function startPayPalPayment() {
    setError(''); setPaypalMessage(''); setPaypalLoading(true);
    try {
      if (!orderId) throw new Error('Prima crea l’ordine.');
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Sessione RiverSpend non valida. Accedi di nuovo.');
      const response = await fetch('/api/pay/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ orderId })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'PayPal non disponibile.');
      if (!result?.url) throw new Error('PayPal non ha restituito il link di approvazione.');
      window.location.href = result.url;
    } catch (err) {
      setError(err?.message || 'Impossibile avviare PayPal.');
      setPaypalLoading(false);
    }
  }

  async function capturePayPalPayment(paypalOrderId) {
    setPaypalLoading(true); setError('');
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Accedi di nuovo al tuo account RiverSpend.');
      const response = await fetch('/api/pay/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ paypalOrderId })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Impossibile confermare PayPal.');
      setPaypalMessage('Pagamento PayPal completato. Ordine confermato.');
      setOrderId(result.orderId || orderId);
      try { localStorage.removeItem('riverspend-rete'); setItems([]); } catch {}
    } catch (err) {
      setError(err?.message || 'Errore nella conferma PayPal.');
    } finally {
      setPaypalLoading(false);
    }
  }

  async function selectCashOnDelivery() {
    setError(''); setCodMessage(''); setTransferMessage('');
    if (!orderId) return setError('Prima crea l’ordine.');
    const { error: updateError } = await supabase.from('orders').update({ payment_status: 'cod_pending' }).eq('id', orderId);
    if (updateError) return setError('Impossibile impostare il pagamento alla consegna.');
    setCodMessage('🚚 Pagamento alla consegna selezionato. L’ordine resta in attesa di consegna.');
  }


  async function selectInstantTransfer() {
    setError(''); setTransferMessage(''); setCodMessage('');
    if (!orderId) return setError('Prima crea l’ordine.');
    const { error: updateError } = await supabase.from('orders').update({ payment_status: 'transfer_pending' }).eq('id', orderId);
    if (updateError) return setError('Impossibile impostare il bonifico. Contatta l’assistenza prima di ripetere l’ordine.');
    setTransferMessage('Bonifico istantaneo selezionato. L’ordine resta non pagato finché il trasferimento non viene verificato. Le coordinate del beneficiario devono essere comunicate dal titolare o dal venditore.');
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
            <h2 className="mt-2 text-xl font-black text-slate-900">Scegli come pagare</h2>
            <p className="mt-1 text-sm text-slate-500">Scegli tra pagamento alla consegna in contanti, bonifico istantaneo e PayPal.</p>
            <div className="mt-4 grid gap-3">
              {[
                ['cod','🚚','Pagamento alla consegna in contanti'],
                ['transfer','🏦','Bonifico istantaneo'],
                ['paypal','🅿️','PayPal — pagamento online']
              ].map(([id, icon, title]) => (
                <button key={id} type="button" onClick={() => setSelectedPayment(id)} className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left ${selectedPayment === id ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white'}`}>
                  <span className="flex items-center gap-3"><span className="text-xl">{icon}</span><strong className="text-slate-900">{title}</strong></span>
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
              ['💶', 'Pagamento', 'Contanti alla consegna o bonifico istantaneo'],
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
              PayPal richiede credenziali Live valide configurate in Vercel. Non inserire qui chiavi segrete.
            </p>
          </div>

          {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
          {orderId && <div className="mt-5 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-700">✅ Ordine creato. ID: <span className="font-mono">{orderId}</span><br />Stato: <strong>in attesa di pagamento</strong>.</div>}
          {codMessage && <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{codMessage}</div>}
          {paypalMessage && <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800">{paypalMessage}</div>}
          {transferMessage && <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{transferMessage}</div>}

          <div className="mt-6 rounded-2xl border border-teal-100 bg-white p-4">
            <div className="flex flex-wrap gap-3">
              {user && items.length > 0 && !orderId && (
                <button type="button" onClick={createOrder} disabled={creating} className="rounded-xl bg-teal-500 px-4 py-3 font-bold text-white disabled:opacity-60">
                  {creating ? 'Creazione ordine…' : '🧾 Crea ordine'}
                </button>
              )}

              {selectedPayment === 'cod' && (
                <button type="button" onClick={selectCashOnDelivery} disabled={!orderId} className="rounded-xl border border-amber-400 bg-amber-500 px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-40">
                  🚚 Conferma pagamento alla consegna
                </button>
              )}

              {selectedPayment === 'paypal' && (
                <button type="button" onClick={startPayPalPayment} disabled={!orderId || paypalLoading} className="rounded-xl border border-sky-400 bg-sky-600 px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-40">
                  {paypalLoading ? 'Apertura PayPal…' : 'Paga con PayPal'}
                </button>
              )}

              {selectedPayment === 'transfer' && (
                <button type="button" onClick={selectInstantTransfer} disabled={!orderId} className="rounded-xl border border-teal-400 bg-teal-600 px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-40">
                  🏦 Conferma bonifico istantaneo
                </button>
              )}







              <Link href="/rete" className="rounded-xl border border-teal-300 px-4 py-3 font-bold text-teal-700">
                🕸️ Vai alla Rete
              </Link>
            </div>
            {!orderId && user && items.length > 0 && (
              <p className="mt-3 text-xs text-slate-500">Prima premi <strong>Crea ordine</strong>, poi conferma il metodo di pagamento scelto.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
