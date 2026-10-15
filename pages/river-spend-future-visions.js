import Head from 'next/head';

const visions = [
  { id: 'aircraft', number: '01', icon: '✈', title: 'Aerei del futuro', subtitle: 'RiverSky', category: 'Mobilità aerea', text: 'Velivoli dal design originale, con propulsione e sistemi energetici da studiare per viaggi più silenziosi ed efficienti.', art: 'air' },
  { id: 'trains', number: '02', icon: '🚄', title: 'Treni del futuro', subtitle: 'RiverRail', category: 'Mobilità ferroviaria', text: 'Convogli dal profilo innovativo, interni riconfigurabili e connessioni intelligenti tra città e comunità.', art: 'train' },
  { id: 'trucks', number: '03', icon: '🚛', title: 'Camion del futuro', subtitle: 'RiverHaul', category: 'Logistica', text: 'Veicoli per merci con architettura aerodinamica, sistemi di assistenza avanzati e soluzioni energetiche da valutare.', art: 'truck' },
  { id: 'rescue', number: '04', icon: '✚', title: 'RSUS-10 · Primo soccorso', subtitle: 'Soccorso del futuro', category: 'Emergenze', text: 'Un mezzo di soccorso futuristico, non un’ambulanza tradizionale: cabina medica avanzata e supporto aereo come obiettivi concettuali.', art: 'rescue' },
  { id: 'jetpack', number: '05', icon: '🚀', title: 'RSUS-15 · Unità Jetpack', subtitle: 'Intervento rapido dall’alto', category: 'Soccorso speciale', text: 'Una squadra concettuale che raggiunge aree difficili senza paracadute. Fattibilità e sicurezza devono ancora essere verificate.', art: 'jet' },
  { id: 'droid', number: '06', icon: '🤖', title: 'RiveR A1A1', subtitle: 'Droide di assistenza', category: 'Robotica personale', text: 'Un concept di droide pensato per affiancare la persona nelle attività quotidiane, mantenendo autonomia e dignità umana.', art: 'robot' },
  { id: 'phone', number: '07', icon: '📱', title: 'FuturPhone RiveR1one', subtitle: 'Il mondo RiverSpend in un dispositivo', category: 'Tecnologia personale', text: 'Uno smartphone con identità visiva originale e possibile integrazione di Hey River e dei servizi RiverSpend.', art: 'phone' },
  { id: 'city', number: '08', icon: '🏙', title: 'RiverSpend Future City', subtitle: 'Una città pensata per il domani', category: 'Città e infrastrutture', text: 'Architetture, spazi pubblici e servizi progettati attorno a persone, accessibilità, ambiente e resilienza.', art: 'city' },
  { id: 'energy', number: '09', icon: '⚡', title: 'RS Energy Futures', subtitle: 'Nuove idee per l’energia', category: 'Energia', text: 'Concept per sistemi energetici integrati e puliti, da valutare per impatto, costi e reale fattibilità.', art: 'energy' },
  { id: 'ecology', number: '10', icon: '🌊', title: 'RS Ecology Futures', subtitle: 'Tecnologia al servizio della natura', category: 'Ambiente', text: 'Idee per proteggere fiumi, mari e biodiversità con soluzioni innovative da progettare e testare.', art: 'ecology' },
  { id: 'rsus', number: '11', icon: '🛡', title: 'RSUS · Unità Sicura', subtitle: 'I Protettori, guardiani della città', category: 'Protezione e comunità', text: 'Un sistema futuro di assistenza e coordinamento per gli spazi RiverSpend, con responsabilità umana e rispetto della privacy.', art: 'security' },
  { id: 'transport', number: '12', icon: '🚈', title: 'Trasporto urbano futuro', subtitle: 'Connessioni più intelligenti', category: 'Mobilità urbana', text: 'Nuovi concept di trasporto integrato e accessibile, progettati per ridurre ingombri e impatto ambientale.', art: 'urban' },
];

