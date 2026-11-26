import Head from 'next/head';
import { useMemo, useState } from 'react';

const quizQuestions = [
  { q: 'Quale pianeta è conosciuto come Pianeta Rosso?', a: ['Venere', 'Marte', 'Giove', 'Mercurio'], correct: 1, fact: 'Marte appare rossastro per gli ossidi di ferro presenti sulla sua superficie.' },
  { q: 'Quanti lati ha un esagono?', a: ['5', '6', '7', '8'], correct: 1, fact: 'Un esagono è un poligono con sei lati.' },
  { q: 'In quale continente si trova il Giappone?', a: ['Europa', 'Africa', 'Asia', 'Oceania'], correct: 2, fact: 'Il Giappone è un arcipelago dell’Asia orientale.' },
  { q: 'Qual è la formula chimica dell’acqua?', a: ['CO2', 'O2', 'NaCl', 'H2O'], correct: 3, fact: 'Una molecola d’acqua contiene due atomi di idrogeno e uno di ossigeno.' },
  { q: 'Chi ha scritto la Divina Commedia?', a: ['Petrarca', 'Dante Alighieri', 'Boccaccio', 'Manzoni'], correct: 1, fact: 'Dante Alighieri compose la Divina Commedia tra il XIV secolo e gli ultimi anni della sua vita.' }
];

const games = [
  { icon: '🧠', title: 'Quiz Arena', type: 'Gioco gratuito', desc: 'Metti alla prova cultura generale, scienza, sport e storia.', status: 'Giocabile in demo', action: 'quiz' },
  { icon: '♟️', title: 'Scacchi', type: 'Gioco classico', desc: 'Partite strategiche, allenamento e future sfide online.', status: 'In sviluppo', action: 'soon' },
  { icon: '🔴', title: 'Forza 4', type: 'Gioco classico', desc: 'Sfida un amico: allinea quattro pedine.', status: 'In sviluppo', action: 'soon' },
  { icon: '⭕', title: 'Tris', type: 'Gioco classico', desc: 'Una sfida veloce, perfetta anche su smartphone.', status: 'In sviluppo', action: 'soon' },
  { icon: '🎯', title: 'Dama', type: 'Gioco classico', desc: 'Tattica e strategia in una sfida testa a testa.', status: 'In sviluppo', action: 'soon' },
  { icon: '🏆', title: 'Tornei River', type: 'Competizioni', desc: 'Classifiche, eventi e competizioni organizzate.', status: 'In preparazione', action: 'soon' }
];

