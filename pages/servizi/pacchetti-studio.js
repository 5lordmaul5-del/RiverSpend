import Head from 'next/head';
import { useState } from 'react';

const audioPlans = [
  { name: 'Progetto 3 canzoni', songs: '3 brani', price: '€ 19,90', detail: 'Preparazione progetto e gestione delle tracce audio.' },
  { name: 'Progetto 5 canzoni', songs: '5 brani', price: '€ 29,90', detail: 'Per un piccolo EP o una raccolta.' },
  { name: 'Progetto 10 canzoni', songs: '10 brani', price: '€ 49,90', detail: 'Formato album standard.' },
  { name: 'Progetto 15 canzoni', songs: '15 brani', price: '€ 69,90', detail: 'Per album estesi e raccolte.' },
  { name: 'Progetto 20 canzoni', songs: '20 brani', price: '€ 89,90', detail: 'Per raccolte complete.' },
  { name: 'Album intero', songs: 'Fino a 10 brani', price: '€ 99,90', detail: 'Pacchetto album con organizzazione del progetto.' , featured: true},
  { name: 'Doppio album', songs: 'Fino a 20 brani', price: '€ 169,90', detail: 'Pacchetto esteso per due dischi.' }
];
const videoPlans = [
  { name: 'Video musicale standard', price: 'da € 19,90', detail: 'Montaggio semplice e titoli base.' },
  { name: 'Video musicale lungo', price: 'da € 39,90', detail: 'Durata maggiore e montaggio più articolato.' },
  { name: 'Cortometraggio', price: 'da € 99,90', detail: 'Montaggio narrativo e titoli.' },
  { name: 'Lungometraggio', price: 'Su preventivo', detail: 'Preventivo in base a durata, materiale ed effetti.' },
  { name: 'Film', price: 'Su preventivo', detail: 'Montaggio, audio e consegna secondo il progetto.' },
  { name: 'Fiction / serie a episodi', price: 'Su preventivo', detail: 'Prezzo per episodio o per stagione, da definire.' },
  { name: 'Effetti speciali e compositing', price: 'Da definire', detail: 'Green/blue screen, creature, scenari, esplosioni e compositing; dipende dalla complessità.' }
];
export default function RiverSpendStudioPackages() {
  const [category, setCategory] = useState('audio');
  const [selected, setSelected] = useState('');
  const [notice, setNotice] = useState('');
  const plans = category === 'audio' ? audioPlans : videoPlans;
  return <>
    <Head><title>Pacchetti Studio | RiverSpend</title><meta name="description" content="Pacchetti RiverSpend Sound Studio Live e Video Lab." /></Head>
    <main style={{minHeight:'100vh',padding:'20px 14px 48px',background:'linear-gradient(180deg,#ecfeff,#f8fafc 48%,#fff)',fontFamily:'system-ui',color:'#0f172a'}}>
      <div style={{maxWidth:1080,margin:'0 auto'}}>
        <a href="/" style={{color:'#0f766e',fontWeight:800,textDecoration:'none'}}>← RiverSpendShop</a>
        <header style={{marginTop:18,padding:'28px 22px',borderRadius:26,background:'linear-gradient(120deg,#083344,#0e7490)',color:'white'}}>
          <div style={{fontSize:12,letterSpacing:3,color:'#a5f3fc',fontWeight:900}}>RIVERSPEND CREATIVE STUDIO</div>
          <h1 style={{fontSize:'clamp(30px,6vw,44px)',lineHeight:1.1,margin:'10px 0'}}>Scegli il tuo pacchetto</h1>
          <p style={{maxWidth:720,color:'#cffafe',lineHeight:1.65,marginBottom:0}}>Progetti musicali, album, videoclip, cortometraggi e produzioni più lunghe. I prezzi qui indicati sono proposte iniziali, non pagamenti attivi.</p>
        </header>
        <div style={{display:'flex',gap:8,marginTop:16,flexWrap:'wrap'}}>
          <button onClick={()=>{setCategory('audio');setSelected('');setNotice('')}} aria-pressed={category==='audio'} style={{flex:1,minWidth:140,padding:13,borderRadius:13,border:category==='audio'?'2px solid #0891b2':'1px solid #cbd5e1',background:category==='audio'?'#cffafe':'white',fontWeight:900}}>🎵 Sound Studio</button>
          <button onClick={()=>{setCategory('video');setSelected('');setNotice('')}} aria-pressed={category==='video'} style={{flex:1,minWidth:140,padding:13,borderRadius:13,border:category==='video'?'2px solid #0891b2':'1px solid #cbd5e1',background:category==='video'?'#cffafe':'white',fontWeight:900}}>🎬 Video Editing</button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,260px),1fr))',gap:12,marginTop:14}}>
          {plans.map(p=><article key={p.name} style={{padding:18,borderRadius:20,background:'white',border:p.featured?'2px solid #0891b2':'1px solid #bae6fd',boxShadow:p.featured?'0 8px 22px rgba(8,145,178,.12)':'0 5px 16px rgba(15,23,42,.04)'}}>
            {p.featured && <div style={{fontSize:11,fontWeight:900,color:'#0e7490',letterSpacing:1,marginBottom:8}}>PACCHETTO ALBUM</div>}
            <h2 style={{fontSize:19,margin:'0 0 8px'}}>{p.name}</h2>
            {p.songs && <div style={{fontSize:13,color:'#64748b',marginBottom:8}}>{p.songs}</div>}
            <div style={{fontSize:25,fontWeight:950,color:'#0e7490',margin:'10px 0'}}>{p.price}</div>
            <p style={{fontSize:14,color:'#475569',lineHeight:1.55,minHeight:44}}>{p.detail}</p>
            <button onClick={()=>{setSelected(p.name);setNotice('Hai selezionato “'+p.name+'”. Il checkout non è ancora attivo: prezzo e contenuto vanno confermati prima di accettare pagamenti.');}} style={{width:'100%',padding:12,border:0,borderRadius:12,background:selected===p.name?'#0f766e':'#0891b2',color:'white',fontWeight:900}}>{selected===p.name?'✓ Selezionato':'Seleziona pacchetto'}</button>
          </article>)}
        </div>
        {notice && <div role="status" style={{marginTop:14,padding:14,borderRadius:13,background:'#f0fdfa',color:'#115e59',lineHeight:1.5}}>{notice}</div>}
        <section style={{marginTop:18,padding:16,borderRadius:18,background:'#fff7ed',border:'1px solid #fed7aa',color:'#9a3412',fontSize:13,lineHeight:1.6}}>
          <strong>Prima di attivare gli incassi</strong>
          <p style={{marginBottom:0}}>I prezzi sono bozze commerciali da approvare. Il pagamento non è collegato e la selezione non effettua addebiti. Le funzioni di registrazione professionale, mastering AI, chroma key reale, rendering di effetti e consegna finale saranno incluse solo quando saranno implementate e testate. Le produzioni lunghe e gli effetti complessi richiedono preventivo.</p>
        </section>
        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:16}}>
          <a href="/servizi/sound-studio-live" style={{flex:1,minWidth:200,textAlign:'center',padding:13,borderRadius:12,background:'#0f172a',color:'white',textDecoration:'none',fontWeight:800}}>Apri Sound Studio Live</a>
          <a href="/servizi/video-editing" style={{flex:1,minWidth:200,textAlign:'center',padding:13,borderRadius:12,background:'#0f172a',color:'white',textDecoration:'none',fontWeight:800}}>Apri Video Lab</a>
        </div>
      </div>
    </main>
  </>;
}