function ConceptArt({ item }) {
  return (
    <div className={'concept-art art-' + item.art} aria-label={'Illustrazione concettuale: ' + item.title}>
      <div className="art-grid" />
      <div className="art-orb" />
      <div className="art-object">{item.icon}</div>
      <div className="art-river">RS</div>
      <span className="art-label">RIVERSPEND · FUTURE VISIONS</span>
      <span className="art-index">{item.number}</span>
    </div>
  );
}

export default function RiverSpendFutureVisions() {
  return (
    <>
      <Head>
        <title>RiverSpend Future Visions</title>
        <meta name="description" content="RiverSpend Future Visions: concept originali per mobilità, robotica, soccorso, città ed energia del futuro." />
        <meta name="theme-color" content="#061923" />
      </Head>
      <main className="fv-page">
        <header className="fv-header">
          <a className="fv-brand" href="/">RiverSpend <span>YOUR SHOP • YOUR FLOW</span></a>
          <a className="fv-back" href="/river-spend-future-city">← RiverSpend Future City</a>
        </header>
        <section className="fv-hero">
          <div className="fv-hero-copy">
            <span className="fv-eyebrow">RSFV · CONCEPT ORIGINALI</span>
            <h1>RiverSpend <em>Future Visions</em></h1>
            <p>Non riproporre ciò che già esiste: immaginare nuove forme, nuove tecnologie e nuovi modi di aiutare le persone. Ogni scheda è un concept da studiare, non un prodotto già disponibile.</p>
            <a className="fv-cta" href="#visions">Esplora le visioni ↓</a>
          </div>
          <div className="fv-hero-art">
            <div className="fv-cityline"><i/><i/><i/><i/><i/><i/><i/><i/></div>
            <div className="fv-river-mark">〰</div>
            <div className="fv-hero-title">IL FUTURO<br/><strong>PRENDE FORMA</strong></div>
            <span className="fv-hero-note">IDEA · DESIGN · FATTIBILITÀ</span>
          </div>
        </section>
        <section className="fv-principles">
          <div><b>01</b><span><strong>Immaginare</strong><small>Concept originali e riconoscibili</small></span></div>
          <div><b>02</b><span><strong>Progettare</strong><small>Studio tecnico e sostenibilità</small></span></div>
          <div><b>03</b><span><strong>Verificare</strong><small>Sicurezza, costi e fattibilità</small></span></div>
        </section>
        <section id="visions" className="fv-gallery">
          <div className="fv-section-head"><div><span className="fv-eyebrow">IL CATALOGO DEL DOMANI</span><h2>Le nostre visioni</h2></div><span className="fv-count">12 CONCEPT</span></div>
          <div className="fv-grid">
            {visions.map(item => <article className="fv-card" key={item.id}>
              <ConceptArt item={item} />
              <div className="fv-card-body">
                <div className="fv-card-meta"><span>{item.category}</span><span>CONCEPT</span></div>
                <h3>{item.title}</h3><h4>{item.subtitle}</h4><p>{item.text}</p>
                <div className="fv-card-foot"><span>Da sviluppare e verificare</span><span>↗</span></div>
              </div>
            </article>)}
          </div>
        </section>
        <footer className="fv-footer"><span className="fv-footer-logo">RiverSpend <b>Future Visions</b></span><p>Idee per il futuro, con i piedi per terra oggi.</p><small>Tutti i contenuti sono concept illustrativi. Le prestazioni ipotizzate richiedono progettazione, verifiche tecniche e autorizzazioni prima di un’eventuale realizzazione.</small></footer>
      </main>
      <style jsx>{`
        .fv-page{min-height:100vh;background:#04131b;color:#f4fbff;font-family:Arial,Helvetica,sans-serif}
        .fv-header{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px clamp(18px,5vw,72px);border-bottom:1px solid #123d4d;background:#061923}
        .fv-brand{font-size:23px;font-weight:900;color:#fff;text-decoration:none;letter-spacing:-.7px}.fv-brand span{display:block;font-size:9px;letter-spacing:2px;color:#8feafa;margin-top:4px}
        .fv-back{color:#bceff8;text-decoration:none;border:1px solid #23677a;border-radius:99px;padding:10px 15px;font-size:12px;font-weight:700}
        .fv-hero{padding:clamp(34px,6vw,82px) clamp(18px,5vw,72px);display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:center;background:radial-gradient(ellipse at 80% 30%,#0b4656 0%,transparent 48%),linear-gradient(130deg,#071f2a,#06131b 70%)}
        .fv-eyebrow{color:#65e8f6;font-size:11px;letter-spacing:2.5px;font-weight:900}.fv-hero h1{font-size:clamp(38px,5.4vw,76px);line-height:.98;letter-spacing:-2.5px;margin:18px 0}.fv-hero h1 em{display:block;color:#5de2f2;font-style:normal}.fv-hero p{max-width:610px;color:#c4d8df;font-size:16px;line-height:1.7}.fv-cta{display:inline-block;margin-top:14px;background:#5ce5f2;color:#03151b;padding:13px 20px;border-radius:99px;text-decoration:none;font-weight:900}
        .fv-hero-art{position:relative;min-height:320px;overflow:hidden;border:1px solid #1c7183;border-radius:28px;background:linear-gradient(160deg,rgba(18,94,114,.4),rgba(3,15,24,.95)),radial-gradient(ellipse at 50% 80%,#13647b,transparent 58%);box-shadow:0 20px 70px #0008}
        .fv-cityline{position:absolute;inset:18% 4% 18%;display:flex;align-items:end;justify-content:center;gap:8px;border-bottom:2px solid #50e6fa;transform:perspective(350px) rotateX(4deg)}
        .fv-cityline i{display:block;width:9%;height:var(--h,60%);background:linear-gradient(#1d6377,#0b2430);border:1px solid #2dbbd1;box-shadow:0 0 18px #12a8d566;clip-path:polygon(15% 0,85% 0,100% 100%,0 100%)}
        .fv-cityline i:nth-child(1){height:45%}.fv-cityline i:nth-child(2){height:72%}.fv-cityline i:nth-child(3){height:55%}.fv-cityline i:nth-child(4){height:90%}.fv-cityline i:nth-child(5){height:65%}.fv-cityline i:nth-child(6){height:80%}.fv-cityline i:nth-child(7){height:50%}.fv-cityline i:nth-child(8){height:68%}
        .fv-river-mark{position:absolute;right:12%;top:5%;font-size:80px;color:#63ecf5;text-shadow:0 0 24px #12d9f5;transform:rotate(-12deg)}
        .fv-hero-title{position:absolute;left:8%;bottom:13%;font-size:clamp(18px,2.2vw,29px);font-weight:900;line-height:1.05;text-shadow:0 2px 12px #000}.fv-hero-title strong{color:#67e8f9}.fv-hero-note{position:absolute;right:7%;bottom:7%;font-size:9px;letter-spacing:2px;color:#b4f5ff}
        .fv-principles{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#164150;border-top:1px solid #164150;border-bottom:1px solid #164150}.fv-principles>div{display:flex;align-items:center;gap:15px;padding:22px clamp(16px,4vw,54px);background:#071d27}.fv-principles b{font-size:28px;color:#4edceb}.fv-principles strong,.fv-principles small{display:block}.fv-principles strong{font-size:14px}.fv-principles small{margin-top:5px;color:#9dbbc5;font-size:11px}
        .fv-gallery{padding:58px clamp(16px,4vw,58px) 76px;max-width:1600px;margin:auto}.fv-section-head{display:flex;align-items:end;justify-content:space-between;margin-bottom:25px;gap:15px}.fv-section-head h2{font-size:clamp(29px,4vw,44px);margin:8px 0 0;letter-spacing:-1px}.fv-count{border:1px solid #1d6374;color:#8deaf5;padding:9px 12px;border-radius:99px;font-size:10px;letter-spacing:1.5px;font-weight:900}
        .fv-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}.fv-card{overflow:hidden;border:1px solid #174657;border-radius:18px;background:linear-gradient(160deg,#0a2935,#06151e);transition:transform .2s,border-color .2s}.fv-card:hover{transform:translateY(-3px);border-color:#41d9ed}
        .concept-art{height:225px;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at 50% 80%,#126277,#061923 68%)}.art-grid{position:absolute;inset:0;background-image:linear-gradient(#42c8dc18 1px,transparent 1px),linear-gradient(90deg,#42c8dc18 1px,transparent 1px);background-size:28px 28px;transform:perspective(230px) rotateX(12deg) scale(1.2);transform-origin:bottom}
        .art-orb{position:absolute;width:170px;height:170px;border:1px solid #48d9eb66;border-radius:50%;box-shadow:0 0 35px #08d4f433,inset 0 0 35px #08d4f422}.art-object{position:relative;font-size:88px;filter:drop-shadow(0 0 20px #22dff6aa);z-index:1}.art-river{position:absolute;right:14px;top:4px;font-size:36px;font-weight:900;font-style:italic;color:#75f2f8;opacity:.75}.art-label{position:absolute;left:14px;bottom:12px;font-size:8px;letter-spacing:1.6px;color:#b4f4fb}.art-index{position:absolute;right:14px;bottom:10px;font-size:28px;font-weight:900;color:#fff5}
        .art-air{background:radial-gradient(ellipse at 55% 65%,#0e6982,#061923 70%)}.art-train{background:radial-gradient(ellipse at 50% 80%,#155e77,#061923 70%)}.art-truck{background:radial-gradient(ellipse at 50% 80%,#5b512b,#061923 70%)}.art-rescue{background:radial-gradient(ellipse at 50% 80%,#164e69,#061923 70%)}.art-jet{background:radial-gradient(ellipse at 50% 70%,#155a80,#061923 70%)}.art-robot{background:radial-gradient(ellipse at 50% 70%,#0f6567,#061923 70%)}.art-phone{background:radial-gradient(ellipse at 50% 70%,#1b4d82,#061923 70%)}.art-city{background:radial-gradient(ellipse at 50% 70%,#0f6370,#061923 70%)}.art-energy{background:radial-gradient(ellipse at 50% 70%,#645a21,#061923 70%)}.art-ecology{background:radial-gradient(ellipse at 50% 70%,#12634e,#061923 70%)}.art-security{background:radial-gradient(ellipse at 50% 70%,#184a70,#061923 70%)}.art-urban{background:radial-gradient(ellipse at 50% 70%,#126071,#061923 70%)}
        .fv-card-body{padding:18px}.fv-card-meta{display:flex;justify-content:space-between;gap:8px;color:#6fe5f3;font-size:9px;letter-spacing:1px;text-transform:uppercase;font-weight:900}.fv-card-meta span:last-child{color:#e6c97b}.fv-card h3{font-size:20px;line-height:1.2;margin:13px 0 5px}.fv-card h4{font-size:12px;color:#9fe9f1;margin:0;font-weight:700}.fv-card p{min-height:70px;color:#b9cdd4;font-size:13px;line-height:1.65;margin:13px 0 18px}.fv-card-foot{display:flex;justify-content:space-between;border-top:1px solid #16404e;padding-top:12px;color:#85aab5;font-size:10px}.fv-card-foot span:last-child{color:#5de2f2;font-size:18px}
        .fv-footer{padding:30px clamp(18px,5vw,72px);border-top:1px solid #164150;background:#031018;text-align:center}.fv-footer-logo{font-size:20px;font-weight:900}.fv-footer-logo b{color:#65e8f6}.fv-footer p{color:#b8d4dc}.fv-footer small{display:block;max-width:850px;margin:15px auto 0;color:#7797a2;line-height:1.6}
        @media(max-width:900px){.fv-hero{grid-template-columns:1fr}.fv-hero-art{min-height:260px}.fv-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.fv-principles>div{padding:18px 14px}}
        @media(max-width:560px){.fv-header{align-items:flex-start;flex-direction:column}.fv-grid{grid-template-columns:1fr}.concept-art{height:210px}.fv-principles{grid-template-columns:1fr}.fv-principles>div{padding:14px 20px}.fv-card p{min-height:0}.fv-hero h1{letter-spacing:-1.5px}}
      `}</style>
    </>
  );
}
