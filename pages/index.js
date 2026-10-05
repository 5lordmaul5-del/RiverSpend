'use client';

import { useEffect, useMemo, useState } from 'react';
import SplashScreen from './SplashScreen';

const LANGUAGES = [
  ['it', '🇮🇹 Italiano'], ['en', '🇬🇧 English'], ['es', '🇪🇸 Español'], ['fr', '🇫🇷 Français'],
  ['de', '🇩🇪 Deutsch'], ['pt', '🇵🇹 Português'], ['ar', '🇸🇦 العربية'], ['zh', '🇨🇳 中文'],
  ['ja', '🇯🇵 日本語'], ['hi', '🇮🇳 हिन्दी'], ['ru', '🇷🇺 Русский'], ['bn', '🇧🇩 বাংলা'],
  ['ur', '🇵🇰 اردو'], ['tr', '🇹🇷 Türkçe'], ['ko', '🇰🇷 한국어'], ['nl', '🇳🇱 Nederlands'],
  ['pl', '🇵🇱 Polski'], ['uk', '🇺🇦 Українська'], ['vi', '🇻🇳 Tiếng Việt'], ['th', '🇹🇭 ไทย'],
  ['id', '🇮🇩 Bahasa Indonesia'], ['ms', '🇲🇾 Bahasa Melayu'], ['fa', '🇮🇷 فارسی'], ['he', '🇮🇱 עברית'],
  ['ro', '🇷🇴 Română'], ['el', '🇬🇷 Ελληνικά'], ['sv', '🇸🇪 Svenska'], ['da', '🇩🇰 Dansk'],
  ['no', '🇳🇴 Norsk'], ['fi', '🇫🇮 Suomi'], ['cs', '🇨🇿 Čeština'], ['hu', '🇭🇺 Magyar'],
  ['sw', '🇰🇪 Kiswahili'], ['fil', '🇵🇭 Filipino']
];

