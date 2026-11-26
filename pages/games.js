import Head from 'next/head';

const titles = [
  {
    id: 'RSGG-001',
    name: 'RiverSpaceGalaxyGames',
    subtitle: 'Universo galattico · Planet E-01',
    description: 'Il primo universo RiverSpend: esplorazione, pianeti, astronavi, droidi, civiltà e agenti AI.',
    status: 'PROTOTIPO WEB IN SVILUPPO',
    href: '/river-space-galaxy-games',
    icon: '🌌',
    featured: true
  }
];

const roadmap = [
  { month: 'NOVEMBRE 2026', label: 'Primo universo', title: 'RiverSpaceGalaxyGames', status: 'Prototipo in sviluppo' },
  { month: 'DICEMBRE 2026', label: 'Nuova uscita mensile', title: 'Titolo in selezione', status: 'Da progettare' },
  { month: 'GENNAIO 2027', label: 'Nuova uscita mensile', title: 'Titolo in selezione', status: 'Da progettare' }
];

export default function RiverSpendGames() {
  return <>
    <Head>
      <title>RiverSpend Games | Un nuovo gioco ogni mese</title>
      <meta name="description" content="Il comparto ufficiale RiverSpend Games: giochi, nuove uscite mensili e catalogo digitale centrale." />
    </Head>
    <main className="games-hub">
      <header className="games-nav">
        <a href="/" className="brand"><span>RS</span> RIVERSPEND <b>GAMES</b></a>
        <nav><a href="#catalogo">Catalogo</a><a href="#classici">Giochi classici</a><a href="#uscite">Uscite mensili</a><a href="/river-space-galaxy-games-shop">GamesShopS</a></nav>
        <a className="shop-button" href="/river-space-galaxy-games-shop">🛒 GamesShopS</a>
      </header>
      <section className="games-hero">
        <div className="hero-orbit orbit-a"></div><div className="hero-orbit orbit-b"></div>
        <div className="hero-copy">
          <span className="eyebrow">RIVERSPEND ENTERTAINMENT</span>
          <h1>Un universo di giochi.<br/><em>Una nuova avventura ogni mese.</em></h1>
          <p>Il comparto Games di RiverSpend raccoglie i nostri giochi, le nuove uscite e i mondi da scoprire. Ogni titolo avrà una propria identità e un catalogo collegato al marketplace centrale.</p>
          <div className="hero-buttons"><a className="gold-button" href="#catalogo">Esplora i giochi →</a><a className="outline-button" href="/river-space-galaxy-games-shop">Apri GamesShopS</a></div>
          <div className="promise"><span>✦</span> OBIETTIVO: 1 NUOVO GIOCO AL MESE</div>
        </div>
        <div className="hero-planet hero-banner game-universe-art" role="img" aria-label="Illustrazione originale dell'universo RiverSpend Games"><div className="art-stars">✦　·　✧　　·　✦　·</div><div className="art-orbit art-orbit-one"></div><div className="art-orbit art-orbit-two"></div><div className="art-planet"></div><div className="art-moon"></div><div className="art-ship">◆</div><span className="planet-label">RIVERSPEND<br/>GAMES UNIVERSE</span></div>
      </section>
      <section className="catalog-section" id="catalogo">
        <div className="section-head"><div><span className="eyebrow">GAMES LIBRARY</span><h2>Il catalogo <em>dei giochi</em></h2></div><span className="count">GIOCHI CLASSICI + MONDO GALAXY</span></div>
        <div className="title-grid">{titles.map(game => <article className="title-card" key={game.id}>
          <div className="cover game-cover-art"><div className="cover-stars">✦　·　✧　✦</div><div className="cover-planet"></div><div className="cover-orbit"></div><span className="cover-title">GALAXY<br/><b>EXPLORER</b></span><small>{game.id}</small></div>
          <div className="title-content"><span className="game-status">{game.status}</span><h3>{game.name}</h3><h4>{game.subtitle}</h4><p>{game.description}</p><a href={game.href} className="play-link">Apri scheda gioco →</a></div>
        </article>)}</div>
      </section>
      <section className="classic-band" id="classici">
        <div><span className="eyebrow">ALL CLASSICS · €1 LIFETIME PASS</span><h2>Giochi classici <em>per tutti.</em></h2><p>Scacchi, battaglia navale, dama, sudoku, mahjong e memory sono giocabili. Un solo pagamento di €1, una tantum, per sbloccare tutti i giochi classici a vita: nessun abbonamento.</p><a href="/games-classics" className="gold-button">Apri il catalogo dei giochi classici →</a></div>
        <div className="classic-icons"><span>♟</span><span>⚓</span><span>♛</span><span>▦</span></div>
      </section>
      <section className="game-worlds" id="generi">
        <div className="section-head"><div><span className="eyebrow">GAMES FOR EVERY GENERATION</span><h2>Ogni genere. <em>Ogni età.</em></h2></div><span className="count">CATALOGO IN ESPANSIONE</span></div>
        <div className="world-grid">
          <article><span>🧩</span><h3>Enigmi & mente</h3><p>Risolvi enigmi, rompicapi, indovinelli, escape room, trova le differenze, memoria e logica.</p></article>
          <article><span>🕹️</span><h3>Arcade anni '80</h3><p>Flipper, Space Invaders, platform, labirinti, corse a punteggio e classici arcade originali.</p></article>
          <article><span>🏎️</span><h3>Sport & motori</h3><p>Calcio, basket, tennis, corse, F1-style, rally, moto e sfide multiplayer.</p></article>
          <article><span>🛡️</span><h3>Azione & strategia</h3><p>War, tattica, missioni, spionaggio e infiltrazione: nuove avventure originali, non copie di titoli protetti.</p></article>
          <article><span>🧸</span><h3>Kids & famiglia</h3><p>Giochi semplici, creativi, educativi e sicuri, con livelli adatti a bambini e famiglie.</p></article>
          <article><span>🌌</span><h3>Avventura & VR</h3><p>Mondi 3D, esplorazione, fantascienza, simulazione e titoli predisposti per visori compatibili.</p></article>
        </div>
      </section>
      <section className="play-anywhere">
        <div><span className="eyebrow">PLAY YOUR WAY</span><h2>Gioca sul tuo schermo.<br/><em>Porta il gioco sul grande schermo.</em></h2><p>Progettiamo un comparto per collegare RiverSpend Games a TV e PC tramite rete Wi-Fi, Bluetooth e tecnologie di proiezione compatibili; supporto per controller, cuffie e visori VR quando il dispositivo e il gioco lo consentono.</p></div>
        <div className="connect-grid"><span>📶<b>Wi-Fi / rete locale</b></span><span>🔵<b>Bluetooth</b></span><span>📺<b>TV / proiettore</b></span><span>🖥️<b>PC</b></span><span>🥽<b>Visori VR</b></span><span>🎧<b>Cuffie & audio</b></span></div>
        <small>Compatibilità e funzioni da verificare per ogni dispositivo. Il collegamento non è ancora attivo in questa versione.</small>
      </section>
      <section className="release-section" id="uscite">
        <div className="section-head"><div><span className="eyebrow">MONTHLY RELEASE PLAN</span><h2>Un gioco <em>ogni mese</em></h2></div><p>Calendario di pianificazione. Una nuova uscita sarà annunciata quando il gioco avrà superato i test di qualità.</p></div>
        <div className="release-list">{roadmap.map((item,index)=><article className="release-item" key={item.month}><div className="release-date"><b>{item.month}</b><span>{item.label}</span></div><div className="release-title"><span>0{index+1}</span><h3>{item.title}</h3></div><div className="release-status">{item.status}</div></article>)}</div>
      </section>
      <section className="commerce-band"><div><span className="eyebrow">ONE SHOP · ALL GAMES</span><h2>Un solo negozio per<br/><em>tutti i nostri giochi.</em></h2><p>Articoli digitali, espansioni, personaggi, veicoli, droidi e contenuti: il punto commerciale comune sarà RiverSpendGamesShopS dentro RiverSpendShop.</p><a href="/river-space-galaxy-games-shop" className="gold-button">Entra in GamesShopS →</a></div><div className="commerce-art"><span>🛸</span><b>GAME MARKETPLACE</b><small>RIVERSPENDSHOP.COM</small></div></section>
      <footer><a href="/">← RiverSpendShop</a><span>RIVERSPEND GAMES · HUB 1.0</span><a href="/ecosistema">Ecosistema RiverSpend →</a></footer>
    </main>
    <style jsx global>{`
      *{box-sizing:border-box}.games-hub{min-height:100vh;background:#071629;color:#eff7fc;font-family:Inter,system-ui,sans-serif;overflow:hidden}.games-hub a{text-decoration:none}.games-nav{height:72px;padding:0 clamp(18px,5vw,72px);display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(143,188,216,.16);background:#071629}.brand{font-weight:950;letter-spacing:1.5px;color:white;font-size:13px;display:flex;align-items:center;gap:10px}.brand span{width:34px;height:34px;border:1px solid #edc56d;border-radius:10px;display:grid;place-items:center;color:#edc56d}.brand b{color:#edc56d}.games-nav nav{display:flex;gap:25px}.games-nav nav a{font-size:12px;color:#abc2d2}.shop-button{background:#edc56d;color:#10243a;padding:11px 15px;border-radius:8px;font-size:11px;font-weight:900}.games-hero{min-height:560px;position:relative;display:grid;grid-template-columns:1.1fr .9fr;align-items:center;max-width:1320px;margin:auto;padding:65px clamp(20px,6vw,88px);background:radial-gradient(ellipse at 75% 45%,rgba(16,104,143,.22),transparent 44%)}.hero-copy{position:relative;z-index:2}.eyebrow{color:#edc56d;font-size:10px;letter-spacing:2.5px;font-weight:900}.games-hero h1{font-size:clamp(40px,5.8vw,72px);line-height:1.02;letter-spacing:-3px;margin:20px 0}.games-hero h1 em,.section-head h2 em,.commerce-band h2 em{font-style:normal;color:#edc56d}.games-hero p{max-width:570px;color:#abc1d1;line-height:1.8;font-size:14px}.hero-buttons{display:flex;gap:12px;flex-wrap:wrap;margin-top:27px}.gold-button,.outline-button{display:inline-flex;align-items:center;padding:13px 17px;border-radius:8px;font-size:12px;font-weight:900}.gold-button{background:linear-gradient(120deg,#f4d78e,#d8a947);color:#10243a}.outline-button{border:1px solid rgba(173,207,226,.3);color:#d9eaf3}.promise{margin-top:28px;color:#8da9bb;font-size:9px;letter-spacing:1.7px}.promise span{color:#edc56d;margin-right:7px}.hero-planet{height:390px;position:relative;display:grid;place-items:center}.hero-banner{overflow:hidden;border:1px solid rgba(237,197,109,.5);border-radius:22px;box-shadow:0 20px 70px rgba(0,0,0,.35)}.hero-banner img{width:100%;height:100%;object-fit:cover;display:block}.hero-banner:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(7,22,41,.12),transparent 55%,rgba(7,22,41,.16));pointer-events:none}.planet-core{width:250px;height:250px;border-radius:50%;background:radial-gradient(circle at 32% 25%,#91d4d1,#277e9d 35%,#102d55 76%);box-shadow:inset -35px -22px 50px #06142b,0 0 80px rgba(62,171,204,.24)}.planet-ring{position:absolute;width:390px;height:125px;border:1px solid rgba(237,197,109,.7);border-radius:50%;transform:rotate(-23deg)}.ring-two{width:430px;height:190px;border-color:rgba(113,206,223,.35);transform:rotate(35deg)}.planet-label{position:absolute;bottom:24px;right:0;color:#9ebbd0;font-size:9px;letter-spacing:2px;line-height:1.6}.hero-orbit{position:absolute;border:1px solid rgba(109,178,206,.12);border-radius:50%;pointer-events:none}.orbit-a{width:650px;height:650px;right:-280px;top:-30px}.orbit-b{width:850px;height:850px;right:-380px;top:-130px}.catalog-section,.release-section{max-width:1320px;margin:auto;padding:72px clamp(20px,6vw,88px)}.section-head{display:flex;justify-content:space-between;align-items:end;gap:25px;margin-bottom:25px}.section-head h2,.commerce-band h2{font-size:clamp(30px,4vw,44px);letter-spacing:-1.5px;margin:10px 0 0}.count{font-size:9px;letter-spacing:1.5px;color:#8eaabc;border:1px solid rgba(142,170,188,.25);padding:8px 10px;border-radius:5px}.title-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:17px}.title-card{border:1px solid rgba(135,182,208,.2);border-radius:14px;overflow:hidden;background:linear-gradient(145deg,#112e49,#0b2038)}.cover{height:190px;position:relative;display:grid;place-items:center;overflow:hidden;background:#0a1d37}.cover img{width:100%;height:100%;object-fit:cover;display:block}.cover small{position:absolute;top:13px;left:15px;color:#d7e8ef;font-size:9px;letter-spacing:2px;z-index:3}.title-content{padding:20px}.game-status{font-size:8px;letter-spacing:1px;color:#74dfbd}.title-content h3{font-size:19px;margin:11px 0 4px}.title-content h4{font-size:11px;color:#edc56d;margin:0}.title-content p{font-size:12px;color:#9eb6c7;line-height:1.7;min-height:62px}.play-link{display:inline-block;margin-top:9px;color:#f0d28a;font-size:11px;font-weight:900}.classic-band{max-width:1320px;margin:0 auto 35px;padding:50px clamp(20px,6vw,88px);display:grid;grid-template-columns:1.2fr .8fr;gap:20px;align-items:center;background:linear-gradient(110deg,#102e49,#0b1d34);border-top:1px solid rgba(237,197,109,.25);border-bottom:1px solid rgba(237,197,109,.25)}.classic-band h2{font-size:clamp(28px,4vw,42px);margin:10px 0}.classic-band h2 em{font-style:normal;color:#edc56d}.classic-band p{max-width:600px;color:#a5bdcd;line-height:1.8;font-size:13px}.classic-icons{display:flex;justify-content:center;gap:18px;flex-wrap:wrap}.classic-icons span{width:76px;height:76px;display:grid;place-items:center;border:1px solid rgba(237,197,109,.5);border-radius:18px;color:#edc56d;font-size:38px;background:rgba(255,255,255,.04)}.release-section{border-top:1px solid rgba(143,188,216,.14)}.section-head>p{max-width:330px;color:#95adbf;font-size:11px;line-height:1.7}.release-list{border-top:1px solid rgba(143,188,216,.18)}.release-item{display:grid;grid-template-columns:1fr 1.3fr .8fr;align-items:center;gap:20px;padding:19px 8px;border-bottom:1px solid rgba(143,188,216,.15)}.release-date b,.release-date span{display:block}.release-date b{font-size:10px;color:#edc56d;letter-spacing:1.5px}.release-date span{font-size:10px;color:#839fb2;margin-top:5px}.release-title{display:flex;align-items:center;gap:14px}.release-title span{font-size:12px;color:#64869d}.release-title h3{font-size:14px;margin:0}.release-status{justify-self:end;font-size:10px;color:#9ab3c4}.commerce-band{margin:35px auto 0;max-width:1320px;padding:58px clamp(20px,6vw,88px);display:grid;grid-template-columns:1fr .8fr;align-items:center;gap:25px;background:linear-gradient(110deg,#112f4c,#0b1d34);border-top:1px solid rgba(237,197,109,.2);border-bottom:1px solid rgba(237,197,109,.2)}.commerce-band p{max-width:530px;color:#a5bdcd;line-height:1.8;font-size:12px}.commerce-band .gold-button{margin-top:10px}.commerce-art{height:230px;display:grid;place-content:center;justify-items:center;background:radial-gradient(ellipse,rgba(32,132,165,.24),transparent 67%)}.commerce-art span{font-size:92px;filter:drop-shadow(0 0 25px rgba(102,208,224,.45))}.commerce-art b{font-size:10px;letter-spacing:2px;color:#edc56d}.commerce-art small{font-size:8px;color:#87a6ba;margin-top:8px;letter-spacing:2px}.games-hub footer{padding:23px clamp(18px,5vw,72px);display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;border-top:1px solid rgba(143,188,216,.14);font-size:10px;color:#829eb1}.games-hub footer a{color:#edc56d}@media(max-width:800px){.games-nav nav{display:none}.games-hero{grid-template-columns:1fr;padding-top:55px}.hero-planet{height:300px}.planet-core{width:210px;height:210px}.planet-ring{width:320px}.title-grid{grid-template-columns:1fr 1fr}.commerce-band{grid-template-columns:1fr}.commerce-art{height:180px}}@media(max-width:540px){.games-nav{height:62px}.brand{font-size:10px}.shop-button{font-size:9px;padding:9px}.games-hero h1{letter-spacing:-2px}.hero-planet{height:260px}.planet-core{width:175px;height:175px}.planet-ring{width:270px;height:90px}.catalog-section,.release-section{padding-top:55px;padding-bottom:55px}.section-head{align-items:start;flex-direction:column}.title-grid{grid-template-columns:1fr}.cover{height:160px}.release-item{grid-template-columns:1fr;gap:9px}.release-status{justify-self:start}.commerce-band{padding-top:42px;padding-bottom:42px}.classic-band{grid-template-columns:1fr}.classic-icons{justify-content:flex-start}}

    .game-universe-art{isolation:isolate;overflow:hidden;background:radial-gradient(ellipse at 50% 48%,rgba(46,165,196,.28),transparent 52%),linear-gradient(145deg,#071a35,#102f52 55%,#081629)!important;border:1px solid rgba(237,197,109,.25);border-radius:50% 50% 44% 44%}
    .art-stars,.cover-stars{position:absolute;inset:12% 8%;color:#d9f6ff;letter-spacing:14px;font-size:18px;opacity:.8}
    .art-planet{position:absolute;width:210px;height:210px;border-radius:50%;background:radial-gradient(circle at 32% 25%,#b6f1ee,#3186a5 34%,#14385f 72%);box-shadow:0 0 55px rgba(76,208,224,.5),inset -24px -18px 35px rgba(0,0,0,.45)}
    .art-orbit{position:absolute;width:360px;height:115px;border:2px solid rgba(238,202,121,.72);border-radius:50%;transform:rotate(-24deg)}
    .art-orbit-two{width:420px;height:150px;border-color:rgba(122,220,231,.35);transform:rotate(28deg)}
    .art-moon{position:absolute;width:48px;height:48px;right:18%;top:20%;border-radius:50%;background:radial-gradient(circle at 30% 30%,#fff1c3,#b48c53 70%);box-shadow:0 0 25px rgba(255,224,155,.35)}
    .art-ship{position:absolute;right:22%;bottom:24%;color:#f6d98c;font-size:36px;transform:rotate(-25deg);text-shadow:0 0 20px #6ddbea}
    .game-cover-art{display:grid;place-items:center;background:radial-gradient(circle at 50% 55%,#164d72,#07172d 72%)}
    .cover-planet{width:118px;height:118px;border-radius:50%;background:radial-gradient(circle at 32% 28%,#d4fff2,#3e9eb5 38%,#12345a 75%);box-shadow:0 0 38px rgba(79,210,223,.5)}
    .cover-orbit{position:absolute;width:230px;height:74px;border:2px solid rgba(239,203,121,.7);border-radius:50%;transform:rotate(-24deg)}
    .cover-title{position:absolute;bottom:16px;right:18px;color:#fff;font-size:17px;font-weight:900;line-height:1.05;text-align:right;letter-spacing:2px;text-shadow:0 2px 12px #071629}
    .cover-title b{color:#f2d58e}
    @media(max-width:540px){.art-planet{width:165px;height:165px}.art-orbit{width:290px}.art-orbit-two{width:340px}}
    `}</style>
  </>;
}
