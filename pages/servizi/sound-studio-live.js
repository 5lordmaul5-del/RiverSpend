import Head from 'next/head';
import { useMemo, useRef, useState } from 'react';

const kinds = ['Voce', 'Batteria', 'Basso', 'Chitarra', 'Tastiere', 'Base / altro'];
export default function RiverSpendSoundStudioLive() {
  const [tracks, setTracks] = useState([]);
  const [monitorChoice, setMonitorChoice] = useState('Yamaha HS8');
  const [consoleChoice, setConsoleChoice] = useState('RiverSpend Virtual Console Pro');
  const [roomChoice, setRoomChoice] = useState('Stereo Studio');
  const [project, setProject] = useState('Il mio progetto');
  const [master, setMaster] = useState(80);
  const [issaEnabled, setIssaEnabled] = useState(true);
  const [issaAmbience, setIssaAmbience] = useState(28);
  const [issaProgress, setIssaProgress] = useState(100);
  const [issaBusy, setIssaBusy] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0);
  const [audioInput, setAudioInput] = useState(null);
  const [inputName, setInputName] = useState('Microfono predefinito');
  const [recording, setRecording] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const [midiDevices, setMidiDevices] = useState([]);
  const [midiStatus, setMidiStatus] = useState('USB/MIDI non collegato');
  const [midiLastMessage, setMidiLastMessage] = useState('Nessun segnale MIDI ricevuto');
  const midiAccessRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const monitorContextRef = useRef(null);
  const monitorNodesRef = useRef(null);
  const [notice, setNotice] = useState('Carica le tue tracce audio per iniziare il mix.');
  const audioRefs = useRef({});
  const audioGraphs = useRef({});
  const audioContextRef = useRef(null);
  const uploadRef = useRef(null);
  const soloActive = tracks.some(t => t.solo);
  const totalDuration = useMemo(() => tracks.reduce((max, t) => Math.max(max, t.duration || 0), 0), [tracks]);

  async function connectMidi() {
    if (!navigator.requestMIDIAccess) {
      setMidiStatus('Web MIDI non supportato da questo browser. Prova Chrome aggiornato su HTTPS.');
      setNotice('Il browser non supporta Web MIDI. Su Android il supporto USB/MIDI può variare in base al dispositivo e all’adattatore OTG.');
      return;
    }
    try {
      const access = await navigator.requestMIDIAccess();
      midiAccessRef.current = access;
      const refreshInputs = () => {
        const inputs = Array.from(access.inputs.values());
        setMidiDevices(inputs.map((input, index) => ({ id: input.id || String(index), name: input.name || input.manufacturer || ('Ingresso MIDI ' + (index + 1)), manufacturer: input.manufacturer || '' })));
        setMidiStatus(inputs.length ? inputs.length + ' ingresso/i MIDI rilevato/i' : 'Accesso MIDI attivo, ma nessun dispositivo collegato');
        inputs.forEach(input => {
          input.onmidimessage = event => {
            const data = Array.from(event.data || []);
            if (!data.length) return;
            const status = data[0] & 0xf0;
            const note = data.length > 1 ? data[1] : null;
            const velocity = data.length > 2 ? data[2] : null;
            const type = status === 0x90 && velocity > 0 ? 'Nota premuta' : (status === 0x80 || (status === 0x90 && velocity === 0) ? 'Nota rilasciata' : (status === 0xb0 ? 'Controller' : 'Messaggio MIDI'));
            setMidiLastMessage(type + ' · dati: ' + data.join(', '));
          };
        });
      };
      access.onstatechange = refreshInputs;
      refreshInputs();
      setNotice('USB/MIDI abilitato. Suona un tasto o muovi un controllo per verificare che arrivino messaggi MIDI.');
    } catch (e) {
      setMidiStatus(e?.name === 'NotAllowedError' ? 'Permesso MIDI negato' : 'Impossibile accedere al MIDI');
      setNotice('Accesso MIDI non riuscito. Controlla i permessi del browser, il cavo USB e l’adattatore OTG.');
    }
  }

  function disconnectMidi() {
    const access = midiAccessRef.current;
    if (access) {
      access.inputs.forEach(input => { input.onmidimessage = null; });
      access.onstatechange = null;
    }
    midiAccessRef.current = null;
    setMidiDevices([]);
    setMidiStatus('USB/MIDI scollegato');
    setMidiLastMessage('Nessun segnale MIDI ricevuto');
    setNotice('Connessione USB/MIDI chiusa.');
  }

  async function connectLiveInput() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setNotice('Il browser non permette l’accesso al microfono. Apri questa pagina con Chrome aggiornato e HTTPS.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }, video: false });
      streamRef.current = stream;
      setAudioInput(stream);
      setInputName(stream.getAudioTracks()[0]?.label || 'Ingresso audio collegato');
      setNotice('Ingresso audio collegato. Puoi registrare voce o uno strumento collegato tramite interfaccia audio.');
    } catch (e) {
      setNotice(e?.name === 'NotAllowedError' ? 'Permesso microfono negato: consenti l’accesso nelle impostazioni del browser e riprova.' : 'Non riesco a collegare l’ingresso. Controlla microfono, adattatore e permessi.');
    }
  }

  async function toggleLiveMonitor() {
    if (!streamRef.current) { setNotice('Prima collega l’ingresso audio.'); return; }
    if (monitoring) {
      try { monitorNodesRef.current?.source.disconnect(); monitorNodesRef.current?.gain.disconnect(); } catch (_) {}
      monitorNodesRef.current = null;
      setMonitoring(false);
      setNotice('Monitoraggio in cuffia disattivato.');
      return;
    }
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) { setNotice('Questo browser non supporta il monitoraggio audio.'); return; }
      const ctx = monitorContextRef.current || (monitorContextRef.current = new AudioCtx());
      if (ctx.state === 'suspended') await ctx.resume();
      const source = ctx.createMediaStreamSource(streamRef.current);
      const gain = ctx.createGain();
      gain.gain.value = 0.7;
      source.connect(gain); gain.connect(ctx.destination);
      monitorNodesRef.current = { source, gain };
      setMonitoring(true);
      setNotice('Monitoraggio live attivo. Usa cuffie per evitare eco e fischi.');
    } catch (_) { setNotice('Impossibile attivare il monitoraggio su questo dispositivo.'); }
  }

  function startLiveRecording() {
    const stream = streamRef.current;
    if (!stream) { setNotice('Prima premi “Collega microfono / strumento”.'); return; }
    if (!window.MediaRecorder) { setNotice('Registrazione non supportata: prova Chrome aggiornato.'); return; }
    try {
      const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find(t => MediaRecorder.isTypeSupported?.(t));
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data?.size) chunksRef.current.push(e.data); };
      recorder.onerror = () => { setRecording(false); setNotice('Errore durante la registrazione.'); };
      recorder.onstop = () => {
        const type = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        if (!blob.size) { setNotice('Registrazione vuota: controlla l’ingresso e riprova.'); return; }
        const ext = type.includes('mp4') ? 'm4a' : 'webm';
        const file = new File([blob], 'RiverSpend-registrazione-' + Date.now() + '.' + ext, { type });
        const url = URL.createObjectURL(blob);
        const track = { id: Date.now().toString() + Math.random().toString(36).slice(2,7), name: 'Registrazione live', kind: 'Voce', url, file, volume: 80, muted: false, solo: false, duration: 0, fx: { bass: 0, mid: 0, treble: 0, reverb: 0 }, bass: 0, mid: 0, treble: 0, pan: 0 };
        setTracks(prev => [...prev, track]);
        setNotice('Registrazione aggiunta come nuova traccia nel mixer. Premi “Riproduci mix” per ascoltarla.');
      };
      mediaRecorderRef.current = recorder;
      recorder.start(250);
      setRecording(true);
      setNotice('Registrazione in corso: parla o suona, poi premi “Ferma e aggiungi al mixer”.');
    } catch (_) { setNotice('Non è stato possibile avviare la registrazione. Ricollega l’ingresso e riprova.'); }
  }

  function stopLiveRecording() {
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    setRecording(false);
  }

  function disconnectLiveInput() {
    if (recording) stopLiveRecording();
    try { monitorNodesRef.current?.source.disconnect(); monitorNodesRef.current?.gain.disconnect(); } catch (_) {}
    monitorNodesRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null; setAudioInput(null); setMonitoring(false);
    setNotice('Ingresso audio scollegato.');
  }

  function addFiles(event) {
    const files = Array.from(event.target.files || []).filter(f => f.type.startsWith('audio/'));
    if (!files.length) { setNotice('Seleziona uno o più file audio supportati.'); return; }
    setIssaBusy(true); setIssaProgress(10);
    const progressSteps = [25, 40, 58, 73, 88, 100];
    progressSteps.forEach((value, index) => setTimeout(() => { setIssaProgress(value); if (value === 100) { setIssaBusy(false); setNotice('ISSA by RSSound: analisi completata. Tracce pronte per l’ascolto immersivo.'); } }, 220 * (index + 1)));
    setNotice('ISSA by RSSound: analisi dei file e preparazione del percorso audio…');
    const additions = files.map((file, i) => ({
      id: (Date.now() + i).toString() + Math.random().toString(36).slice(2, 7),
      name: file.name.replace(/\.[^.]+$/, ''),
      kind: kinds[Math.min(tracks.length + i, kinds.length - 1)],
      url: URL.createObjectURL(file), file, volume: 80, muted: false, solo: false, duration: 0, fx: { bass: 0, mid: 0, treble: 0, reverb: 0 }, bass: 0, mid: 0, treble: 0, pan: 0
    }));
    setTracks(prev => [...prev, ...additions]);
    setNotice(additions.length + ' traccia/e aggiunta/e. Regola volume, bassi, medi, alti e panorama stereo e premi Riproduci.');
    event.target.value = '';
  }
  function patchTrack(id, patch) { setTracks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t)); }
  function syncVolumes(nextTracks = tracks, nextMaster = master) {
    nextTracks.forEach(t => {
      const el = audioRefs.current[t.id];
      if (el) el.volume = (t.muted || (soloActive && !t.solo) ? 0 : t.volume / 100) * nextMaster / 100;
    });
  }
  function ensureAudioGraph(id, el) {
    if (audioGraphs.current[id]) return audioGraphs.current[id];
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) { setNotice('Il browser non supporta gli effetti audio avanzati. Prova con Chrome aggiornato.'); return null; }
    const ctx = audioContextRef.current || (audioContextRef.current = new AudioContextClass());
    const source = ctx.createMediaElementSource(el);
    const bass = ctx.createBiquadFilter(); bass.type = 'lowshelf'; bass.frequency.value = 180;
    const mid = ctx.createBiquadFilter(); mid.type = 'peaking'; mid.frequency.value = 1000; mid.Q.value = 0.8;
    const treble = ctx.createBiquadFilter(); treble.type = 'highshelf'; treble.frequency.value = 5000;
    const panner = ctx.createStereoPanner();
    const dry = ctx.createGain(); dry.gain.value = issaEnabled ? 1 - (issaAmbience / 100) * 0.35 : 1;
    const delay = ctx.createDelay(1.5); delay.delayTime.value = 0.19;
    const feedback = ctx.createGain(); feedback.gain.value = 0.18;
    const wet = ctx.createGain(); wet.gain.value = issaEnabled ? issaAmbience / 100 : 0;
    source.connect(bass); bass.connect(mid); mid.connect(treble); treble.connect(panner);
    panner.connect(dry); dry.connect(ctx.destination);
    panner.connect(delay); delay.connect(feedback); feedback.connect(delay); delay.connect(wet); wet.connect(ctx.destination);
    const graph = { ctx, bass, mid, treble, panner, dry, delay, feedback, wet };
    audioGraphs.current[id] = graph;
    return graph;
  }
  function applyEffects(track) {
    const el = audioRefs.current[track.id];
    if (!el) return;
    const graph = ensureAudioGraph(track.id, el);
    if (!graph) return;
    graph.bass.gain.value = track.bass || 0;
    graph.mid.gain.value = track.mid || 0;
    graph.treble.gain.value = track.treble || 0;
    graph.panner.pan.value = (track.pan || 0) / 100;
    graph.dry.gain.value = issaEnabled ? 1 - (issaAmbience / 100) * 0.35 : 1;
    graph.wet.gain.value = issaEnabled ? issaAmbience / 100 : 0;
  }
  function changeFx(track, key, value) {
    const nextValue = Number(value);
    patchTrack(track.id, { fx: { ...(track.fx || {}), [key]: nextValue } });
    if (key === 'bass' || key === 'mid' || key === 'treble') {
      changeEffect(track, key, nextValue);
      return;
    }
    if (key === 'reverb') {
      setNotice('Il controllo River Reverb è visibile, ma l’effetto riverbero dedicato non è ancora collegato al motore audio.');
      return;
    }
    setNotice('Effetto aggiornato su "' + track.name + '".');
  }
  function changeEffect(track, key, value) {
    const updated = { ...track, [key]: Number(value) };
    patchTrack(track.id, { [key]: Number(value) });
    applyEffects(updated);
    setNotice('Effetto aggiornato su "' + track.name + '". Premi Riproduci per ascoltare il mix.');
  }
  function togglePlayback() {
    if (!tracks.length) { setNotice('Prima carica almeno una traccia audio.'); return; }
    if (!playing) {
      tracks.forEach(t => { const el = audioRefs.current[t.id]; if (el) { el.volume = (t.muted || (soloActive && !t.solo) ? 0 : t.volume / 100) * master / 100; applyEffects(t); const ctx = audioContextRef.current; if (ctx && ctx.state === 'suspended') ctx.resume(); el.play().catch(() => setNotice('Tocca di nuovo Riproduci per autorizzare la riproduzione audio.')); } });
      setPlaying(true); setNotice(issaEnabled ? 'ISSA by RSSound attivo: ascolto immersivo con ambiente stereo ed eco leggero. Elaborazione locale nel browser.' : 'Riproduzione standard avviata nel browser.');
    } else {
      tracks.forEach(t => { const el = audioRefs.current[t.id]; if (el) el.pause(); });
      setPlaying(false); setNotice('Riproduzione in pausa.');
    }
  }
  function removeTrack(id) {
    const track = tracks.find(t => t.id === id);
    if (track) URL.revokeObjectURL(track.url);
    delete audioRefs.current[id];
    delete audioGraphs.current[id];
    setTracks(prev => prev.filter(t => t.id !== id));
  }
  return <>
    <Head><title>RiverSpend Sound Studio Live</title><meta name="description" content="Studio digitale RiverSpend per tracce audio, mix e preparazione audio-video." /></Head>
    <main style={{minHeight:'100vh',background:'linear-gradient(180deg,#ecfeff 0%,#f8fafc 45%,#fff 100%)',color:'#0f172a',fontFamily:'system-ui',padding:'18px 14px 48px'}}>
      <div style={{maxWidth:1080,margin:'0 auto'}}>
        <a href="/" style={{color:'#0f766e',fontWeight:800,textDecoration:'none'}}>← RiverSpendShop</a>
        <a href="/servizi/pacchetti-studio" style={{display:"inline-block",marginLeft:12,color:"#0e7490",fontWeight:800,textDecoration:"none"}}>💳 Pacchetti e prezzi</a>
        <header style={{marginTop:18,overflow:'hidden',position:'relative',borderRadius:26,padding:'28px 22px',color:'white',background:'radial-gradient(circle at 80% 10%,#0e7490 0,#164e63 34%,#082f49 75%)',boxShadow:'0 18px 40px rgba(8,47,73,.18)'}}>
          <div style={{fontSize:12,letterSpacing:2,fontWeight:900,color:"#a5f3fc",overflowWrap:"anywhere"}}>RiverSpendSoundStudioLive</div>
          <h1 style={{fontSize:"clamp(30px,6vw,48px)",lineHeight:1.08,margin:"12px 0"}}>Il tuo studio. Il tuo suono.</h1>
          <div style={{borderRadius:16,overflow:"hidden",margin:"12px 0",border:"1px solid #67e8f9",boxShadow:"0 10px 28px rgba(0,0,0,.25)",background:"#020b12"}}><img src="/rssoundstudio-issa-banner.jpg" alt="RSSoundStudio I.S.S.A. — ImmersiveSoundSpaceAmbient, studio audio virtuale RiverSpend" style={{display:"block",width:"100%",height:"clamp(112px,28vw,220px)",objectFit:"contain",objectPosition:"center"}} /></div>
          <p style={{maxWidth:720,fontSize:16,lineHeight:1.65,color:"#cffafe",marginBottom:0}}>🎤 <strong>Sei un musicista o una cantante?</strong> Porta la tua musica su RiverSpend: carica le tue tracce, prepara il tuo progetto nel mixer e scopri i pacchetti per singoli, EP e album. River AI ti guida nei passaggi; il sistema I.S.S.A. è il nostro ambiente audio immersivo in evoluzione. Le funzioni AI avanzate si attiveranno quando sarà collegato il servizio dedicato.</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:18}}>{['MULTITRACCIA','AUDIO LAB','VIDEO EDIT','ISSA • ESCLUSIVA RIVERSPEND'].map(x=><span key={x} style={{border:'1px solid #67e8f9',borderRadius:999,padding:'6px 10px',fontSize:11,fontWeight:800,color:'#cffafe',background:'rgba(8,47,73,.72)'}}>{x}</span>)}</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:10,marginTop:22,position:'relative',zIndex:2}}>
            <button type="button" onClick={()=>uploadRef.current?.click()} style={{padding:'13px 17px',border:0,borderRadius:12,background:'#fbbf24',color:'#082f49',fontWeight:900,fontSize:15,cursor:'pointer'}}>＋ CARICA TRACCE</button>
            <button type="button" onClick={()=>{document.getElementById("mixer-multitraccia")?.scrollIntoView({behavior:"smooth",block:"start"});}} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"13px 17px",border:"1px solid #67e8f9",borderRadius:12,background:"#083344",color:"white",fontWeight:900,fontSize:15,cursor:"pointer"}}>🎚️ APRI IL MIXER</button>
          </div>
        </header>

        <section id="river-studio-console" style={{marginTop:12,background:'#020817',color:'#e0f2fe',border:'1px solid #155e75',borderRadius:18,overflow:'hidden',boxShadow:'0 18px 50px rgba(2,8,23,.45)'}}>
          <style>{`
            .rs-console-nav{display:flex;gap:7px;align-items:center;flex-wrap:wrap;padding:12px;background:#030b18;border-bottom:1px solid #164e63}
            .rs-console-nav span{font-size:10px;letter-spacing:.7px;font-weight:900;padding:9px 10px;border:1px solid #164e63;border-radius:8px;color:#bae6fd}
            .rs-console-nav .active{background:#082f49;border-color:#22d3ee;color:#fff;box-shadow:0 0 16px #0891b244}
            .rs-console-grid{display:grid;grid-template-columns:minmax(150px, .72fr) minmax(0,2.1fr) minmax(150px,.72fr);gap:9px;padding:9px}
            .rs-console-panel{min-width:0;background:linear-gradient(180deg,#071a2b,#020817);border:1px solid #164e63;border-radius:11px;padding:10px}
            .rs-console-title{font-size:11px;font-weight:900;letter-spacing:1px;color:#67e8f9;margin-bottom:9px}
            .rs-console-btn{border:1px solid #155e75;background:#082f49;color:#e0f2fe;border-radius:8px;padding:10px 12px;font-weight:900;cursor:pointer}
            .rs-console-btn:focus-visible{outline:2px solid #fbbf24;outline-offset:2px}
            .rs-console-studio-art{min-height:190px;display:flex;align-items:center;justify-content:center;text-align:center;padding:18px;border:1px solid #075985;border-radius:10px;background:radial-gradient(ellipse at 50% 25%,#075985 0,#082f49 26%,#061426 65%,#020817 100%);position:relative;overflow:hidden}
            .rs-console-studio-art:before,.rs-console-studio-art:after{content:'';position:absolute;width:75%;height:90px;border:2px solid #22d3ee;border-radius:50%;transform:perspective(140px) rotateX(60deg);opacity:.45;box-shadow:0 0 20px #0ea5e9}
            .rs-console-studio-art:after{width:55%;height:65px;opacity:.25}
            .rs-console-logo{position:relative;z-index:1;text-shadow:0 0 18px #22d3ee}
            .rs-console-logo strong{display:block;font-size:clamp(19px,3vw,30px);letter-spacing:1px}
            .rs-console-logo small{font-size:10px;letter-spacing:3px;color:#fbbf24}
            .rs-console-transport{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-top:9px;padding:9px;background:#061426;border:1px solid #164e63;border-radius:10px}
            .rs-console-wave{height:30px;flex:1;min-width:70px;display:flex;gap:2px;align-items:center;overflow:hidden}
            .rs-console-wave i{display:block;flex:1;min-width:2px;border-radius:3px;background:#22d3ee;box-shadow:0 0 5px #0891b2}
            .rs-console-track{display:grid;grid-template-columns:76px minmax(40px,1fr);gap:7px;align-items:center;margin:7px 0;font-size:11px}
            .rs-console-track span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
            .rs-console-track div{height:15px;border-radius:4px;background:repeating-linear-gradient(90deg,#0891b2 0 3px,#0e7490 3px 5px,#164e63 5px 9px);border:1px solid #22d3ee}
            .rs-console-faders{display:grid;grid-template-columns:repeat(6,minmax(58px,1fr));gap:6px;padding:9px;background:#030b18;border-top:1px solid #164e63}
            .rs-console-strip{padding:8px 5px;border:1px solid #164e63;border-radius:8px;text-align:center;background:linear-gradient(180deg,#102b40,#061426)}
            .rs-console-strip label{display:block;font-size:10px;font-weight:900;color:#bae6fd;margin-bottom:8px}
            .rs-console-strip input{width:100%;accent-color:#22d3ee}
            .rs-console-strip small{font-size:10px;color:#67e8f9}
            @media(max-width:760px){.rs-console-grid{grid-template-columns:1fr}.rs-console-studio-art{min-height:155px}.rs-console-faders{grid-template-columns:repeat(3,minmax(0,1fr))}.rs-console-nav span{flex:1;text-align:center}.rs-console-track{grid-template-columns:68px minmax(30px,1fr)}}
          `}</style>
          <div className="rs-console-nav"><span className="active">⌁ STUDIO LIVE</span><span>▣ VIDEO STUDIO</span><span>♫ BEAT LAB</span><span>◫ MASTERING</span><span>✳ EFFETTI</span><span>▤ PROGETTI</span><span>◎ COMMUNITY</span><span style={{marginLeft:'auto',borderColor:'#fbbf24',color:'#fbbf24'}}>✦ RIVER AI</span></div>
          <div className="rs-console-grid">
            <aside className="rs-console-panel">
              <div className="rs-console-title">SALA VIRTUALE · STATO</div>
              <div style={{display:'flex',alignItems:'center',gap:8,padding:'9px 0',borderBottom:'1px solid #164e63'}}><span style={{width:9,height:9,borderRadius:'50%',background:recording?'#ef4444':'#22c55e',boxShadow:'0 0 10px currentColor'}}/><div><strong style={{fontSize:12}}>{recording?'REC IN CORSO':audioInput?'INGRESSO COLLEGATO':'STUDIO PRONTO'}</strong><div style={{fontSize:10,color:'#94a3b8',marginTop:3}}>{inputName}</div></div></div>
              <div style={{fontSize:11,color:'#bae6fd',lineHeight:1.8,marginTop:8}}>🎙️ Microfono / strumento<br/>🎚️ Mixer multitraccia<br/>🌌 ISSA audio immersivo</div>
              <button className="rs-console-btn" type="button" onClick={connectLiveInput} style={{width:'100%',marginTop:10}}>＋ Collega microfono</button>
              <button className="rs-console-btn" type="button" onClick={disconnectLiveInput} style={{width:'100%',marginTop:7}}>Scollega ingresso</button>
              <div className="rs-console-title" style={{marginTop:17}}>ISSA CONTROLLER 10.0</div>
              <label style={{fontSize:10,display:'flex',justifyContent:'space-between'}}>Intensità ambiente <strong>{issaAmbience}%</strong></label>
              <input aria-label="Intensità ambiente ISSA" type="range" min="0" max="60" value={issaAmbience} onChange={e=>{const v=Number(e.target.value);setIssaAmbience(v);Object.values(audioGraphs.current).forEach(g=>{g.wet.gain.value=issaEnabled?v/100:0;g.dry.gain.value=issaEnabled?1-v/100*.35:1;});}} style={{width:'100%',accentColor:'#22d3ee'}}/>
              <button className="rs-console-btn" type="button" onClick={()=>{setIssaEnabled(v=>!v);setNotice(!issaEnabled?'ISSA attivato.':'ISSA disattivato.')}} style={{width:'100%',marginTop:8}}>{issaEnabled?'● ISSA ATTIVO':'○ ISSA SPENTO'}</button>
            </aside>
            <div className="rs-console-panel">
              <div className="rs-console-title">RIVERSPEND SOUND STUDIO · CONTROL ROOM</div>
              <div className="rs-console-studio-art"><div className="rs-console-logo"><div style={{fontSize:28}}>🌊</div><strong>RiverSpend®</strong><small>SOUND STUDIO</small><div style={{fontSize:11,color:'#bae6fd',marginTop:12}}>REGISTRAZIONE · MIX · PRODUZIONE</div></div></div>
              <div className="rs-console-transport">
                <button className="rs-console-btn" type="button" onClick={recording?stopLiveRecording:startLiveRecording} style={{background:recording?'#7f1d1d':'#991b1b',borderColor:'#ef4444'}}>● {recording?'STOP REC':'REC'}</button>
                <button className="rs-console-btn" type="button" onClick={()=>{tracks.forEach(t=>{const el=audioRefs.current[t.id];if(el)el.pause();});setPlaying(false);if(recording)stopLiveRecording();}} >■ STOP</button>
                <button className="rs-console-btn" type="button" onClick={togglePlayback} style={{background:'#064e3b',borderColor:'#10b981'}}>▶ {playing?'PAUSA':'PLAY MIX'}</button>
                <button className="rs-console-btn" type="button" onClick={()=>uploadRef.current?.click()}>＋ IMPORTA</button>
                <div className="rs-console-wave" aria-label="Decorazione visuale audio">{Array.from({length:48},(_,i)=><i key={i} style={{height:(5+((i*13+i*i*7)%24))+'px'}}/>)}</div>
                <strong style={{fontSize:12,color:'#67e8f9'}}>{tracks.length} TRACCE</strong>
              </div>
              <div style={{marginTop:13,display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}><div className="rs-console-title" style={{margin:0}}>TRACCE MULTIPLE</div><button className="rs-console-btn" type="button" onClick={()=>uploadRef.current?.click()}>＋ NUOVA TRACCIA</button></div>
              {tracks.length?tracks.slice(0,8).map((t,i)=><div className="rs-console-track" key={t.id}><span>{['🎤','🎙️','🎸','🎸','🥁','🎹','🎻','♫'][i%8]} {t.name}</span><div style={{opacity:t.muted?.3:1,background:t.muted?'#334155':undefined}}/></div>):<div style={{padding:18,textAlign:'center',border:'1px dashed #155e75',borderRadius:9,color:'#94a3b8',fontSize:12,marginTop:10}}>Nessuna traccia caricata. Premi “Importa” per iniziare il mix.</div>}
            </div>
            <aside className="rs-console-panel">
              <div className="rs-console-title">ISSA SURROUND 10.0</div>
              <div style={{padding:13,borderRadius:9,border:'1px solid #075985',background:'radial-gradient(ellipse,#0c4a6e,#020817)',textAlign:'center'}}><div style={{fontSize:27}}>◉</div><strong style={{fontSize:13}}>AUDIO IMMERSIVO</strong><div style={{fontSize:10,color:'#67e8f9',marginTop:5}}>Ambiente stereo / eco nel browser</div></div>
              <label style={{display:'block',fontSize:11,marginTop:12,color:'#bae6fd'}}>Preset ambiente</label>
              <select value={roomChoice} onChange={e=>setRoomChoice(e.target.value)} style={{width:'100%',padding:9,marginTop:5,borderRadius:7,background:'#082f49',color:'white',border:'1px solid #155e75'}}><option>Stereo Studio</option><option>ISSA Surround 10.0 — visualizzazione</option><option>Live Concert — visualizzazione</option><option>Cinema Mix — visualizzazione</option></select>
              <div style={{fontSize:11,color:'#94a3b8',lineHeight:1.6,marginTop:10}}>Preset selezionato: <strong style={{color:'#fbbf24'}}>{roomChoice}</strong><br/>Surround multicanale reale non ancora attivo.</div>
              <button className="rs-console-btn" type="button" onClick={()=>document.getElementById('mixer-multitraccia')?.scrollIntoView({behavior:'smooth',block:'start'})} style={{width:'100%',marginTop:12}}>APRI MIXER COMPLETO ↓</button>
            </aside>
          </div>
          <div className="rs-console-title" style={{padding:'0 12px'}}>MIXER STUDIO · CANALI AUDIO</div>
          <div className="rs-console-faders">{(tracks.length?tracks.slice(0,6):[{id:'demo1',name:'Voce'},{id:'demo2',name:'Voce 2'},{id:'demo3',name:'Chitarra'},{id:'demo4',name:'Basso'},{id:'demo5',name:'Batteria'},{id:'demo6',name:'Piano'}]).map((t,i)=>{const live=tracks.find(x=>x.id===t.id);return <div className="rs-console-strip" key={t.id}><label>{t.name||['Voce','Voce 2','Chitarra','Basso','Batteria','Piano'][i]}</label>{live?<><input aria-label={'Volume '+live.name} type="range" min="0" max="100" value={live.volume} onChange={e=>{const v=Number(e.target.value);patchTrack(live.id,{volume:v});const el=audioRefs.current[live.id];if(el)el.volume=(live.muted||(soloActive&&!live.solo)?0:v/100)*master/100;}}/><small>{live.volume}%</small></>:<><div style={{height:55,display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b'}}>···</div><small>In attesa</small></>}</div>})}</div>
          <div style={{padding:10,fontSize:11,color:'#94a3b8',borderTop:'1px solid #164e63'}}>Nota: il pannello riproduce il layout della console di riferimento; i canali diventano controlli audio reali quando importi le tracce. La collaborazione live e il surround 10.0 richiedono ancora integrazioni dedicate.</div>
        </section>

        <section id="tariffe-musica" style={{marginTop:16,padding:18,borderRadius:22,background:"#f0fdfa",color:"#0f172a",border:"1px solid #99f6e4"}}>
          <div style={{fontSize:12,letterSpacing:2,fontWeight:900,color:"#0e7490"}}>RIVERSPEND MUSIC • TARIFFE</div>
          <h2 style={{fontSize:24,lineHeight:1.15,margin:"8px 0"}}>Prepara il tuo singolo, EP o album</h2>
          <p style={{fontSize:14,lineHeight:1.6,color:"#334155",marginTop:0}}>Carica le tracce nel mixer, organizza il progetto e scegli il pacchetto adatto. Le tariffe qui sotto sono proposte attualmente visibili sul sito; la selezione non comporta un pagamento.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,145px),1fr))",gap:9}}>
            {[
              ["3 canzoni","€ 19,90"],["5 canzoni","€ 29,90"],["10 canzoni","€ 49,90"],["15 canzoni","€ 69,90"],["20 canzoni","€ 89,90"],["Album intero · fino a 10 brani","€ 99,90"],["Doppio album · fino a 20 brani","€ 169,90"]
            ].map(([name,price])=><article key={name} style={{padding:12,borderRadius:13,background:"white",border:"1px solid #99f6e4"}}>
              <div style={{fontSize:13,fontWeight:800,color:"#334155"}}>{name}</div><div style={{fontSize:22,fontWeight:950,color:"#0e7490",marginTop:5}}>{price}</div>
            </article>)}
          </div>
          <a href="/servizi/pacchetti-studio" style={{display:"inline-flex",marginTop:12,padding:"11px 15px",borderRadius:11,background:"#0e7490",color:"white",fontWeight:900,textDecoration:"none"}}>🎵 Tutte le tariffe e i pacchetti →</a>
          <p style={{fontSize:12,color:"#64748b",lineHeight:1.5,marginBottom:0}}>Nota: i prezzi sono proposte iniziali. Il checkout non è attivo e non vengono effettuati addebiti. Servizi di distribuzione musicale e royalties vanno definiti separatamente prima dell’attivazione.</p>
        </section>

        <section id="river-music-in-issa" style={{marginTop:16,padding:18,borderRadius:22,background:'linear-gradient(135deg,#071525,#172554 58%,#164e63)',color:'#f8fafc',border:'1px solid #fbbf24',boxShadow:'0 14px 32px rgba(2,8,23,.28)'}}>
          <div style={{fontSize:11,fontWeight:900,letterSpacing:2,color:'#fbbf24'}}>ARTISTI • MUSICA • EVENTI</div>
          <h2 style={{fontSize:'clamp(23px,4vw,32px)',lineHeight:1.15,margin:'8px 0'}}>RiverSpend Music · dentro ISSA Sound Studio</h2>
          <p style={{fontSize:15,lineHeight:1.7,color:'#e0f2fe',margin:'0 0 12px'}}>Sei un artista o un musicista? Prepara le tue tracce nel mixer RiverSpend, lavora al tuo progetto musicale e organizza la presentazione di CD, musica ed eventi dal vivo. RiverSpend Music fa parte dell'esperienza Sound Studio: le funzioni di pubblicazione e promozione saranno disponibili quando i relativi strumenti saranno attivati.</p>
          <div style={{display:'flex',gap:9,flexWrap:'wrap'}}>
            <button type="button" onClick={()=>uploadRef.current?.click()} style={{padding:'11px 14px',border:0,borderRadius:10,background:'#fbbf24',color:'#082f49',fontWeight:900,cursor:'pointer'}}>＋ CARICA LE TUE TRACCE</button>
            <a href="#mixer-multitraccia" style={{display:'inline-flex',alignItems:'center',padding:'11px 14px',border:'1px solid #67e8f9',borderRadius:10,color:'#cffafe',fontWeight:900,textDecoration:'none'}}>APRI IL MIXER ↓</a>
            <a href="/vendi" style={{display:'inline-flex',alignItems:'center',padding:'11px 14px',border:'1px solid #fbbf24',borderRadius:10,color:'#fde68a',fontWeight:900,textDecoration:'none'}}>SCOPRI LE OPZIONI PER ARTISTI →</a>
          </div>
        </section>

        <section id="issa-surround-10" style={{marginTop:16,padding:18,borderRadius:22,background:'radial-gradient(circle at 50% 0%,#164e63 0%,#071525 65%)',color:'#e0f2fe',border:'1px solid #0891b2',boxShadow:'0 16px 36px rgba(8,47,73,.2)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
            <div><div style={{fontSize:11,letterSpacing:2,fontWeight:900,color:'#67e8f9'}}>RIVERSPEND SOUND STUDIO • MODULO IMMERSIVO</div><h2 style={{fontSize:'clamp(24px,5vw,34px)',margin:'6px 0',color:'#fbbf24'}}>🌌 ISSA SURROUND 10.0</h2><p style={{margin:'0',color:'#bae6fd',lineHeight:1.5}}>Pannello di controllo spaziale collegato al mixer ISSA.</p></div>
            <button type="button" onClick={()=>{setIssaEnabled(v=>{const next=!v;Object.values(audioGraphs.current).forEach(g=>{g.wet.gain.value=next?issaAmbience/100:0;g.dry.gain.value=next?1-(issaAmbience/100)*0.35:1;});setNotice(next?'ISSA Surround: ambiente stereo attivo sul mix.':'ISSA Surround disattivato: percorso audio asciutto.');return next;});}} style={{minHeight:44,padding:'11px 15px',border:0,borderRadius:11,background:issaEnabled?'#10b981':'#475569',color:'white',fontWeight:900,cursor:'pointer'}}>{issaEnabled?'● ISSA ATTIVO':'○ ISSA SPENTO'}</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,260px),1fr))',gap:14,marginTop:16,alignItems:'stretch'}}>
            <div style={{padding:14,borderRadius:16,background:'rgba(2,6,23,.7)',border:'1px solid #155e75'}}>
              <div style={{fontSize:12,fontWeight:900,letterSpacing:1,color:'#67e8f9'}}>SALA VIRTUALE • 10 POSIZIONI</div>
              <div style={{marginTop:12,display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:8}}>
                {['L · Frontale SX','C · Centro','R · Frontale DX','LS · Surround SX','LFE · Bassi','RS · Surround DX','LRS · Retro SX','W · Ampiezza','RRS · Retro DX','LW · Wide SX','RW · Wide DX','M · Master'].map((sp,i)=><div key={sp} style={{minHeight:56,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:5,borderRadius:10,border:'1px solid '+(issaEnabled?'#0891b2':'#334155'),background:issaEnabled?'linear-gradient(180deg,#0c4a6e,#082f49)':'#1e293b',fontSize:11,fontWeight:800,color:issaEnabled?'#e0f2fe':'#94a3b8'}}><span style={{fontSize:18,color:i===4?'#fbbf24':'#67e8f9'}}>◉</span>{sp}</div>)}
              </div>
              <p style={{fontSize:11,lineHeight:1.5,color:'#94a3b8',marginBottom:0}}>Le posizioni sono una mappa di riferimento dell’interfaccia: non indicano uscite fisiche indipendenti.</p>
            </div>
            <div style={{padding:14,borderRadius:16,background:'rgba(2,6,23,.7)',border:'1px solid #155e75'}}>
              <div style={{fontSize:12,fontWeight:900,letterSpacing:1,color:'#67e8f9'}}>CONTROLLI ISSA COLLEGATI</div>
              <label htmlFor="issa-surround-intensity" style={{display:'flex',justifyContent:'space-between',gap:8,marginTop:18,fontSize:13,fontWeight:800}}>Intensità ambiente <span>{issaAmbience}%</span></label>
              <input id="issa-surround-intensity" type="range" min="0" max="60" value={issaAmbience} onChange={e=>{const v=Number(e.target.value);setIssaAmbience(v);Object.values(audioGraphs.current).forEach(g=>{g.wet.gain.value=issaEnabled?v/100:0;g.dry.gain.value=issaEnabled?1-(v/100)*0.35:1;});setNotice('ISSA Surround: intensità ambiente impostata a '+v+'%.');}} style={{width:'100%',accentColor:'#fbbf24',marginTop:8}}/>
              <label htmlFor="issa-surround-preset" style={{display:'block',fontSize:13,fontWeight:800,marginTop:16}}>Profilo ambiente</label>
              <select id="issa-surround-preset" defaultValue="concert" onChange={e=>{const v=({studio:8,concert:28,club:38,cinema:48,outdoor:14})[e.target.value]??28;setIssaAmbience(v);Object.values(audioGraphs.current).forEach(g=>{g.wet.gain.value=issaEnabled?v/100:0;g.dry.gain.value=issaEnabled?1-(v/100)*0.35:1;});setNotice('Profilo ISSA selezionato: '+e.target.options[e.target.selectedIndex].text+'. Intensità ambiente '+v+'%.');}} style={{boxSizing:'border-box',width:'100%',padding:11,borderRadius:10,border:'1px solid #0e7490',background:'#0f172a',color:'#e0f2fe',marginTop:7}}>
                <option value="studio">Studio — suono asciutto</option><option value="concert">Sala concerto</option><option value="club">Club</option><option value="cinema">Cinema — ambiente più ampio</option><option value="outdoor">All'aperto</option>
              </select>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:16}}>
                <button type="button" onClick={()=>{document.getElementById('mixer-multitraccia')?.scrollIntoView({behavior:'smooth',block:'start'});}} style={{flex:1,minHeight:42,padding:10,borderRadius:10,border:'1px solid #22d3ee',background:'#083344',color:'#cffafe',fontWeight:900,cursor:'pointer'}}>🎚️ Apri mixer</button>
                <button type="button" onClick={()=>{if(!tracks.length){setNotice('Carica prima una o più tracce audio per provare ISSA Surround.');return;}togglePlayback();}} style={{flex:1,minHeight:42,padding:10,border:0,borderRadius:10,background:'#0891b2',color:'white',fontWeight:900,cursor:'pointer'}}>{playing?'Ⅱ Pausa mix':'▶ Ascolta mix'}</button>
              </div>
              <div role="status" style={{marginTop:12,padding:10,borderRadius:10,background:'#082f49',border:'1px solid #155e75',fontSize:12,lineHeight:1.5,color:'#cffafe'}}>{issaEnabled?'ISSA attivo: il controllo ambiente modifica il percorso stereo del browser.':'ISSA spento: l’effetto ambiente è bypassato.'} Il vero rendering multicanale 10.0 richiede ancora un motore audio dedicato e hardware/uscite compatibili.</div>
            </div>
          </div>
        </section>

        <section id="mixer-multitraccia" style={{marginTop:16,scrollMarginTop:18}}>
          <h2 style={{fontSize:23,margin:'0 0 10px'}}>🎚️ Mixer multitraccia — apri e usa</h2>
          <div style={{marginBottom:12,padding:14,borderRadius:18,background:'#061b2a',border:'1px solid #22d3ee',color:'white',boxShadow:'0 8px 22px rgba(8,47,73,.18)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap',marginBottom:12}}>
              <div><div style={{fontSize:11,letterSpacing:2,fontWeight:900,color:'#67e8f9'}}>RIVERSPEND • ISSA TRANSPORT</div><strong style={{fontSize:18}}>Controlli di riproduzione</strong></div>
              <div aria-live="polite" style={{fontVariantNumeric:'tabular-nums',fontSize:22,fontWeight:900,background:'#0f3347',border:'1px solid #155e75',borderRadius:10,padding:'8px 12px'}}>{Math.floor(playhead/60)}:{String(Math.floor(playhead%60)).padStart(2,'0')} <span style={{fontSize:12,color:'#a5f3fc'}}>TIMER</span></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(76px,1fr))',gap:8}}>
              <button type="button" aria-label="Torna indietro di 5 secondi" onClick={()=>{tracks.forEach(t=>{const el=audioRefs.current[t.id];if(el)el.currentTime=Math.max(0,el.currentTime-5);});setPlayhead(v=>Math.max(0,v-5));}} style={{padding:'13px 8px',border:'1px solid #0e7490',borderRadius:11,background:'#0f3347',color:'white',fontWeight:900,cursor:'pointer'}}>⏪ −5s</button>
              <button type="button" onClick={()=>{tracks.forEach(t=>{const el=audioRefs.current[t.id];if(el)el.currentTime=0;});setPlayhead(0);setNotice('Playhead riportato all’inizio.');}} style={{padding:'13px 8px',border:'1px solid #0e7490',borderRadius:11,background:'#0f3347',color:'white',fontWeight:900,cursor:'pointer'}}>↤ INIZIO</button>
              <button type="button" onClick={togglePlayback} style={{padding:'13px 8px',border:0,borderRadius:11,background:'#fbbf24',color:'#082f49',fontWeight:1000,cursor:'pointer'}}>{playing?'Ⅱ PAUSA':'▶ PLAY'}</button>
              <button type="button" onClick={()=>{tracks.forEach(t=>{const el=audioRefs.current[t.id];if(el){el.pause();el.currentTime=0;}});setPlaying(false);setPlayhead(0);setNotice('Mix fermato e riportato all’inizio.');}} style={{padding:'13px 8px',border:'1px solid #fb7185',borderRadius:11,background:'#7f1d1d',color:'white',fontWeight:900,cursor:'pointer'}}>■ STOP</button>
              <button type="button" aria-label="Avanti di 5 secondi" onClick={()=>{tracks.forEach(t=>{const el=audioRefs.current[t.id];if(el)el.currentTime=Math.min(el.duration||Infinity,el.currentTime+5);});setPlayhead(v=>Math.min(totalDuration||Infinity,v+5));}} style={{padding:'13px 8px',border:'1px solid #0e7490',borderRadius:11,background:'#0f3347',color:'white',fontWeight:900,cursor:'pointer'}}>+5s ⏩</button>
              <button type="button" onClick={()=>{if(audioInput){recording?stopLiveRecording():startLiveRecording();}else{setNotice('Per registrare premi prima “Collega microfono / strumento” nella sezione Ingresso Live.');document.getElementById('ingresso-live')?.scrollIntoView({behavior:'smooth',block:'start'});}}} style={{padding:'13px 8px',border:0,borderRadius:11,background:recording?'#991b1b':'#dc2626',color:'white',fontWeight:900,cursor:'pointer'}}>● {recording?'STOP REC':'REC'}</button>
              <button type="button" onClick={()=>uploadRef.current?.click()} style={{padding:'13px 8px',border:'1px solid #22d3ee',borderRadius:11,background:'#164e63',color:'white',fontWeight:900,cursor:'pointer'}}>＋ TRACCIA</button>
            </div>
            <div style={{height:7,marginTop:12,borderRadius:99,overflow:'hidden',background:'#164e63'}}><div style={{height:'100%',width:Math.min(100,totalDuration?playhead/totalDuration*100:0)+'%',background:'linear-gradient(90deg,#22d3ee,#fbbf24)',transition:'width .15s linear'}} /></div>
            <p style={{margin:'9px 0 0',fontSize:12,lineHeight:1.5,color:'#bae6fd'}}>Play, pausa, stop, avanti/indietro, timer, registrazione microfono e inserimento tracce. REC richiede il permesso microfono e aggiunge la registrazione come nuova traccia.</p>
          </div>
          {!tracks.length ? <div style={{padding:16,border:'1px solid #7dd3fc',borderRadius:20,background:'#082f49',color:'white'}}>
            <div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap',alignItems:'center'}}><div><strong style={{fontSize:20}}>Console pronta • 8 canali</strong><p style={{color:'#cffafe',fontSize:13,margin:'5px 0 0'}}>Il mixer è già visibile. Carica le tracce per attivare i canali con il tuo audio.</p></div><button type="button" onClick={()=>uploadRef.current?.click()} style={{padding:'12px 15px',border:0,borderRadius:11,background:'#fbbf24',color:'#082f49',fontWeight:900,cursor:'pointer'}}>＋ CARICA AUDIO</button></div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(105px,1fr))',gap:8,marginTop:14}}>
              {['VOCE','BATTERIA','BASSO','CHITARRA','TASTIERE','BASE','FX 1','FX 2'].map((name,i)=><div key={name} style={{minWidth:0,padding:'12px 7px',borderRadius:12,background:['#164e63','#312e81','#14532d','#7c2d12','#581c87','#164e63','#713f12','#134e4a'][i],border:'1px solid #22d3ee',textAlign:'center',boxShadow:'inset 0 0 18px rgba(34,211,238,.08)'}}>
                <div style={{fontSize:11,fontWeight:900,color:'#a5f3fc',overflowWrap:'anywhere'}}>{String(i+1).padStart(2,'0')} • {name}</div><div style={{height:54,display:'flex',alignItems:'end',justifyContent:'center',gap:3,margin:'10px 0'}}>{Array.from({length:7},(_,j)=><span key={j} style={{width:5,height:(8+((i*13+j*11)%38))+'px',background:j%3===0?'#fbbf24':'#22d3ee',borderRadius:3,opacity:.85}} />)}</div>
                <input aria-label={'Volume canale '+name} type="range" min="0" max="100" defaultValue="80" disabled style={{width:'100%',accentColor:'#fbbf24',opacity:.85}}/><div style={{display:'flex',justifyContent:'center',gap:5,marginTop:8}}><span style={{fontSize:10,border:'1px solid #67e8f9',borderRadius:5,padding:'3px 6px'}}>M</span><span style={{fontSize:10,border:'1px solid #67e8f9',borderRadius:5,padding:'3px 6px'}}>S</span></div>
              </div>)}
            </div><p style={{fontSize:12,color:'#bae6fd',marginBottom:0}}>I controlli dei canali si attivano quando importi file audio. Questa è una console di mix nel browser, non Cubase, Logic Pro o Pro Tools.</p>
          </div> : <div style={{display:'grid',gap:10}}>{tracks.map((t,i)=><article key={t.id} style={{background:'white',border:'1px solid #cbd5e1',borderRadius:18,padding:14,boxShadow:'0 4px 14px rgba(15,23,42,.04)'}}>
            <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
              <div style={{width:36,height:36,display:'grid',placeItems:'center',borderRadius:11,background:'#cffafe',color:'#155e75',fontWeight:900}}>{i+1}</div>
              <div style={{flex:'1 1 150px',minWidth:0}}><strong style={{display:'block',overflowWrap:'anywhere'}}>{t.name}</strong><div style={{fontSize:12,color:'#64748b'}}>{t.file.name} · {(t.file.size/1024/1024).toFixed(1)} MB</div></div>
              <select aria-label={'Tipo traccia '+t.name} value={t.kind} onChange={e=>patchTrack(t.id,{kind:e.target.value})} style={{padding:8,border:'1px solid #cbd5e1',borderRadius:9,maxWidth:'100%'}}>{kinds.map(k=><option key={k}>{k}</option>)}</select>
              <button onClick={()=>patchTrack(t.id,{muted:!t.muted})} aria-pressed={t.muted} style={{padding:'8px 11px',borderRadius:9,border:'1px solid #cbd5e1',background:t.muted?'#fee2e2':'white',fontWeight:900}}>M</button>
              <button onClick={()=>patchTrack(t.id,{solo:!t.solo})} aria-pressed={t.solo} style={{padding:'8px 11px',borderRadius:9,border:'1px solid #cbd5e1',background:t.solo?'#fef3c7':'white',fontWeight:900}}>S</button>
              <button type="button" onClick={()=>removeTrack(t.id)} aria-label={'Elimina traccia '+t.name} title={'Elimina traccia '+t.name} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:6,flexShrink:0,minHeight:42,padding:'10px 12px',borderRadius:10,border:'2px solid #b91c1c',background:'#dc2626',color:'#ffffff',fontWeight:900,fontSize:13,cursor:'pointer',boxShadow:'0 2px 6px rgba(185,28,28,.25)'}}>🗑️ <span>ELIMINA</span></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 55px',gap:12,alignItems:'center',marginTop:12}}>
              <input aria-label={'Volume '+t.name} type="range" min="0" max="100" value={t.volume} onChange={e=>{const v=Number(e.target.value);patchTrack(t.id,{volume:v});const el=audioRefs.current[t.id];if(el)el.volume=(t.muted||(soloActive&&!t.solo)?0:v/100)*master/100;}} style={{width:'100%',accentColor:'#0891b2'}} />
              <strong style={{textAlign:'right'}}>{t.volume}%</strong>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,190px),1fr))',gap:10,marginTop:14,padding:12,background:'#f0fdfa',borderRadius:12}}>
              {[[ 'Bassi', 'bass', -12, 12, ' dB'],['Medi', 'mid', -12, 12, ' dB'],['Alti', 'treble', -12, 12, ' dB'],['Panorama L/R', 'pan', -100, 100, '']].map(([label,key,min,max,unit])=><label key={key} style={{fontSize:12,fontWeight:800,color:'#164e63'}}>{label}: {t[key] || 0}{unit}<input aria-label={label+' '+t.name} type="range" min={min} max={max} step="1" value={t[key] || 0} onChange={e=>changeEffect(t,key,e.target.value)} style={{display:'block',width:'100%',accentColor:'#0e7490'}} /></label>)}
            </div>
            <div style={{marginTop:12,padding:12,borderRadius:12,background:'#f0fdfa',border:'1px solid #99f6e4'}}><strong style={{display:'block',marginBottom:8,color:'#115e59'}}>🎛️ Effetti traccia</strong><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(125px,1fr))',gap:10}}>{[['bass','Bassi',-12,12,' dB'],['mid','Medi',-12,12,' dB'],['treble','Alti',-12,12,' dB'],['reverb','River Reverb',0,100,'%']].map(([key,label,min,max,unit])=><label key={key} style={{fontSize:12,fontWeight:800,color:'#134e4a'}}>{label} <span style={{float:'right'}}>{t.fx?.[key] ?? 0}{unit}</span><input aria-label={label+' '+t.name} type="range" min={min} max={max} value={t.fx?.[key] ?? 0} onChange={e=>changeFx(t,key,e.target.value)} style={{display:'block',width:'100%',accentColor:'#0d9488',marginTop:7}} /></label>)}</div><p style={{fontSize:11,color:'#475569',margin:'8px 0 0'}}>EQ e riverbero si applicano alla riproduzione nel browser; il file originale non viene modificato né esportato.</p></div><audio ref={el=>{audioRefs.current[t.id]=el; if(el && el.duration && !t.duration) patchTrack(t.id,{duration:el.duration});}} src={t.url} preload="metadata" onLoadedMetadata={e=>patchTrack(t.id,{duration:e.currentTarget.duration})} onTimeUpdate={e=>{if(i===0)setPlayhead(e.currentTarget.currentTime||0);}} onEnded={()=>{if(tracks.every(x=>{const el=audioRefs.current[x.id];return !el||el.ended||el.paused;}))setPlaying(false);}} controls style={{width:'100%',height:38,marginTop:8}} />
          </article>)}</div>}
        </section>

                <section id="river-ai-assistente" style={{marginTop:16,padding:18,borderRadius:20,background:"#082f49",color:"white",border:"1px solid #22d3ee"}}>
          <div style={{fontSize:12,letterSpacing:2,fontWeight:900,color:"#67e8f9"}}>🤖 RIVER AI • ASSISTENTE DEL MUSICISTA</div>
          <h2 style={{fontSize:23,margin:"7px 0"}}>Ti guido nel tuo studio</h2>
          <p style={{color:"#cffafe",lineHeight:1.55,marginTop:0}}>Scegli cosa vuoi fare: River AI ti mostra il prossimo passo. Questa guida è interattiva; le risposte AI libere richiederanno il collegamento del servizio AI.</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <button type="button" onClick={()=>{setNotice("River AI: 1) premi Carica tracce; 2) seleziona i file audio; 3) regola il volume di ogni traccia; 4) premi PLAY per ascoltare. Usa cuffie per lavorare meglio.");document.getElementById("guida-river-ai")?.scrollIntoView({behavior:"smooth",block:"nearest"});}} style={{padding:"11px 13px",border:0,borderRadius:10,background:"#fbbf24",color:"#082f49",fontWeight:900,cursor:"pointer"}}>🎚️ Aiutami a fare un mix</button>
            <button type="button" onClick={()=>{setNotice("River AI: per registrare, vai a Ingresso live, premi Collega microfono / strumento e autorizza il microfono. Poi avvia la registrazione e premi Ferma e aggiungi al mixer.");document.getElementById("ingresso-live")?.scrollIntoView({behavior:"smooth",block:"start"});}} style={{padding:"11px 13px",border:"1px solid #67e8f9",borderRadius:10,background:"#164e63",color:"white",fontWeight:900,cursor:"pointer"}}>🎙️ Voglio registrare</button>
            <button type="button" onClick={()=>{setNotice("River AI: per usare una tastiera, collegala tramite USB/OTG se il dispositivo lo supporta, poi apri la sezione USB/MIDI e premi Collega USB / MIDI. Il MIDI da solo non genera suono.");document.getElementById("usb-midi")?.scrollIntoView({behavior:"smooth",block:"start"});}} style={{padding:"11px 13px",border:"1px solid #67e8f9",borderRadius:10,background:"#164e63",color:"white",fontWeight:900,cursor:"pointer"}}>🎹 Collegare una tastiera</button>
          </div>
          <div id="guida-river-ai" role="status" style={{marginTop:12,padding:12,borderRadius:12,background:"#164e63",color:"#cffafe",lineHeight:1.55}}>{notice}</div>
          <a href="#mixer-multitraccia" style={{display:"inline-flex",alignItems:"center",marginTop:10,padding:"11px 14px",borderRadius:10,background:"#22d3ee",color:"#083344",fontWeight:900,textDecoration:"none"}}>↓ Apri il mixer</a>
        </section>





        <section id="usb-midi" style={{marginTop:16,padding:18,borderRadius:22,background:'#f0fdfa',color:'#0f172a',border:'1px solid #5eead4'}}>
          <div style={{fontSize:12,letterSpacing:2,fontWeight:900,color:'#0e7490'}}>USB / MIDI • TASTIERE E CONTROLLER</div>
          <h2 style={{fontSize:24,margin:'6px 0 8px'}}>Collega la tua tastiera o controller MIDI</h2>
          <p style={{color:'#334155',lineHeight:1.6,marginTop:0}}>Collega il dispositivo USB/MIDI, concedi il permesso quando richiesto e suona un tasto. Se il browser lo supporta, qui vedrai il dispositivo e i messaggi in ingresso. MIDI trasporta comandi, non audio: per sentire il suono serve uno strumento virtuale/sintetizzatore, da integrare separatamente.</p>
          <div style={{display:'flex',gap:9,flexWrap:'wrap'}}>
            <button type="button" onClick={connectMidi} style={{padding:'12px 15px',border:0,borderRadius:11,background:'#0e7490',color:'white',fontWeight:900,cursor:'pointer'}}>🎹 Collega USB / MIDI</button>
            <button type="button" onClick={disconnectMidi} style={{padding:'12px 15px',border:'1px solid #0e7490',borderRadius:11,background:'white',color:'#0e7490',fontWeight:900,cursor:'pointer'}}>Scollega MIDI</button>
          </div>
          <div role="status" style={{marginTop:12,padding:11,borderRadius:10,background:'white',border:'1px solid #99f6e4',fontSize:13}}><strong>Stato:</strong> {midiStatus}</div>
          <div style={{marginTop:8,padding:11,borderRadius:10,background:'#ccfbf1',fontSize:13}}><strong>Dispositivi:</strong> {midiDevices.length ? midiDevices.map(d => d.name + (d.manufacturer ? ' (' + d.manufacturer + ')' : '')).join(', ') : 'nessun dispositivo rilevato'}</div>
          <div role="status" style={{marginTop:8,padding:11,borderRadius:10,background:'#082f49',color:'#cffafe',fontSize:13}}><strong>Ultimo segnale:</strong> {midiLastMessage}</div>
          <p style={{fontSize:12,color:'#475569',lineHeight:1.55,marginBottom:0}}>Nota: serve un browser compatibile con Web MIDI e, in genere, una pagina HTTPS. Su telefoni e tablet Android il riconoscimento dipende anche da supporto USB host/OTG e dal dispositivo collegato.</p>
        </section>

        <section id="ingresso-live" style={{marginTop:16,padding:18,borderRadius:22,background:'#082f49',color:'white',border:'1px solid #155e75'}}>
          <div style={{fontSize:12,letterSpacing:2,fontWeight:900,color:'#67e8f9'}}>INGRESSO LIVE • MICROFONO / CHITARRA</div>
          <h2 style={{fontSize:24,margin:'6px 0 8px'}}>Collega, ascolta in cuffia e registra</h2>
          <p style={{color:'#cffafe',lineHeight:1.6,marginTop:0}}>Collega il microfono integrato/USB oppure una chitarra tramite un’interfaccia audio USB compatibile. Premi il pulsante per autorizzare il browser. La registrazione verrà aggiunta al mixer come traccia separata.</p>
          <div style={{display:'flex',gap:9,flexWrap:'wrap'}}>
            <button type="button" onClick={connectLiveInput} style={{padding:'12px 15px',border:0,borderRadius:11,background:'#fbbf24',color:'#082f49',fontWeight:900,cursor:'pointer'}}>🎙️ Collega microfono / strumento</button>
            <button type="button" onClick={startLiveRecording} disabled={!audioInput||recording} style={{padding:'12px 15px',border:0,borderRadius:11,background:'#dc2626',color:'white',fontWeight:900,cursor:'pointer',opacity:(!audioInput || recording) ? 0.55 : 1}}>⏺ Avvia registrazione</button>
            <button type="button" onClick={stopLiveRecording} disabled={!recording} style={{padding:'12px 15px',border:0,borderRadius:11,background:'#f8fafc',color:'#0f172a',fontWeight:900,cursor:'pointer',opacity:recording?1:.55}}>■ Ferma e aggiungi al mixer</button>
            <button type="button" onClick={toggleLiveMonitor} disabled={!audioInput} style={{padding:'12px 15px',border:'1px solid #67e8f9',borderRadius:11,background:monitoring?'#0e7490':'#164e63',color:'white',fontWeight:900,cursor:'pointer',opacity:audioInput?1:.55}}>{monitoring?'🎧 Disattiva ascolto':'🎧 Ascolta in cuffia'}</button>
            <button type="button" onClick={disconnectLiveInput} disabled={!audioInput} style={{padding:'12px 15px',border:'1px solid #67e8f9',borderRadius:11,background:'transparent',color:'white',fontWeight:800,cursor:'pointer',opacity:audioInput?1:.55}}>Scollega</button>
          </div>
          <div role="status" style={{marginTop:12,padding:11,borderRadius:10,background:'#164e63',color:'#cffafe',fontSize:13}}>{audioInput?'● COLLEGATO: '+inputName:'● Ingresso non collegato'}{recording?' — REGISTRAZIONE IN CORSO':''}</div>
          <p style={{fontSize:12,color:'#cffafe',lineHeight:1.55,marginBottom:0}}>Importante: per una chitarra elettrica serve normalmente una scheda/interfaccia audio. Il monitoraggio via browser può avere ritardo; per suonare senza latenza usa il monitoraggio diretto della scheda audio. Attiva l’ascolto solo con cuffie, per evitare feedback dagli altoparlanti.</p>
        </section>

        <section style={{marginTop:16,padding:18,borderRadius:22,background:'#082f49',color:'white',border:'1px solid #155e75',boxShadow:'0 8px 24px rgba(15,23,42,.12)'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,280px),1fr))',gap:18,alignItems:'center'}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap',marginBottom:10}}>
                <img src="/riverspend-river-market.svg" alt="Marchio RiverSpend" style={{width:76,height:76,objectFit:'contain',background:'#ffffff',borderRadius:14,padding:5,boxSizing:'border-box'}} />
                <div>
                  <div style={{fontSize:12,letterSpacing:2,fontWeight:900,color:'#67e8f9'}}>MARCHIO RIVERSPEND</div>
                  <div style={{fontSize:13,fontWeight:800,color:'#ffffff'}}>SOUND STUDIO • ESCLUSIVA RIVERSPEND</div>
                </div>
              </div>
              <h2 style={{fontSize:'clamp(24px,4vw,34px)',lineHeight:1.15,margin:'8px 0'}}>ISSA: il sistema audio esclusivo RiverSpend</h2>
              <p style={{color:'#cffafe',lineHeight:1.6}}>Carica più tracce, ascoltale e regola il volume di ogni canale nel mixer qui sotto. ISSA è il concept proprietario di RiverSpend Sound Studio, dedicato a mix, spazialità e audio immersivo. Il nome e l'esperienza sono riservati al progetto RiverSpend; le funzioni surround avanzate saranno attivate dopo l'integrazione e i test del motore audio.</p>
              <a href="#mixer-multitraccia" style={{display:'inline-block',padding:'11px 15px',borderRadius:11,background:'#22d3ee',color:'#083344',fontWeight:900,textDecoration:'none'}}>↓ Vai al mixer multitraccia</a>
            </div>
            <div style={{borderRadius:16,overflow:'hidden',minHeight:180,background:'#164e63'}}>
              <img src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1000&q=85" alt="Studio audio con console e apparecchiature di registrazione" style={{display:'block',width:'100%',height:220,objectFit:'cover'}} />
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,150px),1fr))',gap:9,marginTop:14}}>
            {[
              ['🎚️','MIXER','Volume, mute e solo per traccia'],
              ['🎙️','REGISTRAZIONE','Microfono e tracce live: modulo da sviluppare'],
              ['🌌','ISSA • ESCLUSIVA RIVERSPEND','Sistema audio immersivo proprietario: modulo da integrare'],
              ['🤖','RIVER AI AUDIO','Assistenza intelligente: modulo futuro']
            ].map(([icon,title,desc])=><div key={title} style={{padding:12,border:'1px solid #155e75',borderRadius:12,background:'#164e63'}}>
              <div style={{fontSize:23}}>{icon}</div><strong style={{fontSize:13}}>{title}</strong><div style={{fontSize:12,color:'#cffafe',lineHeight:1.45,marginTop:4}}>{desc}</div>
            </div>)}
          </div>
        </section>

        <section style={{marginTop:16,padding:18,borderRadius:22,background:'white',border:'1px solid #bae6fd',boxShadow:'0 8px 24px rgba(15,23,42,.06)'}}>
          <div style={{fontSize:12,letterSpacing:2,fontWeight:900,color:'#0e7490'}}>COLLEGAMENTO AUDIO</div>
          <h2 style={{fontSize:23,margin:'6px 0 8px'}}>Scegli il tuo livello</h2>
          <p style={{color:'#475569',lineHeight:1.6,marginTop:0}}>RiverSpend è pensato per chi inizia e per chi lavora in studio. Seleziona la configurazione più vicina alla tua: questa guida ti aiuta a preparare l'attrezzatura, non attiva da sola una diretta.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,220px),1fr))',gap:10}}>
            {[
              ['🌱','Principiante','PC o portatile, microfono integrato o USB e cuffie. Non serve una scheda audio dedicata.','https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80'],
              ['🎙️','Intermedio','Microfono USB o XLR con interfaccia audio USB, cuffie e ambiente il più possibile silenzioso.','https://images.unsplash.com/photo-1593078166035-9d5a4e1c5a2f?auto=format&fit=crop&w=600&q=80'],
              ['🎚️','Esperto / semi-professionale','Scheda audio USB, microfono XLR, monitoraggio in cuffia e strumenti collegati agli ingressi compatibili.','https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80'],
              ['🎛️','Professionale','Interfaccia multicanale o mixer, più ingressi separati, monitor da studio e gestione dedicata della latenza.','https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80'],
              ['🌐','Collaborazione da remoto','Per suonare insieme da luoghi diversi servirà una funzione live dedicata a bassa latenza: non è ancora attiva.','https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=600&q=80'],
              ['📱','Tablet o telefono','Possibile per ascoltare e gestire file compatibili; collegamento di microfoni e schede esterne dipende dal dispositivo e dagli adattatori.','https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=600&q=80']
            ].map(([icon,title,desc,photo])=><article key={title} style={{padding:12,borderRadius:15,border:'1px solid #bae6fd',background:'#f8fdff',overflow:'hidden'}}>
              <img src={photo} alt={title+' - attrezzatura e ambiente audio'} loading="lazy" style={{display:'block',width:'100%',height:115,objectFit:'cover',borderRadius:10,marginBottom:10}} />
              <div style={{fontSize:25}}>{icon}</div><strong>{title}</strong><p style={{fontSize:13,color:'#475569',lineHeight:1.55,marginBottom:0}}>{desc}</p>
            </article>)}
          </div>
          <div style={{marginTop:12,padding:12,borderRadius:12,background:'#fff7ed',color:'#9a3412',fontSize:13,lineHeight:1.55}}>
            <strong>Importante:</strong> la versione attuale permette di caricare e mixare in anteprima file audio nel browser. La cattura microfono, la registrazione live multitraccia, la diretta con altri utenti e il monitoraggio a bassa latenza richiedono ancora sviluppo e test. Per cantare senza sentire ritardo, una scheda audio con monitoraggio diretto è spesso la scelta migliore.
          </div>
        </section>

        <section style={{marginTop:16,padding:18,borderRadius:22,background:'white',border:'1px solid #bae6fd',boxShadow:'0 8px 24px rgba(15,23,42,.06)'}}>
          <label htmlFor="project" style={{display:'block',fontWeight:800,marginBottom:7}}>Nome del progetto</label>
          <input id="project" value={project} onChange={e=>setProject(e.target.value)} style={{boxSizing:'border-box',width:'100%',padding:12,border:'1px solid #cbd5e1',borderRadius:12,fontSize:16}} />
          <div style={{display:'flex',flexWrap:'wrap',gap:10,marginTop:14}}>
            <button type="button" onClick={()=>uploadRef.current?.click()} style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8,padding:'12px 16px',border:0,borderRadius:13,background:'#0891b2',color:'white',fontWeight:900,cursor:'pointer'}}>
              ＋ Carica tracce audio
            </button>
            <label style={{display:'block',marginTop:12,padding:12,border:'2px dashed #0891b2',borderRadius:12,background:'#ecfeff',color:'#164e63',fontWeight:800}}>Seleziona file audio (MP3, WAV, M4A e altri formati supportati)<input ref={uploadRef} type="file" accept="audio/*,.wav,.mp3,.aiff,.flac,.m4a,.ogg" multiple onChange={addFiles} style={{display:'block',width:'100%',marginTop:9,fontSize:14,color:'#0f172a'}} /></label>
            <button onClick={togglePlayback} style={{padding:'12px 18px',border:0,borderRadius:13,background:playing?'#0f766e':'#0f172a',color:'white',fontWeight:900,fontSize:15}}>{playing?'Ⅱ Pausa mix':'▶ Riproduci mix'}</button>
            <button onClick={()=>{tracks.forEach(t=>{const el=audioRefs.current[t.id];if(el){el.pause();el.currentTime=0;}});setPlaying(false);setNotice('Riproduzione riportata all’inizio.')}} style={{padding:'12px 16px',border:'1px solid #cbd5e1',borderRadius:13,background:'white',fontWeight:800}}>↺ Riavvolgi</button>
          </div>
          <section style={{marginTop:14,padding:15,borderRadius:16,background:'linear-gradient(135deg,#082f49,#312e81)',border:'1px solid #22d3ee',color:'white'}}><div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center',flexWrap:'wrap'}}><div><div style={{fontSize:11,letterSpacing:2,fontWeight:900,color:'#67e8f9'}}>RIVERSPEND SOUND STUDIO LAB</div><h3 style={{margin:'5px 0',fontSize:21}}>ISSA by RSSound</h3><div style={{fontSize:13,color:'#cffafe'}}>Ottimizzazione audio immersiva {issaBusy ? 'in corso…' : (issaEnabled ? 'pronta' : 'disattivata')}</div></div><button type="button" onClick={()=>{setIssaEnabled(v=>!v);setNotice(!issaEnabled?'ISSA attivato: l’effetto immersivo sarà applicato durante la riproduzione.':'ISSA disattivato: riproduzione standard.');}} style={{padding:'11px 14px',border:0,borderRadius:10,background:issaEnabled?'#fbbf24':'#e2e8f0',color:'#082f49',fontWeight:900,cursor:'pointer'}}>{issaEnabled?'🌌 ISSA ATTIVO':'ISSA DISATTIVATO'}</button></div><div style={{height:10,background:'#164e63',borderRadius:99,overflow:'hidden',marginTop:13}}><div style={{height:'100%',width:issaProgress+'%',background:'linear-gradient(90deg,#22d3ee,#fbbf24)',transition:'width .25s ease'}}/></div><div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#cffafe',marginTop:5}}><span>{issaBusy?'ISSA by RSSound • attendere…':'ISSA by RSSound • pronto'}</span><strong>{issaProgress}%</strong></div><div style={{marginTop:14,padding:12,borderRadius:12,background:'#0f3347',border:'1px solid #155e75'}}><label htmlFor="issa-ambience" style={{display:'flex',justifyContent:'space-between',gap:8,fontSize:13,fontWeight:900,color:'#cffafe'}}>🌊 Intensità ambiente / eco <span>{issaAmbience}%</span></label><input id="issa-ambience" type="range" min="0" max="60" step="1" value={issaAmbience} onChange={e=>{const value=Number(e.target.value);setIssaAmbience(value);Object.values(audioGraphs.current).forEach(graph=>{graph.wet.gain.value=issaEnabled?value/100:0;graph.dry.gain.value=issaEnabled?1-(value/100)*0.35:1;});setNotice('ISSA: intensità ambiente impostata al '+value+'%. Premi Riproduci mix per ascoltare la differenza.');}} style={{width:'100%',accentColor:'#fbbf24',marginTop:10}}/><div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#a5f3fc'}}><span>Suono più asciutto</span><span>Più ambiente</span></div></div><p style={{fontSize:11,color:'#bae6fd',lineHeight:1.5,marginBottom:0,marginTop:10}}>Controllo attivo dell’ambiente stereo/eco durante la riproduzione nel browser. Il surround reale 5.1/7.1 e l’elaborazione AI non sono ancora disponibili: richiedono un motore audio dedicato.</p></section><div role="status" style={{marginTop:13,padding:12,borderRadius:12,background:'#f0fdfa',color:'#115e59',fontSize:14}}>{notice}</div>
        </section>

        <section style={{marginTop:16,padding:18,borderRadius:22,background:'#0f172a',color:'white'}}>
          <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}>
            <div><div style={{fontSize:12,color:'#67e8f9',fontWeight:900,letterSpacing:2}}>MASTER BUS</div><h2 style={{margin:'5px 0',fontSize:23}}>{project || 'Progetto senza nome'}</h2><div style={{fontSize:13,color:'#cbd5e1'}}>{tracks.length} tracce caricate{totalDuration ? ' · durata massima '+Math.floor(totalDuration/60)+':'+String(Math.floor(totalDuration%60)).padStart(2,'0') : ''}</div></div>
            <div style={{minWidth:180,flex:'1 1 220px',maxWidth:320}}><label htmlFor="master" style={{display:'flex',justifyContent:'space-between',fontSize:13,fontWeight:800,marginBottom:8}}>Volume master <span>{master}%</span></label><input id="master" type="range" min="0" max="100" value={master} onChange={e=>{const v=Number(e.target.value);setMaster(v);tracks.forEach(t=>{const el=audioRefs.current[t.id];if(el)el.volume=(t.muted||(soloActive&&!t.solo)?0:t.volume/100)*v/100;});}} style={{width:'100%',accentColor:'#22d3ee'}} /></div>
          </div>
          <div style={{height:22,display:'flex',gap:3,alignItems:'end',marginTop:18,overflow:'hidden'}}>{Array.from({length:72},(_,i)=><span key={i} style={{flex:'1 0 3px',height:(8+((i*17+i*i*3)%14))+'px',borderRadius:3,background:i%4===0?'#fbbf24':'#22d3ee',opacity:.85}} />)}</div>
        </section>



        <section style={{marginTop:18,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,230px),1fr))',gap:12}}>
          {[['🎛️','Preamplificatore & FX','Moduli previsti: gain, EQ, compressore, riverbero e delay.'],['🌌','Surround 5.1 / 7.1','Progettazione multicanale; rendering ed export richiedono un motore audio compatibile.'],['🎬','Video Edit','Modulo successivo per importare video, sincronizzare l’audio e montare le scene.'],['🤖','River AI Audio Lab','Pulizia, mix assistito e mastering tramite un servizio audio dedicato da integrare.']].map(([icon,title,desc])=><div key={title} style={{padding:16,borderRadius:18,background:'white',border:'1px solid #bae6fd'}}><div style={{fontSize:26}}>{icon}</div><strong>{title}</strong><p style={{fontSize:14,color:'#475569',lineHeight:1.5,marginBottom:0}}>{desc}</p></div>)}
        </section>
        <section style={{marginTop:18,padding:18,borderRadius:20,background:'#ecfeff',border:'1px solid #67e8f9',color:'#164e63'}}>
          <div style={{fontSize:12,fontWeight:900,letterSpacing:2,color:'#0e7490'}}>RSSPONS MUSIC PROMOTION</div>
          <h2 style={{fontSize:22,fontWeight:900,margin:'6px 0'}}>Promuovi il tuo singolo, album o videoclip</h2>
          <p style={{fontSize:14,lineHeight:1.6,margin:'0 0 12px'}}>Scegli durata, budget e area geografica per preparare una campagna musicale. Il configuratore mostra una stima; pagamento e pubblicazione reali saranno attivati dopo il collegamento dei servizi necessari.</p>
          <a href="/rs-spons/campagna" style={{display:'inline-block',padding:'12px 16px',borderRadius:12,background:'#0e7490',color:'white',fontWeight:900,textDecoration:'none'}}>🎵 Crea campagna musicale RSSpons</a>
        </section>

        <section id="river-audio-equipment" style={{marginTop:20,padding:18,borderRadius:18,background:'linear-gradient(135deg,#082f49,#164e63)',color:'#ecfeff',border:'1px solid #0e7490'}}>
          <div style={{fontSize:12,fontWeight:900,letterSpacing:1.5,color:'#67e8f9'}}>RIVERSPEND SOUND STUDIO LIVE</div>
          <h2 style={{fontSize:'clamp(22px,4vw,30px)',margin:'6px 0 8px',fontWeight:900}}>🎛️ Configura la sala audio virtuale</h2>
          <p style={{fontSize:14,lineHeight:1.6,margin:'0 0 16px',color:'#cffafe'}}>Scegli la configurazione di riferimento per la tua sessione. Queste scelte impostano il profilo visualizzato nello studio: non collegano né controllano automaticamente hardware fisico.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
            <label style={{display:'grid',gap:7,fontSize:13,fontWeight:800}}>Monitor d'ascolto
              <select value={monitorChoice} onChange={e=>setMonitorChoice(e.target.value)} style={{padding:12,borderRadius:10,border:'1px solid #67e8f9',background:'#f0fdfa',color:'#083344',fontWeight:700}}>
                <option>Yamaha HS8</option><option>Yamaha HS7</option><option>Bowers & Wilkins 800 Series</option><option>Genelec The Ones</option><option>Neumann KH Series</option><option>Focal Professional</option><option>ADAM Audio A Series</option>
              </select>
            </label>
            <label style={{display:'grid',gap:7,fontSize:13,fontWeight:800}}>Console virtuale
              <select value={consoleChoice} onChange={e=>setConsoleChoice(e.target.value)} style={{padding:12,borderRadius:10,border:'1px solid #67e8f9',background:'#f0fdfa',color:'#083344',fontWeight:700}}>
                <option>RiverSpend Virtual Console Pro</option><option>Yamaha DM7 — profilo di riferimento</option><option>Console analogica classica — profilo</option><option>Console Cinema & Master — profilo</option>
              </select>
            </label>
            <label style={{display:'grid',gap:7,fontSize:13,fontWeight:800}}>Ambiente di ascolto
              <select value={roomChoice} onChange={e=>setRoomChoice(e.target.value)} style={{padding:12,borderRadius:10,border:'1px solid #67e8f9',background:'#f0fdfa',color:'#083344',fontWeight:700}}>
                <option>Stereo Studio</option><option>ISSA Surround 10.0 — visualizzazione</option><option>Live Concert — visualizzazione</option><option>Cinema Mix — visualizzazione</option>
              </select>
            </label>
          </div>
          <div style={{marginTop:14,padding:13,borderRadius:12,background:'rgba(8,47,73,.72)',border:'1px solid #155e75'}}>
            <strong>Configurazione selezionata</strong>
            <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:9}}>
              {[monitorChoice,consoleChoice,roomChoice].map(item=><span key={item} style={{padding:'7px 10px',borderRadius:999,background:'#cffafe',color:'#164e63',fontSize:12,fontWeight:800}}>{item}</span>)}
            </div>
            <p style={{fontSize:12,lineHeight:1.55,margin:'10px 0 0',color:'#a5f3fc'}}>Nota: i marchi sono riferimenti di catalogo e i profili non equivalgono a una licenza, a una simulazione acustica certificata o al controllo dell'hardware originale. Il collegamento e il test dei dispositivi saranno una fase separata.</p>
          </div>
        </section>

        <section id="river-audio-plugins" style={{marginTop:20,padding:18,borderRadius:18,background:'#071c2c',color:'#ecfeff',border:'1px solid #0e7490'}}>
          <div style={{fontSize:12,fontWeight:900,letterSpacing:1.4,color:'#67e8f9'}}>RIVERSPEND PLUGIN STORE</div>
          <h2 style={{fontSize:'clamp(22px,4vw,30px)',margin:'6px 0 8px'}}>🎚️ Plugin audio per piano</h2>
          <p style={{fontSize:14,lineHeight:1.6,color:'#cbd5e1'}}>I piani stabiliscono quali moduli sono disponibili. In questa prima versione il catalogo e i blocchi sono dimostrativi: i plugin indicati come “in sviluppo” non elaborano ancora l'audio e non sono venduti come funzioni già operative.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
            {[
              {name:'FREE • Starter',price:'€0',items:'EQ base, volume, mute/solo, importazione tracce',status:'Funzioni base disponibili in parte',color:'#334155'},
              {name:'BRONZE • Creator',price:'Piano Bronze',items:'Compressione, gate, de-esser e preset voce',status:'Moduli avanzati da implementare',color:'#92400e'},
              {name:'SILVER • Producer',price:'Piano Silver',items:'EQ parametrico, riverbero, delay e bus effetti',status:'Moduli avanzati da implementare',color:'#475569'},
              {name:'GOLD • Professional',price:'Piano Gold',items:'Catene effetti, automazioni e routing avanzato',status:'In sviluppo',color:'#854d0e'},
              {name:'PLATINUM • Studio',price:'Piano Platinum',items:'Master bus, analisi loudness e strumenti di mastering',status:'In sviluppo',color:'#3730a3'},
              {name:'SUPREME • Cinema',price:'Piano Supreme',items:'Moduli spaziali, surround e post-produzione avanzata',status:'Richiede motore audio dedicato',color:'#701a75'}
            ].map((p)=> <div key={p.name} style={{padding:14,borderRadius:14,background:'#102b40',border:'1px solid #164e63',display:'flex',flexDirection:'column',gap:9}}>
              <div style={{fontSize:12,fontWeight:900,color:'#a5f3fc'}}>{p.name}</div><div style={{fontSize:20,fontWeight:900}}>{p.price}</div><div style={{fontSize:13,lineHeight:1.55,flex:1}}>{p.items}</div><div style={{fontSize:11,fontWeight:800,padding:'7px 9px',borderRadius:8,background:p.color}}>{p.status}</div>
            </div>)}
          </div>
          <p style={{fontSize:12,lineHeight:1.55,color:'#a5f3fc',marginBottom:0}}>Nessun pagamento è attivato da questa scheda. Prezzi, limiti d'uso e accessi saranno collegati ai piani reali quando avremo completato autenticazione, abbonamenti e controlli lato server.</p>
        </section>
        <footer style={{marginTop:20,padding:14,borderRadius:14,background:'#fff7ed',color:'#9a3412',fontSize:13,lineHeight:1.55}}>Versione iniziale dello studio: il mixer consente di caricare, ascoltare, regolare e silenziare tracce nel browser. Non salva ancora i progetti sul server e non esegue ancora mastering AI, registrazione live multitraccia, export del mix o depositi SIAE/Soundreef. Questi moduli richiedono integrazioni dedicate prima di essere offerti come servizi operativi.</footer>
      </div>
    </main>
  </>;
}
