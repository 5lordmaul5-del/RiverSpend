import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

const timeSlots = ['09:00–10:00', '10:00–12:00', '12:00–14:00', '14:00–16:00', '16:00–18:00', '18:00–20:00'];

function readableError(error) {
  return error?.message || 'Si è verificato un errore. Riprova.';
}

export default function RSLocalRitiro() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [orderId, setOrderId] = useState('');
  const [city, setCity] = useState('Alessandria');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00–12:00');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState('');

  const loadData = useCallback(async (user) => {
    if (!user) {
      setOrders([]);
      setPickups([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [ordersResult, pickupsResult] = await Promise.all([
      supabase.from('orders')
        .select('id,created_at,total,status,order_items(product_name,seller_id)')
        .eq('buyer_id', user.id)
        .eq('delivery_method', 'rs_local')
        .not('status', 'in', '(cancelled,refunded)')
        .order('created_at', { ascending: false }),
      supabase.from('rs_local_pickups')
        .select('id,order_id,buyer_id,seller_id,zone,pickup_date,pickup_time_slot,status,buyer_confirmed_at,seller_confirmed_at,created_at')
        .order('created_at', { ascending: false })
    ]);
    if (ordersResult.error) setNotice('Non riesco a leggere gli ordini RS Local: ' + readableError(ordersResult.error));
    else {
      setOrders(ordersResult.data || []);
      if (!orderId && ordersResult.data?.length) setOrderId(ordersResult.data[0].id);
    }
    if (pickupsResult.error) setNotice('Non riesco a leggere i ritiri: ' + readableError(pickupsResult.error));
    else setPickups(pickupsResult.data || []);
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!alive) return;
      if (error) setNotice(readableError(error));
      setSession(data?.session || null);
      loadData(data?.session?.user || null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      loadData(nextSession?.user || null);
    });
    return () => {
      alive = false;
      listener?.subscription?.unsubscribe();
    };
  }, [loadData]);

  async function createProposal(event) {
    event.preventDefault();
    setNotice('');
    if (!session?.user) {
      setNotice('Accedi a RiverSpend per creare una proposta reale.');
      return;
    }
    if (!orderId || !date || !city.trim()) {
      setNotice('Seleziona un ordine RS Local, una zona e una data.');
      return;
    }
    setBusyId('create');
    const { data, error } = await supabase.rpc('rs_local_create_pickup', {
      p_order_id: orderId,
      p_zone: city.trim(),
      p_pickup_date: date,
      p_pickup_time_slot: time
    });
    if (error) setNotice('Proposta non salvata: ' + readableError(error));
    else {
      setNotice('Proposta salvata in Supabase. Codice ritiro: ' + data.id);
      await loadData(session.user);
    }
    setBusyId('');
  }

  async function confirmPickup(pickupId) {
    if (!session?.user) return;
    setBusyId(pickupId);
    setNotice('');
    const { data, error } = await supabase.rpc('rs_local_confirm_pickup', { p_pickup_id: pickupId });
    if (error) setNotice('Conferma non salvata: ' + readableError(error));
    else {
      setNotice(data.status === 'completed'
        ? 'Entrambe le parti hanno confermato il ritiro. Stato registrato in Supabase.'
        : 'La tua conferma è stata registrata in Supabase. Manca la conferma dell’altra parte.');
      await loadData(session.user);
    }
    setBusyId('');
  }

  const myPickups = pickups.filter((pickup) =>
    pickup.buyer_id === session?.user?.id || pickup.seller_id === session?.user?.id
  );

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <Link href="/servizi/local" className="text-teal-700 underline">← Torna a RS Local</Link>
        <section className="mt-6 rounded-3xl border border-teal-200 bg-white p-6 shadow-sm sm:p-9">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-700">RiverSpend · RS Local</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Ritiro locale protetto</h1>
          <p className="mt-4 leading-7 text-slate-600">
            La pagina mostra soltanto la zona indicativa, non l’indirizzo preciso. Le proposte e le conferme qui sotto vengono registrate in Supabase e sono visibili ai partecipanti dell’ordine.
          </p>

          {!session && (
            <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-4">
              <h2 className="font-bold text-amber-900">Accedi per usare il servizio reale</h2>
              <p className="mt-2 text-sm leading-6 text-amber-900">Non è possibile creare o confermare un ritiro reale senza autenticazione. Dopo l’accesso, torna qui per continuare.</p>
              <Link href="/accedi" className="mt-3 inline-block rounded-xl bg-teal-700 px-5 py-3 font-bold text-white">Accedi a RiverSpend</Link>
            </div>
          )}

          {session && (
            <form onSubmit={createProposal} className="mt-7 rounded-2xl border border-teal-200 p-5">
              <h2 className="text-xl font-black">Proponi un ritiro per un ordine esistente</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Puoi proporre un ritiro solo per un ordine reale già impostato con consegna RS Local.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold sm:col-span-2">
                  Ordine RS Local
                  <select required value={orderId} onChange={(event) => setOrderId(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3">
                    <option value="">Seleziona un ordine</option>
                    {orders.map((order) => (
                      <option key={order.id} value={order.id}>
                        {order.order_items?.map((item) => item.product_name).filter(Boolean).join(', ') || 'Ordine'} · €{Number(order.total || 0).toFixed(2)} · {order.id.slice(0, 8)}
                      </option>
                    ))}
                  </select>
                  {!loading && orders.length === 0 && <span className="mt-1 block text-xs font-normal text-slate-500">Non risultano ordini RS Local disponibili nel tuo account.</span>}
                </label>
                <label className="text-sm font-semibold">
                  Zona indicativa
                  <input required value={city} onChange={(event) => setCity(event.target.value)} maxLength={100} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3" placeholder="Es. Alessandria" />
                </label>
                <label className="text-sm font-semibold">
                  Giorno proposto
                  <input required type="date" value={date} min={new Date().toLocaleDateString('en-CA')} onChange={(event) => setDate(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3" />
                </label>
                <label className="text-sm font-semibold sm:col-span-2">
                  Fascia oraria proposta
                  <select value={time} onChange={(event) => setTime(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3">
                    {timeSlots.map((slot) => <option key={slot}>{slot}</option>)}
                  </select>
                </label>
              </div>
              <button disabled={busyId === 'create' || loading || orders.length === 0} type="submit" className="mt-4 w-full rounded-xl bg-teal-700 px-5 py-3 font-bold text-white disabled:opacity-50 sm:w-auto">
                {busyId === 'create' ? 'Salvataggio…' : 'Salva proposta in Supabase'}
              </button>
            </form>
          )}

          {notice && <p role="status" className="mt-4 break-words rounded-xl bg-teal-50 p-3 text-sm text-teal-900">{notice}</p>}

          <section className="mt-7">
            <h2 className="text-xl font-black">I miei ritiri RS Local</h2>
            {loading && <p className="mt-3 text-sm text-slate-600">Caricamento dati…</p>}
            {!loading && session && myPickups.length === 0 && <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Non ci sono ancora ritiri associati al tuo account.</p>}
            <div className="mt-4 grid gap-4">
              {myPickups.map((pickup) => {
                const isBuyer = pickup.buyer_id === session?.user?.id;
                const ownConfirmed = isBuyer ? pickup.buyer_confirmed_at : pickup.seller_confirmed_at;
                const otherConfirmed = isBuyer ? pickup.seller_confirmed_at : pickup.buyer_confirmed_at;
                const statusText = pickup.status === 'completed' ? 'Ritiro confermato da entrambe le parti'
                  : pickup.status === 'cancelled' ? 'Ritiro annullato'
                  : ownConfirmed ? 'La tua conferma è registrata; attendiamo l’altra parte'
                  : 'In attesa delle conferme';
                return (
                  <article key={pickup.id} className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Ritiro RS Local · {isBuyer ? 'Acquirente' : 'Venditore'}</p>
                    <p className="mt-1 break-all text-lg font-black">{pickup.id}</p>
                    <p className="mt-2 text-sm text-slate-700">Zona: {pickup.zone}</p>
                    <p className="text-sm text-slate-700">Appuntamento: {pickup.pickup_date} · {pickup.pickup_time_slot}</p>
                    <p className="mt-3 font-bold text-teal-800">{statusText}</p>
                    <p className="mt-1 text-xs text-slate-500">La tua conferma: {ownConfirmed ? 'sì' : 'no'} · Conferma dell’altra parte: {otherConfirmed ? 'sì' : 'no'}</p>
                    {pickup.status !== 'completed' && pickup.status !== 'cancelled' && !ownConfirmed && (
                      <button type="button" disabled={busyId === pickup.id} onClick={() => confirmPickup(pickup.id)} className="mt-4 w-full rounded-xl border border-teal-700 px-4 py-3 font-bold text-teal-800 disabled:opacity-50 sm:w-auto">
                        {busyId === pickup.id ? 'Registrazione…' : 'Conferma ritiro in Supabase'}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          <section className="mt-7 rounded-2xl border border-amber-300 bg-amber-50 p-4">
            <h2 className="font-bold text-amber-900">Importante sui pagamenti</h2>
            <p className="mt-2 text-sm leading-6 text-amber-900">Supabase registra l’ordine RS Local e le conferme delle parti. Non trattiene né trasferisce denaro: l’accredito dopo il ritiro resta disattivato finché non integriamo un provider che supporti pagamenti marketplace e accrediti differiti. Non usare le conferme come prova di pagamento.</p>
          </section>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/rete" className="rounded-xl bg-teal-700 px-5 py-3 font-bold text-white">Vai alla mia Rete</Link>
            <Link href="/servizi/local" className="rounded-xl border border-slate-300 px-5 py-3 font-semibold">Pagina RS Local</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
