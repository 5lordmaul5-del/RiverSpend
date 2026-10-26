import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';

const TRACKS = [
  { name: 'Traccia 1 · Basso', frequency: 110, color: '#22d3ee' },
  { name: 'Traccia 2 · Synth', frequency: 220, color: '#a78bfa' },
  { name: 'Traccia 3 · Armonia', frequency: 330, color: '#f472b6' },
  { name: 'Traccia 4 · Atmosfera ISSA', frequency: 440, color: '#fbbf24' }
];

export default function RSSoundStudio() {
  const audioRef = useRef(null);
  const tracksRef = useRef([]);
  const masterRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState([false, false, false, false]);
  const [levels, setLevels] = useState([45, 32, 24, 18]);
  const [master, setMaster] = useState(70);
  const [issa, setIssa] = useState(true);
  const [message, setMessage] = useState('Premi “Avvia mixer” per attivare l’audio. Nessun suono parte automaticamente.');

  function startAudio() {
    const AudioContextClass = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
    if (!AudioContextClass) {
      setMessage('Questo browser non supporta il mixer audio. Prova con Google Chrome aggiornato.');
      return;
    }
    if (!audioRef.current) {
      const ctx = new AudioContextClass();
      const masterGain = ctx.createGain();
      masterGain.gain.value = master / 100;
      const compressor = ctx.createDynamicsCompressor();
      masterGain.connect(compressor);
      compressor.connect(ctx.destination);
      const delay = ctx.createDelay(1.5);
      const feedback = ctx.createGain();
      const wet = ctx.createGain();
      delay.delayTime.value = 0.28;
      feedback.gain.value = 0.22;
      wet.gain.value = issa ? 0.22 : 0;
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(wet);
      wet.connect(masterGain);
      const tracks = TRACKS.map((track, i) => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        oscillator.type = i === 0 ? 'triangle' : i === 3 ? 'sine' : 'sawtooth';
        oscillator.frequency.value = track.frequency;
        filter.type = 'lowpass';
        filter.frequency.value = i === 1 ? 1400 : 2200;
        gain.gain.value = 0;
        oscillator.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        gain.connect(delay);
        oscillator.start();
        return { oscillator, gain, filter };
      });
      audioRef.current = ctx;
      tracksRef.current = tracks;
      masterRef.current = masterGain;
    }
    audioRef.current.resume();
    setReady(true);
    setMessage('Mixer attivo. Accendi una o più tracce e regola i cursori. Sistema ISSA: ambiente spaziale opzionale.');
  }

  function toggleTrack(index) {
    if (!audioRef.current) startAudio();
    const next = [...playing];
    next[index] = !next[index];
    setPlaying(next);
    const track = tracksRef.current[index];
    if (track) track.gain.gain.setTargetAtTime(next[index] ? levels[index] / 100 * 0.22 : 0, audioRef.current.currentTime, 0.04);
  }

  function changeLevel(index, value) {
    const n = Number(value);
    const next = [...levels]; next[index] = n; setLevels(next);
    const track = tracksRef.current[index];
    if (track && playing[index] && audioRef.current) track.gain.gain.setTargetAtTime(n / 100 * 0.22, audioRef.current.currentTime, 0.04);
  }

  function changeMaster(value) {
    const n = Number(value); setMaster(n);
    if (masterRef.current && audioRef.current) masterRef.current.gain.setTargetAtTime(n / 100, audioRef.current.currentTime, 0.04);
  }

  function toggleIssa(value) {
    setIssa(value);
    setMessage(value ? 'Sistema ISSA ImmersiveSoundSpaceAmbient selezionato.' : 'Ambiente ISSA disattivato; il mixer base resta disponibile.');
    // Reverb/delay mix is created when the audio context starts; the switch remains explicit for the next activation.
  }

  useEffect(() => () => {
    if (audioRef.current) audioRef.current.close().catch(() => {});
  }, []);

  return <>
    <Head>
      <title>RSSoundStudio System ISSA | RiverSpend</title>
      <meta name="description" content="Mixer audio sperimentale RiverSpend SoundStudio con quattro tracce, volume master e ambiente ISSA opzionale." />
    </Head>
    <main style={{ minHeight:'100vh', background:'radial-gradient(circle at top,#164e63 0,#071426 58%,#030712 100%)', color:'#f8fafc', padding:'18px 12px 42px', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ maxWidth:980, margin:'0 auto' }}>
        <a href="/" style={{ color:'#67e8f9', fontWeight:800, textDecoration:'none' }}>← Torna a RiverSpendShop</a>
        <header style={{ marginTop:18, overflow:'hidden', borderRadius:24, border:'1px solid #22d3ee66', background:'#082f49', boxShadow:'0 18px 55px #0008' }}>
          <img src="/rssoundstudio-issa-banner.jpg" alt="RiverSpend SoundStudio System ISSA" style={{ display:'block', width:'100%', maxHeight:260, objectFit:'cover', objectPosition:'center' }} />
          <div style={{ padding:'18px 18px 22px' }}>
            <div style={{ color:'#67e8f9', fontSize:12, fontWeight:900, letterSpacing:3 }}>RIVERSPEND EXCLUSIVE SYSTEM</div>
            <h1 style={{ fontSize:'clamp(27px,5vw,42px)', lineHeight:1.08, margin:'8px 0', fontWeight:950 }}>RSSoundStudio <span style={{ color:'#fbbf24' }}>ISSA</span></h1>
            <p style={{ margin:0, color:'#cbd5e1', lineHeight:1.55 }}>ImmersiveSoundSpaceAmbient · Mixer audio interattivo in versione iniziale. Avvia l’audio solo quando lo desideri.</p>
          </div>
        </header>

        <section style={{ marginTop:16, padding:16, borderRadius:22, border:'1px solid #155e75', background:'#071d30' }}>
          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:12 }}>
            <div><div style={{ fontWeight:900, fontSize:20 }}>🎛️ Mixer ISSA</div><div style={{ color:'#94a3b8', fontSize:12 }}>4 tracce sintetiche di prova · controlli in tempo reale</div></div>
            <button type="button" onClick={startAudio} style={{ border:0, borderRadius:12, padding:'12px 18px', background:ready?'#0f766e':'#22d3ee', color:ready?'white':'#082f49', fontWeight:950 }}>{ready?'✓ Mixer attivo':'▶ Avvia mixer'}</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,190px),1fr))', gap:10, marginTop:16 }}>
            {TRACKS.map((track,i)=><article key={track.name} style={{ border:'1px solid #334155', borderRadius:16, padding:13, background:'linear-gradient(160deg,#10283c,#071426)' }}>
              <div style={{ height:5, borderRadius:9, background:track.color, marginBottom:12, opacity:playing[i]?1:.35 }} />
              <h2 style={{ fontSize:14, margin:'0 0 12px', minHeight:34 }}>{track.name}</h2>
              <button type="button" onClick={()=>{ if(!ready) startAudio(); toggleTrack(i); }} style={{ width:'100%', border:0, borderRadius:10, padding:10, fontWeight:900, background:playing[i]?'#f87171':'#0e7490', color:'white' }}>{playing[i]?'■ Ferma traccia':'▶ Ascolta traccia'}</button>
              <label style={{ display:'block', fontSize:12, color:'#cbd5e1', marginTop:14 }}>Volume <strong>{levels[i]}%</strong><input aria-label={'Volume '+track.name} type="range" min="0" max="100" value={levels[i]} onChange={e=>changeLevel(i,e.target.value)} style={{ width:'100%', accentColor:track.color, marginTop:8 }} /></label>
            </article>)}
          </div>
          <div style={{ marginTop:14, borderRadius:16, padding:14, background:'#0c263a', border:'1px solid #334155' }}>
            <label style={{ display:'block', fontWeight:850 }}>Master volume · {master}%<input aria-label="Volume master" type="range" min="0" max="100" value={master} onChange={e=>changeMaster(e.target.value)} style={{ width:'100%', accentColor:'#22d3ee', marginTop:8 }} /></label>
            <label style={{ display:'flex', gap:10, alignItems:'center', marginTop:14, fontSize:14, fontWeight:800 }}><input type="checkbox" checked={issa} onChange={e=>toggleIssa(e.target.checked)} style={{ width:18,height:18,accentColor:'#a78bfa' }} /> Sistema ISSA ImmersiveSoundSpaceAmbient</label>
          </div>
          <p role="status" aria-live="polite" style={{ margin:'14px 0 0', padding:12, borderRadius:12, background:'#082f49', color:'#a5f3fc', fontSize:13, lineHeight:1.5 }}>{message}</p>
        </section>
        <p style={{ color:'#94a3b8', fontSize:12, lineHeight:1.5, marginTop:14 }}>Questa è una prima console dimostrativa con suoni sintetici generati dal browser; non registra ancora microfono, file audio o progetti. Le tracce non vengono salvate. Le funzioni successive dovranno essere aggiunte e testate separatamente.</p>
      </div>
    </main>
  </>;
}
