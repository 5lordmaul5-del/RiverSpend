import Link from 'next/link';
import { useMemo, useState } from 'react';

const topics = [
  { icon: '🌍', title: 'Geografia', description: 'Paesi, città, territori, popoli e culture.', tags: 'geografia paesi città culture' },
  { icon: '🔬', title: 'Scienza', description: 'Fisica, chimica, biologia e matematica.', tags: 'scienza fisica chimica biologia matematica' },
  { icon: '🚀', title: 'Universo e astronomia', description: 'Pianeti, stelle, galassie e missioni spaziali.', tags: 'universo astronomia pianeti stelle spazio' },
  { icon: '🏛️', title: 'Storia e civiltà', description: 'Archeologia, Egizi, Maya e grandi civiltà.', tags: 'storia archeologia egizi maya civiltà' },
  { icon: '🤖', title: 'Tecnologia', description: 'Informatica, intelligenza artificiale e robotica.', tags: 'tecnologia informatica intelligenza artificiale robotica' },
  { icon: '🌱', title: 'Natura e ambiente', description: 'Animali, piante, ecosistemi e biodiversità.', tags: 'natura ambiente animali piante biodiversità' },
  { icon: '🩺', title: 'Salute e prevenzione', description: 'Informazione di base e prevenzione con fonti autorevoli.', tags: 'salute prevenzione benessere' },
  { icon: '🎨', title: 'Arte e cultura', description: 'Musica, pittura, letteratura e patrimonio culturale.', tags: 'arte musica pittura letteratura' },
  { icon: '📖', title: 'Lingue e dizionario', description: 'Parole, definizioni, pronuncia e traduzioni.', tags: 'lingue parole definizioni pronuncia traduzioni' }
];

export default function RSDizionario() {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('it');
    if (!q) return topics;
    return topics.filter((topic) => (topic.title + ' ' + topic.description + ' ' + topic.tags).toLocaleLowerCase('it').includes(q));
  }, [query]);

  return (
    <main className="min-h-screen bg-[#f7fbfc] text-slate-900">
      <section className="relative isolate overflow-hidden bg-[#071c2a] px-5 py-16 text-white sm:px-8 sm:py-24">
        <div className="absolute inset-0 -z-10 opacity-70" style={{backgroundImage:'radial-gradient(circle at 15% 20%, #0e7490 0, transparent 35%), radial-gradient(circle at 85% 75%, #b58a3a 0, transparent 28%)'}} />
        <div className="mx-auto max-w-5xl text-center">
          <Link href="/ecosistema" className="text-sm font-semibold text-cyan-200 underline">← Ecosistema RiverSpend</Link>
          <p className="mt-10 text-xs font-black uppercase tracking-[.4em] text-amber-300">RiverSpend Knowledge</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-7xl">RS<span className="text-cyan-300">Dizionario</span></h1>
          <div className="mx-auto mt-8 max-w-3xl border-y border-cyan-100/20 py-6">
            <p className="text-2xl font-semibold leading-relaxed text-[#e8d39a] sm:text-3xl">La conoscenza è un fiume che scorre senza fine.</p>
            <p className="mt-3 text-lg leading-relaxed text-cyan-100 sm:text-xl">La via del sapere apre porte a noi sconosciute!</p>
          </div>
          <p className="mx-auto mt-7 max-w-2xl leading-7 text-slate-300">Un viaggio tra scienza, storia, natura, tecnologia e culture. Ogni scoperta è l'inizio di una nuova domanda.</p>
          <label className="mx-auto mt-8 flex max-w-2xl items-center gap-3 rounded-2xl border border-white/20 bg-white px-4 py-3 text-left shadow-xl">
            <span className="text-xl" aria-hidden="true">🔎</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cerca un argomento o una parola…" aria-label="Cerca argomento" className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-500" />
          </label>
          <p className="mt-3 text-xs text-slate-400">Ricerca tra le categorie disponibili</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-black uppercase tracking-[.25em] text-teal-700">Esplora il sapere</p><h2 className="mt-2 text-3xl font-black">Conoscenza senza confini</h2></div>
          <span className="text-sm text-slate-500">{filtered.length} {filtered.length === 1 ? 'categoria' : 'categorie'}</span>
        </div>
        {filtered.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((topic) => <article key={topic.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-teal-400 hover:shadow-md">
            <span className="text-4xl" aria-hidden="true">{topic.icon}</span>
            <h3 className="mt-4 text-xl font-black">{topic.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{topic.description}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-teal-700">Categoria in preparazione</p>
          </article>)}
        </div> : <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">Nessuna categoria trovata. Prova un'altra parola.</div>}
        <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
          <strong>Il nostro impegno per l'attendibilità.</strong> Le voci dell'enciclopedia saranno accompagnate da fonti consultabili e date di aggiornamento. Fatti documentati, consenso scientifico, teorie, ipotesi e leggende saranno sempre distinti. I contenuti saranno pubblicati dopo revisione editoriale.
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link href="/rs-educational" className="rounded-2xl border border-teal-200 bg-white p-5 hover:border-teal-500"><span className="text-2xl">🛟</span><h3 className="mt-2 text-lg font-black">RSEducational</h3><p className="mt-1 text-sm text-slate-600">Imparare, prepararsi e conoscere le regole di sicurezza.</p><span className="mt-4 inline-block text-sm font-bold text-teal-700">Scopri il progetto →</span></Link>
          <Link href="/ecosistema" className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-teal-500"><span className="text-2xl">🌊</span><h3 className="mt-2 text-lg font-black">Ecosistema RiverSpend</h3><p className="mt-1 text-sm text-slate-600">Torna a esplorare tutti i servizi.</p><span className="mt-4 inline-block text-sm font-bold text-teal-700">Torna all'ecosistema →</span></Link>
        </div>
      </section>
      <footer className="bg-[#071c2a] px-5 py-8 text-center text-sm text-slate-400">RSDizionario · La conoscenza è un fiume che scorre senza fine.</footer>
    </main>
  );
}
