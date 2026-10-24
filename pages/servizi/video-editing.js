import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';

const effects = [
  { id: 'none', name: 'Nessun effetto', icon: '🎬', filter: 'none' },
  { id: 'explosion', name: 'Esplosione', icon: '💥', filter: 'contrast(1.15) saturate(1.3)' },
  { id: 'earthquake', name: 'Terremoto', icon: '🌋', filter: 'contrast(1.2) saturate(1.15)' },
  { id: 'monster', name: 'Mostro / creatura', icon: '👾', filter: 'contrast(1.2) hue-rotate(15deg)' },
  { id: 'cinema', name: 'Look cinematografico', icon: '🎞️', filter: 'contrast(1.12) saturate(.85)' },
  { id: 'night', name: 'Notte / atmosfera', icon: '🌙', filter: 'brightness(.72) contrast(1.2) saturate(.8)' }
];
export default function RiverSpendVideoEditing() {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoProfile, setVideoProfile] = useState('Cinema 4K');
  const [cameraProfile, setCameraProfile] = useState('Camera cinema — profilo');
  const [audioPostProfile, setAudioPostProfile] = useState('Mix stereo');
  const [videoName, setVideoName] = useState('');
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [backgroundName, setBackgroundName] = useState('');
  const [keyColor, setKeyColor] = useState('green');
  const [tolerance, setTolerance] = useState(35);
  const [overlayText, setOverlayText] = useState('RIVERSPEND STUDIOS');
  const [textColor, setTextColor] = useState('#ffffff');
  const [effect, setEffect] = useState('none');
  const [showText, setShowText] = useState(true);
  const [notice, setNotice] = useState('Carica un video per iniziare la prova degli effetti.');
  const videoRef = useRef(null);
  const videoInputRef = useRef(null);
  const bgInputRef = useRef(null);
  const chosen = effects.find(e => e.id === effect) || effects[0];

  useEffect(() => () => { if (videoUrl) URL.revokeObjectURL(videoUrl); }, [videoUrl]);
  useEffect(() => () => { if (backgroundUrl) URL.revokeObjectURL(backgroundUrl); }, [backgroundUrl]);

  function uploadVideo(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) { setNotice('Scegli un file video supportato.'); return; }
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(URL.createObjectURL(file)); setVideoName(file.name);
    setNotice('Video caricato per l’anteprima locale. Le modifiche non sono ancora esportate nel file.');
  }
  function uploadBackground(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setNotice('Per questa anteprima scegli un’immagine di sfondo.'); return; }
    if (backgroundUrl) URL.revokeObjectURL(backgroundUrl);
    setBackgroundUrl(URL.createObjectURL(file)); setBackgroundName(file.name);
    setNotice('Sfondo caricato. Per rimuovere davvero il green/blue screen servirà il motore chroma key nel rendering finale.');
  }
  return <>
    <Head><title>RiverSpend Video Editing</title><meta name="description" content="RiverSpend Video Editing: chroma key, titoli ed effetti visivi in anteprima." /></Head>
    <main style={{minHeight:'100vh',padding:'18px 14px 48px',background:'linear-gradient(180deg,#ecfeff,#f8fafc 45%,#fff)',color:'#0f172a',fontFamily:'system-ui'}}>
      <div style={{maxWidth:1080,margin:'0 auto'}}>
        <a href="/servizi/sound-studio-live" style={{color:'#0f766e',fontWeight:800,textDecoration:'none'}}>← RiverSpend Sound Studio Live</a>\n        <a href="/servizi/pacchetti-studio" style={{display:"inline-block",marginLeft:12,color:"#0e7490",fontWeight:800,textDecoration:"none"}}>💳 Pacchetti e prezzi</a>
        <header style={{marginTop:18,padding:'28px 22px',borderRadius:26,color:'white',background:'radial-gradient(circle at 85% 10%,#0e7490,#082f49 70%)'}}>
          <div style={{fontSize:12,letterSpacing:3,color:'#a5f3fc',fontWeight:900}}>RIVERSPEND VIDEO LAB</div>
          <h1 style={{fontSize:'clamp(30px,6vw,46px)',lineHeight:1.1,margin:'10px 0'}}>Il video, senza limiti creativi.</h1>
          <p style={{maxWidth:700,color:'#cffafe',lineHeight:1.65,marginBottom:0}}>Green screen, blue screen, titoli, scenari e una libreria di effetti speciali: il punto di partenza per creare videoclip, scene fantasy e video musicali.</p>
        </header>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,310px),1fr))',gap:14,marginTop:16}}>
          <section style={{padding:16,borderRadius:20,background:'white',border:'1px solid #bae6fd'}}>
            <h2 style={{marginTop:0,fontSize:21}}>1. Importa i media</h2>
            <label style={{display:'block',fontWeight:800,marginBottom:7}}>Video principale</label>
            <input ref={videoInputRef} type="file" accept="video/*" onChange={uploadVideo} style={{width:'100%',fontSize:14}} />
            {videoName && <p style={{fontSize:12,color:'#475569',overflowWrap:'anywhere'}}>Video: {videoName}</p>}
            <label style={{display:'block',fontWeight:800,margin:'16px 0 7px'}}>Immagine di sfondo / scenario</label>
            <input ref={bgInputRef} type="file" accept="image/*" onChange={uploadBackground} style={{width:'100%',fontSize:14}} />
            {backgroundName && <p style={{fontSize:12,color:'#475569',overflowWrap:'anywhere'}}>Sfondo: {backgroundName}</p>}
            <p style={{fontSize:13,color:'#64748b',lineHeight:1.5}}>Suggerimento: registra il soggetto davanti a uno sfondo verde o blu uniforme, con luce il più possibile omogenea.</p>
          </section>

          <section style={{padding:16,borderRadius:20,background:'white',border:'1px solid #bae6fd'}}>
            <h2 style={{marginTop:0,fontSize:21}}>2. Chroma key</h2>
            <p style={{fontSize:14,color:'#475569'}}>Seleziona il colore da rimuovere nel modulo di compositing.</p>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {['green','blue'].map(c=><button key={c} onClick={()=>setKeyColor(c)} aria-pressed={keyColor===c} style={{flex:1,padding:12,borderRadius:12,border:keyColor===c?'3px solid #0f172a':'1px solid #cbd5e1',background:c==='green'?'#16a34a':'#2563eb',color:'white',fontWeight:900}}>{c==='green'?'🟢 Green screen':'🔵 Blue screen'}</button>)}
            </div>
            <label htmlFor="tolerance" style={{display:'flex',justifyContent:'space-between',marginTop:18,fontWeight:800,fontSize:14}}>Tolleranza colore <span>{tolerance}</span></label>
            <input id="tolerance" type="range" min="1" max="100" value={tolerance} onChange={e=>setTolerance(Number(e.target.value))} style={{width:'100%',accentColor:'#0891b2'}} />
            <div style={{marginTop:12,padding:12,borderRadius:12,background:'#f0fdfa',fontSize:13,color:'#115e59'}}>Impostazione selezionata: {keyColor==='green'?'verde':'blu'} · tolleranza {tolerance}. Valore pronto per il motore chroma key; la rimozione effettiva non è ancora attiva nell’esportazione.</div>
          </section>
        </div>

        <section style={{marginTop:14,padding:16,borderRadius:20,background:'white',border:'1px solid #bae6fd'}}>
          <h2 style={{marginTop:0,fontSize:21}}>3. Titoli e scritte</h2>
          <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) auto',gap:10,alignItems:'center'}}>
            <input value={overlayText} onChange={e=>setOverlayText(e.target.value)} placeholder="Scrivi il titolo del video" aria-label="Testo sovrapposto" style={{width:'100%',boxSizing:'border-box',padding:12,border:'1px solid #cbd5e1',borderRadius:11,fontSize:16}} />
            <input type="color" value={textColor} onChange={e=>setTextColor(e.target.value)} aria-label="Colore testo" style={{width:48,height:44,border:0,background:'transparent'}} />
          </div>
          <label style={{display:'flex',gap:8,alignItems:'center',marginTop:12,fontWeight:700}}><input type="checkbox" checked={showText} onChange={e=>setShowText(e.target.checked)} /> Mostra scritta nell’anteprima</label>
        </section>

        <section style={{marginTop:14,padding:16,borderRadius:20,background:'white',border:'1px solid #bae6fd'}}>
          <h2 style={{marginTop:0,fontSize:21}}>4. Effetti speciali</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,145px),1fr))',gap:9}}>
            {effects.map(item=><button key={item.id} onClick={()=>{setEffect(item.id);setNotice('Anteprima effetto selezionato: '+item.name+'. Per il rendering finale servirà il motore effetti.');}} aria-pressed={effect===item.id} style={{padding:12,textAlign:'left',borderRadius:14,border:effect===item.id?'2px solid #0891b2':'1px solid #cbd5e1',background:effect===item.id?'#ecfeff':'white',fontWeight:800,cursor:'pointer'}}><span style={{display:'block',fontSize:25,marginBottom:7}}>{item.icon}</span><span style={{fontSize:13}}>{item.name}</span></button>)}
          </div>
          <p style={{fontSize:13,color:'#64748b',lineHeight:1.55,marginBottom:0,marginTop:12}}>La libreria prevista comprende esplosioni, crolli di grattacieli, terremoti, mostri e creature, fumo, fuoco, detriti, luci, particelle e scritte animate. Gli effetti cinematografici reali richiedono clip/asset dedicati e un sistema di compositing/rendering; i pulsanti attuali impostano la scelta e l’anteprima visiva.</p>
        </section>

        <section style={{marginTop:14,padding:16,borderRadius:20,background:'#0f172a',color:'white'}}>
          <h2 style={{marginTop:0,fontSize:21}}>🎥 Anteprima del progetto</h2>
          <div style={{position:'relative',aspectRatio:'16/9',width:'100%',overflow:'hidden',borderRadius:14,background:backgroundUrl?'#111827':(keyColor==='green'?'#14532d':'#1e3a8a'),display:'grid',placeItems:'center'}}>
            {backgroundUrl && <img src={backgroundUrl} alt="Sfondo scelto per la composizione" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} />}
            {videoUrl ? <video ref={videoRef} src={videoUrl} controls playsInline style={{position:'relative',zIndex:1,width:'100%',height:'100%',objectFit:'contain',filter:chosen.filter}} /> : <div style={{position:'relative',zIndex:1,textAlign:'center',padding:20}}><div style={{fontSize:46}}>🎬</div><strong>Carica un video per vedere l’anteprima</strong><p style={{fontSize:13,color:'#cbd5e1'}}>16:9 · anteprima locale</p></div>}
            {showText && overlayText && <div style={{position:'absolute',zIndex:2,left:12,right:12,bottom:14,textAlign:'center',fontWeight:1000,fontSize:'clamp(18px,4vw,36px)',letterSpacing:1,textShadow:'0 3px 8px #000',color:textColor,overflowWrap:'anywhere',pointerEvents:'none'}}>{overlayText}</div>}
            {effect==='explosion' && <div aria-hidden="true" style={{position:'absolute',zIndex:2,top:'18%',right:'12%',fontSize:'clamp(36px,8vw,76px)',filter:'drop-shadow(0 0 16px #f97316)',pointerEvents:'none'}}>💥</div>}
            {effect==='earthquake' && <div aria-hidden="true" style={{position:'absolute',zIndex:2,top:12,left:12,fontSize:30,pointerEvents:'none'}}>🌋</div>}
            {effect==='monster' && <div aria-hidden="true" style={{position:'absolute',zIndex:2,top:'12%',right:'12%',fontSize:'clamp(32px,7vw,66px)',filter:'drop-shadow(0 0 12px #a3e635)',pointerEvents:'none'}}>👾</div>}
          </div>
          <div role="status" style={{marginTop:12,padding:12,borderRadius:12,background:'#164e63',color:'#cffafe',fontSize:13}}>{notice}</div>
        </section>


        <section id="river-video-equipment" style={{marginTop:20,padding:18,borderRadius:18,background:'linear-gradient(135deg,#111827,#312e81)',color:'#eef2ff',border:'1px solid #6366f1'}}>
          <div style={{fontSize:12,fontWeight:900,letterSpacing:1.5,color:'#c4b5fd'}}>RIVERSPEND VIDEO STUDIO</div>
          <h2 style={{fontSize:'clamp(22px,4vw,30px)',margin:'6px 0 8px',fontWeight:900}}>🎬 Configura la produzione video</h2>
          <p style={{fontSize:14,lineHeight:1.6,margin:'0 0 16px',color:'#e0e7ff'}}>Seleziona il profilo di lavoro e la configurazione di riferimento per il tuo progetto. I profili organizzano la sessione; non simulano una videocamera fisica né attivano funzioni di export non ancora implementate.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
            <label style={{display:'grid',gap:7,fontSize:13,fontWeight:800}}>Formato di produzione
              <select value={videoProfile} onChange={e=>setVideoProfile(e.target.value)} style={{padding:12,borderRadius:10,border:'1px solid #a5b4fc',background:'#eef2ff',color:'#1e1b4b',fontWeight:700}}>
                <option>Cinema 4K</option><option>Videoclip musicale</option><option>Film / cortometraggio</option><option>Social verticale 9:16</option><option>Documentario</option><option>Full HD leggero</option>
              </select>
            </label>
            <label style={{display:'grid',gap:7,fontSize:13,fontWeight:800}}>Profilo camera
              <select value={cameraProfile} onChange={e=>setCameraProfile(e.target.value)} style={{padding:12,borderRadius:10,border:'1px solid #a5b4fc',background:'#eef2ff',color:'#1e1b4b',fontWeight:700}}>
                <option>Camera cinema — profilo</option><option>ARRI — profilo di riferimento</option><option>RED — profilo di riferimento</option><option>Sony Cinema Line — profilo</option><option>Blackmagic Design — profilo</option><option>Smartphone — profilo</option>
              </select>
            </label>
            <label style={{display:'grid',gap:7,fontSize:13,fontWeight:800}}>Post-produzione audio
              <select value={audioPostProfile} onChange={e=>setAudioPostProfile(e.target.value)} style={{padding:12,borderRadius:10,border:'1px solid #a5b4fc',background:'#eef2ff',color:'#1e1b4b',fontWeight:700}}>
                <option>Mix stereo</option><option>Dialoghi e Foley</option><option>Videoclip musicale</option><option>Cinema surround — profilo</option>
              </select>
            </label>
          </div>
          <div style={{marginTop:14,padding:13,borderRadius:12,background:'rgba(17,24,39,.65)',border:'1px solid #4f46e5'}}>
            <strong>Profilo progetto</strong>
            <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:9}}>
              {[videoProfile,cameraProfile,audioPostProfile].map(item=><span key={item} style={{padding:'7px 10px',borderRadius:999,background:'#e0e7ff',color:'#312e81',fontSize:12,fontWeight:800}}>{item}</span>)}
            </div>
            <p style={{fontSize:12,lineHeight:1.55,margin:'10px 0 0',color:'#c7d2fe'}}>I nomi di produttori e sistemi sono profili di riferimento, non dichiarazioni di partnership o certificazione. La timeline completa, il rendering finale e i codec professionali richiedono ulteriori implementazioni e test.</p>
          </div>
        </section>

        <section id="river-video-plugins" style={{marginTop:20,padding:18,borderRadius:18,background:'#11112e',color:'#eef2ff',border:'1px solid #6366f1'}}>
          <div style={{fontSize:12,fontWeight:900,letterSpacing:1.4,color:'#c4b5fd'}}>RIVERSPEND VIDEO PLUGIN STORE</div>
          <h2 style={{fontSize:'clamp(22px,4vw,30px)',margin:'6px 0 8px'}}>🎬 Plugin video per piano</h2>
          <p style={{fontSize:14,lineHeight:1.6,color:'#c7d2fe'}}>I piani organizzano l'accesso alle funzioni video. Gli strumenti contrassegnati “in sviluppo” sono proposti nel catalogo ma non vengono presentati come effetti o esportazioni già funzionanti.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
            {[
              {name:'FREE • Starter',price:'€0',items:'Anteprima, titoli base e filtri semplici',status:'Anteprima disponibile; export completo da implementare',color:'#334155'},
              {name:'BRONZE • Creator',price:'Piano Bronze',items:'Transizioni, titoli animati e formati social',status:'In sviluppo',color:'#92400e'},
              {name:'SILVER • Editor',price:'Piano Silver',items:'Correzione colore, chroma key e livelli multipli',status:'In sviluppo',color:'#475569'},
              {name:'GOLD • Professional',price:'Piano Gold',items:'Timeline multilivello, maschere e strumenti avanzati',status:'Richiede motore di montaggio',color:'#854d0e'},
              {name:'PLATINUM • Cinema',price:'Piano Platinum',items:'Color grading avanzato, proxy e gestione progetto',status:'In sviluppo',color:'#3730a3'},
              {name:'SUPREME • Studio',price:'Piano Supreme',items:'Rendering ad alta qualità, audio/video avanzato e preset cinema',status:'Richiede rendering ed export dedicati',color:'#701a75'}
            ].map((p)=> <div key={p.name} style={{padding:14,borderRadius:14,background:'#202047',border:'1px solid #4338ca',display:'flex',flexDirection:'column',gap:9}}>
              <div style={{fontSize:12,fontWeight:900,color:'#c4b5fd'}}>{p.name}</div><div style={{fontSize:20,fontWeight:900}}>{p.price}</div><div style={{fontSize:13,lineHeight:1.55,flex:1}}>{p.items}</div><div style={{fontSize:11,fontWeight:800,padding:'7px 9px',borderRadius:8,background:p.color}}>{p.status}</div>
            </div>)}
          </div>
          <p style={{fontSize:12,lineHeight:1.55,color:'#c7d2fe',marginBottom:0}}>Questa scheda non attiva abbonamenti né blocca ancora le funzioni per utente. Il controllo dei piani dovrà essere collegato ad account, pagamenti e autorizzazioni lato server.</p>
        </section>
        <footer style={{marginTop:14,padding:14,borderRadius:14,background:'#fff7ed',color:'#9a3412',fontSize:13,lineHeight:1.6}}>Stato: interfaccia iniziale con import video/immagine, controlli chroma key, titoli e anteprima di alcuni effetti. Non esporta ancora un video compositato e non rimuove realmente il green/blue screen: per questo servirà integrare un motore video (per esempio FFmpeg/WebAssembly o rendering server), una timeline e una libreria di effetti autorizzati. Lavoreremo su file caricati dall’utente o su asset con licenza adeguata.</footer>
      </div>
    </main>
  </>;
}
