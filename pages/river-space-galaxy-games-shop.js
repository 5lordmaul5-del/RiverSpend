import Head from 'next/head';
import { useState } from 'react';

const products = [
  { id:'RSGG-DROID-001', name:'Droide esploratore A1', category:'Droidi e intelligenza', image:'0% 0%', price:4.99, unit:'cad.', description:'Compagno robotico virtuale per esplorazione, raccolta e supporto alle missioni.' },
  { id:'RSGG-SHIP-001', name:'Astronave Nova-Class', category:'Astronavi e flotte', image:'50% 0%', price:14.99, unit:'cad.', description:'Nave stellare per esplorare pianeti, trasportare equipaggi e attraversare la galassia.' },
  { id:'RSGG-COUNCIL-001', name:'Gran Consiglio Galattico', category:'Città e civiltà', image:'100% 0%', price:49.99, unit:'pacchetto', description:'Sala del consiglio e strumenti di rappresentanza per la tua civiltà virtuale.' },
  { id:'RSGG-DEFENSE-001', name:'Scudo orbitale', category:'Difesa e tecnologia', image:'0% 100%', price:9.99, unit:'modulo', description:'Generatore di campo di forza per proteggere basi, stazioni e colonie nel gioco.' },
  { id:'RSGG-RESOURCE-001', name:'Tesoro di cristalli e lingotti', category:'Materiali e risorse', image:'50% 100%', price:2.99, unit:'pacchetto', description:'Risorse virtuali: gemme, cristalli, pepite e lingotti per costruzioni e scambi.' },
  { id:'RSGG-CITY-001', name:'Colonia planetaria', category:'Città e civiltà', image:'100% 100%', price:29.99, unit:'struttura', description:'Insediamento futuristico da sviluppare su un pianeta abitabile.' }
];

