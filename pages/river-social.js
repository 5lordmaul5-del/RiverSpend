import Head from 'next/head';
import { useState } from 'react';

export default function RiverSpendSocialNetwork() {
  const [section, setSection] = useState('feed');
  const [draft, setDraft] = useState('');
  const [posts, setPosts] = useState([]);
  const [notice, setNotice] = useState('Anteprima locale: i post restano in questa sessione e non sono pubblicati online.');
  function publish() {
    const text = draft.trim();
    if (!text) { setNotice('Scrivi un messaggio prima di pubblicarlo.'); return; }
    setPosts(current => [{ id: Date.now(), text }, ...current]);
    setDraft('');
    setNotice('Post aggiunto a questa anteprima sul dispositivo. Per renderlo visibile agli altri servono account e database online.');
  }
  const nav = ['feed','gruppi','video','profilo'];
  const labels = { feed:'Bacheca', gruppi:'Gruppi', video:'Video e dirette', profilo:'Profilo' };
  return <>
    <Head><title>RiverSpendSocialNetwork | RiverSpend</title><meta name="description" content="Anteprima del social network RiverSpend: bacheca, gruppi, video e profili."/><meta name="theme-color" content="#082f49"/></Head>
    <main style={{minHeight:'100vh',background:'#f1f5f9',color:'#0f172a',fontFamily:'system-ui,sans-serif',padding:'16px 12px 48px'}}>
      <div style={{maxWidth:900,margin:'0 auto'}}>
        <a href="/" style={{color:'#0e7490',fontWeight:800,textDecoration:'none'}}>← Torna a RiverSpendShop</a>
        <header style={{marginTop:16,borderRadius:26,overflow:'hidden',background:'linear-gradient(135deg,#082f49,#0891b2)',color:'#fff',padding:'24px 20px',boxShadow:'0 12px 35px #0f172a22'}}>
          <div style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}><img src="/icons/riverspend-social.svg" alt="" width="92" height="92" style={{borderRadius:22}}/><div><p style={{margin:0,color:'#fde68a',fontWeight:900,letterSpacing:2,fontSize:12}}>BY RIVERSPENDSHOP</p><h1 style={{fontSize:'clamp(27px,6vw,44px)',lineHeight:1.05,margin:'8px 0',fontWeight:950}}>RiverSpendSocialNetwork</h1><p style={{margin:0,color:'#cffafe',fontWeight:700}}>Condividi momenti. Crea connessioni.</p></div></div>
          <p style={{lineHeight:1.6,color:'#e0f2fe',marginBottom:0}}>Un nuovo spazio per la community RiverSpend: bacheca, gruppi, video e profili, progettati per funzionare bene anche sul telefono.</p>
        </header>
        <nav aria-label="Sezioni social" style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:8,margin:'16px 0'}}>{nav.map(n=><button key={n} onClick={()=>setSection(n)} style={{border:section===n?'2px solid #0891b2':'1px solid #cbd5e1',borderRadius:14,padding:'12px 4px',background:section===n?'#cffafe':'#fff',color:'#0f172a',fontWeight:850,fontSize:12}}>{labels[n]}</button>)}</nav>
        <section style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:22,padding:18,boxShadow:'0 5px 20px #0f172a0b'}}>
          <h2 style={{fontSize:22,fontWeight:900,margin:'0 0 12px'}}>{labels[section]}</h2>
          {section==='feed' ? <><label htmlFor="social-post" style={{display:'block',fontWeight:750,marginBottom:8}}>Che cosa vuoi condividere?</label><textarea id="social-post" value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Scrivi un pensiero per la community…" rows={3} style={{width:'100%',boxSizing:'border-box',border:'1px solid #cbd5e1',borderRadius:14,padding:12,fontSize:16,color:'#0f172a',background:'#fff'}}/><button onClick={publish} style={{marginTop:10,background:'#0891b2',color:'#fff',fontWeight:900,border:0,borderRadius:12,padding:'12px 18px'}}>＋ Crea post di prova</button>{posts.map(p=><article key={p.id} style={{borderTop:'1px solid #e2e8f0',paddingTop:12,marginTop:14,whiteSpace:'pre-wrap'}}>{p.text}</article>)}</> :
          <div style={{border:'1px dashed #94a3b8',borderRadius:16,padding:18,color:'#475569',lineHeight:1.6}}>{section==='gruppi'?'Spazio dedicato a community e gruppi tematici.':section==='video'?'Area prevista per video, dirette e contenuti della community.':'Area prevista per profilo, foto e impostazioni personali.'}<br/><strong>Questa sezione è una bozza grafica:</strong> le funzioni online saranno attivate con account, database e controlli di sicurezza.</div>}
          <p role="status" style={{fontSize:12,color:'#475569',lineHeight:1.5,marginBottom:0,marginTop:14}}>{notice}</p>
        </section>
        <p style={{fontSize:12,color:'#64748b',lineHeight:1.6,marginTop:16}}>Versione iniziale di presentazione, non ancora un social network pubblico: non creare o inserire dati personali sensibili. Registrazione, moderazione, privacy e pubblicazione online devono essere implementate e verificate prima del lancio.</p>
      </div>
    </main>
  </>;
}