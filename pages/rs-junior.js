import Link from 'next/link';
import { useState } from 'react';

const activities = [
  { icon: '🎮', title: 'Giochi educativi', text: 'Quiz, memory, logica e piccoli enigmi per imparare giocando.', tag: 'GIOCA' },
  { icon: '📚', title: 'Letture e fiabe', text: 'Favole, racconti illustrati, storie della buonanotte e prime letture.', tag: 'LEGGI' },
  { icon: '🎬', title: 'Cartoni e storie animate', text: 'Un’area per cartoni, brevi animazioni e racconti selezionati.', tag: 'GUARDA' },
  { icon: '🧩', title: 'Puzzle e creatività', text: 'Puzzle, disegno, colori, attività manuali e fantasia.', tag: 'CREA' },
  { icon: '🚀', title: 'Scienza e spazio', text: 'Pianeti, stelle, robot, esperimenti spiegati in modo semplice.', tag: 'SCOPRI' },
  { icon: '🐬', title: 'Animali e natura', text: 'Esplora gli animali, gli habitat, gli oceani e il nostro pianeta.', tag: 'ESPLORA' },
  { icon: '🎵', title: 'Musica e lingue', text: 'Suoni, filastrocche, parole nuove e lingue dal mondo.', tag: 'ASCOLTA' },
  { icon: '🌍', title: 'Storia e culture', text: 'Viaggi nel tempo per conoscere popoli, luoghi e civiltà.', tag: 'VIAGGIA' }
];

const quiz = [
  { q: 'Quale pianeta è famoso per i suoi anelli?', options: ['Marte', 'Saturno', 'Mercurio'], answer: 'Saturno', explain: 'Saturno è famoso per il suo grande sistema di anelli.' },
  { q: 'Qual è l’animale più grande del pianeta?', options: ['Elefante africano', 'Balena azzurra', 'Giraffa'], answer: 'Balena azzurra', explain: 'La balena azzurra è il più grande animale conosciuto.' },
  { q: 'Di che cosa hanno bisogno le piante per crescere?', options: ['Luce e acqua', 'Caramelle', 'Giocattoli'], answer: 'Luce e acqua', explain: 'Le piante usano luce, acqua e aria per vivere e crescere.' }
];