export default function RiverSpaceGalaxyGamesShop() {
  const [quantities, setQuantities] = useState({});
  const [filter, setFilter] = useState('Tutti');
  const categories = ['Tutti', ...new Set(products.map(p => p.category))];
  const visible = products.filter(p => filter === 'Tutti' || p.category === filter);
  const format = value => new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(value);
  return <>
    <Head><title>RiverSpendGamesShopS | RiverSpend</title><meta name="description" content="Catalogo illustrato di articoli digitali RiverSpaceGalaxyGames su RiverSpendShop."/></Head>
    <main className="game-shop">
      <header><a href="/games">← Torna a RiverSpend Games</a><span>RIVERSPENDSHOP · SPACEGALAXY MARKET</span></header>
      <section className="shop-hero"><div className="eyebrow">RIVERSPACEGALAXYGAMES · MARKETPLACE</div><h1>RiverSpend<span>GamesShopS</span></h1><p>Ogni oggetto del mondo SpaceGalaxy ha la sua scheda, immagine, codice e prezzo. I prezzi mostrati sono proposte iniziali in euro, da confermare prima dell'apertura delle vendite.</p><div className="shop-note">CATALOGO DIMOSTRATIVO · CHECKOUT NON ANCORA ATTIVO</div></section>
      <section className="catalog">
        <div className="catalog-heading"><div><b>CATALOGO SPACEGALAXY</b><span>6 articoli illustrati · prezzi proposti</span></div><a href="/games-classics">Giochi classici →</a></div>
        <div className="filters">{categories.map(c=><button key={c} className={filter===c?'active':''} onClick={()=>setFilter(c)}>{c}</button>)}</div>
        <div className="products">{visible.map(p=><article className="product" key={p.id}>
          <div className="product-art" style={{backgroundPosition:p.image}}><small>{p.category}</small></div>
          <div className="product-body"><div className="sku">{p.id}</div><h2>{p.name}</h2><p>{p.description}</p><div className="price">{format(p.price)} <small>/ {p.unit}</small></div>
            <label>Quantità <input type="number" min="1" max="100" value={quantities[p.id] || 1} onChange={e=>setQuantities(old=>({...old,[p.id]:Math.max(1,Math.min(100,Number(e.target.value)||1))}))}/></label>
            <div className="subtotal">Totale indicativo: {format(p.price*(quantities[p.id]||1))}</div><button className="disabled" disabled>Acquisto in attivazione</button>
          </div></article>)}</div>
        <p className="legal-note">Gli articoli sono beni virtuali utilizzabili esclusivamente nel gioco. Nessun oggetto, credito o vantaggio è acquistabile finché il sistema di pagamento, consegna digitale e registrazione degli ordini non sarà integrato e collaudato.</p>
      </section>
      <footer><a href="/">RiverSpendShop</a><span>RiverSpendGamesShopS · SpaceGalaxy</span></footer>
    </main>
    <style jsx global>{`
      *{box-sizing:border-box}.game-shop{min-height:100vh;background:#f4f8fb;color:#10243a;font-family:Inter,system-ui,sans-serif}.game-shop a{text-decoration:none}.game-shop header{height:66px;background:#071629;color:#dbeaf4;display:flex;align-items:center;justify-content:space-between;padding:0 clamp(18px,5vw,70px);font-size:11px;letter-spacing:1px}.game-shop header a{color:#f0c76a;font-weight:800}.game-shop header span{color:#9ab4c8}.shop-hero{padding:62px 20px 54px;text-align:center;background:radial-gradient(ellipse at 50% 0%,#164a69,#071629 72%);color:white}.eyebrow{font-size:10px;letter-spacing:3px;color:#f0c76a;font-weight:900}.shop-hero h1{font-size:clamp(36px,6vw,64px);letter-spacing:-2px;margin:15px 0}.shop-hero h1 span{display:block;color:#f0c76a}.shop-hero p{max-width:650px;margin:0 auto;color:#b4c8d7;line-height:1.7}.shop-note{display:inline-block;margin-top:23px;padding:9px 13px;border:1px solid rgba(240,199,106,.4);border-radius:5px;color:#f4d98d;font-size:9px;letter-spacing:1.5px}.catalog{max-width:1180px;margin:auto;padding:35px 20px 70px}.catalog-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:20px}.catalog-heading b,.catalog-heading span{display:block}.catalog-heading b{font-size:12px;letter-spacing:1.4px}.catalog-heading span{font-size:11px;color:#71889a;margin-top:5px}.catalog-heading a{font-size:11px;font-weight:900;color:#0c5876}.filters{display:flex;gap:8px;overflow-x:auto;padding-bottom:18px}.filters button{white-space:nowrap;border:1px solid #d2e0e9;background:white;border-radius:30px;padding:9px 14px;color:#31536b;font-size:11px;font-weight:800;cursor:pointer}.filters button.active{background:#0d3857;color:white;border-color:#0d3857}.products{display:grid;grid-template-columns:repeat(3,1fr);gap:17px}.product{background:white;border:1px solid #dce7ee;border-radius:15px;overflow:hidden;box-shadow:0 8px 25px rgba(18,50,75,.06)}.product-art{height:180px;background-image:url('/images/galaxy-catalog-atlas.jpg');background-size:300% 200%;background-repeat:no-repeat;position:relative}.product-art:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(5,24,42,.52))}.product-art small{position:absolute;z-index:1;bottom:12px;left:14px;color:white;font-size:9px;letter-spacing:1px;text-transform:uppercase;text-shadow:0 1px 5px #001}.product-body{padding:18px}.sku{font-size:8px;color:#8aa0b1;letter-spacing:1px}.product h2{font-size:18px;margin:7px 0}.product p{font-size:11px;color:#607789;line-height:1.6;min-height:52px}.price{font-size:20px;font-weight:950;color:#0c5876;margin:13px 0}.price small{font-size:10px;font-weight:600;color:#71889a}.product label{display:flex;align-items:center;justify-content:space-between;font-size:11px;color:#536e80}.product input{width:75px;border:1px solid #cbd9e2;border-radius:7px;padding:7px}.subtotal{font-size:11px;font-weight:800;color:#284e67;margin:13px 0}.disabled{width:100%;border:0;border-radius:8px;padding:11px;background:#e6edf2;color:#6d8190;font-weight:800;font-size:10px}.legal-note{font-size:11px;line-height:1.7;color:#607789;margin-top:25px}.game-shop footer{background:#071629;color:#9eb6c8;padding:24px clamp(18px,5vw,70px);display:flex;justify-content:space-between;gap:15px;flex-wrap:wrap;font-size:10px}.game-shop footer a{color:#f0c76a;font-weight:800}@media(max-width:850px){.products{grid-template-columns:repeat(2,1fr)}}@media(max-width:560px){.game-shop header span{display:none}.products{grid-template-columns:1fr}.product-art{height:210px}.shop-hero{padding-top:48px}.catalog-heading{align-items:flex-start;flex-direction:column}}
    `}</style>
  </>;
}
