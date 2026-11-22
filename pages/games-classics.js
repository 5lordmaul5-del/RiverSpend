import Head from 'next/head';

const games = [
  { id:'RSC-001',name:'Scacchi',icon:'♟',price:'€ 1,99',description:'Sfida strategica classica, partite contro il computer e modalità locale.' },
  { id:'RSN-001',name:'Battaglia navale',icon:'⚓',price:'€ 2,49',description:'Posiziona la flotta, individua le navi avversarie e conquista il mare.' },
  { id:'RSD-001',name:'Dama',icon:'◉',price:'€ 1,49',description:'Il gioco di strategia per sfide rapide e tornei.' },
  { id:'RSS-001',name:'Sudoku',icon:'▦',price:'€ 0,99',description:'Numeri, logica e livelli di difficoltà per allenare la mente.' },
  { id:'RSM-001',name:'Mahjong',icon:'麻',price:'€ 2,99',description:'Abbina le tessere e completa i livelli con calma e precisione.' },
  { id:'RSME-001',name:'Memory',icon:'◈',price:'€ 0,99',description:'Allena memoria e concentrazione con carte da abbinare.' }
];

export default function RiverSpendClassicGames(){
  return <>
    <Head><title>Giochi classici | RiverSpend Games</title><meta name="description" content="Catalogo dei giochi classici RiverSpend con prova gratuita e sblocco una tantum."/></Head>
    <main className="classic-page">
      <header><a href="/games">← RiverSpend Games</a><b>CLASSIC GAMES LIBRARY</b><a href="/river-space-galaxy-games-shop">SpaceGalaxy Shop →</a></header>
      <section className="hero"><span>RIVERSPEND GAMES · CLASSICS</span><h1>Giochi senza abbonamento.</h1><p>Ogni titolo offre una prova gratuita. Per sbloccare la versione completa si paga una sola volta per gioco: nessun canone mensile e nessun rinnovo automatico.</p><small>PREZZI PROPOSTI · DA CONFERMARE PRIMA DEL LANCIO</small></section>
      <section className="grid">{games.map(g=><article key={g.id}><div className="art"><span>{g.icon}</span><small>{g.id}</small></div><div className="body"><h2>{g.name}</h2><p>{g.description}</p><div className="price">{g.price} <small>una tantum</small></div><div className="trial">Prova gratuita · sblocco completo una tantum</div><button disabled>Pagamento non ancora attivo</button></div></article>)}</section>
      <footer>RiverSpend Games · I giochi saranno abilitati dopo l'integrazione del pagamento e dei controlli di licenza.</footer>
    </main>
    <style jsx global>{`
      *{box-sizing:border-box}.classic-page{min-height:100vh;background:#071629;color:#eef7fb;font-family:Inter,system-ui,sans-serif}.classic-page a{color:#f0c76a;text-decoration:none;font-weight:800;font-size:11px}.classic-page header{height:68px;display:flex;justify-content:space-between;align-items:center;padding:0 5vw;border-bottom:1px solid #23415a}.classic-page header b{font-size:10px;letter-spacing:2px;color:#a9c3d2}.hero{text-align:center;padding:65px 20px 45px;background:radial-gradient(ellipse at 50% 0%,#174a67,#071629 72%)}.hero>span{font-size:10px;letter-spacing:3px;color:#edc56d;font-weight:900}.hero h1{font-size:clamp(34px,6vw,60px);margin:15px 0}.hero p{max-width:690px;margin:0 auto;color:#b2c7d5;line-height:1.8}.hero small{display:inline-block;margin-top:20px;color:#edc56d;font-size:9px;letter-spacing:1.5px}.grid{max-width:1160px;margin:auto;padding:25px 20px 70px;display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.grid article{background:#102b44;border:1px solid rgba(237,197,109,.2);border-radius:16px;overflow:hidden}.art{height:150px;background:radial-gradient(circle at 50% 70%,#1c718b,#0b1b32 75%);display:grid;place-items:center;position:relative}.art span{font-size:66px;color:#f2d58d;text-shadow:0 5px 20px #001}.art small{position:absolute;top:12px;left:14px;font-size:8px;letter-spacing:2px;color:#a9c3d2}.body{padding:20px}.body h2{margin:0 0 8px;font-size:20px}.body p{min-height:54px;color:#a8bdcc;font-size:12px;line-height:1.6}.price{font-size:23px;font-weight:950;color:#f1d18a;margin:15px 0}.price small{font-size:10px;color:#9eb7c7;font-weight:600}.trial{font-size:10px;color:#8fe0c6;margin-bottom:14px}.body button{width:100%;border:0;border-radius:8px;padding:12px;background:#263e52;color:#9db0bf;font-weight:800;font-size:10px}.classic-page footer{text-align:center;border-top:1px solid #23415a;padding:25px;color:#93adbf;font-size:11px}@media(max-width:800px){.grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:540px){.classic-page header b{display:none}.grid{grid-template-columns:1fr}.art{height:170px}}
    `}</style>
  </>;
}
