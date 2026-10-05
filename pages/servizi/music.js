import Head from 'next/head';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function RiverSpendMusic() {
  const [catalog, setCatalog] = useState([]);
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [version, setVersion] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadCatalog() {
    const response = await fetch('/api/music');
    const data = await response.json();
    if (response.ok) setCatalog(data);
  }

  useEffect(() => { loadCatalog(); }, []);

  async function registerWork(e) {
    e.preventDefault();
    setBusy(true); setMessage('');
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        setMessage('🔐 Devi accedere a RiverSpend per registrare una nuova opera.');
        return;
      }
      const response = await fetch('/api/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ title, genre, version })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registrazione non riuscita.');
      setTitle(''); setGenre(''); setVersion('');
      setMessage('✅ Opera registrata. Autore e titolare preimpostati: Maurizio Lella. Stato Soundreef: non ancora inviata.');
      await loadCatalog();
    } catch (error) {
      setMessage('⚠️ ' + error.message);
    } finally {
      setBusy(false);
    }
  }

  return <>
    <Head><title>RiverSpend Music</title><meta name="description" content="RiverSpend Music — opere originali, diritti e flusso Soundreef-ready." /></Head>
    <main style={{minHeight:'100vh',background:'linear-gradient(135deg,#ecfeff,#ffffff)',color:'#0f172a',padding:'24px',fontFamily:'system-ui'}}>
      <div style={{maxWidth:1050,margin:'0 auto'}}>
        <a href="/" style={{color:'#0f766e',fontWeight:800}}>← RiverSpendShop</a>
        <div style={{marginTop:24,borderRadius:28,padding:28,background:'#083344',color:'white'}}>
          <div style={{fontSize:14,letterSpacing:2,color:'#67e8f9',fontWeight:800}}>RIVERSPEND MUSIC</div>
          <h1 style={{fontSize:40,margin:'8px 0'}}>🎵 La musica del Fiume</h1>
          <p style={{fontSize:18,lineHeight:1.6,color:'#cffafe'}}>Ogni opera originale RiverSpend nasce con una scheda diritti strutturata e con Maurizio Lella preimpostato come autore/titolare secondo la configurazione del catalogo.</p>
        </div>

        <section style={{marginTop:20,borderRadius:22,padding:22,background:'white',border:'1px solid #a5f3fc',boxShadow:'0 8px 25px rgba(15,23,42,.08)'}}>
          <h2 style={{marginTop:0}}>🎼 Registra nuova opera RiverSpend</h2>
          <p style={{color:'#475569'}}>Questa fase crea il registro interno. Il collegamento automatico a Soundreef verrà attivato solo con un'integrazione ufficiale/autorizzata.</p>
          <form onSubmit={registerWork} style={{display:'grid',gap:10}}>
            <input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="Titolo del brano" style={{padding:12,border:'1px solid #cbd5e1',borderRadius:12}} />
            <input value={version} onChange={e=>setVersion(e.target.value)} placeholder="Versione (opzionale)" style={{padding:12,border:'1px solid #cbd5e1',borderRadius:12}} />
            <input value={genre} onChange={e=>setGenre(e.target.value)} placeholder="Genere (opzionale)" style={{padding:12,border:'1px solid #cbd5e1',borderRadius:12}} />
            <div style={{padding:12,borderRadius:12,background:'#f0fdfa'}}>👤 <strong>Autore:</strong> Maurizio Lella · <strong>Titolare:</strong> Maurizio Lella · <strong>Soundreef:</strong> non inviata</div>
            <button disabled={busy} style={{padding:14,border:0,borderRadius:14,background:'#0891b2',color:'white',fontWeight:900}}>{busy ? '⏳ Registrazione...' : '🎵 Registra opera'}</button>
          </form>
          {message && <p style={{marginBottom:0,fontWeight:700}}>{message}</p>}
        </section>

        <section style={{marginTop:20,borderRadius:22,padding:22,background:'#f8fafc',border:'1px solid #cbd5e1'}}>
          <h2 style={{marginTop:0}}>📀 Catalogo RiverSpend Original</h2>
          {catalog.length ? catalog.map(work => <article key={work.id} style={{background:'white',border:'1px solid #e2e8f0',borderRadius:16,padding:16,marginTop:10}}>
            <strong>🎵 {work.title}</strong>
            <div style={{fontSize:14,color:'#475569',marginTop:5}}>Autore: {work.author_name} · Titolare: {work.rights_holder_name} · Soundreef: {work.soundreef_status}</div>
          </article>) : <p style={{color:'#64748b'}}>Nessun brano pubblicato nel catalogo.</p>}
        </section>

        <section style={{marginTop:20,borderRadius:22,padding:22,background:'#fff7ed',border:'1px solid #fed7aa'}}>
          <strong>🟠 Soundreef-ready</strong>
          <p style={{marginBottom:0,lineHeight:1.6}}>RiverSpend conserva già autore, titolare, stato Soundreef e metadati di registrazione. Non dichiariamo un deposito Soundreef finché non esiste un canale ufficiale di invio.</p>
        </section>
      </div>
    </main>
  </>;
}
