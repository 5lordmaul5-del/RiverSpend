import { useState } from 'react';
import Link from 'next/link';

const OPTIONS = [
  { id: 'support', icon: '💚', title: 'RiverSpend Donation', text: 'Contributo volontario per sostenere lo sviluppo e il miglioramento dell’ecosistema RiverSpend.' },
  { id: 'ecology', icon: '🌳', title: 'RiverSpend Ecology', text: 'Sostieni iniziative ambientali, come il progetto Adotta un albero. La destinazione dei fondi sarà indicata prima dell’attivazione.' },
  { id: 'charity', icon: '❤️', title: 'RiverSpend Charity', text: 'Contributi per iniziative solidali con beneficiario, obiettivo e destinazione delle somme dichiarati.' },
  { id: 'piggybank', icon: '🐷', title: 'RiverSpend PiggyBank', text: 'Raccolte dedicate a un obiettivo specifico, con importo e traguardo visibili.' },
  { id: 'giftcard', icon: '🎁', title: 'RiverSpend Gift Card', text: 'Buoni regalo per gli acquisti RiverSpendShop. Non è una donazione e sarà attivata separatamente.' }
];

export default function RiverSpendDonation() {
  const [selected, setSelected] = useState('support');
  const [amount, setAmount] = useState('5');
  const [message, setMessage] = useState('');

  function prepareContribution(event) {
    event.preventDefault();
    const option = OPTIONS.find((item) => item.id === selected);
    if (selected === 'giftcard') {
      setMessage('🎁 RiverSpend Gift Card è un servizio distinto dalle donazioni. L’acquisto sarà attivato quando saranno pronte le condizioni e il sistema di pagamento.');
      return;
    }
    setMessage(`Hai scelto ${option.title} per €${amount}. La raccolta non è ancora attiva: non è stato effettuato alcun pagamento. Prima dell’attivazione saranno indicati il beneficiario, la destinazione dei fondi e il metodo di pagamento.`);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-teal-700 underline">← Torna al RiverSpendShop</Link>
        <header className="mt-6 rounded-3xl bg-gradient-to-br from-teal-800 to-cyan-600 p-6 text-white shadow-xl sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-teal-100">YOUR SHOP • YOUR FLOW</p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">💚 RiverSpend Donation</h1>
          <p className="mt-3 max-w-2xl leading-7 text-teal-50">Un gesto volontario può sostenere un progetto. Scegli l’iniziativa e l’importo: prima di raccogliere denaro mostreremo chiaramente chi riceve i fondi e come verranno utilizzati.</p>
        </header>

        <form onSubmit={prepareContribution} className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-black">Scegli dove destinare il contributo</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {OPTIONS.map((option) => (
              <button key={option.id} type="button" onClick={() => { setSelected(option.id); setMessage(''); }}
                className={`rounded-2xl border p-4 text-left transition ${selected === option.id ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-100' : 'border-slate-200 bg-white hover:border-teal-300'}`}>
                <span className="text-2xl" aria-hidden="true">{option.icon}</span>
                <span className="mt-2 block font-black">{option.title}</span>
                <span className="mt-1 block text-sm leading-6 text-slate-600">{option.text}</span>
                {selected === option.id && <span className="mt-3 block text-sm font-bold text-teal-700">✓ Selezionato</span>}
              </button>
            ))}
          </div>

          {selected !== 'giftcard' && (
            <div className="mt-6">
              <h3 className="font-bold">Scegli l’importo della donazione</h3>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {['1', '2', '5', '10'].map((value) => (
                  <button key={value} type="button" onClick={() => { setAmount(value); setMessage(''); }}
                    className={`rounded-xl border px-3 py-3 font-black ${amount === value ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-200 bg-white'}`}>€{value}</button>
                ))}
              </div>
              <label className="mt-4 block text-sm font-semibold" htmlFor="donation-amount">Oppure inserisci un importo in euro</label>
              <input id="donation-amount" type="number" min="1" max="5000" step="0.01" value={amount}
                onChange={(event) => { setAmount(event.target.value); setMessage(''); }}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </div>
          )}

          <button type="submit" className="mt-6 w-full rounded-xl bg-teal-700 px-5 py-4 font-black text-white hover:bg-teal-800">
            {selected === 'giftcard' ? '🎁 Prepara RiverSpend Gift Card' : '💚 Continua'}
          </button>
          {message && <p role="status" className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">{message}</p>}
        </form>

        <aside className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <strong>Trasparenza:</strong> questa pagina è una prima interfaccia informativa. Non raccoglie denaro e non avvia pagamenti. Prima di attivare le donazioni dobbiamo definire il beneficiario, le condizioni, la gestione contabile e un metodo autorizzato per ricevere i fondi. Le donazioni non sono il pagamento di un prodotto e sono facoltative.
        </aside>
      </div>
    </main>
  );
}
