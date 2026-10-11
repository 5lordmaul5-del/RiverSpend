import Link from 'next/link';
import { useState } from 'react';

export default function RiverSpendInvestor() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ nome: '', azienda: '', email: '', tipologia: 'Investitore privato', fascia: '', messaggio: '' });
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function submit(e) {
    e.preventDefault();
    const subject = encodeURIComponent('Interesse RiverSpend Investor');
    const body = encodeURIComponent(
      'Richiesta informazioni RiverSpend Investor\n\n' +
      'Nome: ' + form.nome + '\nAzienda: ' + (form.azienda || 'Non indicata') +
      '\nEmail: ' + form.email + '\nProfilo: ' + form.tipologia +
      '\nFascia indicativa: ' + (form.fascia || 'Non indicata') +
      '\nMessaggio: ' + (form.messaggio || 'Nessun messaggio aggiuntivo')
    );
    window.location.href = 'mailto:investor@riverspend.com?subject=' + subject + '&body=' + body;
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="bg-gradient-to-br from-slate-950 via-cyan-950 to-teal-900 px-4 py-14 text-white sm:py-20">
        <div className="mx-auto max-w-6xl">
          <Link href="/ecosistema" className="text-sm font-semibold text-cyan-200 underline">← Ecosistema RiverSpend</Link>
          <p className="mt-8 text-sm font-bold uppercase tracking-[.25em] text-amber-300">RiverSpend Investor</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">Investi in un mondo di nuove possibilità.</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-cyan-50">Cerchiamo investitori e partner strategici interessati a valutare lo sviluppo di RiverSpend Park e dell’ecosistema RiverSpend: intrattenimento, turismo, tecnologia e innovazione.</p>
          <a href="#contatto" className="mt-8 inline-flex rounded-xl bg-amber-300 px-6 py-3 font-bold text-slate-950 hover:bg-amber-200">Proponi una collaborazione ↓</a>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <section className="grid gap-5 md:grid-cols-3">
          {[
            ['🎢','RiverSpend Park','Un concept di parco tematico con montagne russe, aree acquatiche, attrazioni immersive e mondi da esplorare.'],
            ['🤝','Partner e investitori','Cerchiamo investitori privati, gruppi finanziari, aziende e operatori turistici interessati a valutare una collaborazione.'],
            ['🌐','Un ecosistema più ampio','Commercio, servizi, tecnologia e intrattenimento: le diverse aree RiverSpend potranno svilupparsi per fasi.']
          ].map(([icon,title,description]) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-3xl">{icon}</div>
              <h2 className="mt-3 text-xl font-bold">{title}</h2>
              <p className="mt-2 leading-7 text-slate-600">{description}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-teal-100 bg-white p-6 sm:p-9">
          <h2 className="text-2xl font-black">Quali collaborazioni cerchiamo</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              'Investitori privati e gruppi finanziari',
              'Partner industriali e tecnologici',
              'Aziende specializzate in parchi tematici e attrazioni',
              'Operatori turistici, alberghieri e della ristorazione',
              'Partner per infrastrutture e servizi',
              'Consulenti per fattibilità, pianificazione e sviluppo'
            ].map((item) => <div key={item} className="rounded-xl bg-cyan-50 p-4 font-medium text-slate-700"><span className="mr-2 text-teal-700">✓</span>{item}</div>)}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-9">
          <h2 className="text-2xl font-black">Un progetto da valutare con trasparenza</h2>
          <p className="mt-3 leading-7 text-slate-700">RiverSpend Park è attualmente un progetto in fase di concept e sviluppo. Costi, localizzazione definitiva, fabbisogno finanziario, tempi, struttura societaria e condizioni di eventuali investimenti dovranno essere definiti e verificati. Non vengono promessi rendimenti né garantiti risultati economici. Ogni proposta sarà valutata sulla base della documentazione disponibile e di accordi formalizzati.</p>
        </section>

        <section id="contatto" className="mt-10 grid gap-8 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-teal-700">Parliamone</p>
            <h2 className="mt-2 text-3xl font-black">Presentaci il tuo interesse.</h2>
            <p className="mt-4 leading-7 text-slate-600">Compila il modulo per preparare una richiesta di contatto. Potrai indicare il tuo profilo e la fascia d’interesse, senza impegno.</p>
            <p className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">Nota: il pulsante prepara un’email sul tuo dispositivo. L’indirizzo di destinazione deve essere confermato prima di raccogliere richieste pubbliche.</p>
          </div>
          <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">Nome e cognome *
                <input required name="nome" value={form.nome} onChange={update} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal" autoComplete="name" />
              </label>
              <label className="text-sm font-semibold">Azienda (facoltativo)
                <input name="azienda" value={form.azienda} onChange={update} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal" autoComplete="organization" />
              </label>
              <label className="text-sm font-semibold sm:col-span-2">Email *
                <input required type="email" name="email" value={form.email} onChange={update} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal" autoComplete="email" />
              </label>
              <label className="text-sm font-semibold">Profilo
                <select name="tipologia" value={form.tipologia} onChange={update} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal">
                  <option>Investitore privato</option><option>Fondo o gruppo finanziario</option><option>Azienda o partner industriale</option><option>Partner turistico</option><option>Consulente</option><option>Altro</option>
                </select>
              </label>
              <label className="text-sm font-semibold">Fascia indicativa (facoltativa)
                <select name="fascia" value={form.fascia} onChange={update} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 font-normal">
                  <option value="">Preferisco parlarne</option><option>Fino a € 50.000</option><option>€ 50.000–€ 250.000</option><option>€ 250.000–€ 1.000.000</option><option>Oltre € 1.000.000</option><option>Partner industriale / non finanziario</option>
                </select>
              </label>
              <label className="text-sm font-semibold sm:col-span-2">Messaggio
                <textarea name="messaggio" value={form.messaggio} onChange={update} rows={4} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal" placeholder="Raccontaci brevemente il tuo interesse…" />
              </label>
            </div>
            <button type="submit" className="mt-5 w-full rounded-xl bg-teal-800 px-5 py-3 font-bold text-white hover:bg-teal-700">Prepara richiesta di contatto</button>
            {submitted && <p className="mt-3 rounded-lg bg-teal-50 p-3 text-sm text-teal-900">È stato richiesto di aprire il programma email. La richiesta non viene inviata automaticamente dal sito.</p>}
          </form>
        </section>
        <footer className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-500">RiverSpend Investor · YOUR SHOP • YOUR FLOW · Concept in sviluppo</footer>
      </div>
    </main>
  );
}
