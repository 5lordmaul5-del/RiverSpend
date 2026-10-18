import { useMemo, useState } from 'react';
import Link from 'next/link';

const phases = [
  ['Ordine pagato', 'Il sistema verifica il pagamento prima di mostrare i dati necessari al ritiro.'],
  ['Ritiro concordato', 'Acquirente e venditore scelgono giorno e fascia oraria tramite l’ordine.'],
  ['Codice di consegna', 'Un codice monouso conferma che la consegna è avvenuta di persona.'],
  ['Conferma e accredito', 'La conferma avvia la procedura di accredito prevista dal prestatore di pagamento.']
];

export default function RSLocalRitiro() {
  const [city, setCity] = useState('Alessandria');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00–12:00');
  const [orderCode, setOrderCode] = useState('');
  const [buyerConfirmed, setBuyerConfirmed] = useState(false);
  const [sellerConfirmed, setSellerConfirmed] = useState(false);
  const [notice, setNotice] = useState('');

  const demoStatus = useMemo(() => {
    if (!orderCode) return 'Nessun ordine dimostrativo creato';
    if (buyerConfirmed && sellerConfirmed) return 'Consegna registrata nella demo';
    if (buyerConfirmed) return 'Conferma acquirente registrata nella demo';
    if (sellerConfirmed) return 'Conferma venditore registrata nella demo';
    return 'Ritiro da concordare';
  }, [orderCode, buyerConfirmed, sellerConfirmed]);

  function createDemo() {
    if (!date) {
      setNotice('Scegli una data per simulare la proposta di ritiro.');
      return;
    }
    setOrderCode('RS-' + Math.random().toString(36).slice(2, 8).toUpperCase());
    setBuyerConfirmed(false);
    setSellerConfirmed(false);
    setNotice('Proposta di ritiro creata solo in questa demo. Non è stato creato un ordine reale.');
  }

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <Link href="/servizi/local" className="text-teal-700 underline">← Torna a RS Local</Link>
        <section className="mt-6 rounded-3xl border border-teal-200 bg-white p-6 shadow-sm sm:p-9">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-teal-700">RiverSpend · RS Local</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Ritiro locale protetto</h1>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            La scheda pubblica mostra solo la zona, ad esempio “{city} e dintorni”. Indirizzo preciso e telefono non devono apparire nell’annuncio pubblico: vengono condivisi con l’acquirente solo quando l’ordine e le regole del servizio lo consentono.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {phases.map(([title, description], index) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-700 font-black text-white">{index + 1}</span>
                  <h2 className="font-bold">{title}</h2>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
              </article>
            ))}
          </div>

          <section className="mt-7 rounded-2xl border border-teal-200 p-5">
            <h2 className="text-xl font-black">Prova il flusso di ritiro</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Questa è una simulazione visiva per controllare il percorso. Non crea ordini nel database, non invia notifiche e non riceve né trattiene denaro.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                Zona indicativa
                <input value={city} onChange={(e) => setCity(e.target.value)} maxLength={80} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3" placeholder="Es. Alessandria e dintorni" />
              </label>
              <label className="text-sm font-semibold">
                Giorno proposto
                <input type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3" />
              </label>
              <label className="text-sm font-semibold sm:col-span-2">
                Fascia oraria proposta
                <select value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3">
                  <option>09:00–10:00</option>
                  <option>10:00–12:00</option>
                  <option>12:00–14:00</option>
                  <option>14:00–16:00</option>
                  <option>16:00–18:00</option>
                  <option>18:00–20:00</option>
                </select>
              </label>
            </div>
            <button type="button" onClick={createDemo} className="mt-4 w-full rounded-xl bg-teal-700 px-5 py-3 font-bold text-white hover:bg-teal-800 sm:w-auto">Simula proposta di ritiro</button>

            {notice && <p role="status" className="mt-4 rounded-xl bg-teal-50 p-3 text-sm text-teal-900">{notice}</p>}
            {orderCode && (
              <div className="mt-5 rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Ordine dimostrativo</p>
                <p className="mt-1 text-2xl font-black">{orderCode}</p>
                <p className="mt-2 text-sm text-slate-700">Zona: {city || 'non specificata'}</p>
                <p className="text-sm text-slate-700">Appuntamento proposto: {date} · {time}</p>
                <p className="mt-3 text-sm font-bold text-teal-800">{demoStatus}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={() => { setBuyerConfirmed(true); setNotice('Conferma acquirente simulata.'); }} className="rounded-xl border border-teal-700 px-4 py-3 font-bold text-teal-800">Simula conferma acquirente</button>
                  <button type="button" onClick={() => { setSellerConfirmed(true); setNotice('Conferma venditore simulata.'); }} className="rounded-xl border border-teal-700 px-4 py-3 font-bold text-teal-800">Simula conferma venditore</button>
                </div>
                {buyerConfirmed && sellerConfirmed && <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">Demo completata: nella versione reale questa fase dovrà essere collegata alla verifica dell’ordine e alle regole di accredito del provider.</p>}
              </div>
            )}
          </section>

          <section className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-4">
            <h2 className="font-bold text-amber-900">Prima di attivare i pagamenti reali</h2>
            <p className="mt-2 text-sm leading-6 text-amber-900">Il rilascio del denaro dopo il ritiro richiede un provider che supporti marketplace e accrediti differiti, oltre a controlli server-side. Non è sicuro basarsi solo su un pulsante di conferma nel browser. Questa pagina è una demo del flusso, non un servizio di pagamento protetto attivo.</p>
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
