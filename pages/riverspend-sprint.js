'use client';

import { useEffect, useState } from 'react';

const translations = {
  it: {
    back: '← Torna a RiverSpendShop', badge: 'PROGETTO INTERNAZIONALE', eyebrow: 'LE TUE IDEE, PRONTE A PRENDERE FORMA',
    tagline: 'La tua immagine. La tua idea. Il tuo prodotto.',
    description: 'Dalle magliette agli asciugamani, dai cappellini a zaini, portachiavi e penne: una vetrina per prodotti personalizzati con il marchio RiverSpend e con le tue immagini.',
    cta: 'Scopri cosa potrai creare ↓', sectionEyebrow: 'SCEGLI LA TUA IDEA', heading: 'Cosa potrai personalizzare',
    intro: 'Un unico punto di partenza per fotografie, regali e prodotti stampati.',
    uploadEyebrow: 'ANTEPRIMA FOTO', uploadHeading: 'La tua immagine, in anteprima',
    uploadText: 'Puoi selezionare una foto dal telefono e vederla qui. Per ora resta in questa anteprima: non viene inviata a una tipografia e non viene effettuato alcun ordine.',
    choosePhoto: '📷 Scegli una foto dal telefono', photoPlaceholder: 'La tua foto apparirà qui',
    partnersEyebrow: 'PRODUZIONE E SPEDIZIONE', partnersHeading: 'Partner da collegare',
    prodigi: 'Foto, stampe e quadri', printful: 'Abbigliamento e accessori',
    worldHeading: 'Un progetto pensato per il mondo', worldText: 'Obiettivo: offrire prodotti in più Paesi e lingue. Destinazioni, tariffe e tempi saranno confermati dopo il collegamento dei fornitori.',
    disclaimer: 'PREPARAZIONE — Il negozio non accetta ancora ordini reali. Le API dei fornitori, il catalogo con prezzi, i pagamenti, le spedizioni internazionali, i resi e le traduzioni complete saranno configurati e testati prima del lancio.',
    categories: ['Foto e ricordi','Abbigliamento','Cappellini e accessori','Tazze e borracce','Asciugamani e casa','Zaini e borse','Cover e accessori tech','Portachiavi e penne','Stampa professionale','Prodotti personalizzati','Regali speciali','Per aziende e attività'],
    texts: ['Stampe fotografiche, poster, quadri, tele e fotolibri.','Magliette, felpe, polo e capi personalizzati con il logo RiverSpend.','Cappellini, occhiali, bandane e accessori personalizzati.','Tazze, borracce e idee regalo per te e per chi ami.','Asciugamani, teli mare e articoli per la casa personalizzati.','Zaini, shopper, borsoni e sacche personalizzate.','Cover, auricolari, mousepad e accessori tecnologici.','Portachiavi, penne e gadget personalizzati per ogni occasione.','Biglietti da visita, volantini, brochure, etichette e molto altro.','Cuscini, puzzle, calendari, quaderni e articoli unici.','Idee regalo personalizzate per compleanni e occasioni speciali.','Abbigliamento, gadget e materiali promozionali con il marchio.']
  },
  en: {
    back: '← Back to RiverSpendShop', badge: 'INTERNATIONAL PROJECT', eyebrow: 'YOUR IDEAS, READY TO TAKE SHAPE',
    tagline: 'Your image. Your idea. Your product.',
    description: 'From T-shirts and towels to caps, backpacks, keychains and pens: a showcase for custom products featuring RiverSpend branding and your own images.',
    cta: 'Explore what you can create ↓', sectionEyebrow: 'CHOOSE YOUR IDEA', heading: 'What you can customize',
    intro: 'One place to start for photo prints, gifts and custom-printed products.',
    uploadEyebrow: 'PHOTO PREVIEW', uploadHeading: 'Preview your image',
    uploadText: 'Choose a photo from your phone to preview it here. For now, it stays in this preview: it is not sent to a printer and no order is placed.',
    choosePhoto: '📷 Choose a photo from your phone', photoPlaceholder: 'Your photo will appear here',
    partnersEyebrow: 'PRODUCTION & SHIPPING', partnersHeading: 'Partners to connect',
    prodigi: 'Photo prints, art prints and wall art', printful: 'Apparel and accessories',
    worldHeading: 'Designed with the world in mind', worldText: 'Goal: offer products across multiple countries and languages. Destinations, rates and delivery times will be confirmed after supplier integration.',
    disclaimer: 'PRE-LAUNCH — This store does not accept real orders yet. Supplier APIs, live product catalogs and pricing, payments, international shipping, returns and full translations must be configured and tested before launch.',
    categories: ['Photos & memories','Apparel','Caps & accessories','Mugs & bottles','Towels & home','Backpacks & bags','Phone cases & tech','Keychains & pens','Professional printing','Custom products','Special gifts','For businesses'],
    texts: ['Photo prints, posters, wall art, canvases and photo books.','T-shirts, hoodies, polos and apparel with RiverSpend branding.','Caps, eyewear, bandanas and custom accessories.','Mugs, bottles and gift ideas for you and your loved ones.','Custom towels, beach towels and home products.','Backpacks, tote bags, duffel bags and drawstring bags.','Phone cases, earbuds, mousepads and tech accessories.','Custom keychains, pens and promotional gadgets.','Business cards, flyers, brochures, labels and more.','Custom cushions, puzzles, calendars, notebooks and more.','Personalized gifts for birthdays and special occasions.','Branded apparel, promotional items and printed materials.']
  }
};
const products = [
  { icon: '📸', title: 'Foto e ricordi', text: 'Stampe fotografiche, poster, quadri, tele e fotolibri.', tone: 'category-photo' },
  { icon: '👕', title: 'Abbigliamento', text: 'Magliette, felpe, polo e capi personalizzati con il logo RiverSpend.', tone: 'category-wear' },
  { icon: '🧢', title: 'Cappellini e accessori', text: 'Cappellini, occhiali, bandane e accessori personalizzati.', tone: 'category-cap' },
  { icon: '☕', title: 'Tazze e borracce', text: 'Tazze, borracce e idee regalo per te e per chi ami.', tone: 'category-gift' },
  { icon: '🧺', title: 'Asciugamani e casa', text: 'Asciugamani, teli mare e articoli per la casa personalizzati.', tone: 'category-home' },
  { icon: '🎒', title: 'Zaini e borse', text: 'Zaini, shopper, borsoni e sacche personalizzate.', tone: 'category-bags' },
  { icon: '📱', title: 'Cover e accessori tech', text: 'Cover, auricolari, mousepad e accessori tecnologici.', tone: 'category-tech' },
  { icon: '🔑', title: 'Portachiavi e penne', text: 'Portachiavi, penne e gadget personalizzati per ogni occasione.', tone: 'category-gadgets' },
  { icon: '🖨️', title: 'Stampa professionale', text: 'Biglietti da visita, volantini, brochure, etichette e molto altro.', tone: 'category-pro' },
  { icon: '🎁', title: 'Prodotti personalizzati', text: 'Cuscini, puzzle, calendari, quaderni e articoli unici.', tone: 'category-custom' },
  { icon: '💝', title: 'Regali speciali', text: 'Idee regalo personalizzate per compleanni e occasioni speciali.', tone: 'category-gifts' },
  { icon: '🏪', title: 'Per aziende e attività', text: 'Abbigliamento, gadget e materiali promozionali con il marchio.', tone: 'category-business' },
];