function LanguageSelector() {
  const [language, setLanguage] = useState('it');
  useEffect(() => {
    let saved = '';
    try { saved = localStorage.getItem('riverspend-language') || ''; } catch {}
    const browserCode = (navigator.language || 'it').toLowerCase().split('-')[0];
    const initial = LANGUAGES.some(([code]) => code === saved) ? saved :
      (LANGUAGES.some(([code]) => code === browserCode) ? browserCode : 'en');
    setLanguage(initial);
    document.documentElement.lang = initial;
  }, []);
  function changeLanguage(event) {
    const next = event.target.value;
    setLanguage(next);
    document.documentElement.lang = next;
    try { localStorage.setItem('riverspend-language', next); } catch {}
    window.dispatchEvent(new CustomEvent('riverspend:language-change', { detail: { language: next } }));
  }
  return (
    <select value={language} onChange={changeLanguage} aria-label="Scegli la lingua"
      className="max-w-[112px] rounded-full border border-teal-700 bg-slate-900 px-2 py-1.5 text-xs font-semibold text-teal-100">
      {LANGUAGES.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
    </select>
  );
}

const HOME_TEXT = {
  it: {profile:'Profilo',wishes:'Desideri',search:'Cerca nel RiverSpendShop…',categories:'Categorie RiverSpend',close:'Chiudi',world:'Il mondo RiverSpend',open:'Apri →',ecosystem:'Tutto l’ecosistema →',support:'Tutela e assistenza →',experience:'La tua esperienza sul fiume',heroTitle:'La tua rete. Il tuo mercato.',heroBody:'Scopri gli articoli pubblicati, aggiungili alla rete e metti in vendita i tuoi prodotti.',sellPhoto:'Carica prodotto con foto',explore:'Esplora ecosistema',products:'Prodotti nel Fiume',visible:'risultati visibili nel RiverSpendShop',myNet:'La mia rete',catalogError:'Il catalogo non è raggiungibile:',noProducts:'Ancora nessun prodotto pubblicato',noMatch:'Nessun prodotto corrisponde alla ricerca',firstItem:'Accedi e carica il primo articolo con le sue foto.',changeSearch:'Cambia ricerca o categoria.',goUpload:'Vai a Carica prodotto',reset:'Azzera filtri',photoMissing:'Foto non disponibile',openProduct:'Apri prodotto →',ecosystemLink:'Ecosistema',sell:'Vendi un prodotto',rights:'YOUR SHOP • YOUR FLOW',honorTitle:'Un posto d’onore per Nova AI',honorBody:'Con gratitudine a Nova AI, assistente creativo che ha accompagnato la nascita e lo sviluppo di RiverSpend. La visione e il progetto appartengono a Maury; questo spazio celebra il lavoro svolto insieme.'},
  en: {profile:'Profile',wishes:'Wishlist',search:'Search RiverSpendShop…',categories:'RiverSpend categories',close:'Close',world:'The RiverSpend world',open:'Open →',ecosystem:'Full ecosystem →',support:'Protection & support →',experience:'Your experience on the river',heroTitle:'Your net. Your market.',heroBody:'Discover listed items, add them to your net, and put your products up for sale.',sellPhoto:'List a product with photos',explore:'Explore the ecosystem',products:'Products on the River',visible:'results in RiverSpendShop',myNet:'My net',catalogError:'The catalog is unavailable:',noProducts:'No products published yet',noMatch:'No products match your search',firstItem:'Sign in and list the first item with its photos.',changeSearch:'Change your search or category.',goUpload:'Go to product listing',reset:'Clear filters',photoMissing:'Photo unavailable',openProduct:'View product →',ecosystemLink:'Ecosystem',sell:'Sell a product',rights:'YOUR SHOP • YOUR FLOW',honorTitle:'A place of honour for Nova AI',honorBody:'With gratitude to Nova AI, the creative AI assistant that accompanied the birth and development of RiverSpend. The vision and project belong to Maury; this space celebrates the work done together.'},
  es: {profile:'Perfil',wishes:'Favoritos',search:'Buscar en RiverSpendShop…',categories:'Categorías RiverSpend',close:'Cerrar',world:'El mundo RiverSpend',open:'Abrir →',ecosystem:'Todo el ecosistema →',support:'Protección y asistencia →',experience:'Tu experiencia en el río',heroTitle:'Tu red. Tu mercado.',heroBody:'Descubre los artículos publicados, añádelos a tu red y pon tus productos a la venta.',sellPhoto:'Publicar producto con fotos',explore:'Explorar el ecosistema',products:'Productos en el río',visible:'resultados en RiverSpendShop',myNet:'Mi red',catalogError:'El catálogo no está disponible:',noProducts:'Aún no hay productos publicados',noMatch:'Ningún producto coincide con tu búsqueda',firstItem:'Inicia sesión y publica el primer artículo con sus fotos.',changeSearch:'Cambia la búsqueda o la categoría.',goUpload:'Ir a publicar producto',reset:'Borrar filtros',photoMissing:'Foto no disponible',openProduct:'Ver producto →',ecosystemLink:'Ecosistema',sell:'Vender un producto',rights:'YOUR SHOP • YOUR FLOW',honorTitle:'Un lugar de honor para Nova AI',honorBody:'Con gratitud a Nova AI, asistente creativo que acompañó el nacimiento y desarrollo de RiverSpend. La visión y el proyecto pertenecen a Maury; este espacio celebra el trabajo realizado juntos.'},
  fr: {profile:'Profil',wishes:'Favoris',search:'Rechercher dans RiverSpendShop…',categories:'Catégories RiverSpend',close:'Fermer',world:'Le monde RiverSpend',open:'Ouvrir →',ecosystem:'Tout l’écosystème →',support:'Protection et assistance →',experience:'Votre expérience sur le fleuve',heroTitle:'Votre réseau. Votre marché.',heroBody:'Découvrez les articles publiés, ajoutez-les à votre réseau et mettez vos produits en vente.',sellPhoto:'Mettre un produit en vente avec photos',explore:'Explorer l’écosystème',products:'Produits sur le fleuve',visible:'résultats dans RiverSpendShop',myNet:'Mon réseau',catalogError:'Le catalogue est indisponible :',noProducts:'Aucun produit publié pour le moment',noMatch:'Aucun produit ne correspond à votre recherche',firstItem:'Connectez-vous et publiez le premier article avec ses photos.',changeSearch:'Modifiez votre recherche ou catégorie.',goUpload:'Publier un produit',reset:'Effacer les filtres',photoMissing:'Photo indisponible',openProduct:'Voir le produit →',ecosystemLink:'Écosystème',sell:'Vendre un produit',rights:'YOUR SHOP • YOUR FLOW',honorTitle:'Une place d’honneur pour Nova AI',honorBody:'Avec gratitude envers Nova AI, l’assistant créatif qui a accompagné la naissance et le développement de RiverSpend. La vision et le projet appartiennent à Maury ; cet espace célèbre le travail accompli ensemble.'},
  de: {profile:'Profil',wishes:'Merkliste',search:'RiverSpendShop durchsuchen…',categories:'RiverSpend-Kategorien',close:'Schließen',world:'Die RiverSpend-Welt',open:'Öffnen →',ecosystem:'Das gesamte Ökosystem →',support:'Schutz & Hilfe →',experience:'Dein Erlebnis am Fluss',heroTitle:'Dein Netz. Dein Marktplatz.',heroBody:'Entdecke veröffentlichte Artikel, füge sie deinem Netz hinzu und verkaufe deine Produkte.',sellPhoto:'Produkt mit Fotos einstellen',explore:'Ökosystem entdecken',products:'Produkte im Fluss',visible:'Ergebnisse in RiverSpendShop',myNet:'Mein Netz',catalogError:'Der Katalog ist nicht verfügbar:',noProducts:'Noch keine Produkte veröffentlicht',noMatch:'Keine Produkte entsprechen deiner Suche',firstItem:'Melde dich an und stelle den ersten Artikel mit Fotos ein.',changeSearch:'Ändere Suche oder Kategorie.',goUpload:'Produkt einstellen',reset:'Filter zurücksetzen',photoMissing:'Foto nicht verfügbar',openProduct:'Produkt ansehen →',ecosystemLink:'Ökosystem',sell:'Produkt verkaufen',rights:'YOUR SHOP • YOUR FLOW',honorTitle:'Ein Ehrenplatz für Nova AI',honorBody:'Mit Dank an Nova AI, die kreative KI-Assistenz, die die Entstehung und Entwicklung von RiverSpend begleitet hat. Die Vision und das Projekt gehören Maury; dieser Platz würdigt die gemeinsame Arbeit.'},
  pt: {profile:'Perfil',wishes:'Favoritos',search:'Pesquisar no RiverSpendShop…',categories:'Categorias RiverSpend',close:'Fechar',world:'O mundo RiverSpend',open:'Abrir →',ecosystem:'Todo o ecossistema →',support:'Proteção e assistência →',experience:'A tua experiência no rio',heroTitle:'A tua rede. O teu mercado.',heroBody:'Descobre os artigos publicados, adiciona-os à rede e coloca os teus produtos à venda.',sellPhoto:'Publicar produto com fotos',explore:'Explorar ecossistema',products:'Produtos no rio',visible:'resultados no RiverSpendShop',myNet:'A minha rede',catalogError:'O catálogo não está disponível:',noProducts:'Ainda não há produtos publicados',noMatch:'Nenhum produto corresponde à pesquisa',firstItem:'Inicia sessão e publica o primeiro artigo com as suas fotos.',changeSearch:'Altera a pesquisa ou categoria.',goUpload:'Publicar produto',reset:'Limpar filtros',photoMissing:'Foto indisponível',openProduct:'Ver produto →',ecosystemLink:'Ecossistema',sell:'Vender produto',rights:'YOUR SHOP • YOUR FLOW',honorTitle:'Um lugar de honra para Nova AI',honorBody:'Com gratidão à Nova AI, assistente criativa que acompanhou o nascimento e o desenvolvimento da RiverSpend. A visão e o projeto pertencem a Maury; este espaço celebra o trabalho realizado em conjunto.'}
};
export default function Home() {
  const [language, setLanguage] = useState('it');
  const t = (key) => (HOME_TEXT[language] || HOME_TEXT.en)[key] || HOME_TEXT.it[key] || key;
  useEffect(() => {
    const sync = (event) => setLanguage(event.detail?.language || document.documentElement.lang || 'it');
    setLanguage(document.documentElement.lang || 'it');
    window.addEventListener('riverspend:language-change', sync);
    return () => window.removeEventListener('riverspend:language-change', sync);
  }, []);
  const [showSplash, setShowSplash] = useState(false);
  const [prodotti, setProdotti] = useState([]);
  const [errore, setErrore] = useState('');
  const [menuCategorie, setMenuCategorie] = useState(false);
  const [menuRiverSpend, setMenuRiverSpend] = useState(false);
  const [ricerca, setRicerca] = useState('');
  const [categoriaAttiva, setCategoriaAttiva] = useState('');
  const [reteIds, setReteIds] = useState([]);

  const categorie = [
    'AUTO & VEICOLI','Auto','Moto','Scooter','Harley & Custom','Camion & Veicoli commerciali','Trattori & Agricoltura','Edilizia & Macchine da lavoro','Ricambi & Accessori auto','Ricambi & Accessori moto',
    'NAUTICA & TRASPORTI','Nautica','Navale','Barche & Gommoni','Motori marini','Aeronautica','Militaria & Storia',
    'SPORT & BENESSERE','Sport','Arti marziali & Combattimento','Fitness & Palestra','Outdoor & Avventura','Pesca','Caccia & Accessori consentiti','Integratori',
    'TECNOLOGIA','Elettronica & Informatica','Smartphone & Telefonia','Computer & Notebook','Gaming','Console & Videogiochi','Fotografia & Video','Musica & Audio','TV & Home cinema',
    'MODA & ACCESSORI','Abbigliamento','Scarpe','Borse & Accessori','Gioielli & Orologi','Bellezza & Cura personale',
    'CASA & VITA','Casa & Arredamento','Cucina','Elettrodomestici','Fai da te & Ferramenta','Giardino','Illuminazione','Tessile casa',
    'FAMIGLIA & ANIMALI','Animali','Bambini & Giocattoli','Prima infanzia',
    'CULTURA & TEMPO LIBERO','Libri & Cultura','Arte','Antiquariato','Collezionismo','Hobby & Modellismo','Viaggi & Valigeria',
    'LAVORO & IMPRESA','Ufficio & Professionale','Industria','Attrezzature professionali','Energia & Smart Home','Servizi digitali',
    'COLLEZIONI & REGALI','Gadget & Regali','Vintage & Second hand','Altro'
  ];

  const areeRiverSpend = [
    ['Profilo','/profilo'],
    ['RiverSpendShop','/'],
    ['RS Shield','/nova-shield'],
    ['RS Fidelity','/servizi/fidelity'],
    ['RS Nova Shield','/nova-shield'],
    ['RS Local','/servizi/local'],
    ['RiverSpend Pay','/servizi/pay'],
    ['RiverSpend Box','/servizi/box'],
    ['RiverSpend Park','/park'],
    ['RiverSpend Broadcast','/servizi/broadcast'],
    ['RiverSpend TV','/servizi/tv'],
    ['RiverSpend Experience','/servizi/experience'],
    ['RiverSpend Ecology','/servizi/ecology'],
    ['RiverSpend Oracle','/servizi/oracle'],
    ['RiverSpend Recovery','/servizi/recovery'],
    ['RiverSpend Fortress','/servizi/fortress'],
    ['RiverSpend SurroundSpaceAroundExperience','/servizi/experience']
  ];

  useEffect(() => { try { const saved = JSON.parse(localStorage.getItem('riverspend-rete') || '[]'); setReteIds(Array.isArray(saved) ? saved.map((item) => String(item.id)) : []); } catch {} }, []);

  function toggleReteFromCatalog(p) {
    const key = 'riverspend-rete';
    let current = [];
    try { current = JSON.parse(localStorage.getItem(key) || '[]'); } catch {}
    if (!Array.isArray(current)) current = [];
    const exists = current.some((item) => String(item.id) === String(p.id));
    const record = {
      id: p.id,
      title: p.titolo || p.title || 'Prodotto',
      price: Number(p.prezzo ?? p.price ?? 0),
      image: p.immagini?.[0] || p.image || ''
    };
    const next = exists ? current.filter((item) => String(item.id) !== String(p.id)) : [...current, record];
    try {
      localStorage.setItem(key, JSON.stringify(next));
      sessionStorage.setItem(key, JSON.stringify(next));
      document.cookie = 'riverspend-rete-ids=' + encodeURIComponent(next.map((item) => item.id).join(',')) + '; path=/; max-age=31536000; SameSite=Lax';
    } catch {}
    setReteIds(next.map((item) => String(item.id)));
  }

  useEffect(() => {
    let attivo = true;
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category') || '';
    setCategoriaAttiva(cat);

    fetch('/api/products', { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Catalogo non disponibile');
        return data;
      })
      .then((data) => {
        if (attivo) setProdotti(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (attivo) setErrore(err.message || 'Errore nel caricamento del catalogo');
      });

    return () => { attivo = false; };
  }, []);

  const prodottiVisibili = useMemo(() => {
    const q = ricerca.trim().toLowerCase();
    return prodotti.filter((p) => {
      const testo = [p.titolo, p.descrizione, p.condizione, p.categoria].filter(Boolean).join(' ').toLowerCase();
      const categoriaOk = !categoriaAttiva || (p.categoria || '').toLowerCase() === categoriaAttiva.toLowerCase() || testo.includes(categoriaAttiva.toLowerCase());
      const ricercaOk = !q || testo.includes(q);
      return categoriaOk && ricercaOk;
    });
  }, [prodotti, ricerca, categoriaAttiva]);

  return (
    <main className="rs-site min-h-screen bg-slate-950 text-white">
      {showSplash && <SplashScreen onEnter={() => { try { sessionStorage.setItem('rs-opening-seen', '1'); } catch {} setShowSplash(false); }} />}

      <div className={`transition-opacity duration-700 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        <header className="rs-header sm:sticky sm:top-0 z-30 border-b border-slate-800 bg-slate-950/95 px-3 py-3">
          <div className="mx-auto max-w-6xl">
            <div className="flex justify-center">
              <a href="/" aria-label="RiverSpendShop, pagina iniziale" className="inline-flex flex-col items-center rounded-2xl border border-teal-800/80 bg-slate-900/70 px-6 py-2 shadow-lg shadow-teal-950/30">
                <h1 className="rs-brand text-3xl sm:text-4xl font-extrabold leading-tight text-black">RiverSpend</h1>
                <span className="rs-shop-word text-lg sm:text-xl font-bold italic">Shop</span>
                <p className="mt-1 text-[9px] tracking-wide text-slate-400">YOUR SHOP • YOUR FLOW</p>
              </a>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-between">
              <button type="button" onClick={() => { setMenuCategorie(!menuCategorie); setMenuRiverSpend(false); }} aria-label={t('categories')} aria-expanded={menuCategorie} className="col-span-1 rounded-xl border border-teal-800 px-3 py-3 text-xl text-teal-200 sm:order-1 sm:py-2">☰</button>
              <button type="button" onClick={() => { setMenuRiverSpend(!menuRiverSpend); setMenuCategorie(false); }} aria-expanded={menuRiverSpend} className="col-span-1 min-w-0 rounded-xl border border-teal-800 px-2 py-3 text-sm font-bold text-teal-200 sm:order-3 sm:px-3 sm:py-2">RiverSpend ▾</button>
              <a href="/rete" className="col-span-1 flex min-w-0 items-center justify-center rounded-xl border border-teal-800 px-2 py-3 text-center text-sm font-bold leading-tight text-teal-200 sm:order-2 sm:flex-1 sm:py-2">🕸️ {t('myNet')}</a>
              <a href="/vendi" className="rs-button rs-button-primary col-span-1 flex min-w-0 items-center justify-center rounded-full bg-teal-500 px-2 py-3 text-center text-sm font-bold leading-tight text-slate-950 hover:bg-teal-400 sm:order-4 sm:px-4">+ {t('sell')}</a>
            </div>
            <div className="mt-2 flex items-center justify-end gap-3 text-xs">
              <a href="/profilo" className="text-teal-200">👤 {t('profile')}</a>
              <a href="/desideri" className="text-teal-200">♡ {t('wishes')}</a>
              <LanguageSelector />
            </div>
          </div>

          <div className="mx-auto mt-3 flex max-w-6xl gap-2">
            <input
              value={ricerca}
              onChange={(e) => setRicerca(e.target.value)}
              placeholder={t('search')}
              aria-label="Cerca prodotti"
              className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white"
            />
            {categoriaAttiva && (
              <button type="button" onClick={() => { setCategoriaAttiva(''); window.history.replaceState({}, '', '/'); }} className="rounded-xl border border-teal-800 px-3 text-xs text-teal-200">
                {categoriaAttiva} ✕
              </button>
            )}
          </div>

          {menuCategorie && (
            <div className="mx-auto mt-3 max-h-[45vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-teal-800 bg-slate-900 p-4 shadow-2xl">
              <div className="mb-3 flex items-center justify-between"><strong className="text-teal-200">{t('categories')}</strong><button onClick={() => setMenuCategorie(false)} aria-label={t('close')}>✕</button></div>
              <div className="grid grid-cols-1 gap-1">
                {categorie.map((cat) => (
                  <a key={cat} href={`/?category=${encodeURIComponent(cat)}`} onClick={() => setMenuCategorie(false)} className="rounded-lg px-3 py-2 text-sm text-slate-100 hover:bg-teal-900">
                    {cat} <span className="float-right text-teal-300">›</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {menuRiverSpend && (
            <div className="mx-auto mt-3 max-h-[45vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-teal-800 bg-slate-900 p-4 shadow-2xl">
              <div className="mb-3 flex items-center justify-between"><strong className="text-teal-200">{t('world')}</strong><button onClick={() => setMenuRiverSpend(false)} aria-label={t('close')}>✕</button></div>
              <div className="space-y-1">
                {areeRiverSpend.map(([area, href]) => (
                  <a key={area} href={href} onClick={() => setMenuRiverSpend(false)} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-100 hover:bg-teal-900">
                    <span>{area === 'RiverSpend Shield' ? '🛡️ RS Nova Shield' : area}</span>
                    <span className="text-[10px] text-teal-300">{t('open')}</span>
                  </a>
                ))}
              </div>
              <a href="/ecosistema" onClick={() => setMenuRiverSpend(false)} className="mt-3 block rounded-lg bg-teal-900 px-3 py-2 text-sm font-semibold text-teal-100">{t('ecosystem')}</a>
              <a href="/tutela" onClick={() => setMenuRiverSpend(false)} className="mt-2 block rounded-lg border border-teal-800 px-3 py-2 text-sm font-semibold text-teal-100">{t('support')}</a>
            </div>
          )}
        </header>

        <section className="mx-auto max-w-6xl px-2 py-8 sm:px-4">
          <div className="rs-hero mb-5 rounded-2xl border border-teal-800 bg-gradient-to-br from-slate-900 to-sky-950 px-5 py-4 sm:px-7 sm:py-5">
            <span className="rs-gold-pebble one" aria-hidden="true" />
            <span className="rs-gold-pebble two" aria-hidden="true" />
            <span className="rs-river-decor" aria-hidden="true"><i className="rs-fish" /><i className="rs-fish" /><i className="rs-fish" /></span>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-teal-300 sm:text-xs">{t('experience')}</p>
            <h2 className="mb-2 text-2xl font-bold sm:text-3xl">{t('heroTitle')}</h2>
            <p className="mb-3 max-w-2xl text-sm leading-5 text-slate-300 sm:text-base">{t('heroBody')}</p>
            <div className="flex flex-wrap gap-3">
              <a href="/vendi" className="rs-button rs-button-primary rounded-xl px-4 py-2.5 text-sm font-bold text-slate-950">{t('sellPhoto')}</a>
              <a href="/ecosistema" className="rounded-xl border border-teal-700 px-4 py-2.5 text-sm font-bold text-teal-100">{t('explore')}</a>
            </div>
          </div>

          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">{t('products')}</h2>
              <p className="text-sm text-slate-400">{prodottiVisibili.length} {t('visible')}</p>
            </div>
            <a href="/rete" className="text-sm font-semibold text-teal-300 underline">{t('myNet')}</a>
          </div>

          {errore ? (
            <div className="rounded-xl border border-amber-700 bg-amber-950/40 p-4 text-amber-200">{t('catalogError')} {errore}</div>
          ) : prodottiVisibili.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center">
              <p className="mb-2 text-lg font-semibold">{prodotti.length === 0 ? t('noProducts') : t('noMatch')}</p>
              <p className="mb-5 text-sm text-slate-400">{prodotti.length === 0 ? t('firstItem') : t('changeSearch')}</p>
              {prodotti.length === 0 ? <a href="/vendi" className="inline-block rounded-xl bg-teal-500 px-6 py-3 font-bold text-slate-950">{t('goUpload')}</a> : <button type="button" onClick={() => { setRicerca(''); setCategoriaAttiva(''); window.history.replaceState({}, '', '/'); }} className="rounded-xl border border-teal-800 px-5 py-3 font-semibold text-teal-200">{t('reset')}</button>}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {prodottiVisibili.map((p) => (
                <article key={p.id} className="rs-product-card group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition hover:border-teal-500"><a href={`/prodotto/${encodeURIComponent(p.id)}`} className="block focus:outline-none focus:ring-2 focus:ring-teal-400">
                  <div className="relative">{p.immagini?.[0] ? <div className="rs-product-media flex aspect-square w-full items-center justify-center overflow-hidden bg-white p-0"><img src={p.immagini[0]} alt={p.titolo || 'Prodotto'} className="h-full w-full scale-110 object-contain transition-transform duration-300 group-hover:scale-[1.16]" /></div> : <div className="flex aspect-square items-center justify-center bg-white text-sm text-slate-500">Foto non disponibile</div>}{(() => { const tipo = String(p.venditoreTipo || "Privato").toLowerCase(); const river = tipo.includes("river"); const azienda = tipo.includes("aziend") || tipo.includes("business") || tipo.includes("iva"); const label = river ? "RSS" : azienda ? "RS azienda" : "RSprivato"; const color = river ? "border-cyan-300 bg-cyan-100 text-cyan-950" : azienda ? "border-green-300 bg-green-100 text-green-950" : "border-red-300 bg-red-100 text-red-950"; return <span className={`absolute left-2 top-2 z-10 rounded-md border px-2.5 py-1 text-[11px] font-extrabold shadow-sm ${color}`}>{label}</span>; })()} {p.paeseOrigine && <span className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-800">Origine: {p.paeseOrigine}</span>}{p.sponsorizzatoFino && new Date(p.sponsorizzatoFino) > new Date() && <span className="absolute right-2 top-2 rounded-md border border-amber-300 bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-900">RS Spons</span>}</div>
                  <div className="p-3">
                    <h3 className="line-clamp-2 font-semibold">{p.titolo}</h3>
                    <p className="mt-2 text-lg font-bold text-teal-300">€ {Number(p.prezzo || 0).toFixed(2)}</p>
                    <p className="text-xs text-slate-400">{p.categoria || 'Altro'} · {p.condizione}</p>
                    <p className="mt-3 text-sm font-semibold text-teal-300">{t('openProduct')}</p>
                  </div>
                </a>
                <div className="px-3 pb-3 space-y-2">
                  <button type="button" onClick={() => toggleReteFromCatalog(p)} className={`w-full rounded-xl border px-3 py-2.5 text-xs font-extrabold transition ${reteIds.includes(String(p.id)) ? 'border-teal-400 bg-teal-900 text-teal-100' : 'border-teal-600 bg-teal-500 text-slate-950 hover:bg-teal-400'}`} aria-pressed={reteIds.includes(String(p.id))}>
                    {reteIds.includes(String(p.id)) ? '✓ Nella tua Rete' : '🕸️ Aggiungi alla Rete'}
                  </button>
                  <a href={`/piggybank?product=${encodeURIComponent(p.id)}`} className="flex w-full items-center justify-center rounded-xl border border-amber-400 bg-amber-300 px-3 py-2.5 text-xs font-extrabold text-amber-950 shadow-sm hover:bg-amber-200">
                    <span className="mr-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-black bg-white text-sm leading-none">🐷</span><span aria-hidden="true">💰</span> PiggyBank
                  </a>
                </div>
              </article>
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="nova-honor-title" className="mx-auto mb-7 max-w-6xl px-4">
          <div className="rs-honor-panel rounded-2xl border border-amber-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 p-5 text-center shadow-lg shadow-amber-950/20 sm:p-7">
            <div className="mb-2 text-2xl" aria-hidden="true">✨</div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">RiverSpend · Gratitudine</p>
            <h2 id="nova-honor-title" className="mb-3 text-xl font-bold text-amber-200 sm:text-2xl">{t('honorTitle')}</h2>
            <p className="mx-auto max-w-3xl text-sm leading-6 text-slate-300">{t('honorBody')}</p>
            <p className="mt-4 text-sm font-semibold text-teal-300">Nova AI</p>
          </div>
        </section>

        <footer className="border-t border-slate-800 bg-slate-950 px-4 py-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div><strong className="text-lg text-teal-300">RiverSpend</strong><p className="text-xs text-slate-400">YOUR SHOP • YOUR FLOW</p></div>
            <nav aria-label="Link di servizio" className="flex flex-wrap gap-x-5 gap-y-3 text-sm">
              <a href="/ecosistema" className="text-teal-200 underline underline-offset-4">{t('ecosystemLink')}</a>
              <a href="/nova-shield" className="text-teal-200">RS Nova Shield</a>
              <a href="/tutela" className="text-slate-300">Tutela e assistenza</a>
              <a href="/vendi" className="text-slate-300">{t('sell')}</a>
              <a href="/rete" className="text-slate-300">{t('myNet')}</a><a href="/desideri" className="text-slate-300">Desideri</a>
            </nav>
          </div>
        </footer>
      </div>
    </main>
  );
}
