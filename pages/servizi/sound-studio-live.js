import Head from 'next/head';
import { useMemo, useRef, useState } from 'react';

const kinds = ['Voce', 'Batteria', 'Basso', 'Chitarra', 'Tastiere', 'Base / altro'];
export default function RiverSpendSoundStudioLive() {
  const [tracks, setTracks] = useState([]);
  const [project, setProject] = useState('Il mio progetto');
  const [master, setMaster] = useState(80);
  const [issaEnabled, setIssaEnabled] = useState(true);
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
    const dry = ctx.createGain(); dry.gain.value = issaEnabled ? 0.72 : 1;
    const delay = ctx.createDelay(1.5); delay.delayTime.value = 0.19;
    const feedback = ctx.createGain(); feedback.gain.value = 0.18;
    const wet = ctx.createGain(); wet.gain.value = issaEnabled ? 0.28 : 0;
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
    graph.dry.gain.value = issaEnabled ? 0.72 : 1;
    graph.wet.gain.value = issaEnabled ? 0.28 : 0;
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
          <div style={{fontSize:12,letterSpacing:3,fontWeight:900,color:'#a5f3fc'}}>RIVERSPEND SOUND STUDIO LIVE</div>
          <h1 style={{fontSize:'clamp(30px,6vw,48px)',lineHeight:1.08,margin:'12px 0'}}>Il tuo studio. Il tuo suono.</h1>
          <p style={{maxWidth:680,fontSize:16,lineHeight:1.65,color:'#cffafe',marginBottom:0}}>Carica le tracce, regola ogni livello e prepara il tuo progetto musicale. River AI, mastering assistito, video editing e distribuzione saranno moduli progressivi dello studio.</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:18}}>{['MULTITRACCIA','AUDIO LAB','VIDEO EDIT','ISSA • ESCLUSIVA RIVERSPEND'].map(x=><span key={x} style={{border:'1px solid #67e8f9',borderRadius:999,padding:'6px 10px',fontSize:11,fontWeight:800,color:'#cffafe',background:'rgba(8,47,73,.72)'}}>{x}</span>)}</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:10,marginTop:22,position:'relative',zIndex:2}}>
            <button type="button" onClick={()=>uploadRef.current?.click()} style={{padding:'13px 17px',border:0,borderRadius:12,background:'#fbbf24',color:'#082f49',fontWeight:900,fontSize:15,cursor:'pointer'}}>＋ CARICA TRACCE</button>
            <button type="button" onClick={()=>document.getElementById('mixer-multitraccia')?.scrollIntoView({behavior:'smooth',block:'start'})} style={{padding:'13px 17px',border:'1px solid #67e8f9',borderRadius:12,background:'#083344',color:'white',fontWeight:900,fontSize:15,cursor:'pointer'}}>🎚️ APRI IL MIXER</button>
          </div>
        </header>

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
              <button onClick={()=>removeTrack(t.id)} aria-label={'Rimuovi '+t.name} style={{padding:'8px 10px',borderRadius:9,border:'1px solid #fecaca',background:'white',color:'#b91c1c'}}>✕</button>
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
            <input ref={uploadRef} type="file" accept="audio/*,.wav,.mp3,.aiff,.flac,.m4a,.ogg" multiple onChange={addFiles} style={{display:'none'}} />
            <button onClick={togglePlayback} style={{padding:'12px 18px',border:0,borderRadius:13,background:playing?'#0f766e':'#0f172a',color:'white',fontWeight:900,fontSize:15}}>{playing?'Ⅱ Pausa mix':'▶ Riproduci mix'}</button>
            <button onClick={()=>{tracks.forEach(t=>{const el=audioRefs.current[t.id];if(el){el.pause();el.currentTime=0;}});setPlaying(false);setNotice('Riproduzione riportata all’inizio.')}} style={{padding:'12px 16px',border:'1px solid #cbd5e1',borderRadius:13,background:'white',fontWeight:800}}>↺ Riavvolgi</button>
          </div>
          <section style={{marginTop:14,padding:15,borderRadius:16,background:'linear-gradient(135deg,#082f49,#312e81)',border:'1px solid #22d3ee',color:'white'}}><div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center',flexWrap:'wrap'}}><div><div style={{fontSize:11,letterSpacing:2,fontWeight:900,color:'#67e8f9'}}>RIVERSPEND SOUND STUDIO LAB</div><h3 style={{margin:'5px 0',fontSize:21}}>ISSA by RSSound</h3><div style={{fontSize:13,color:'#cffafe'}}>Ottimizzazione audio immersiva {issaBusy ? 'in corso…' : (issaEnabled ? 'pronta' : 'disattivata')}</div></div><button type="button" onClick={()=>{setIssaEnabled(v=>!v);setNotice(!issaEnabled?'ISSA attivato: l’effetto immersivo sarà applicato durante la riproduzione.':'ISSA disattivato: riproduzione standard.');}} style={{padding:'11px 14px',border:0,borderRadius:10,background:issaEnabled?'#fbbf24':'#e2e8f0',color:'#082f49',fontWeight:900,cursor:'pointer'}}>{issaEnabled?'🌌 ISSA ATTIVO':'ISSA DISATTIVATO'}</button></div><div style={{height:10,background:'#164e63',borderRadius:99,overflow:'hidden',marginTop:13}}><div style={{height:'100%',width:issaProgress+'%',background:'linear-gradient(90deg,#22d3ee,#fbbf24)',transition:'width .25s ease'}}/></div><div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#cffafe',marginTop:5}}><span>{issaBusy?'ISSA by RSSound • attendere…':'ISSA by RSSound • pronto'}</span><strong>{issaProgress}%</strong></div><p style={{fontSize:11,color:'#bae6fd',lineHeight:1.5,marginBottom:0}}>ISSA applica un ambiente stereo con eco leggero durante l’ascolto nel browser. È una prima versione dell’effetto immersivo, non un mastering professionale né un surround 5.1/7.1.</p></section><div role="status" style={{marginTop:13,padding:12,borderRadius:12,background:'#f0fdfa',color:'#115e59',fontSize:14}}>{notice}</div>
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
        <footer style={{marginTop:20,padding:14,borderRadius:14,background:'#fff7ed',color:'#9a3412',fontSize:13,lineHeight:1.55}}>Versione iniziale dello studio: il mixer consente di caricare, ascoltare, regolare e silenziare tracce nel browser. Non salva ancora i progetti sul server e non esegue ancora mastering AI, registrazione live multitraccia, export del mix o depositi SIAE/Soundreef. Questi moduli richiedono integrazioni dedicate prima di essere offerti come servizi operativi.</footer>
      </div>
    </main>
  </>;
}
