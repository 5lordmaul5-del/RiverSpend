import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

const DELIVERY_OPTIONS = [
  ['home_delivery', '🚚 Consegna a domicilio'],
  ['seller_shop', '🏪 Ritiro al punto vendita / negozio'],
  ['river_hub', '📦 Ritiro al punto Hub RiverSpend (da confermare)'],
  ['pickup_point', '🏬 Punto di ritiro convenzionato (da confermare)'],
  ['locker', '🔐 Locker automatico (da confermare)'],
  ['seller_pickup', '🤝 Ritiro presso il venditore su appuntamento'],
  ['scheduled_delivery', '🗓️ Consegna programmata (da confermare)'],
  ['rs_local', '📍 RS Local · consegna a mano concordata']
];

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
  const [deliveryMethod, setDeliveryMethod] = useState('home_delivery');
  const [deliveryDetails, setDeliveryDetails] = useState('');
  const [codMessage, setCodMessage] = useState('');
  const [transferMessage, setTransferMessage] = useState('');
  const [paypalLoading, setPaypalLoading] = useState(false);
  const [paypalMessage, setPaypalMessage] = useState('');

  const cartLines = Object.values(items.reduce((lines, item) => {
    const id = String(item.id) + '::' + String(item.variantName || '');
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
    if (!lines[id]) lines[id] = { ...item, lineId: id, quantity };
    else lines[id].quantity += quantity;
    return lines;
  }, {}));
  const deliveryMethodsAvailable = DELIVERY_OPTIONS.filter(([method]) =>
    !items.length || !items.every((item) => Array.isArray(item.deliveryOptions)) ||
    items.every((item) => item.deliveryOptions.includes(method))
  );

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
    if (deliveryMethodsAvailable.length && !deliveryMethodsAvailable.some(([method]) => method === deliveryMethod)) {
      setDeliveryMethod(deliveryMethodsAvailable[0][0]);
    }
  }, [items, deliveryMethod, deliveryMethodsAvailable.length]);

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

      const cartById = new Map();
      for (const item of items) {
        const id = String(item.id || '');
        if (!id) throw new Error('Un prodotto nella Rete non ha un identificativo valido.');
        const variantName = String(item.variantName || '');
        const key = id + '::' + variantName;
        const existing = cartById.get(key);
        const itemQuantity = Math.max(1, Math.floor(Number(item.quantity || item.qty || 1)));
        cartById.set(key, { id, variantName, quantity: (existing?.quantity || 0) + itemQuantity });
      }

      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, price, stock, variants')
        .in('id', [...new Set([...cartById.values()].map((entry) => entry.id))])
        .eq('status', 'published');

      if (productsError) throw productsError;

      const byId = new Map((products || []).map((product) => [String(product.id), product]));
      const validItems = [...cartById.values()].map((cartEntry) => {
        const product = byId.get(cartEntry.id);
        if (!product) throw new Error('Uno o più prodotti non sono più disponibili.');
        const quantity = cartEntry.quantity;
        const stock = Number(product.stock);
        if (cartEntry.variantName) {
          const variant = (Array.isArray(product.variants) ? product.variants : []).find((v) => v.name === cartEntry.variantName);
          if (!variant || Number(variant.stock) < quantity) throw new Error(`Quantità non disponibile per ${product.name || 'un prodotto'} (${cartEntry.variantName}).`);
          return { product, quantity, variantName: cartEntry.variantName };
        }
        if (Array.isArray(product.variants) && product.variants.length) throw new Error(`Scegli un colore per ${product.name || 'un prodotto'} prima di inviare l'ordine.`);
        if (Number.isFinite(stock) && stock >= 0 && quantity > stock) throw new Error(`Quantità non disponibile per ${product.name || 'un prodotto'}: disponibili ${stock}.`);
        return { product, quantity, variantName: null };
      });

      const subtotal = validItems.reduce((sum, entry) => sum + Number(entry.product.price || 0) * entry.quantity, 0);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          buyer_id: user.id,
          status: 'pending_shipping_quote',
          payment_status: 'unpaid',
          currency: 'EUR',
          subtotal,
          shipping_total: 0,
          donation_total: 0,
          total: subtotal,
          delivery_method: deliveryMethod,
          delivery_details: deliveryDetails.trim() || null,
          delivery_status: 'pending_confirmation'
        })
        .select('id')
        .single();

      if (orderError) throw orderError;

      const orderItems = validItems.map(({ product, quantity, variantName }) => ({
        order_id: order.id,
        product_id: String(product.id),
        variant_name: variantName,
        product_name: (product.name || 'Prodotto') + (variantName ? ' · ' + variantName : ''),
        unit_price: Number(product.price || 0),
        quantity,
        subtotal: Number(product.price || 0) * quantity
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

  async function runSandboxPayment() {
    setError(''); setPaypalMessage('');
    if (!orderId) return setError('Prima crea l’ordine.');
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Accedi di nuovo al tuo account RiverSpend.');
      const response = await fetch('/api/pay/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ orderId })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || 'Pagamento sandbox non riuscito.');
      setPaypalMessage('✅ Test completato: pagamento simulato, nessun denaro reale movimentato. Ordine ' + result.orderId + '.');
      try { localStorage.removeItem('riverspend-rete'); setItems([]); } catch {}
    } catch (err) {
      setError(err?.message || 'Errore nel test di pagamento.');
    }
  }

  async function selectCashOnDelivery() {
    setError(''); setCodMessage(''); setTransferMessage('');
    if (!orderId) return setError('Prima crea l’ordine.');
    try {
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !currentUser) throw new Error('Accedi di nuovo al tuo account RiverSpend.');
      const { data, error: updateError } = await supabase
        .from('orders')
        .update({
          payment_method: 'cash_on_delivery',
          payment_status: 'unpaid',
          payment_selected_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('buyer_id', currentUser.id)
        .select('id')
        .maybeSingle();
      if (updateError) throw updateError;
      if (!data) throw new Error('Ordine non trovato o non appartenente al tuo account.');
      setCodMessage('🚚 Pagamento in contanti alla consegna selezionato. L’ordine resta non pagato fino alla consegna e alla verifica.');
    } catch (err) {
      setError(err?.message || 'Impossibile impostare il pagamento alla consegna.');
    }
  }

  async function selectInstantTransfer() {
    setError(''); setTransferMessage(''); setCodMessage('');
    if (!orderId) return setError('Prima crea l’ordine.');
    try {
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !currentUser) throw new Error('Accedi di nuovo al tuo account RiverSpend.');
      const { data, error: updateError } = await supabase
        .from('orders')
        .update({
          payment_method: 'bank_transfer',
          payment_status: 'unpaid',
          payment_selected_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('buyer_id', currentUser.id)
        .select('id')
        .maybeSingle();
      if (updateError) throw updateError;
      if (!data) throw new Error('Ordine non trovato o non appartenente al tuo account.');
      setTransferMessage('Bonifico istantaneo selezionato. L’ordine resta non pagato finché il trasferimento non viene verificato. Non segnare il pagamento come completato prima della verifica.');
    } catch (err) {
      setError(err?.message || 'Impossibile impostare il bonifico. Contatta l’assistenza prima di ripetere l’ordine.');
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
Invia una richiesta d’ordine. RiverSpendShop è appena partito: il venditore confermerà il costo e la modalità di spedizione prima della conferma definitiva. In questa fase non viene addebitato alcun pagamento online.
          </p>

          <div className="mt-6 rounded-2xl border border-teal-100 bg-white p-4">
            <h2 className="font-bold">🛒 Riepilogo</h2>
            {items.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">La tua Rete non contiene ancora prodotti da portare al checkout.</p>
            ) : (
              <>
                <div className="mt-3 space-y-2">
                  {cartLines.map((item) => (
                    <div key={item.lineId || item.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate">{item.title || 'Prodotto'}{item.variantName && <span className="text-teal-700"> · {item.variantName}</span>} <span className="text-slate-500">× {item.quantity}</span></span>
                      <strong>€ {(Number(item.price || 0) * item.quantity).toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between border-t border-teal-100 pt-3 text-lg font-black">
                  <span>Totale prodotti</span>
                  <span className="text-teal-600">€ {cartLines.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          <section className="mt-4 rounded-2xl border border-teal-200 bg-white p-4">
            <h2 className="font-bold text-slate-900">📦 Scegli ritiro o consegna</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">La tua preferenza viene salvata nella richiesta d’ordine. Il venditore deve confermare che la modalità sia disponibile e comunicare l’eventuale costo prima della conferma definitiva. Durante i test, Hub, locker e punti convenzionati non sono garantiti come servizi attivi.</p>
            <label htmlFor="rs-delivery-method" className="mt-4 block text-sm font-semibold text-slate-800">Modalità preferita</label>
            <select id="rs-delivery-method" value={deliveryMethod} onChange={(event) => setDeliveryMethod(event.target.value)} disabled={Boolean(orderId)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 disabled:bg-slate-100">
              {deliveryMethodsAvailable.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <label htmlFor="rs-delivery-details" className="mt-4 block text-sm font-semibold text-slate-800">Indirizzo, zona o punto di ritiro (facoltativo)</label>
            <textarea id="rs-delivery-details" value={deliveryDetails} onChange={(event) => setDeliveryDetails(event.target.value)} disabled={Boolean(orderId)} maxLength={500} rows={3} placeholder="Inserisci solo le informazioni necessarie alla modalità scelta; il venditore confermerà i dettagli dopo la richiesta." className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-slate-900 disabled:bg-slate-100" />
            <p className="mt-2 text-xs text-slate-500">Costo spedizione non calcolato automaticamente: attendi il totale completo e la conferma del venditore prima di pagare. La preferenza non garantisce la disponibilità del servizio.</p>
          </section>

          <section className="mt-6 rounded-2xl border border-teal-100 bg-white p-4">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-teal-600">RiverSpend Pay</p>
            <h2 className="mt-2 text-xl font-black text-slate-900">Scegli come pagare</h2>
            <p className="mt-1 text-sm text-slate-500">Per questa fase sono disponibili contanti alla consegna e bonifico istantaneo. I pagamenti online restano in pausa durante i test.</p>
            <div className="mt-4 grid gap-3">
              {[
                ['cod','🚚','Pagamento alla consegna in contanti'],
                ['transfer','🏦','Bonifico istantaneo'],\n                ['sandbox','🧪','Test RiverSpend Pay (solo simulazione)']
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
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="La tua email" autoComplete="email" className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500 outline-none focus:border-teal-500" />
                <button type="submit" disabled={sendingLink} className="rounded-xl bg-teal-500 px-4 py-3 font-bold text-white disabled:opacity-60">
                  {sendingLink ? 'Invio…' : '🔐 Accedi'}
                </button>
              </form>
            )}
            {authMessage && <p className="mt-2 text-sm text-amber-900">{authMessage}</p>}
            <p className="mt-2 text-xs text-slate-500">
              I pagamenti online con carta e PayPal non sono attivi in questa fase di verifica.
            </p>
          </div>

          {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
          {orderId && <div className="mt-5 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800">✅ Richiesta d’ordine registrata. ID: <span className="font-mono">{orderId}</span><br />Stato: <strong>in attesa di conferma della spedizione e del totale finale</strong>.<div className="mt-3"><Link href={`/ricevuta/${encodeURIComponent(orderId)}`} className="inline-flex rounded-xl bg-teal-700 px-4 py-3 font-bold text-white">⬇️ Scarica riepilogo ordine</Link></div><p className="mt-2 text-xs text-teal-900">Il riepilogo non sostituisce fattura o scontrino fiscale.</p></div>}
          {codMessage && <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{codMessage}</div>}
          {paypalMessage && <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800">{paypalMessage}</div>}
          {transferMessage && <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{transferMessage}</div>}

          <div className="mt-6 rounded-2xl border border-teal-100 bg-white p-4">
            <div className="flex flex-wrap gap-3">
              {user && items.length > 0 && !orderId && (
                <button type="button" onClick={createOrder} disabled={creating} className="rounded-xl bg-teal-500 px-4 py-3 font-bold text-white disabled:opacity-60">
                  {creating ? 'Invio richiesta…' : '🧾 Invia richiesta d’ordine'}
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

              {selectedPayment === 'sandbox' && (
                <button type="button" onClick={runSandboxPayment} disabled={!orderId} className="rounded-xl border border-violet-400 bg-violet-600 px-5 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-40">
                  🧪 Esegui test pagamento (nessun addebito)
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
