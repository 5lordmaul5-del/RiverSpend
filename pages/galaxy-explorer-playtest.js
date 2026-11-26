import Head from 'next/head';
import { useEffect, useState } from 'react';

const MAP = [
  '###########',
  '#..C...#..#',
  '#.##...#C.#',
  '#....#....#',
  '###..#..#.#',
  '#C...P....#',
  '#.####..#.#',
  '#....C....#',
  '#..#...C..#',
  '#.........#',
  '###########'
];
const START = { x: 5, y: 5 };

export default function GalaxyExplorerPlaytest() {
  const [player, setPlayer] = useState(START);
  const [collected, setCollected] = useState([]);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('Missione avviata. Esplora Planet E-01 e raccogli i cristalli.');
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem('rsgg-e01-save') || 'null');
      if (saved && saved.player && Array.isArray(saved.collected)) {
        setPlayer(saved.player);
        setCollected(saved.collected);
      }
    } catch (error) {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) window.localStorage.setItem('rsgg-e01-save', JSON.stringify({ player, collected }));
  }, [player, collected, ready]);

  const move = (dx, dy) => {
    const next = { x: player.x + dx, y: player.y + dy };
    if (MAP[next.y]?.[next.x] === undefined || MAP[next.y][next.x] === '#') {
      setMessage('Ostacolo rilevato. Cerca un altro percorso.');
      return;
    }
    const cellKey = next.x + ',' + next.y;
    if (MAP[next.y][next.x] === 'C' && !collected.includes(cellKey)) {
      setCollected(old => [...old, cellKey]);
      setMessage('Cristallo energetico raccolto! Risorse: ' + (collected.length + 1));
    } else {
      setMessage('Coordinate E-01: settore ' + next.x + '-' + next.y + '.');
    }
    setPlayer(next);
  };
  useEffect(() => {
    const onKey = event => {
      const keys = { ArrowUp:[0,-1], w:[0,-1], ArrowDown:[0,1], s:[0,1], ArrowLeft:[-1,0], a:[-1,0], ArrowRight:[1,0], d:[1,0] };
      const delta = keys[event.key];
      if (delta) { event.preventDefault(); move(delta[0],delta[1]); }
    };
    window.addEventListener('keydown',onKey);
    return () => window.removeEventListener('keydown',onKey);
  });
  const reset = () => {
    setPlayer(START); setCollected([]); setMessage('Esplorazione riavviata. Buona missione!');
    window.localStorage.removeItem('rsgg-e01-save');
  };
  return <>
    <Head><title>Planet E-01 · Playtest | RiverSpaceGalaxyGames</title><meta name="description" content="Prototipo esplorabile 2D di Planet E-01."/></Head>
    <main className="playtest">
      <header><a href="/river-space-galaxy-games">← RiverSpaceGalaxyGames</a><span>MISSIONE ZERO · PLANET E-01</span></header>
      <section className="intro"><div className="eyebrow">FIELD TEST / E-01</div><h1>Esplora il pianeta.</h1><p>Prototipo giocabile 2D: muovi l'esploratore, evita gli ostacoli e raccogli i cristalli energetici. I progressi vengono salvati su questo dispositivo.</p></section>
      <section className="game-layout">
        <div className="world-panel"><div className="world-head"><b>SETTORE E-01</b><span>SEGNALI RILEVATI · {MAP.flatMap(row=>row.split('')).filter(c=>c==='C').length-collected.length} CRISTALLI</span></div><div className="world-grid">{MAP.map((row,y)=>row.split('').map((cell,x)=>{const key=x+','+y;const isPlayer=player.x===x&&player.y===y;const isCollected=collected.includes(key);return <div key={key} className={'tile '+(cell==='#'?'rock':cell==='C'&&!isCollected?'crystal':'ground')+(isPlayer?' player':'')}>{isPlayer?'🧑‍🚀':cell==='#'?'':cell==='C'&&!isCollected?'💎':''}</div>}))}</div><div className="world-legend"><span>🧑‍🚀 Esploratore</span><span>💎 Cristallo</span><span>⬛ Roccia</span></div></div>
        <aside className="control-panel"><div className="metric"><small>CRISTALLI RACCOLTI</small><strong>{collected.length} / 5</strong></div><div className="metric"><small>POSIZIONE</small><strong>{player.x} : {player.y}</strong></div><div className="message" role="status">{message}</div><div className="dpad"><span></span><button onClick={()=>move(0,-1)} aria-label="Su">↑</button><span></span><button onClick={()=>move(-1,0)} aria-label="Sinistra">←</button><button onClick={()=>move(0,1)} aria-label="Giù">↓</button><button onClick={()=>move(1,0)} aria-label="Destra">→</button></div><small className="keyboard">Puoi usare anche le frecce della tastiera o WASD.</small><button className="reset" onClick={reset}>↻ Riavvia esplorazione</button></aside>
      </section>
      <footer><span>PROTOTIPO 2D · NON È ANCORA IL MOTORE 3D/MULTIPLAYER</span><a href="/games">RiverSpend Games →</a></footer>
    </main>
    <style jsx global>{`
      *{box-sizing:border-box}.playtest{min-height:100vh;background:#071629;color:#edf7fc;font-family:Inter,system-ui,sans-serif}.playtest a{color:#edc56d;text-decoration:none;font-weight:800}.playtest header{height:64px;padding:0 clamp(16px,5vw,60px);display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(147,190,216,.17);font-size:11px}.playtest header span{color:#8daabd;letter-spacing:1.5px}.intro{max-width:1100px;margin:auto;padding:48px 20px 25px}.eyebrow{color:#edc56d;font-size:10px;letter-spacing:2px;font-weight:900}.intro h1{font-size:clamp(32px,5vw,52px);margin:10px 0}.intro p{max-width:700px;color:#a9c1d1;line-height:1.7;font-size:13px}.game-layout{max-width:1100px;margin:auto;padding:15px 20px 60px;display:grid;grid-template-columns:1fr 260px;gap:18px}.world-panel,.control-panel{border:1px solid rgba(137,184,211,.2);border-radius:14px;background:#0d2742;padding:17px}.world-head{display:flex;justify-content:space-between;gap:10px;color:#edc56d;font-size:10px;letter-spacing:1px;margin-bottom:15px}.world-head span{color:#8eabba;font-size:9px}.world-grid{display:grid;grid-template-columns:repeat(11,minmax(0,1fr));gap:4px;max-width:650px;margin:auto;aspect-ratio:1.1}.tile{border-radius:5px;display:grid;place-items:center;font-size:clamp(13px,2.4vw,24px);min-width:0;min-height:0}.tile.ground{background:linear-gradient(145deg,#214e60,#15354d);border:1px solid rgba(121,191,191,.13)}.tile.rock{background:linear-gradient(145deg,#344b5b,#182d40);border:1px solid #456070;box-shadow:inset 0 0 9px rgba(0,0,0,.3)}.tile.crystal{background:linear-gradient(145deg,#285d78,#163b59);border:1px solid rgba(114,217,231,.3);text-shadow:0 0 12px #65d9ee}.tile.player{background:linear-gradient(145deg,#876b39,#574522);border:1px solid #f2cc73;box-shadow:0 0 15px rgba(242,204,115,.3)}.world-legend{display:flex;justify-content:center;gap:18px;flex-wrap:wrap;margin-top:16px;color:#9cb4c5;font-size:10px}.control-panel{display:flex;flex-direction:column;gap:13px}.metric{padding:12px;border-radius:8px;background:#122f4a}.metric small{display:block;color:#88a6b9;font-size:9px;letter-spacing:1px}.metric strong{display:block;color:#f0ce7a;font-size:24px;margin-top:5px}.message{padding:12px;border:1px solid rgba(111,207,190,.22);border-radius:8px;color:#b8ded9;font-size:11px;line-height:1.6;min-height:58px}.dpad{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;max-width:180px;margin:4px auto}.dpad button{height:47px;border:1px solid rgba(239,200,113,.45);border-radius:9px;background:#1a405b;color:#f5d88f;font-size:22px;font-weight:900;cursor:pointer}.dpad button:active{background:#916c30}.keyboard{font-size:9px;color:#829fb2;line-height:1.5;text-align:center}.reset{border:1px solid rgba(149,183,203,.25);border-radius:8px;background:transparent;color:#d5e6ef;padding:10px;cursor:pointer;font-weight:800;font-size:10px}.playtest footer{border-top:1px solid rgba(147,190,216,.14);padding:20px clamp(16px,5vw,60px);display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;color:#7f9bae;font-size:9px;letter-spacing:1px}@media(max-width:760px){.game-layout{grid-template-columns:1fr}.control-panel{display:grid;grid-template-columns:1fr 1fr}.message,.dpad,.keyboard,.reset{grid-column:1/-1}.world-grid{max-width:500px}.world-head{flex-direction:column}}@media(max-width:440px){.playtest header span{font-size:8px}.world-panel{padding:10px}.world-grid{gap:3px}.tile{border-radius:3px}.control-panel{grid-template-columns:1fr 1fr}}
    `}</style>
  </>;
}
