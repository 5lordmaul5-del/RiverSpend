'use client';

import { useState } from 'react';
import SplashScreen from './SplashScreen';

const areas = [
  ['👤','Profilo','Account, dati personali e attività','profilo'],
  ['🎢','RS Park','Parco, attrazioni e esperienze','park'],
  ['⭐','RS Fidelity','Punti, premi e vantaggi','fidelity'],
  ['📺','RS Media / Broadcast','Video, dirette e contenuti','media'],
  ['🛡️','RS Shield','Protezione e assistenza','shield'],
  ['💳','RS Pay','Pagamenti e RiverMoney','pay'],
  ['📦','RS Box','Spedizioni e consegne','box'],
  ['🛍️','RiverSpendShop','Marketplace e prodotti','shop'],
  ['🔮','RS Oracle','Informazioni e strumenti intelligenti','oracle'],
  ['🌊','RS Experience','Esperienze e audio immersivo','experience'],
  ['♻️','RS Ecology','Ambiente e sostenibilità','ecology'],
  ['🏰','RS Fortress','Sicurezza dell’ecosistema','fortress'],
  ['🔧','RS Recovery','Recupero e supporto','recovery'],
  ['🚗','RS Local / Park','Servizi e attività locali','local'],
];

const attractions = [
  'Megalodonte','RiverStorm','Volcano Escape','SkyRocket','RiverRacer',
  'Dark River','Lost Temple','Pirate River','Dragon Flight','Ice Mountain',
  'Avalanche','Canyon Run','SkyWalk','River Rafting Extreme',
  'Water Cannon Battle','Jungle Splash','Robot Factory','Cyber River',
  'Moon Mission','Mars Explorer','Time Machine','RiverSpend Infinity',
  'The Minator','Velocity — The Power of Speed','Viking Norway Rune'
];

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeArea, setActiveArea] = useState('home');
  const [activeAttraction, setActiveAttraction] = useState('');

  const openArea = (id) => {
    setActiveArea(id);
    setActiveAttraction('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const current = areas.find((area) => area[3] === activeArea);

  return (
    <main style={{ minHeight: '100vh', background: '#f2fbfd', color: '#12343b', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {showSplash && <SplashScreen onEnter={() => setShowSplash(false)} />}
      <div style={{ opacity: showSplash ? 0 : 1, pointerEvents: showSplash ? 'none' : 'auto', transition: 'opacity 700ms' }}>
        <header style={{ position:'sticky', top:0, zIndex:10, background:'#fff', borderBottom:'1px solid #d5edf2', padding:'13px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <button onClick={() => openArea('home')} style={buttonStyle}>⌂ Home</button>
          <strong style={{fontSize:25,color:'#08a7cf'}}>RiverSpend</strong>
          <button onClick={() => openArea('profilo')} style={buttonStyle}>👤 Profilo</button>
        </header>

        <section style={{maxWidth:1100, margin:'0 auto', padding:'24px 16px'}}>
          {activeArea === 'home' ? <>
            <div style={{background:'linear-gradient(120deg,#d9f7fb,#fff)',border:'1px solid #c5eaf0',borderRadius:22,padding:22,marginBottom:22}}>
              <div style={{fontSize:12,fontWeight:800,letterSpacing:2,color:'#087f9e'}}>YOUR SHOP • YOUR FLOW</div>
              <h1 style={{fontSize:32,margin:'8px 0',color:'#073b52'}}>Entra nell’ecosistema RiverSpend</h1>
              <p style={{margin:0,color:'#55747c'}}>Scegli un’area per entrare nella sua sezione.</p>
            </div>
            <h2 style={{fontSize:23}}>Tutte le aree RS</h2>
            <div style={gridStyle}>
              {areas.map(([icon,name,desc,id]) => <button key={id} onClick={() => openArea(id)} style={cardStyle}>
                <span style={{fontSize:28}}>{icon}</span><strong style={{fontSize:17}}>{name}</strong><span style={{fontSize:13,color:'#64818a'}}>{desc}</span><span style={{color:'#0789a8',fontWeight:700}}>Apri area →</span>
              </button>)}
            </div>
          </> : activeArea === 'park' ? <>
            <button onClick={() => openArea('home')} style={buttonStyle}>← Tutte le aree RS</button>
            <h1 style={{fontSize:32,color:'#087f9e'}}>🎢 RS Park</h1>
            <p>Seleziona un’attrazione per aprire la sua scheda.</p>
            {activeAttraction ? <div style={cardStyle}>
              <button onClick={() => setActiveAttraction('')} style={buttonStyle}>← Tutte le attrazioni</button>
              <h2>{activeAttraction}</h2>
              <div style={{background:'#e3f5f7',borderRadius:14,padding:28,textAlign:'center',color:'#527780'}}>Foto dell’attrazione da inserire</div>
              <h3>Descrizione</h3><p>Scheda dell’attrazione da completare con descrizione, esperienza e ambientazione.</p>
              <h3>Sviluppo futuro e sicurezza</h3><p>Specifiche tecniche, accessibilità, procedure e sistemi Power Shield da progettare.</p>
            </div> : <div style={gridStyle}>
              {attractions.map((name) => <button key={name} onClick={() => setActiveAttraction(name)} style={cardStyle}><span style={{fontSize:24}}>🎢</span><strong>{name}</strong><span style={{color:'#0789a8'}}>Apri scheda →</span></button>)}
            </div>}
          </> : <>
            <button onClick={() => openArea('home')} style={buttonStyle}>← Tutte le aree RS</button>
            <div style={{...cardStyle,marginTop:18}}>
              <div style={{fontSize:32}}>{current?.[0]}</div>
              <h1 style={{fontSize:30,color:'#087f9e'}}>{current?.[1] || 'Area RiverSpend'}</h1>
              <p>{current?.[2]}</p>
              <p style={{background:'#fff8e6',padding:14,borderRadius:12,color:'#765b1c'}}>Sezione predisposta: le funzioni specifiche verranno collegate e verificate prima della pubblicazione.</p>
              <button onClick={() => openArea('park')} style={buttonStyle}>Vai a RS Park</button>
            </div>
          </>}
        </section>
      </div>
    </main>
  );
}

const buttonStyle = {border:'1px solid #b9e1e9',borderRadius:12,background:'#fff',padding:'10px 14px',fontWeight:700,color:'#087f9e',cursor:'pointer'};
const cardStyle = {display:'flex',flexDirection:'column',alignItems:'flex-start',gap:10,textAlign:'left',padding:18,border:'1px solid #d2e8ed',borderRadius:16,background:'#fff',boxShadow:'0 4px 14px rgba(0,80,100,.06)',cursor:'pointer'};
const gridStyle = {display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:12};
