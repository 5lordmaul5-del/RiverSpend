import Head from 'next/head';
import Link from 'next/link';

const products = [
  { icon: '📱', name: 'RS Phone', model: 'UltraPhone', desc: 'La futura linea smartphone RiverSpend: design, fotografia, sicurezza e RiverSSAI.', status: 'Progetto in sviluppo' },
  { icon: '⌚', name: 'RS Watch', model: 'RiverWatch', desc: 'Smartwatch con notifiche, salute, attività e collegamento allo smartphone.', status: 'Concept' },
  { icon: '🎮', name: 'RS Console', model: 'NextGen', desc: 'Intrattenimento domestico, giochi e collegamento a RiverBox Living.', status: 'Concept' },
  { icon: '🎧', name: 'RS Sound', model: 'RiverSound', desc: 'Cuffie e auricolari wireless per musica, chiamate e gaming.', status: 'Concept' },
  { icon: '🔊', name: 'RiverISSA', model: 'Audio & Surround', desc: 'Soundbar, subwoofer, diffusori ad arco e sistema home cinema modulare.', status: 'Concept' },
  { icon: '🖥️', name: 'RiverBox', model: 'Premium Living', desc: 'Console e centro d’intrattenimento da collegare alla TV.', status: 'Concept' },
];

export default function RiverSpendElectronics() {
  return <>
    <Head>
      <title>RiverSpend Electronics · Tecnologia in evoluzione</title>
      <meta name="description" content="Scopri i progetti RiverPhone, RiverWatch, RiverSound, RiverISSA e RiverBox." />
      <meta name="theme-color" content="#10131b" />
    </Head>
    <main className="electronics">
      <header className="top"><Link href="/" className="brand">RIVERSPEND <span>ELECTRONICS</span></Link><Link href="/" className="back">← RiverSpendShop</Link></header>
      <section className="hero">
        <div className="glow" />
        <p className="eyebrow">RIVERSPEND · FUTURE TECHNOLOGY</p>
        <h1>La tecnologia<br/><em>prende forma.</em></h1>
        <p className="intro">Un nuovo universo di dispositivi progettati intorno alle persone e collegati all’ecosistema RiverSpend.</p>
        <div className="hero-products" aria-label="Famiglie di prodotti RiverSpend">
          <div className="device phone"><span>R</span><small>ULTRAPHONE</small></div>
          <div className="device watch"><span>◉</span><small>WATCH</small></div>
          <div className="device speaker"><span>)))</span><small>ISSA SOUND</small></div>
          <div className="device console"><span>RS</span><small>NEXTGEN</small></div>
        </div>
        <div className="hero-foot"><span>BLACK · GOLD · PEARL</span><span>DESIGNED FOR THE RIVERSPEND ECOSYSTEM</span></div>
      </section>
      <section className="catalog">
        <div className="section-head"><div><p className="eyebrow">IL NOSTRO UNIVERSO</p><h2>Scopri i prodotti</h2></div><span className="count">06 FAMIGLIE</span></div>
        <div className="grid">{products.map((p) => <article className="product" key={p.name}>
          <div className="product-icon">{p.icon}</div><p className="product-status">{p.status}</p><h3>{p.name}</h3><h4>{p.model}</h4><p className="desc">{p.desc}</p>
          <span className="more">IN ARRIVO <b>↗</b></span>
        </article>)}</div>
      </section>
      <section className="connect"><p className="eyebrow">UN ECOSISTEMA, PIÙ POSSIBILITÀ</p><h2>Connessi con RiverSSAI,<br/>RiverSignals e RiverSpendShop.</h2><p>Le integrazioni saranno attivate progressivamente, quando i relativi dispositivi e servizi saranno sviluppati e collaudati.</p><Link href="/" className="shop-button">Torna a RiverSpendShop →</Link></section>
      <footer>© RiverSpend Electronics · Progetti e concept in fase di sviluppo</footer>
    </main>
    <style jsx>{`
      :global(html),:global(body){margin:0;background:#10131b}
      .electronics{min-height:100vh;background:#f6f7f8;color:#171923;font-family:Arial,sans-serif}
      .top{height:68px;padding:0 clamp(18px,5vw,70px);display:flex;align-items:center;justify-content:space-between;background:#10131b;color:#fff}
      .brand{font-size:15px;font-weight:900;letter-spacing:.16em;color:#fff;text-decoration:none}.brand span{color:#d6b66d}
      .back{color:#f3d995;text-decoration:none;font-size:13px;font-weight:700}
      .hero{position:relative;overflow:hidden;padding:70px clamp(22px,8vw,110px) 26px;background:radial-gradient(ellipse at 75% 42%,#41404a 0%,#20232d 34%,#10131b 75%);color:white;min-height:440px}
      .glow{position:absolute;width:400px;height:400px;border-radius:50%;right:8%;top:15%;background:#d2a94c22;filter:blur(70px)}
      .eyebrow{font-size:10px;letter-spacing:.24em;font-weight:800;color:#b18b43}
      h1{position:relative;font-size:clamp(42px,7vw,78px);line-height:.98;letter-spacing:-.055em;margin:18px 0;max-width:650px}h1 em{font-style:normal;color:#e2c47d}
      .intro{position:relative;max-width:470px;color:#d4d5da;font-size:15px;line-height:1.65}
      .hero-products{position:relative;display:flex;align-items:flex-end;justify-content:center;gap:clamp(12px,4vw,42px);height:180px;margin-top:8px}
      .device{display:flex;align-items:center;justify-content:center;flex-direction:column;border:1px solid #d7bb7b88;background:linear-gradient(145deg,#4a4a50,#101116 70%);box-shadow:0 14px 45px #0008,inset 0 0 20px #ffffff12;color:#e6cc8d}
      .device span{font-weight:900;font-size:30px}.device small{font-size:7px;letter-spacing:.18em;margin-top:9px;color:#fff}
      .phone{width:65px;height:132px;border-radius:17px}.watch{width:78px;height:90px;border-radius:26px}.speaker{width:116px;height:70px;border-radius:16px}.console{width:125px;height:48px;border-radius:10px}
      .hero-foot{position:relative;border-top:1px solid #ffffff22;margin-top:25px;padding-top:14px;display:flex;justify-content:space-between;gap:12px;color:#b6b5b2;font-size:8px;letter-spacing:.15em}
      .catalog{padding:55px clamp(18px,6vw,78px) 65px}.section-head{display:flex;justify-content:space-between;align-items:end;margin-bottom:24px}h2{font-size:clamp(27px,4vw,42px);letter-spacing:-.04em;margin:8px 0}.count{font-size:10px;letter-spacing:.16em;color:#777}
      .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}.product{background:#fff;border:1px solid #e6e4df;border-radius:18px;padding:22px;min-height:230px;box-shadow:0 7px 24px #17192308}
      .product-icon{width:48px;height:48px;border-radius:14px;background:linear-gradient(145deg,#252630,#11131a);display:grid;place-items:center;font-size:24px}
      .product-status{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#a07d37;margin:17px 0 7px}.product h3{font-size:21px;margin:0}.product h4{font-size:13px;color:#a07d37;margin:4px 0 10px}.desc{font-size:13px;line-height:1.55;color:#666;min-height:58px}
      .more{display:flex;justify-content:space-between;border-top:1px solid #eee;padding-top:13px;font-size:9px;letter-spacing:.13em;font-weight:800;color:#8b6d32}.more b{font-size:16px}
      .connect{padding:54px 20px;text-align:center;background:#151821;color:#fff}.connect h2{line-height:1.1}.connect>p:not(.eyebrow){max-width:570px;margin:15px auto 25px;color:#c3c4c8;font-size:13px;line-height:1.6}.shop-button{display:inline-block;padding:13px 20px;border-radius:30px;background:#e4c47c;color:#181820;text-decoration:none;font-size:12px;font-weight:900}
      footer{text-align:center;background:#10131b;color:#aaa;padding:20px;font-size:10px}
      @media(max-width:760px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.hero{padding-top:52px}.hero-products{height:145px}.phone{height:112px}.speaker{width:90px}.console{width:95px}}
      @media(max-width:480px){.grid{grid-template-columns:1fr}.section-head{align-items:start;gap:10px}.count{padding-top:12px}.hero-foot{font-size:7px}.device small{font-size:6px}}
    `}</style>
  </>;
}
