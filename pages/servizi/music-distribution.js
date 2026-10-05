import Head from 'next/head';

const modules = [
  ['🎤','Artisti','Profilo artista, catalogo, releases e documentazione.'],
  ['🏷️','Label','Gestione cataloghi e releases per etichette indipendenti e internazionali.'],
  ['📀','Release Manager','Singoli, EP, album, copertine, metadati e stato della pubblicazione.'],
  ['🌍','Distribuzione','Territori, canali e partner di distribuzione configurabili per ogni release.'],
  ['💿','Fisico','CD e altri prodotti fisici collegabili a RiverSpendShop, con produzione e fulfillment da integrare.'],
  ['🛡️','Rights Check','Controllo di titolarità, autorizzazioni, territori e stato della documentazione prima della vendita.'],
  ['💰','Royalty Engine','Vendite, commissioni, quote degli aventi diritto e rendicontazione.'],
  ['⭐','RiverSpend Originals','Progetti commissionati da RiverSpend con accordi specifici su diritti e compensi.']
];

export default function MusicDistribution() {
  return <>
    <Head><title>RiverSpend Music Distribution</title><meta name="description" content="RiverSpend Music — distribuzione musicale per artisti e label." /></Head>
    <main style={{minHeight:'100vh',background:'linear-gradient(135deg,#ecfeff,#fff)',color:'#0f172a',padding:'24px',fontFamily:'system-ui'}}>
      <div style={{maxWidth:1100,margin:'0 auto'}}>
        <a href="/servizi/music" style={{color:'#0f766e',fontWeight:800}}>← RiverSpend Music</a>
        <header style={{marginTop:22,borderRadius:28,padding:30,background:'#083344',color:'white'}}>
          <div style={{fontSize:13,letterSpacing:2,color:'#67e8f9',fontWeight:900}}>RIVERSPEND MUSIC DISTRIBUTION</div>
          <h1 style={{fontSize:40,margin:'8px 0'}}>🌍 La tua musica. Il tuo catalogo. La tua distribuzione.</h1>
          <p style={{fontSize:18,lineHeight:1.6,color:'#cffafe',maxWidth:850}}>Una struttura pensata per artisti e label internazionali. RiverSpend distribuisce e vende secondo gli accordi sottoscritti; la proprietà dei diritti non viene modificata automaticamente.</p>
        </header>
        <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:14,marginTop:20}}>
          {modules.map(([icon,title,description])=><article key={title} style={{background:'white',border:'1px solid #bae6fd',borderRadius:20,padding:20,boxShadow:'0 8px 25px rgba(15,23,42,.06)'}}><div style={{fontSize:30}}>{icon}</div><h2 style={{fontSize:20,margin:'8px 0'}}>{title}</h2><p style={{color:'#475569',lineHeight:1.5,margin:0}}>{description}</p></article>)}
        </section>
        <section style={{marginTop:20,background:'white',border:'1px solid #cbd5e1',borderRadius:22,padding:22}}>
          <h2 style={{marginTop:0}}>🚦 Flusso di pubblicazione</h2>
          <div style={{display:'grid',gap:10,color:'#334155'}}>
            <div>1️⃣ Artista/Label crea la release</div><div>2️⃣ Upload master + copertina + metadati</div><div>3️⃣ Rights Check e verifica documenti</div><div>4️⃣ Approvazione della release</div><div>5️⃣ Distribuzione nei canali/territori autorizzati</div><div>6️⃣ Vendite e ordini fisici su RiverSpendShop</div><div>7️⃣ Calcolo commissioni e royalty</div><div>8️⃣ Rendiconto artista/label</div>
          </div>
        </section>
        <section style={{marginTop:20,borderRadius:22,padding:22,background:'#fff7ed',border:'1px solid #fed7aa'}}>
          <strong>🛡️ Regola fondamentale</strong>
          <p style={{lineHeight:1.6,marginBottom:0}}>SIAE, Soundreef e gli altri organismi/partner verranno collegati solo attraverso procedure o integrazioni ufficiali. I diritti di artisti e label saranno gestiti in base ai contratti e alle autorizzazioni effettivamente disponibili.</p>
        </section>
      </div>
    </main>
  </>;
}