export default function RiverPlays() {
  const [quizOpen, setQuizOpen] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const question = quizQuestions[questionIndex];
  const progress = useMemo(() => Math.round(((questionIndex + (answer !== null ? 1 : 0)) / quizQuestions.length) * 100), [questionIndex, answer]);

  function startQuiz() {
    setQuestionIndex(0); setAnswer(null); setScore(0); setFinished(false); setQuizOpen(true);
  }
  function chooseAnswer(index) {
    if (answer !== null) return;
    setAnswer(index);
    if (index === question.correct) setScore((value) => value + 1);
  }
  function nextQuestion() {
    if (questionIndex === quizQuestions.length - 1) setFinished(true);
    else { setQuestionIndex((value) => value + 1); setAnswer(null); }
  }

  return (
    <>
      <Head>
        <title>RiverS PlayS | Gaming River</title>
        <meta name="description" content="RiverS PlayS: quiz gratuiti, giochi online, multiplayer e tornei River." />
        <meta name="theme-color" content="#111827" />
      </Head>
      <main style={{ minHeight: '100vh', color: '#f8fafc', background: 'radial-gradient(ellipse at top right,#312e81 0%,#111827 48%,#030712 100%)', padding: '24px 16px 64px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <a href="/app" style={{ color: '#c4b5fd', textDecoration: 'none', fontWeight: 700 }}>← Tutte le app River</a>
          <header style={{ padding: '38px 0 30px', textAlign: 'center' }}>
            <div style={{ fontSize: 13, letterSpacing: 4, color: '#a5f3fc', fontWeight: 900 }}>PLAY • COMPETE • CONNECT</div>
            <div aria-hidden="true" style={{ fontSize: 58, margin: '10px 0 0' }}>🎮</div>
            <h1 style={{ fontSize: 'clamp(38px,7vw,66px)', lineHeight: 1, margin: '8px 0 14px', fontWeight: 950 }}>RiverS <span style={{ color: '#a78bfa' }}>PlayS</span></h1>
            <p style={{ color: '#cbd5e1', maxWidth: 680, margin: '0 auto', lineHeight: 1.7, fontSize: 17 }}>Il nuovo spazio gaming River: quiz, giochi classici, sfide tra amici e tornei. Un solo ecosistema, da smartphone, tablet e computer.</p>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10, marginTop: 22 }}>
              <a href="#games" style={{ background: '#8b5cf6', color: '#fff', textDecoration: 'none', padding: '13px 22px', borderRadius: 12, fontWeight: 850 }}>Scopri i giochi</a>
              <a href="#plans" style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(196,181,253,.35)', color: '#fff', textDecoration: 'none', padding: '13px 22px', borderRadius: 12, fontWeight: 800 }}>Piani in progetto</a>
            </div>
          </header>

          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,220px),1fr))', gap: 14, marginBottom: 38 }}>
            {[
              ['📱','Smartphone e tablet','Interfaccia responsive e controlli touch.'],
              ['📺','Smart TV','Compatibilità TV da sviluppare e verificare per ogni sistema.'],
              ['🌐','Multiplayer online','Stanze, inviti e partite in tempo reale: fase successiva.'],
              ['☁️','Cloud gaming','Obiettivo futuro con server GPU, rete a bassa latenza e licenze.']
            ].map(([icon,title,desc]) => <article key={title} style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(167,139,250,.22)', borderRadius: 18, padding: 18 }}>
              <div style={{ fontSize: 27 }}>{icon}</div><h2 style={{ fontSize: 17, margin: '10px 0 6px' }}>{title}</h2><p style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.55, margin: 0 }}>{desc}</p>
            </article>)}
          </section>

          <section id="games">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
              <div><div style={{ color: '#a5f3fc', fontWeight: 900, letterSpacing: 2, fontSize: 11 }}>GAME LIBRARY</div><h2 style={{ fontSize: 30, margin: '5px 0 0' }}>Scegli il tuo gioco</h2></div>
              <span style={{ color: '#cbd5e1', fontSize: 12 }}>Prima selezione RiverS PlayS</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,250px),1fr))', gap: 14 }}>
              {games.map((game) => <article key={game.title} style={{ background: 'linear-gradient(145deg,rgba(49,46,129,.5),rgba(15,23,42,.9))', border: '1px solid rgba(167,139,250,.28)', borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', minHeight: 220 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: 38 }}>{game.icon}</span><span style={{ fontSize: 10, color: game.action === 'quiz' ? '#86efac' : '#c4b5fd', border: '1px solid currentColor', borderRadius: 999, padding: '5px 8px' }}>{game.status}</span></div>
                <h3 style={{ fontSize: 21, margin: '14px 0 4px' }}>{game.title}</h3><div style={{ color: '#c4b5fd', fontSize: 12, fontWeight: 800 }}>{game.type}</div><p style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.55, flex: 1 }}>{game.desc}</p>
                <button type="button" onClick={game.action === 'quiz' ? startQuiz : () => window.alert('Questo gioco è previsto nelle prossime fasi di sviluppo.')} style={{ border: 0, borderRadius: 11, padding: 12, background: game.action === 'quiz' ? '#7c3aed' : 'rgba(255,255,255,.10)', color: '#fff', fontWeight: 850, cursor: 'pointer' }}>{game.action === 'quiz' ? 'Gioca gratis' : 'In arrivo'}</button>
              </article>)}
            </div>
          </section>

          {quizOpen && <section aria-live="polite" style={{ marginTop: 34, background: '#f8fafc', color: '#111827', borderRadius: 22, padding: 'clamp(18px,4vw,30px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}><div><div style={{ color: '#6d28d9', fontWeight: 900, letterSpacing: 2, fontSize: 11 }}>QUIZ ARENA · DEMO GRATUITA</div><h2 style={{ fontSize: 26, margin: '5px 0' }}>{finished ? 'Quiz completato!' : 'Domanda ' + (questionIndex + 1) + ' di ' + quizQuestions.length}</h2></div><button type="button" onClick={() => setQuizOpen(false)} style={{ border: '1px solid #cbd5e1', borderRadius: 10, background: '#fff', padding: '9px 12px', cursor: 'pointer' }}>Chiudi</button></div>
            <div style={{ height: 7, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden', margin: '16px 0 22px' }}><div style={{ width: (finished ? 100 : progress) + '%', height: '100%', background: '#7c3aed' }} /></div>
            {finished ? <div><p style={{ fontSize: 20, fontWeight: 850 }}>Hai totalizzato {score} punti su {quizQuestions.length}.</p><p style={{ color: '#475569' }}>Questa è una demo locale: il punteggio non viene salvato su un account e non entra ancora in classifiche online.</p><button type="button" onClick={startQuiz} style={{ background: '#6d28d9', color: '#fff', border: 0, borderRadius: 10, padding: '12px 18px', fontWeight: 800 }}>Rigioca</button></div> : <><h3 style={{ fontSize: 20, marginBottom: 16 }}>{question.q}</h3><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,210px),1fr))', gap: 10 }}>{question.a.map((option,index) => { const chosen = answer === index; const correct = answer !== null && index === question.correct; return <button key={option} type="button" disabled={answer !== null} onClick={() => chooseAnswer(index)} style={{ textAlign: 'left', padding: 14, borderRadius: 12, border: '1px solid ' + (correct ? '#16a34a' : chosen ? '#dc2626' : '#cbd5e1'), background: correct ? '#dcfce7' : chosen ? '#fee2e2' : '#fff', color: '#111827', fontWeight: 750, cursor: answer === null ? 'pointer' : 'default' }}>{String.fromCharCode(65 + index)}. {option}</button>; })}</div>{answer !== null && <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: '#ede9fe' }}><strong>{answer === question.correct ? 'Risposta corretta!' : 'Risposta non corretta.'}</strong><p style={{ margin: '5px 0 0', color: '#334155' }}>{question.fact}</p><button type="button" onClick={nextQuestion} style={{ marginTop: 12, background: '#6d28d9', color: '#fff', border: 0, borderRadius: 10, padding: '11px 16px', fontWeight: 850, cursor: 'pointer' }}>{questionIndex === quizQuestions.length - 1 ? 'Vedi risultato' : 'Prossima domanda'}</button></div>}</>}
          </section>}

          <section id="plans" style={{ marginTop: 40 }}>
            <div style={{ textAlign: 'center', marginBottom: 18 }}><div style={{ color: '#a5f3fc', fontWeight: 900, letterSpacing: 2, fontSize: 11 }}>RIVER PLAY MEMBERSHIP</div><h2 style={{ fontSize: 30, margin: '6px 0' }}>Un piano per ogni giocatore</h2><p style={{ color: '#cbd5e1', margin: 0 }}>Prezzi e vantaggi sono proposte da definire: gli abbonamenti non sono ancora acquistabili.</p></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,230px),1fr))', gap: 14 }}>
              {[['FREE','0 €','Quiz demo e giochi gratuiti River.'],['PLUS','5 € / mese','Catalogo ampliato e funzionalità extra, da definire.'],['PREMIUM','10 € / mese','Contenuti premium e tornei dedicati, da definire.']].map(([name,price,desc]) => <article key={name} style={{ border: '1px solid rgba(196,181,253,.3)', background: 'rgba(255,255,255,.06)', borderRadius: 18, padding: 20, textAlign: 'center' }}><div style={{ color: '#c4b5fd', fontWeight: 900, letterSpacing: 2, fontSize: 12 }}>{name}</div><div style={{ fontSize: 30, fontWeight: 950, margin: '8px 0' }}>{price}</div><p style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.5, minHeight: 40 }}>{desc}</p><span style={{ color: '#fcd34d', fontSize: 11, fontWeight: 800 }}>IN PROGETTAZIONE · NON ATTIVO</span></article>)}
            </div>
          </section>

          <footer style={{ marginTop: 38, borderTop: '1px solid rgba(196,181,253,.2)', paddingTop: 20, color: '#94a3b8', fontSize: 12, lineHeight: 1.6 }}>
            RiverS PlayS è in fase iniziale. La demo Quiz Arena gira nel browser e non usa ancora account, pagamenti, multiplayer, salvataggio punteggi o server di cloud gaming. I giochi di terze parti e i servizi PlayStation/Xbox saranno accessibili solo tramite integrazioni e licenze autorizzate.
          </footer>
        </div>
      </main>
    </>
  );
}
