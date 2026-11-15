import Head from 'next/head';

export default function RiverSSPrint() {
  return (
    <>
      <Head>
        <title>RiverSS Print | RiverSpend</title>
        <meta name="description" content="RiverSS Print: il progetto RiverSpend per la stampa personalizzata." />
        <meta name="theme-color" content="#071a36" />
        <link rel="icon" href="/icons/river-ss-print.svg" type="image/svg+xml" />
      </Head>
      <main style={{minHeight:'100vh',background:'radial-gradient(ellipse at top,#123f76 0%,#071426 65%)',color:'#fff',padding:'32px 18px',fontFamily:'Arial,sans-serif'}}>
        <div style={{maxWidth:850,margin:'0 auto'}}>
          <a href="/app" style={{color:'#8beaff',textDecoration:'none',fontWeight:700}}>← Torna alle app RiverSpend</a>
          <section style={{textAlign:'center',padding:'58px 12px 36px'}}>
            <img src="/icons/river-ss-print.svg" alt="RiverSS Print" width="148" height="148" style={{width:148,height:148,margin:'0 auto 22px'}} />
            <div style={{color:'#8beaff',fontSize:13,fontWeight:800,letterSpacing:3}}>RIVERSPEND · NUOVO PROGETTO</div>
            <h1 style={{fontSize:'clamp(34px,7vw,58px)',fontWeight:900,margin:'12px 0'}}>RiverSS Print</h1>
            <p style={{fontSize:19,lineHeight:1.6,color:'#dbeafe',maxWidth:650,margin:'0 auto'}}>Il futuro spazio RiverSpend dedicato alla stampa personalizzata e ai prodotti stampati.</p>
            <div style={{display:'inline-block',marginTop:24,padding:'10px 18px',border:'1px solid #fbbf24',borderRadius:999,color:'#fde68a',fontWeight:800}}>IN PROGETTAZIONE</div>
          </section>
          <section style={{background:'rgba(255,255,255,.07)',border:'1px solid rgba(139,234,255,.25)',borderRadius:22,padding:24,lineHeight:1.7}}>
            <h2 style={{fontSize:22,marginTop:0}}>Cosa stiamo preparando</h2>
            <p style={{color:'#dbeafe'}}>RiverSS Print è stato inserito nell'ecosistema. Catalogo, personalizzazione grafica, preventivi, ordini, pagamenti e produzione non sono ancora attivi: saranno progettati e verificati prima del lancio.</p>
            <p style={{color:'#fde68a',marginBottom:0}}>Questa pagina presenta il progetto e non accetta ordini.</p>
          </section>
        </div>
      </main>
    </>
  );
}