export default function RSJunior() {
  const [question, setQuestion] = useState(0);
  const [choice, setChoice] = useState('');
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const current = quiz[question];

  function answer(value) {
    if (answered) return;
    setChoice(value);
    setAnswered(true);
    if (value === current.answer) setScore((n) => n + 1);
  }

  function next() {
    setQuestion((n) => (n + 1) % quiz.length);
    setChoice('');
    setAnswered(false);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f1fbff] text-slate-900">
      <header className="relative overflow-hidden bg-gradient-to-br from-[#073b63] via-[#087eaa] to-[#21b6c8] px-5 py-14 text-white sm:px-8 sm:py-20">
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full border-[30px] border-white/10" />
        <div className="relative mx-auto max-w-6xl">
          <Link href="/rs-dizionario" className="text-sm font-semibold text-cyan-100 underline">← Torna a RS Enciclopedy</Link>
          <div className="mt-10 grid items-center gap-8 md:grid-cols-[1.2fr_.8fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[.35em] text-amber-200">RiverSpend • Imparare divertendosi</p>
              <h1 className="mt-4 text-5xl font-black tracking-tight sm:text-7xl">RS<span className="text-amber-200">Junior</span></h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-cyan-50">Un mondo di giochi, letture, cartoni, scoperte e fantasia. Qui ogni curiosità può diventare una nuova avventura!</p>
              <div className="mt-7 inline-flex rounded-full border border-white/30 bg-white/10 px-5 py-3 text-lg font-bold">🤖 Nova ti dà il benvenuto!</div>
            </div>
            <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-full border border-cyan-100/50 bg-white/10 shadow-[0_0_70px_rgba(103,232,249,.35)] sm:h-64 sm:w-64">
              <div className="relative flex h-40 w-40 items-center justify-center rounded-[42%] border-4 border-slate-200 bg-gradient-to-br from-white via-slate-100 to-cyan-200 shadow-2xl sm:h-48 sm:w-48">
                <div className="absolute left-7 right-7 top-10 flex h-14 items-center justify-center gap-5 rounded-2xl bg-[#092c4b] shadow-inner"><i className="h-4 w-4 rounded-full bg-cyan-300 shadow-[0_0_15px_#67e8f9]" /><i className="h-4 w-4 rounded-full bg-cyan-300 shadow-[0_0_15px_#67e8f9]" /></div>
                <span className="absolute bottom-5 text-sm font-black tracking-widest text-[#075985]">NOVA</span>
                <span className="absolute -right-5 top-2 rounded-full bg-amber-300 px-3 py-1 text-xs font-black text-slate-900">RS</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
        <div className="mb-7"><p className="text-xs font-black uppercase tracking-[.25em] text-cyan-800">Scegli la tua avventura</p><h2 className="mt-2 text-3xl font-black sm:text-4xl">Cosa vuoi fare oggi?</h2></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {activities.map((item) => <article key={item.title} className="rounded-3xl border border-cyan-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-3xl">{item.icon}</span>
            <h3 className="mt-4 text-lg font-black">{item.title}</h3>
            <p className="mt-2 min-h-16 text-sm leading-6 text-slate-600">{item.text}</p>
            <span className="mt-4 inline-flex rounded-full bg-cyan-100 px-3 py-1 text-xs font-black tracking-wider text-cyan-900">{item.tag} · IN ARRIVO</span>
          </article>)}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-12 sm:px-8">
        <div className="rounded-3xl bg-[#082c4b] p-6 text-white shadow-xl sm:p-9">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.25em] text-cyan-300">La sfida di Nova</p><h2 className="mt-2 text-2xl font-black sm:text-3xl">Mini quiz delle curiosità</h2></div><span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold">⭐ Punti: {score}</span></div>
          <p className="mt-7 text-xl font-bold">{current.q}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {current.options.map((option) => <button key={option} type="button" onClick={() => answer(option)} disabled={answered} className={`rounded-xl border px-4 py-3 text-left font-semibold transition disabled:cursor-default ${answered && option === current.answer ? 'border-emerald-300 bg-emerald-300 text-slate-900' : answered && option === choice ? 'border-rose-300 bg-rose-300 text-slate-900' : 'border-white/20 bg-white/10 hover:bg-white/20'}`}>{option}</button>)}
          </div>
          {answered && <div className="mt-5 rounded-xl bg-white/10 p-4 text-sm"><strong>{choice === current.answer ? 'Bravissimo! 🎉' : 'Bel tentativo! 💙'}</strong><p className="mt-1">{current.explain}</p><button type="button" onClick={next} className="mt-4 rounded-full bg-amber-300 px-5 py-2 font-black text-slate-900">Prossima domanda →</button></div>}
          <p className="mt-5 text-xs text-cyan-100/70">Un piccolo gioco dimostrativo: nuovi quiz e livelli saranno aggiunti in seguito.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-8">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>Un ambiente pensato per i più piccoli.</strong> RSJunior dovrà offrire contenuti adatti all’età, privacy protetta, nessuna chat pubblica e nessuna pubblicità o acquisto non adatto ai minori. I contenuti video e le letture saranno selezionati e verificati prima della pubblicazione. Per i bambini è consigliata la presenza di un adulto.</div>
        <Link href="/ecosistema" className="mt-7 inline-flex rounded-full bg-cyan-800 px-6 py-3 font-bold text-white hover:bg-cyan-900">Torna all’ecosistema RiverSpend →</Link>
      </section>
      <footer className="bg-[#082c4b] px-5 py-7 text-center text-sm text-cyan-100">RSJunior · Curiosità, gioco e conoscenza per crescere insieme.</footer>
    </main>
  );
}
