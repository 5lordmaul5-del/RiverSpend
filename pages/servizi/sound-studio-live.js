import Head from 'next/head';
import { useMemo, useRef, useState } from 'react';

const kinds = ['Voce', 'Batteria', 'Basso', 'Chitarra', 'Tastiere', 'Base / altro'];
export default function RiverSpendSoundStudioLive() {
  const [tracks, setTracks] = useState([]);
  const [project, setProject] = useState('Il mio progetto');
  const [master, setMaster] = useState(80);
  const [playing, setPlaying] = useState(false);
  const [notice, setNotice] = useState('Carica le tue tracce audio per iniziare il mix.');
  const audioRefs = useRef({});
  const uploadRef = useRef(null);
  const soloActive = tracks.some(t => t.solo);
  const totalDuration = useMemo(() => tracks.reduce((max, t) => Math.max(max, t.duration || 0), 0), [tracks]);

  function addFiles(event) {
    const files = Array.from(event.target.files || []).filter(f => f.type.startsWith('audio/'));
    if (!files.length) { setNotice('Seleziona uno o più file audio supportati.'); return; }
    const additions = files.map((file, i) => ({
      id: (Date.now() + i).toString() + Math.random().toString(36).slice(2, 7),
      name: file.name.replace(/\.[^.]+$/, ''),
      kind: kinds[Math.min(tracks.length + i, kinds.length - 1)],
      url: URL.createObjectURL(file), file, volume: 80, muted: false, solo: false, duration: 0
    }));
    setTracks(prev => [...prev, ...additions]);
    setNotice(additions.length + ' traccia/e aggiunta/e. Regola i livelli e premi Riproduci.');
    event.target.value = '';
  }
  function patchTrack(id, patch) { setTracks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t)); }
  function syncVolumes(nextTracks = tracks, nextMaster = master) {
    nextTracks.forEach(t => {
      const el = audioRefs.current[t.id];
      if (el) el.volume = (t.muted || (soloActive && !t.solo) ? 0 : t.volume / 100) * nextMaster / 100;
    });
  }
  function togglePlayback() {
    if (!tracks.length) { setNotice('Prima carica almeno una traccia audio.'); return; }
    if (!playing) {
      tracks.forEach(t => { const el = audioRefs.current[t.id]; if (el) { el.volume = (t.muted || (soloActive && !t.solo) ? 0 : t.volume / 100) * master / 100; el.play().catch(() => setNotice('Tocca di nuovo Riproduci per autorizzare la riproduzione audio.')); } });
      setPlaying(true); setNotice('Riproduzione delle tracce caricate. Il mix è un’anteprima locale del browser.');
    } else {
      tracks.forEach(t => { const el = audioRefs.current[t.id]; if (el) el.pause(); });
      setPlaying(false); setNotice('Riproduzione in pausa.');
    }
  }
  function removeTrack(id) {
    const track = tracks.find(t => t.id === id);
    if (track) URL.revokeObjectURL(track.url);
    delete audioRefs.current[id];
    setTracks(prev => prev.filter(t => t.id !== id));
  }
  return <>
    <Head><title>RiverSpend Sound Studio Live</title><meta name="description" content="Studio digitale RiverSpend per tracce audio, mix e preparazione audio-video." /></Head>
    <main style={{minHeight:'100vh',background:'linear-gradient(180deg,#ecfeff 0%,#f8fafc 45%,#fff 100%)',color:'#0f172a',fontFamily:'system-ui',padding:'18px 14px 48px'}}>
      <div style={{maxWidth:1080,margin:'0 auto'}}>
        <a href="/" style={{color:'#0f766e',fontWeight:800,textDecoration:'none'}}>← RiverSpendShop</a>\n        <a href="/servizi/pacchetti-studio" style={{display:"inline-block",marginLeft:12,color:"#0e7490",fontWeight:800,textDecoration:"none"}}>💳 Pacchetti e prezzi</a>
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
            <label style={{display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8,padding:'12px 16px',borderRadius:13,background:'#0891b2',color:'white',fontWeight:900,cursor:'pointer'}}>
              ＋ Carica tracce audio
              <input ref={uploadRef} type="file" accept="audio/*,.wav,.mp3,.aiff,.flac,.m4a,.ogg" multiple onChange={addFiles} style={{position:'absolute',width:1,height:1,opacity:0,pointerEvents:'none'}} />
            </label>
            <button onClick={togglePlayback} style={{padding:'12px 18px',border:0,borderRadius:13,background:playing?'#0f766e':'#0f172a',color:'white',fontWeight:900,fontSize:15}}>{playing?'Ⅱ Pausa mix':'▶ Riproduci mix'}</button>
            <button onClick={()=>{tracks.forEach(t=>{const el=audioRefs.current[t.id];if(el){el.pause();el.currentTime=0;}});setPlaying(false);setNotice('Riproduzione riportata all’inizio.')}} style={{padding:'12px 16px',border:'1px solid #cbd5e1',borderRadius:13,background:'white',fontWeight:800}}>↺ Riavvolgi</button>
          </div>
          <div role="status" style={{marginTop:13,padding:12,borderRadius:12,background:'#f0fdfa',color:'#115e59',fontSize:14}}>{notice}</div>
        </section>

        <section style={{marginTop:16,padding:18,borderRadius:22,background:'#0f172a',color:'white'}}>
          <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}>
            <div><div style={{fontSize:12,color:'#67e8f9',fontWeight:900,letterSpacing:2}}>MASTER BUS</div><h2 style={{margin:'5px 0',fontSize:23}}>{project || 'Progetto senza nome'}</h2><div style={{fontSize:13,color:'#cbd5e1'}}>{tracks.length} tracce caricate{totalDuration ? ' · durata massima '+Math.floor(totalDuration/60)+':'+String(Math.floor(totalDuration%60)).padStart(2,'0') : ''}</div></div>
            <div style={{minWidth:180,flex:'1 1 220px',maxWidth:320}}><label htmlFor="master" style={{display:'flex',justifyContent:'space-between',fontSize:13,fontWeight:800,marginBottom:8}}>Volume master <span>{master}%</span></label><input id="master" type="range" min="0" max="100" value={master} onChange={e=>{const v=Number(e.target.value);setMaster(v);tracks.forEach(t=>{const el=audioRefs.current[t.id];if(el)el.volume=(t.muted||(soloActive&&!t.solo)?0:t.volume/100)*v/100;});}} style={{width:'100%',accentColor:'#22d3ee'}} /></div>
          </div>
          <div style={{height:22,display:'flex',gap:3,alignItems:'end',marginTop:18,overflow:'hidden'}}>{Array.from({length:72},(_,i)=><span key={i} style={{flex:'1 0 3px',height:(8+((i*17+i*i*3)%14))+'px',borderRadius:3,background:i%4===0?'#fbbf24':'#22d3ee',opacity:.85}} />)}</div>
        </section>

        <section id="mixer-multitraccia" style={{marginTop:16,scrollMarginTop:18}}>
          <h2 style={{fontSize:23,margin:'0 0 10px'}}>🎚️ Mixer multitraccia — apri e usa</h2>
          {!tracks.length ? <div style={{padding:26,textAlign:'center',border:'2px dashed #7dd3fc',borderRadius:20,background:'white'}}><div style={{fontSize:36}}>🎙️</div><strong>Il tuo mixer è pronto</strong><p style={{color:'#64748b',marginBottom:0}}>Carica più file audio per gestire le tracce separatamente.</p></div> : <div style={{display:'grid',gap:10}}>{tracks.map((t,i)=><article key={t.id} style={{background:'white',border:'1px solid #cbd5e1',borderRadius:18,padding:14,boxShadow:'0 4px 14px rgba(15,23,42,.04)'}}>
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
            <audio ref={el=>{audioRefs.current[t.id]=el; if(el && el.duration && !t.duration) patchTrack(t.id,{duration:el.duration});}} src={t.url} preload="metadata" onLoadedMetadata={e=>patchTrack(t.id,{duration:e.currentTarget.duration})} onEnded={()=>{if(tracks.every(x=>{const el=audioRefs.current[x.id];return !el||el.ended||el.paused;}))setPlaying(false);}} controls style={{width:'100%',height:38,marginTop:8}} />
          </article>)}</div>}
        </section>

        <section style={{marginTop:18,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,230px),1fr))',gap:12}}>
          {[['🎛️','Preamplificatore & FX','Moduli previsti: gain, EQ, compressore, riverbero e delay.'],['🌌','Surround 5.1 / 7.1','Progettazione multicanale; rendering ed export richiedono un motore audio compatibile.'],['🎬','Video Edit','Modulo successivo per importare video, sincronizzare l’audio e montare le scene.'],['🤖','River AI Audio Lab','Pulizia, mix assistito e mastering tramite un servizio audio dedicato da integrare.']].map(([icon,title,desc])=><div key={title} style={{padding:16,borderRadius:18,background:'white',border:'1px solid #bae6fd'}}><div style={{fontSize:26}}>{icon}</div><strong>{title}</strong><p style={{fontSize:14,color:'#475569',lineHeight:1.5,marginBottom:0}}>{desc}</p></div>)}
        </section>
        <footer style={{marginTop:20,padding:14,borderRadius:14,background:'#fff7ed',color:'#9a3412',fontSize:13,lineHeight:1.55}}>Versione iniziale dello studio: il mixer consente di caricare, ascoltare, regolare e silenziare tracce nel browser. Non salva ancora i progetti sul server e non esegue ancora mastering AI, registrazione live multitraccia, export del mix o depositi SIAE/Soundreef. Questi moduli richiedono integrazioni dedicate prima di essere offerti come servizi operativi.</footer>
      </div>
    </main>
  </>;
}
