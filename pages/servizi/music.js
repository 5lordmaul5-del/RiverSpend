import Head from 'next/head';

export default function RiverSpendMusic() {
  return <>
    <Head><title>RiverSpend Music</title><meta name="description" content="RiverSpend Music — catalogo, distribuzione e futuro canale musicale." /></Head>
    <main style={{minHeight:'100vh',background:'linear-gradient(135deg,#ecfeff,#ffffff)',color:'#0f172a',padding:'24px',fontFamily:'system-ui'}}>
      <div style={{maxWidth:1050,margin:'0 auto'}}>
        <a href="/" style={{color:'#0f766e',fontWeight:800}}>← RiverSpendShop</a>
        <div style={{marginTop:24,borderRadius:28,padding:28,background:'#083344',color:'white'}}>
          <div style={{fontSize:14,letterSpacing:2,color:'#67e8f9',fontWeight:800}}>RIVERSPEND MUSIC</div>
          <h1 style={{fontSize:40,margin:'8px 0'}}>🎵 La musica del Fiume</h1>
          <p style={{fontSize:18,lineHeight:1.6,color:'#cffafe'}}>Una sezione dedicata alla musica originale RiverSpend e, in futuro, alla distribuzione degli artisti.</p>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:16,marginTop:20}}>
          {[['🌊 RiverSpend Original','Musica originale creata per RiverSpend, RS Spons, Shop, TV, Park e Experience.'],['📀 Catalogo','Archivio dei brani con autore, titolari, metadati e identificativi.'],['🎤 Artisti','In futuro gli artisti potranno proporre i propri brani e accedere ai servizi di distribuzione RiverSpend.'],['💰 Royalties','Area futura per contabilizzazione, rendicontazione e ripartizione secondo gli accordi.'],['📡 RiverSpend Music Live','Canale futuro per live, streaming e programmi musicali, con gestione delle licenze necessarie.'],['🛡️ RSPC Music Control','Controllo futuro di catalogo, diritti, contratti, utilizzi e report.']].map(([title,text])=><section key={title} style={{background:'white',border:'1px solid #a5f3fc',borderRadius:22,padding:20,boxShadow:'0 8px 25px rgba(15,23,42,.08)'}}><h2 style={{marginTop:0,fontSize:21}}>{title}</h2><p style={{lineHeight:1.6,color:'#475569'}}>{text}</p></section>)}
        </div>
        <section style={{marginTop:20,borderRadius:22,padding:22,background:'#f8fafc',border:'1px solid #cbd5e1'}}>
          <strong>🔐 Fase iniziale</strong><p style={{marginBottom:0,lineHeight:1.6}}>Partiamo esclusivamente dalla musica originale RiverSpend. La gestione dei diritti verrà impostata in modo trasparente e documentato; l'apertura agli artisti e la distribuzione arriveranno in una fase successiva con contratti e licenze adeguati.</p>
        </section>
      </div>
    </main>
  </>;
}