export default function RiverSpendSprint() {
  const [language, setLanguage] = useState('it');
  const t = translations[language];
  const [imageUrl, setImageUrl] = useState('');
  const [fileName, setFileName] = useState('');

  useEffect(() => () => { if (imageUrl) URL.revokeObjectURL(imageUrl); }, [imageUrl]);

  function handleImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFileName('Seleziona un file immagine valido.');
      return;
    }
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(URL.createObjectURL(file));
    setFileName(file.name);
  }

  return (
    <main className="sprint-page">
      <header className="sprint-top">
        <a className="sprint-back" href="/">{t.back}</a>
        <div className="sprint-top-right"><label className="sprint-language-label" htmlFor="sprint-language">🌐</label><select id="sprint-language" className="sprint-language" value={language} onChange={(e) => setLanguage(e.target.value)} aria-label="Language"><option value="it">Italiano</option><option value="en">English</option></select><span className="sprint-pill">{t.badge}</span></div>
      </header>

      <section className="sprint-hero">
        <div className="sprint-hero-copy">
          <p className="sprint-eyebrow">{t.eyebrow}</p>
          <h1><span className="sprint-rss-logo" aria-label="RSS">RSS</span><span className="sprint-word">RiverSpend <small>s</small>Print</span></h1>
          <p className="sprint-tagline">{t.tagline}</p>
          <p className="sprint-description">{t.description}</p>
          <a className="sprint-cta" href="#sprint-products">{t.cta}</a>
        </div>
        <div className="sprint-preview">
          <div className="sprint-orbit sprint-orbit-one" />
          <div className="sprint-orbit sprint-orbit-two" />
          <div className="sprint-product-card shirt"><span>👕</span><b>LA TUA FOTO</b></div>
          <div className="sprint-product-card mug"><span>☕</span></div>
          <div className="sprint-product-card sprint-preview-photo"><span>🖼️</span></div>
          <div className="sprint-speed">sPRINT<br/><small>CREA · STAMPA · SORPRENDI</small></div>
        </div>
      </section>

      <section id="sprint-products" className="sprint-products">
        <div className="sprint-section-head">
          <p className="sprint-eyebrow">{t.sectionEyebrow}</p>
          <h2>{t.heading}</h2>
          <p>{t.intro}</p>
        </div>
        <figure className="sprint-catalog-image"><img src="/images/sprint-products/catalogo-riverspend-sprint.svg" alt="Catalogo dimostrativo RSS RiverSpend sPrint: foto, abbigliamento, cappellini, tazze, asciugamani, zaini, accessori tech, portachiavi, penne e gadget" /><figcaption>Catalogo dimostrativo RSS RiverSpend sPrint</figcaption></figure>
        <div className="sprint-grid">
          {products.map((item) => (
            <article className="sprint-card sprint-category-card" style={{ transform: 'none', rotate: 'none', skew: 'none', writingMode: 'horizontal-tb' }} key={item.title}>
              <span className="sprint-card-icon" aria-hidden="true">{item.icon}</span>
              <h3>{t.categories[products.indexOf(item)]}</h3>
              <p>{t.texts[products.indexOf(item)]}</p>
              <span className="sprint-coming">IN PREPARAZIONE</span>
            </article>
          ))}
        </div>
      </section>

      <section className="sprint-upload">
        <div>
          <p className="sprint-eyebrow">{t.uploadEyebrow}</p>
          <h2>{t.uploadHeading}</h2>
          <p>{t.uploadText}</p>
          <label className="sprint-upload-button" htmlFor="sprint-image">{t.choosePhoto}</label>
          <input id="sprint-image" type="file" accept="image/*" onChange={handleImage} />
          {fileName && <p className="sprint-file-name">{fileName}</p>}
        </div>
        <div className="sprint-image-preview">
          {imageUrl ? <img src={imageUrl} alt="Anteprima della foto scelta" /> : <div className="sprint-empty-preview"><span>＋</span><b>{t.photoPlaceholder}</b></div>}
        </div>
      </section>

      <section className="sprint-partners">
        <p className="sprint-eyebrow">{t.partnersEyebrow}</p>
        <h2>{t.partnersHeading}</h2>
        <div className="sprint-partner-row">
          <div><strong>Prodigi</strong><span>{t.prodigi}</span></div>
          <div><strong>Printful</strong><span>{t.printful}</span></div>
        </div>
        <h2>{t.worldHeading}</h2><p>{t.worldText}</p><p className="sprint-disclaimer">{t.disclaimer}</p>
      </section>

      <footer className="sprint-footer">RiverSpend <b>sPrint</b> · YOUR SHOP • YOUR FLOW</footer>

      <style jsx>{`
        .sprint-page{min-height:100vh;background:#f4fbfc;color:#073443;font-family:Arial,Helvetica,sans-serif}
        .sprint-top{max-width:1180px;margin:auto;padding:18px 22px;display:flex;align-items:center;justify-content:space-between;gap:12px}
        .sprint-back{color:#075c68;text-decoration:none;font-weight:800;font-size:14px}.sprint-pill{font-size:10px;letter-spacing:.15em;font-weight:900;background:#d9f8f7;color:#087c84;border-radius:999px;padding:9px 12px}
        .sprint-hero{max-width:1180px;margin:0 auto;padding:40px 22px 54px;display:grid;grid-template-columns:1.1fr .9fr;align-items:center;gap:36px;overflow:hidden}
        .sprint-eyebrow{font-size:11px;letter-spacing:.18em;font-weight:900;color:#078b91;margin:0 0 12px}
        .sprint-rss-logo{display:block;font-size:1.25em;line-height:.95;font-weight:950;letter-spacing:-.07em;background:linear-gradient(110deg,#087bb5 15%,#11c2d2 52%,#d8a62e 85%);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:0 2px 0 rgba(5,54,87,.08)}.sprint-hero h1{font-size:clamp(42px,6vw,76px);letter-spacing:-.065em;line-height:.98;margin:0;color:#073443;display:flex;flex-wrap:wrap;gap:12px}
        .sprint-hero h1>span:first-child{color:#073443}.sprint-word{color:#078d99;white-space:nowrap}.sprint-word small{font-size:.53em;vertical-align:top;display:inline-block;margin:0 1px 0 2px;letter-spacing:-.08em;color:#d7a52a}
        .sprint-tagline{font-size:clamp(19px,2.2vw,25px);font-weight:800;margin:22px 0 10px}.sprint-description{font-size:16px;line-height:1.65;color:#49646c;max-width:520px}
        .sprint-cta,.sprint-upload-button{display:inline-flex;align-items:center;justify-content:center;margin-top:16px;padding:14px 20px;border-radius:14px;background:#087f89;color:#fff;text-decoration:none;font-weight:900;box-shadow:0 8px 22px #087f8929}
        .sprint-preview{position:relative;min-height:360px;border-radius:32px;background:radial-gradient(circle at 45% 35%,#b9f6f5,#2ac5d0 50%,#076c82);overflow:hidden;box-shadow:0 24px 60px #075b6a24}
        .sprint-orbit{position:absolute;border:1px solid #ffffff80;border-radius:50%;width:320px;height:320px;left:50%;top:45%;transform:translate(-50%,-50%) rotate(-20deg)}.sprint-orbit-two{width:410px;height:220px;transform:translate(-50%,-50%) rotate(32deg)}
        .sprint-product-card{position:absolute;display:flex;align-items:center;justify-content:center;flex-direction:column;border:1px solid #ffffffc9;background:#ffffffed;box-shadow:0 12px 30px #003c4b30;border-radius:20px;color:#073443}
        .sprint-product-card span{font-size:48px}.sprint-product-card b{font-size:10px;letter-spacing:.12em}.shirt{width:116px;height:142px;left:12%;top:19%;transform:rotate(-9deg)}.mug{width:100px;height:100px;right:11%;top:18%;transform:rotate(8deg)}.sprint-preview-photo{width:100px;height:108px;left:22%;bottom:12%;transform:rotate(8deg)}
        .sprint-speed{position:absolute;right:8%;bottom:13%;color:white;font-size:27px;line-height:1;font-weight:1000;letter-spacing:-.05em;text-align:center;text-shadow:0 3px 12px #00404a66}.sprint-speed small{font-size:8px;letter-spacing:.14em}
        .sprint-products{padding:46px 22px 54px;background:white}.sprint-section-head{max-width:1180px;margin:0 auto 24px}.sprint-section-head h2,.sprint-upload h2,.sprint-partners h2{font-size:clamp(27px,4vw,40px);letter-spacing:-.04em;margin:0 0 10px}.sprint-section-head>p:last-child{color:#5c7279}
        .sprint-catalog-image{max-width:1180px;margin:0 auto 28px}.sprint-catalog-image img{display:block;width:100%;height:auto;border-radius:24px;border:1px solid #d7e9eb}.sprint-catalog-image figcaption{font-size:12px;color:#60767b;margin-top:7px;text-align:center}.sprint-grid{max-width:1180px;margin:auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.sprint-grid>.sprint-category-card,.sprint-category-card{box-sizing:border-box;position:relative;display:flex;flex-direction:column;align-items:flex-start;transform:translate(0,0) rotate(0deg) skew(0deg,0deg)!important;rotate:none!important;writing-mode:horizontal-tb!important;direction:ltr;border:1px solid #d7e9eb;border-radius:22px;padding:22px;background:linear-gradient(145deg,#fff,#f2fbfc);min-width:0;overflow:hidden}.sprint-card-icon{font-size:36px}.sprint-card h3{font-size:18px;margin:13px 0 7px}.sprint-card p{font-size:14px;line-height:1.55;color:#526d74;min-height:44px;margin:0 0 8px;width:100%;overflow-wrap:anywhere}.sprint-card h3{width:100%;line-height:1.35;overflow-wrap:anywhere}.sprint-coming{align-self:flex-start;max-width:100%;box-sizing:border-box;white-space:normal;line-height:1.35}.sprint-coming{display:inline-block;margin-top:8px;padding:7px 9px;border-radius:999px;background:#fff0c6;color:#78570b;font-size:9px;font-weight:900;letter-spacing:.12em}
        .sprint-upload{max-width:1136px;margin:42px auto;padding:28px;display:grid;grid-template-columns:1fr .8fr;gap:28px;align-items:center;border-radius:28px;background:#e2f7f7;border:1px solid #b5e6e7}.sprint-upload p:not(.sprint-eyebrow){color:#49656d;line-height:1.6;font-size:14px}.sprint-upload input{display:block;margin-top:15px;max-width:100%;font-size:13px}.sprint-upload-button{cursor:pointer;margin-top:8px}.sprint-file-name{overflow-wrap:anywhere;font-size:12px!important}.sprint-image-preview{min-height:260px;display:flex;align-items:center;justify-content:center;border:2px dashed #83cfd2;border-radius:22px;background:#ffffffa6;overflow:hidden}.sprint-image-preview img{display:block;width:100%;max-height:360px;object-fit:contain}.sprint-empty-preview{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;color:#548188}.sprint-empty-preview span{font-size:48px}.sprint-empty-preview b{font-size:13px}
        .sprint-partners{max-width:1136px;margin:0 auto;padding:20px 22px 54px}.sprint-partner-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:20px 0}.sprint-partner-row>div{padding:20px;border-radius:18px;border:1px solid #c9e5e8;background:white;display:flex;flex-direction:column;gap:5px}.sprint-partner-row strong{font-size:22px;color:#087f89}.sprint-partner-row span{font-size:13px;color:#61767b}.sprint-disclaimer{font-size:12px;line-height:1.6;color:#60767b;background:#fff8df;border-radius:14px;padding:14px}
        .sprint-footer{text-align:center;padding:24px 12px;background:#06313e;color:#bfeef0;font-size:12px;letter-spacing:.08em}.sprint-footer b{color:#f2c65d}
        @media(max-width:760px){.sprint-hero{grid-template-columns:1fr;padding-top:25px;gap:26px}.sprint-preview{min-height:300px}.sprint-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.sprint-category-card{padding:15px}.sprint-category-card h3{font-size:16px}.sprint-upload{margin:24px 12px;padding:20px;grid-template-columns:1fr}.sprint-image-preview{min-height:220px}.sprint-top{padding:14px}.sprint-pill{font-size:8px}}
        @media(max-width:390px){.sprint-grid{grid-template-columns:1fr}.sprint-hero h1{font-size:42px}}
      `}</style>
    </main>
  );
}
