'use client';

import { useEffect, useMemo, useState } from 'react';
import SplashScreen from './SplashScreen';
import { supabase } from '../lib/supabase';
import { riverSpendCategorySections as categorieSezioni, riverSpendCategories as categorie } from '../lib/riverSpendCategories';

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

function countryFlag(country) {
  const value = String(country || '').trim().toLowerCase();
  const codes = {
    it: '🇮🇹', italia: '🇮🇹', italy: '🇮🇹', fr: '🇫🇷', francia: '🇫🇷', france: '🇫🇷',
    no: '🇳🇴', norvegia: '🇳🇴', norway: '🇳🇴', de: '🇩🇪', germania: '🇩🇪', germany: '🇩🇪',
    es: '🇪🇸', spagna: '🇪🇸', spain: '🇪🇸', pt: '🇵🇹', portogallo: '🇵🇹', portugal: '🇵🇹',
    gb: '🇬🇧', uk: '🇬🇧', 'regno unito': '🇬🇧', 'united kingdom': '🇬🇧',
    us: '🇺🇸', usa: '🇺🇸', 'stati uniti': '🇺🇸', 'united states': '🇺🇸',
    ch: '🇨🇭', svizzera: '🇨🇭', switzerland: '🇨🇭', at: '🇦🇹', austria: '🇦🇹',
    nl: '🇳🇱', olanda: '🇳🇱', netherlands: '🇳🇱', be: '🇧🇪', belgio: '🇧🇪', belgium: '🇧🇪',
    se: '🇸🇪', svezia: '🇸🇪', sweden: '🇸🇪', dk: '🇩🇰', danimarca: '🇩🇰', denmark: '🇩🇰',
    fi: '🇫🇮', finlandia: '🇫🇮', finland: '🇫🇮', pl: '🇵🇱', polonia: '🇵🇱', poland: '🇵🇱',
    gr: '🇬🇷', grecia: '🇬🇷', greece: '🇬🇷', ie: '🇮🇪', irlanda: '🇮🇪', ireland: '🇮🇪',
    jp: '🇯🇵', giappone: '🇯🇵', japan: '🇯🇵', cn: '🇨🇳', cina: '🇨🇳', china: '🇨🇳',
    au: '🇦🇺', australia: '🇦🇺', ca: '🇨🇦', canada: '🇨🇦', br: '🇧🇷', brasile: '🇧🇷', brazil: '🇧🇷'
  };
  if (codes[value]) return codes[value];
  if (/^[a-z]{2}$/i.test(value)) return String.fromCodePoint(...value.toUpperCase().split('').map((char) => 127397 + char.charCodeAt(0)));
  return '';
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
  // Mostra la schermata iniziale solo finché l'utente non è entrato nello Shop in questa sessione.
  // Lo stato iniziale resta coperto dalla splash per evitare il lampo della homepage.
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => {
    try {
      if (sessionStorage.getItem('rs-opening-seen') === '1') setShowSplash(false);
    } catch {}
  }, []);
  const [prodotti, setProdotti] = useState([]);
  const [errore, setErrore] = useState('');
  const [menuCategorie, setMenuCategorie] = useState(false);
  const [ricercaAperta, setRicercaAperta] = useState(false);
  const [menuRiverSpend, setMenuRiverSpend] = useState(false);
  const [ricerca, setRicerca] = useState('');
  const [riverVoiceStatus, setRiverVoiceStatus] = useState('');
  const [riverVoiceStyle, setRiverVoiceStyle] = useState('femminile');
  const [riverVoiceActive, setRiverVoiceActive] = useState(false);
  const [novaOpen, setNovaOpen] = useState(false);
  const [categoriaAttiva, setCategoriaAttiva] = useState('');
  const [reteIds, setReteIds] = useState([]);
  const [desideriIds, setDesideriIds] = useState([]);
  const [accesso18, setAccesso18] = useState(false);
  const [mostraGate18, setMostraGate18] = useState(false);
  const [rsForceAperta, setRsForceAperta] = useState(false);
  const [rsForceProdottiRandom, setRsForceProdottiRandom] = useState([]);
  const [rsFortuneAperta, setRsFortuneAperta] = useState(false);
  const [rsFortuneSpinning, setRsFortuneSpinning] = useState(false);
  const [rsFortunePrize, setRsFortunePrize] = useState('');
  const [rsFortuneRotation, setRsFortuneRotation] = useState(0);
  const [rsFortuneCelebration, setRsFortuneCelebration] = useState(false);
  const [rsLotteryAperta, setRsLotteryAperta] = useState(false);
  const [rsFolgoreAperta, setRsFolgoreAperta] = useState(false);
  const [rsAdmin, setRsAdmin] = useState(false);

  const areeRiverSpend = [
    ['Profilo','/profilo'],
    ['RiverSpendShop','/'],
    ['📲 Scarica le app RiverSpend','/app'],
    ['🎁 RiverSpend Gift Card','/gift-card'],
    ['RS Shield','/nova-shield'],
    ['RS Fidelity','/servizi/fidelity'],
    ['RS Nova Shield','/nova-shield'],
    ['RS Local','/servizi/local'],
    ['RiverSpend Pay','/servizi/pay'],
    ['RiverSpend Box','/servizi/box'],
    ['RiverSpend Park','/park'],
    ['🌌 RS FutureWorld · FutureCity & Droid','/rs-future-world'],
    ['RiverSpend Broadcast','/servizi/broadcast'],
    ['RiverSpend Music','/servizi/music'],
    ['RS Spons','/rs-spons'],
    ['RiverSpend TV','/servizi/tv'],
    ['RiverSpend Experience','/servizi/experience'],
    ['RiverSpend Ecology','/servizi/ecology'],
    ['RiverSpend Oracle','/servizi/oracle'],
    ['RiverSpend Recovery','/servizi/recovery'],
    ['RiverSpend Fortress','/servizi/fortress'],
    ['RiverSpend SurroundSpaceAroundExperience','/servizi/experience']
  ];

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from('rs_admin_roles').select('role').eq('user_id', user.id).maybeSingle();
        if (active) setRsAdmin(data?.role === 'admin');
      } catch {}
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => { try { const saved = JSON.parse(localStorage.getItem('riverspend-rete') || '[]'); setReteIds(Array.isArray(saved) ? saved.map((item) => String(item.id)) : []); } catch {} }, []);

  function playRsForceSound(ctx) {
    try {
      if (!ctx) return;
      const now = ctx.currentTime;

      // RS FORCE — soundscape originale: profondo, lento, avvolgente.
      const master = ctx.createGain();
      const lowpass = ctx.createBiquadFilter();
      const compressor = ctx.createDynamicsCompressor();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.58, now + 0.9);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 6.8);
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(680, now);
      lowpass.frequency.exponentialRampToValueAtTime(115, now + 6.4);
      lowpass.Q.value = 0.9;
      compressor.threshold.value = -20;
      compressor.knee.value = 24;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.03;
      compressor.release.value = 1.2;
      master.connect(lowpass);
      lowpass.connect(compressor);
      compressor.connect(ctx.destination);

      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(43, now);
      sub.frequency.exponentialRampToValueAtTime(31, now + 6.2);
      subGain.gain.setValueAtTime(0.0001, now);
      subGain.gain.exponentialRampToValueAtTime(0.95, now + 1.15);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 6.65);
      sub.connect(subGain);
      subGain.connect(master);
      sub.start(now);
      sub.stop(now + 6.9);

      const body = ctx.createOscillator();
      const bodyGain = ctx.createGain();
      body.type = 'triangle';
      body.frequency.setValueAtTime(72, now);
      body.frequency.exponentialRampToValueAtTime(49, now + 5.7);
      bodyGain.gain.setValueAtTime(0.0001, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.5, now + 1.0);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 6.35);
      body.connect(bodyGain);
      bodyGain.connect(master);
      body.start(now);
      body.stop(now + 6.6);

      // Movimento lento nel campo stereo: dà la sensazione di "spazio" in cuffia.
      const air = ctx.createOscillator();
      const airGain = ctx.createGain();
      const airFilter = ctx.createBiquadFilter();
      const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      air.type = 'sine';
      air.frequency.setValueAtTime(155, now + 0.4);
      air.frequency.exponentialRampToValueAtTime(330, now + 2.6);
      air.frequency.exponentialRampToValueAtTime(125, now + 6.0);
      airGain.gain.setValueAtTime(0.0001, now);
      airGain.gain.exponentialRampToValueAtTime(0.12, now + 1.5);
      airGain.gain.exponentialRampToValueAtTime(0.0001, now + 6.2);
      airFilter.type = 'lowpass';
      airFilter.frequency.value = 850;
      air.connect(airGain);
      airGain.connect(airFilter);
      if (pan) {
        airFilter.connect(pan);
        pan.pan.setValueAtTime(-0.7, now);
        pan.pan.linearRampToValueAtTime(0.7, now + 3.0);
        pan.pan.linearRampToValueAtTime(-0.45, now + 6.0);
        pan.connect(master);
      } else {
        airFilter.connect(master);
      }
      air.start(now + 0.4);
      air.stop(now + 6.25);

      // Coda morbida: piccola eco filtrata, non un "beep".
      const echo = ctx.createDelay(1.0);
      const echoGain = ctx.createGain();
      echo.delayTime.value = 0.72;
      echoGain.gain.value = 0.18;
      master.connect(echo);
      echo.connect(echoGain);
      echoGain.connect(lowpass);

      // Scariche elettriche del Palantir: crepitii brevi, brillanti e non troppo forti.
      const zapBus = ctx.createGain();
      const zapFilter = ctx.createBiquadFilter();
      zapBus.gain.value = 0.42;
      zapFilter.type = 'bandpass';
      zapFilter.frequency.value = 2400;
      zapFilter.Q.value = 0.8;
      zapBus.connect(zapFilter);
      zapFilter.connect(compressor);

      // Fiammata iniziale originale: soffio elettrico crescente con movimento stereo.
      const surge = ctx.createBufferSource();
      const surgeGain = ctx.createGain();
      const surgeFilter = ctx.createBiquadFilter();
      const surgePan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const surgeBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.9), ctx.sampleRate);
      const surgeData = surgeBuffer.getChannelData(0);
      for (let n = 0; n < surgeData.length; n++) {
        const t = n / surgeData.length;
        surgeData[n] = (Math.random() * 2 - 1) * Math.pow(1 - t, 1.7);
      }
      surge.buffer = surgeBuffer;
      surgeFilter.type = 'bandpass';
      surgeFilter.frequency.setValueAtTime(700, now);
      surgeFilter.frequency.exponentialRampToValueAtTime(5200, now + 0.22);
      surgeFilter.frequency.exponentialRampToValueAtTime(850, now + 0.82);
      surgeFilter.Q.value = 0.75;
      surgeGain.gain.setValueAtTime(0.0001, now);
      surgeGain.gain.exponentialRampToValueAtTime(0.5, now + 0.09);
      surgeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.88);
      surge.connect(surgeFilter);
      surgeFilter.connect(surgeGain);
      if (surgePan) {
        surgeGain.connect(surgePan);
        surgePan.pan.setValueAtTime(-0.65, now);
        surgePan.pan.linearRampToValueAtTime(0.65, now + 0.42);
        surgePan.pan.linearRampToValueAtTime(0, now + 0.85);
        surgePan.connect(compressor);
      } else {
        surgeGain.connect(compressor);
      }
      surge.start(now);
      surge.stop(now + 0.9);

      // Rumore filtrato a impulsi per simulare piccole scariche elettriche.
      const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.22), ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let n = 0; n < noiseData.length; n++) {
        noiseData[n] = (Math.random() * 2 - 1) * (1 - n / noiseData.length);
      }
      [0.035, 0.075, 0.12, 0.19, 0.28, 0.43, 0.49, 0.56, 0.88, 0.96, 1.04, 1.12, 1.22, 1.78, 1.91, 2.04, 2.13, 2.22, 2.88, 3.01, 3.14, 3.28, 4.02, 4.16, 4.3, 4.43, 5.02, 5.17, 5.31].forEach((offset, index) => {
        const start = now + offset;
        const crackle = ctx.createBufferSource();
        const crackleGain = ctx.createGain();
        const crackleFilter = ctx.createBiquadFilter();
        crackle.buffer = noiseBuffer;
        crackleFilter.type = 'highpass';
        crackleFilter.frequency.value = 1250 + Math.random() * 2600;
        crackleGain.gain.setValueAtTime(0.0001, start);
        crackleGain.gain.exponentialRampToValueAtTime(index < 5 ? 0.72 : (index % 3 === 0 ? 0.52 : 0.38), start + 0.012);
        crackleGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.19);
        crackle.connect(crackleFilter);
        crackleFilter.connect(crackleGain);
        crackleGain.connect(zapBus);
        crackle.start(start);
        crackle.stop(start + 0.21);

        // Piccolo scatto tonale per dare alla scarica un carattere energetico.
        const snap = ctx.createOscillator();
        const snapGain = ctx.createGain();
        snap.type = 'sawtooth';
        snap.frequency.setValueAtTime(2400 + Math.random() * 2300, start);
        snap.frequency.exponentialRampToValueAtTime(320 + Math.random() * 260, start + 0.075);
        snapGain.gain.setValueAtTime(0.0001, start);
        snapGain.gain.exponentialRampToValueAtTime(0.11, start + 0.008);
        snapGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.09);
        snap.connect(snapGain);
        snapGain.connect(zapBus);
        snap.start(start);
        snap.stop(start + 0.1);
      });

      window.setTimeout(() => ctx.close().catch(() => {}), 7400);
    } catch {}
  }

  const RS_FORTUNE_PRIZES = ['💰 +5 RiverMoney (€0,50)','💰 +10 RiverMoney (€1)','💰 +20 RiverMoney (€2)','🚚 Spedizione gratuita','🏷️ Sconto 5%','🔥 RS Booster','🎁 Premio sorpresa','⭐ +500 RSP'];

  async function giraRsFortune() {
    if (rsFortuneSpinning) return;
    // Il controllo definitivo è sul server: il CEO/admin non viene bloccato dal localStorage.
    const winner = Math.floor(Math.random() * RS_FORTUNE_PRIZES.length);
    const segment = 360 / RS_FORTUNE_PRIZES.length;
    const target = 7 * 360 + (360 - winner * segment - segment / 2);
    setRsFortuneAperta(true);
    setRsFortunePrize('');
    setRsFortuneSpinning(true);
    setRsFortuneRotation((prev) => prev + target);

    window.setTimeout(async () => {
      const label = RS_FORTUNE_PRIZES[winner];
      const rewardMap = [
        { type: 'rivermoney', rivermoney: 5, rsp: 0 },
        { type: 'rivermoney', rivermoney: 10, rsp: 0 },
        { type: 'rivermoney', rivermoney: 20, rsp: 0 },
        { type: 'shipping', rivermoney: 0, rsp: 0 },
        { type: 'discount', rivermoney: 0, rsp: 0 },
        { type: 'booster', rivermoney: 0, rsp: 0 },
        { type: 'surprise', rivermoney: 0, rsp: 0 },
        { type: 'rsp', rivermoney: 0, rsp: 500 }
      ];
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setRsFortuneSpinning(false);
          setRsFortunePrize('🔐 Accedi al tuo account per ricevere il premio.');
          return;
        }
        const reward = rewardMap[winner];
        const { error } = await supabase.rpc('rs_fortune_credit', {
          p_reward_type: reward.type,
          p_reward_label: label,
          p_rivermoney: reward.rivermoney,
          p_rsp: reward.rsp,
          p_metadata: { wheel_index: winner }
        });
        if (error) {
          if (error.message?.includes('FORTUNE_ALREADY_PLAYED')) {
            setRsFortunePrize('🍀 Hai già usato il tuo unico giro. La fortuna è già stata assegnata.');
          } else {
            console.error('RS FORTUNE credit error:', error);
            setRsFortunePrize('⚠️ Il premio non è stato accreditato. Riprova.');
          }
          return;
        }
        if (!rsAdmin) {
          try { localStorage.setItem('riverspend-fortune-played', 'true'); } catch {}
        }
        setRsFortunePrize(label);
        setRsFortuneCelebration(true);
        window.setTimeout(() => setRsFortuneCelebration(false), 1800);
      } catch (error) {
        console.error('RS FORTUNE credit:', error);
        setRsFortunePrize('⚠️ Il premio non è stato accreditato. Riprova.');
      } finally {
        setRsFortuneSpinning(false);
      }
    }, 5200);
  }

  function eseguiRichiestaNovaTestuale() {
    const richiesta = String(ricerca || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[.,!?;:]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!richiesta) return;
    const senzaFormula = richiesta
      .replace(/^(hey\s+river|ehi\s+river|river|nova|nov[aà])[, ]*/i, '')
      .replace(/^(per favore\s+)?(cerca|cercami|trova|trovami|fammi vedere|mostrami|apri|aprimi|vai a|vai al|vai alla|vorrei|voglio|cerco)\s+/i, '')
      .replace(/^(la sezione|sezione|il reparto|la categoria|categoria|il|lo|la|i|gli|le|dei|degli|delle|del|della|dello)\s+/i, '')
      .trim();
    if (/\b(integratori|integratore|supplementi|supplemento)\b/.test(richiesta) || /^(integratori|integratore|supplementi|supplemento)$/.test(senzaFormula)) {
      setRicerca('');
      setCategoriaAttiva('Integratori');
      setRicercaAperta(true);
      window.history.replaceState({}, '', '/?category=' + encodeURIComponent('Integratori'));
      setRiverVoiceStatus('Apro la categoria Integratori.');
      document.getElementById('rs-products-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const risposta = new SpeechSynthesisUtterance('Ecco la categoria Integratori.');
        risposta.lang = 'it-IT';
        window.speechSynthesis.speak(risposta);
      }
      return;
    }
    setRicerca(senzaFormula || richiesta);
    setCategoriaAttiva('');
    setRicercaAperta(true);
    document.getElementById('rs-products-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function apriNovaConSaluto() {
    setNovaOpen(true);
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const saluto = new SpeechSynthesisUtterance('Ciao, sono River AI A1A1. Sono qui al tuo servizio, fammi una domanda!');
      saluto.lang = 'it-IT';
      saluto.rate = 0.96;
      saluto.pitch = 1.02;
      window.speechSynthesis.speak(saluto);
    } catch (error) {
      console.warn('Voce di benvenuto River AI non disponibile:', error);
    }
  }

  function avviaRiverVoice() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRiverVoiceActive(false);
      setRiverVoiceStatus('La voce non è supportata in questo browser. Apri RiverSpend con Chrome e consenti il microfono.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'it-IT';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    let gestita = false;
    setRiverVoiceActive(true);
    setRiverVoiceStatus('Ti ascolto… parla adesso.');

    const speak = (message) => {
      if (!('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'it-IT';
        const styles = {
          femminile: { pitch: 1.12, rate: 1.12 },
          maschile: { pitch: 0.82, rate: 1.08 },
          sensuale: { pitch: 0.9, rate: 1.0 },
          robotica: { pitch: 0.7, rate: 1.08 }
        };
        const style = styles[riverVoiceStyle] || styles.femminile;
        utterance.pitch = style.pitch;
        utterance.rate = style.rate;
        const voice = window.speechSynthesis.getVoices().find((item) => /^it([-_]|$)/i.test(item.lang));
        if (voice) utterance.voice = voice;
        window.speechSynthesis.speak(utterance);
      } catch {}
    };

    recognition.onresult = (event) => {
      if (gestita) return;
      gestita = true;
      const alternatives = [];
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        for (let j = 0; j < result.length; j++) {
          const text = String(result[j]?.transcript || '').trim();
          if (text) alternatives.push(text);
        }
      }
      const spoken = alternatives[0] || '';
      const q = spoken.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[.,!?;:]/g, ' ').replace(/\s+/g, ' ').trim();
      if (!q) {
        setRiverVoiceStatus('Non ho capito. Tocca River e ripeti più vicino al microfono.');
        setRiverVoiceActive(false);
        return;
      }
      setRiverVoiceStatus('Hai detto: “' + spoken + '”');

      const routes = [
        { terms: ['river spend park', 'riverspend park', 'apri park', 'apri il park', 'apri il parco', 'apri parco', 'vai al park', 'vai al parco', 'fammi vedere il parco', 'fammi vedere il park', 'portami al parco'], href: '/park', label: 'RiverSpend Park' },
        { terms: ['rs force', 'attiva force', 'apri force', 'apri rs force'], href: null, label: 'RS FORCE' },
        { terms: ['river spend shop', 'riverspendshop', 'apri shop', 'apri lo shop', 'apri lo riverspendshop', 'aprimi lo shop', 'aprimi riverspend', 'torna allo shop', 'home'], href: '/', label: 'RiverSpendShop' },
        { terms: ['profilo', 'apri il profilo', 'apri profilo', 'vai al profilo'], href: '/profilo', label: 'Profilo' },
        { terms: ['i miei ordini', 'apri gli ordini', 'apri ordini', 'vai agli ordini', 'ordini'], href: '/ordini', label: 'Ordini' },
        { terms: ['rete', 'la mia rete', 'apri la rete', 'apri rete', 'carrello'], href: '/rete', label: 'La mia Rete' },
        { terms: ['desideri', 'lista dei desideri', 'wishlist', 'apri i desideri'], href: '/desideri', label: 'Desideri' },
        { terms: ['ecology', 'river spend ecology', 'apri ecology'], href: '/servizi/ecology', label: 'RiverSpend Ecology' },
        { terms: ['solidale', 'river spend solidale', 'apri solidale'], href: '/servizi/ecology#solidale', label: 'RiverSpend Solidale' },
        { terms: ['future life', 'piggybank', 'piggy bank', 'apri future life'], href: '/servizi/ecology#future-life', label: 'PiggyBank Future Life' },
        { terms: ['vendi', 'vendi un prodotto', 'carica un prodotto', 'pubblica un prodotto'], href: '/vendi', label: 'Vendi un prodotto' }
      ];
      const route = routes.find((item) => item.terms.some((term) => q === term || q.includes(term)));
      if (route?.label === 'RS FORCE') {
        setRsForceAperta(true);
        setRiverVoiceStatus('RS FORCE è pronto.');
        document.getElementById('rs-force-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        speak('RS Force pronto.');
        return;
      }
      if (route?.href) {
        setRiverVoiceStatus('Apro ' + route.label + '…');
        window.location.assign(route.href);
        return;
      }

      let searchTerms = q
        .replace(/^(hey\s+river|ehi\s+river|river|nova|nov[aà])[, ]*/i, '')
        .replace(/^(per favore\s+)?(cerca|cercami|trova|trovami|fammi vedere|mostrami|apri|aprimi|vorrei|voglio|cerco)\s+/i, '')
        .replace(/^(il|lo|la|i|gli|le|dei|degli|delle|del|della|dello)\s+/i, '')
        .trim();
      if (/\b(integratori|integratore|supplementi|supplemento)\b/.test(searchTerms)) {
        setRicerca('');
        setCategoriaAttiva('Integratori');
        setRicercaAperta(true);
        window.history.replaceState({}, '', '/?category=' + encodeURIComponent('Integratori'));
        setRiverVoiceStatus('Apro la categoria Integratori.');
        document.getElementById('rs-products-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        speak('Ecco gli integratori.');
        return;
      }
      if (/^(abbigliamento|vestiti|vestito|moda)$/.test(searchTerms)) searchTerms = 'Abbigliamento';
      if (searchTerms) {
        setRicerca(searchTerms);
        setRicercaAperta(true);
        setCategoriaAttiva('');
        setRiverVoiceStatus('Cerco: ' + searchTerms);
        if (window.location.pathname !== '/' && window.location.pathname !== '') {
          window.location.assign('/?q=' + encodeURIComponent(searchTerms));
        } else {
          window.history.replaceState({}, '', '/?q=' + encodeURIComponent(searchTerms));
          window.scrollTo({ top: 0, behavior: 'smooth' });
          speak('Cerco ' + searchTerms + '.');
        }
        return;
      }
      setRiverVoiceStatus('Non ho riconosciuto il comando. Prova: “apri Park”, “apri la Rete” oppure “cerca iPhone”.');
      setRiverVoiceActive(false);
    };

    recognition.onerror = (event) => {
      setRiverVoiceActive(false);
      const message = event?.error === 'not-allowed' || event?.error === 'service-not-allowed'
        ? 'Microfono bloccato: consenti a Chrome di usare il microfono per RiverSpend.'
        : event?.error === 'no-speech'
          ? 'Non ho sentito la voce. Tocca River e parla subito.'
          : 'La voce si è interrotta. Riprova toccando River.';
      setRiverVoiceStatus(message);
    };
    recognition.onend = () => {
      setRiverVoiceActive(false);
      setRiverVoiceStatus((current) => current === 'Ti ascolto… parla adesso.' ? 'Non ho sentito la richiesta. Tocca River e riprova.' : current);
    };
    try {
      recognition.start();
    } catch {
      setRiverVoiceActive(false);
      setRiverVoiceStatus('Microfono già attivo. Attendi un secondo e riprova.');
    }
  }

  function apriRsForce() {
    setRsForceAperta(true);
    let forceAudioCtx = null;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        forceAudioCtx = new AudioCtx();
        if (forceAudioCtx.state === 'suspended') forceAudioCtx.resume().catch(() => {});
      }
    } catch {}

    // RS FORCE è puramente sonoro: nessuna voce sintetica.
    window.setTimeout(() => playRsForceSound(forceAudioCtx), 120);
  }

  function apriRsFolgore() {
    setRsFolgoreAperta((v) => !v);
    // Effetto sonoro originale generato via Web Audio: rombo profondo con passaggio stereo.
    // Parte solo dopo il clic dell'utente; non richiede un file esterno né autoplay.
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const master = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const compressor = ctx.createDynamicsCompressor();
      const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.42, now + 0.8);
      master.gain.setValueAtTime(0.42, now + 4.0);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 8.2);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(520, now);
      filter.frequency.linearRampToValueAtTime(900, now + 2.2);
      filter.frequency.exponentialRampToValueAtTime(170, now + 7.8);
      filter.Q.value = 0.7;
      compressor.threshold.value = -22;
      compressor.knee.value = 24;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.04;
      compressor.release.value = 0.8;
      master.connect(filter);
      filter.connect(compressor);
      if (pan) {
        compressor.connect(pan);
        pan.connect(ctx.destination);
        pan.pan.setValueAtTime(-0.85, now);
        pan.pan.linearRampToValueAtTime(0.85, now + 3.8);
        pan.pan.linearRampToValueAtTime(0.15, now + 7.5);
      } else {
        compressor.connect(ctx.destination);
      }

      [42, 56, 83].forEach((frequency, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = index === 1 ? 'triangle' : 'sawtooth';
        osc.frequency.setValueAtTime(frequency * 0.82, now);
        osc.frequency.linearRampToValueAtTime(frequency * 1.18, now + 2.7);
        osc.frequency.exponentialRampToValueAtTime(frequency * 0.72, now + 7.7);
        gain.gain.value = index === 0 ? 0.42 : index === 1 ? 0.12 : 0.035;
        osc.connect(gain);
        gain.connect(master);
        osc.start(now);
        osc.stop(now + 8.25);
      });

      // Fruscio filtrato per dare corpo al flusso d'aria del passaggio.
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.32;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(320, now);
      noiseFilter.frequency.linearRampToValueAtTime(1100, now + 2.5);
      noiseFilter.frequency.exponentialRampToValueAtTime(240, now + 7.6);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.0001, now);
      noiseGain.gain.linearRampToValueAtTime(0.10, now + 1.1);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 8.0);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(master);
      noise.start(now);
      noise.stop(now + 8.1);
      window.setTimeout(() => { try { ctx.close(); } catch {} }, 9000);
    } catch (error) {
      console.warn('RS FOLGORE audio unavailable:', error);
    }
  }

  function toggleDesideriFromCatalog(p) {
    const key = 'riverspend-wishlist';
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
    const next = exists ? current.filter((item) => String(item.id) !== String(p.id)) : [record, ...current];
    try {
      localStorage.setItem(key, JSON.stringify(next));
      sessionStorage.setItem(key, JSON.stringify(next));
    } catch {}
    setDesideriIds(next.map((item) => String(item.id)));
  }

  async function toggleReteFromCatalog(p) {
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

    // Se l'utente è autenticato, mantieni la Rete anche nell'account RiverSpend.
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const productId = String(p.id);
        if (exists) {
          const { error } = await supabase
            .from('river_net_items')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', productId);
          if (error) console.error('RiverSpend Rete cloud delete:', error);
        } else {
          const { error } = await supabase
            .from('river_net_items')
            .upsert({ user_id: user.id, product_id: productId }, { onConflict: 'user_id,product_id' });
          if (error) console.error('RiverSpend Rete cloud insert:', error);
        }
      }
    } catch (error) {
      console.error('RiverSpend Rete cloud sync:', error);
    }
  }

  useEffect(() => {
    let attivo = true;
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category') || '';
    const query = params.get('q') || '';
    try {
      const saved = JSON.parse(localStorage.getItem('riverspend-wishlist') || '[]');
      setDesideriIds(Array.isArray(saved) ? saved.map((item) => String(item.id)) : []);
    } catch { setDesideriIds([]); }
    setCategoriaAttiva(cat);
    if (query) { setRicerca(query); setRicercaAperta(true); }
    try {
      const verificato = localStorage.getItem('riverspend-18plus') === 'true';
      setAccesso18(verificato);
      if (cat === '18🔞 Sex Toys' && !verificato) setMostraGate18(true);
    } catch {
      if (cat === '18🔞 Sex Toys') setMostraGate18(true);
    }

    const catalogUrl = cat ? `/api/products?category=${encodeURIComponent(cat)}` : '/api/products';
    fetch(catalogUrl, { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Catalogo non disponibile');
        return data;
      })
      .then((data) => {
        if (attivo) {
          setProdotti(Array.isArray(data) ? data : []);
          if (params.get('showProducts') === '1') {
            window.setTimeout(() => {
              document.getElementById('rs-products-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              window.history.replaceState({}, '', '/?category=' + encodeURIComponent(cat));
            }, 180);
          }
        }
      })
      .catch((err) => {
        if (attivo) setErrore(err.message || 'Errore nel caricamento del catalogo');
      });

    return () => { attivo = false; };
  }, []);

  function conferma18() {
    try { localStorage.setItem('riverspend-18plus', 'true'); } catch {}
    setAccesso18(true);
    setMostraGate18(false);
  }

  function rifiuta18() {
    setMostraGate18(false);
    window.location.href = '/';
  }

  // RS FORCE — collegamento intelligente alla ricerca: per ora è locale e sicuro,
  // senza API AI esterne. Interpreta parole correlate e porta in cima i risultati più pertinenti.
  const prodottiVisibili = useMemo(() => {
    const q = ricerca.trim().toLowerCase();
    const categoria18 = ['18🔞 ADULTI', '18🔞 Sex Toys'];
    const richiesta18 = categoria18.some((cat) => cat.toLowerCase() === categoriaAttiva.trim().toLowerCase());
    const alias = {
      iphone: ['iphone', 'smartphone', 'telefonia', 'apple'],
      smartphone: ['smartphone', 'iphone', 'android', 'telefonia', 'cellulare'],
      cellulare: ['smartphone', 'iphone', 'android', 'telefonia', 'cellulare'],
      ps5: ['ps5', 'playstation', 'console', 'gaming', 'videogiochi'],
      playstation: ['playstation', 'ps5', 'ps4', 'console', 'gaming'],
      macbook: ['macbook', 'apple', 'computer', 'notebook'],
      computer: ['computer', 'pc', 'notebook', 'informatica'],
      notebook: ['notebook', 'laptop', 'computer', 'informatica'],
      tv: ['tv', 'televisore', 'home cinema'],
      cuffie: ['cuffie', 'headphones', 'audio', 'musica'],
      audio: ['audio', 'cuffie', 'musica', 'speaker'],
      bici: ['bici', 'bicicletta', 'ebike', 'e-bike'],
      ebike: ['ebike', 'e-bike', 'bici', 'bicicletta'],
      auto: ['auto', 'automobile', 'veicolo', 'macchina'],
      moto: ['moto', 'motocicletta', 'scooter'],
      scarpe: ['scarpe', 'sneakers', 'calzature'],
      casa: ['casa', 'arredamento', 'cucina', 'elettrodomestici']
    };
    const termini = q ? Array.from(new Set(q.split(/\\s+/).filter(Boolean).flatMap((term) => [term, ...(alias[term] || [])]))) : [];
    return prodotti
      .map((p, index) => {
        const categoriaProdotto = String(p.categoria || '').trim();
        const prodotto18 = categoria18.some((cat) => cat.toLowerCase() === categoriaProdotto.toLowerCase());
        if (prodotto18 && !richiesta18) return null;
        const titolo = String(p.titolo || '').toLowerCase();
        const descrizione = String(p.descrizione || '').toLowerCase();
        const condizione = String(p.condizione || '').toLowerCase();
        const categoria = String(p.categoria || '').toLowerCase();
        const testo = [titolo, descrizione, condizione, categoria].join(' ');
        const categoriaQuery = categoriaAttiva.trim().toLowerCase();
        const categoriaOk = !categoriaQuery || categoria === categoriaQuery || testo.includes(categoriaQuery);
        if (!categoriaOk) return null;
        if (!q) return { p, score: 0, index };
        let score = 0;
        for (const term of termini) {
          if (titolo.includes(term)) score += 12;
          if (categoria.includes(term)) score += 9;
          if (descrizione.includes(term)) score += 5;
          if (condizione.includes(term)) score += 2;
        }
        if (titolo === q) score += 30;
        if (titolo.includes(q)) score += 20;
        return score > 0 ? { p, score, index } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .map(({ p }) => p);
  }, [prodotti, ricerca, categoriaAttiva]);

  // RS FORCE: seleziona prodotti casuali con immagini e li rinnova mentre il banner è aperto.
  useEffect(() => {
    if (!rsForceAperta) { setRsForceProdottiRandom([]); return; }
    const scegliProdotti = () => {
      const disponibili = prodottiVisibili.filter((p) => Array.isArray(p.immagini) && p.immagini[0]);
      const mescolati = [...disponibili].sort(() => Math.random() - 0.5).slice(0, 4);
      setRsForceProdottiRandom(mescolati);
    };
    scegliProdotti();
    const timer = window.setInterval(scegliProdotti, 2800);
    return () => window.clearInterval(timer);
  }, [rsForceAperta, prodottiVisibili]);

  return (
    <main className="rs-site min-h-screen bg-slate-950 text-white">
      <section role="status" aria-label="Avviso versione di test" className="border-b border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <div className="mx-auto max-w-6xl">
          <p className="font-extrabold">⚠️ RiverSpend è online in versione di test</p>
          <p className="mt-1">Il sito è in fase di sviluppo e verifica: funzioni, pagine, procedure di acquisto, pagamenti e disponibilità possono cambiare, essere temporaneamente limitati o non essere ancora attivi. Non considerare attive le funzioni di trattenuta e svincolo dei fondi finché non saranno confermate da RiverSpend. Grazie per la pazienza.</p>
        </div>
      </section>
      {mostraGate18 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-labelledby="gate18-title">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">🔞</div>
            <h2 id="gate18-title" className="text-2xl font-extrabold text-slate-900">Area 18+ · Sex Toys</h2>
            <p className="mt-3 text-slate-600">Questa sezione di RiverSpendShop è riservata esclusivamente agli adulti. Devi avere almeno 18 anni per continuare.</p>
            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button type="button" onClick={conferma18} className="rounded-xl bg-teal-700 px-4 py-3 font-bold text-white">Ho 18 anni · Entra</button>
              <button type="button" onClick={rifiuta18} className="rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-800">Esci</button>
            </div>
            <p className="mt-3 text-xs text-slate-500">L'accesso 18+ viene memorizzato su questo dispositivo.</p>
          </div>
        </div>
      )}

      {showSplash && <SplashScreen onEnter={() => { try { sessionStorage.setItem('rs-opening-seen', '1'); } catch {} setShowSplash(false); }} />}

      <div className={`transition-opacity duration-700 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        <header className="rs-header sticky top-0 z-30 border-b border-amber-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
          <div className="mx-auto max-w-6xl">
            <div className="relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => { setMenuCategorie(!menuCategorie); setMenuRiverSpend(false); }} aria-label={t('categories')} aria-expanded={menuCategorie} className="flex h-11 w-10 items-center justify-center rounded-xl text-3xl leading-none text-slate-900 hover:bg-amber-50">☰</button>
                <button type="button" onClick={() => setRicercaAperta(!ricercaAperta)} aria-label="Apri ricerca" aria-expanded={ricercaAperta} title="Cerca prodotti" className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-teal-200 bg-teal-50 px-2 text-xl text-teal-800 shadow-sm hover:bg-teal-100">🔍</button>
                
              </div>
              <a href="/" aria-label="RiverSpendShop, pagina iniziale" className="absolute left-1/2 top-1/2 flex w-max max-w-[48%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center text-center">
                <h1 className="rs-brand text-[1.45rem] font-extrabold leading-none tracking-tight text-black sm:text-4xl">RiverSpend</h1>
                <span className="rs-river-wave" aria-hidden="true">〰</span>
                <span className="rs-shop-word text-sm font-extrabold uppercase tracking-[.2em] sm:text-base">Shop</span>
                <span className="mt-0.5 whitespace-nowrap text-[7px] font-semibold tracking-[.08em] text-slate-500 sm:text-[9px] sm:tracking-[.14em]">YOUR SHOP • YOUR FLOW</span>
              </a>
              <div className="flex items-center justify-end gap-2 text-slate-900 sm:gap-4">
                <a href="/rete" aria-label="Apri la Rete e gli articoli salvati" className="relative flex h-10 w-10 items-center justify-center text-2xl hover:text-teal-700">
                  🛒
                  {reteIds.length > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-700 px-1 text-[10px] font-bold text-white">{reteIds.length}</span>}
                </a>
                <a href="/profilo" aria-label={t('profile')} className="flex h-10 w-8 items-center justify-center text-2xl hover:text-teal-700">♙</a>
              </div>
            </div>
            <div className="mx-auto mt-2 flex max-w-[380px] items-center justify-center gap-2 rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 via-white to-sky-50 px-3 py-1 shadow-[0_2px_8px_rgba(3,105,161,.10)]">
              <span className="shrink-0 text-xs font-black tracking-tight text-blue-900">Hey River</span>
              <button type="button" onClick={avviaRiverVoice} aria-label="Chiedi a River AI con la voce" title="Tocca per parlare con Hey River" className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-300 bg-gradient-to-br from-blue-950 via-blue-800 to-cyan-700 text-cyan-100 shadow-[0_0_12px_rgba(2,132,199,.4)] transition ${riverVoiceActive ? 'scale-110 shadow-[0_0_20px_rgba(14,165,233,.9)]' : 'hover:scale-105'}`}>
                <svg viewBox="0 0 48 48" className={`h-8 w-8 ${riverVoiceActive ? 'animate-pulse' : ''}`} role="img" aria-label="River AI onde luminose">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#5eead4" strokeWidth="1.8" opacity=".9"/>
                  <path d="M5 24 C12 24 13 35 20 35 S28 13 36 13 S40 24 43 24" fill="none" stroke="#99fff0" strokeWidth="1.8" strokeLinecap="round"><animate attributeName="d" dur="2.2s" repeatCount="indefinite" values="M5 24 C12 24 13 35 20 35 S28 13 36 13 S40 24 43 24;M5 24 C12 24 13 14 20 14 S28 35 36 35 S40 24 43 24;M5 24 C12 24 13 35 20 35 S28 13 36 13 S40 24 43 24"/></path>
                  <path d="M5 24 C12 24 13 30 20 30 S28 18 36 18 S40 24 43 24" fill="none" stroke="#2dd4bf" strokeWidth="1.3" strokeLinecap="round" opacity=".9"><animate attributeName="d" dur="1.6s" repeatCount="indefinite" values="M5 24 C12 24 13 30 20 30 S28 18 36 18 S40 24 43 24;M5 24 C12 24 13 18 20 18 S28 30 36 30 S40 24 43 24;M5 24 C12 24 13 30 20 30 S28 18 36 18 S40 24 43 24"/></path>
                </svg>
              </button>
              <label htmlFor="river-voice-style" className="text-[10px] font-medium text-slate-600">Voce</label>
              <select id="river-voice-style" value={riverVoiceStyle} onChange={(e) => setRiverVoiceStyle(e.target.value)} className="max-w-[112px] rounded-full border border-blue-200 bg-white px-2 py-1 text-[11px] font-medium text-blue-900">
                <option value="femminile">Femminile</option>
                <option value="maschile">Maschile</option>
                <option value="sensuale">Calda e profonda</option>
                <option value="robotica">Robotica sci-fi</option>
              </select>
            </div>
            {riverVoiceStatus && <p role="status" aria-live="polite" className="mx-auto mt-2 max-w-6xl rounded-lg bg-teal-50 px-3 py-2 text-center text-xs font-medium text-teal-900">{riverVoiceStatus}</p>}
            <div className="mt-2 flex items-center justify-between gap-2">
              <LanguageSelector />
              <button type="button" onClick={() => { setMenuRiverSpend(!menuRiverSpend); setMenuCategorie(false); }} aria-expanded={menuRiverSpend} className="rounded-full px-3 py-1 text-xs font-bold text-teal-800 hover:bg-teal-50">Esplora RiverSpend ▾</button>
            </div>
            <div className={ricercaAperta || ricerca ? "mx-auto mt-2 flex max-w-6xl gap-2" : "hidden"}>
              <input
                value={ricerca}
                onChange={(e) => setRicerca(e.target.value)}
                placeholder={t('search')}
                aria-label="Cerca prodotti"
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900"
              />
              {categoriaAttiva && (
                <button type="button" onClick={() => { setCategoriaAttiva(''); window.history.replaceState({}, '', '/'); }} className="rounded-xl border border-amber-300 px-3 text-xs text-amber-800">
                  {categoriaAttiva} ✕
                </button>
              )}
            </div>
          {menuCategorie && (
            <div className="mx-auto mt-3 max-h-[45vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-teal-200 bg-white p-4 text-slate-900 shadow-2xl">
              <div className="mb-3 flex items-center justify-between"><strong className="text-teal-800">{t('categories')}</strong><button onClick={() => setMenuCategorie(false)} aria-label={t('close')}>✕</button></div>
              <div className="space-y-3">
                {categorieSezioni.map(([section, items]) => (
                  <div key={section} className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                    <a href={`/categorie?section=${encodeURIComponent(section)}`} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-bold tracking-wide text-teal-800 hover:bg-teal-100">
                      <span>{section}</span><span aria-hidden="true">Apri con immagini →</span>
                    </a>
                    <div className="grid grid-cols-1 gap-1">
                      {items.map((cat) => (
                        <a key={cat} href={`/?category=${encodeURIComponent(cat)}`} onClick={() => setMenuCategorie(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-800 hover:bg-teal-50">
                          {cat} <span className="float-right text-teal-700">›</span>
                        </a>
                      ))}
                    </div>
                  </div>
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
          </div>
        </header>

          <section aria-label="App RiverSpend" className="mb-4 rounded-2xl border border-cyan-200/70 bg-white/90 px-2 py-3 shadow-md">
            <div className="mb-2 text-center text-[11px] font-extrabold uppercase tracking-[.16em] text-slate-700">Le app RiverSpend</div>
            <div className="grid grid-cols-6 gap-1">
              <a href="/app" className="flex min-w-0 flex-col items-center gap-1 text-center" aria-label="RSShop">
                <img src="/icons/riverspendshop-app.jpg" alt="RSShop" className="h-10 w-10 rounded-lg object-cover shadow-sm ring-1 ring-cyan-200" loading="lazy" />
                <span className="w-full break-words text-[8px] font-bold leading-tight text-slate-800">RSShop</span>
              </a>
              <a href="/rs-sound-studio" className="flex min-w-0 flex-col items-center gap-1 text-center" aria-label="RSSoundStudio System ISSA">
                <img src="/rssoundstudio-issa-banner.jpg" alt="RSSoundStudio System ISSA" className="h-10 w-10 rounded-lg object-cover shadow-sm ring-1 ring-cyan-200" loading="lazy" />
                <span className="w-full break-words text-[7px] font-bold leading-tight text-slate-800">RSSoundStudio<br />System ISSA</span>
              </a>
              <a href="/servizi/broadcast" className="flex min-w-0 flex-col items-center gap-1 text-center" aria-label="RSStreaming">
                <img src="/icons/streaming.svg" alt="RSStreaming" className="h-10 w-10 rounded-lg object-contain shadow-sm ring-1 ring-cyan-200" loading="lazy" />
                <span className="w-full break-words text-[8px] font-bold leading-tight text-slate-800">RSStreaming</span>
              </a>
              <a href="/park" className="flex min-w-0 flex-col items-center gap-1 text-center" aria-label="RSPark">
                <img src="/1000187343.png" alt="RSPark" className="h-10 w-10 rounded-lg object-cover shadow-sm ring-1 ring-cyan-200" loading="lazy" />
                <span className="w-full break-words text-[8px] font-bold leading-tight text-slate-800">RSPark</span>
              </a>
              <a href="/servizi/music" className="flex min-w-0 flex-col items-center gap-1 text-center" aria-label="RSMusic">
                <img src="/icons/music.svg" alt="RSMusic" className="h-10 w-10 rounded-lg object-contain shadow-sm ring-1 ring-cyan-200" loading="lazy" />
                <span className="w-full break-words text-[8px] font-bold leading-tight text-slate-800">RSMusic</span>
              </a>
              <a href="/rs-control-center" className="flex min-w-0 flex-col items-center gap-1 text-center" aria-label="RSPC">
                <img src="/1000186325.png" alt="RSPC" className="h-10 w-10 rounded-lg object-cover shadow-sm ring-1 ring-cyan-200" loading="lazy" />
                <span className="w-full break-words text-[8px] font-bold leading-tight text-slate-800">RSPC</span>
              </a>
            </div>
            <a href="/app" className="mt-2 block text-center text-[10px] font-semibold text-teal-800 underline underline-offset-2">Istruzioni per installarle da Google Chrome · App Store non ancora disponibile</a>
          </section>

          <div className="rs-apps-grid mb-5 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-1 pb-3" aria-label="Scopri le iniziative RiverSpend: scorri orizzontalmente">
            <section id="rs-force-card" className="rs-feature-card relative h-[400px] shrink-0 w-[280px] snap-start rs-force-card overflow-hidden rounded-2xl border-2 border-cyan-300 bg-gradient-to-b from-slate-950 via-cyan-950 to-indigo-950 p-0 text-center shadow-lg shadow-cyan-950/40">
              <button type="button" onClick={() => { if (rsForceAperta) setRsForceAperta(false); else apriRsForce(); }} className="relative flex h-full w-full flex-col items-center overflow-hidden rounded-xl bg-slate-950 text-center">
                <div className="rs-force-stage rs-feature-media relative mx-auto flex h-[300px] min-h-[300px] w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-cyan-300/50 bg-gradient-to-br from-slate-950 via-cyan-950 to-indigo-950">
                  <img src="/rs-force.jpg" alt="RS FORCE: sfera energetica RiverSpend blu e oro" className="absolute inset-0 h-full w-full object-cover object-center opacity-35" />
                  <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.28),transparent_58%)]" />
                  <img src="/rs-force-lightning.svg?v=2" alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 h-full w-full object-cover opacity-100 mix-blend-screen" />
                  {rsForceAperta && rsForceProdottiRandom.map((p, index) => {
                    const image = p.immagini?.[0];
                    return image ? (
                      <div key={'force-orbit-' + p.id} className="rs-force-orbit z-10" style={{'--orbit-radius': index % 2 === 0 ? '78px' : '48px', '--orbit-duration': (index % 2 === 0 ? 7 : 5) + 's', animationDelay: (-index * 1.1) + 's'}}>
                        <a href={'/prodotto/' + encodeURIComponent(p.id)} onClick={(e) => e.stopPropagation()} aria-label={'RS Force: ' + (p.titolo || 'prodotto')} className="rs-force-product absolute flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-cyan-200/80 bg-white p-0.5 shadow-lg" style={{left:0, top:0}}>
                          <img src={image} alt="" className="h-full w-full object-contain" />
                        </a>
                      </div>
                    ) : null;
                  })}
                  <span aria-label="Palantir energetico RiverSpend" className="rs-palantir relative z-20 flex h-36 w-36 shrink-0 translate-y-7 items-center justify-center rounded-full border-2 border-cyan-100/90 bg-[radial-gradient(circle_at_32%_25%,#ffffff_0%,#a5f3fc_8%,#22d3ee_20%,#075985_43%,#07152d_68%,#020617_100%)] text-6xl shadow-[0_0_32px_12px_rgba(34,211,238,.78),inset_0_0_28px_rgba(255,255,255,.75)]" style={{animation:'rs-palantir-pulse 3s ease-in-out infinite'}}>🔮<span className="absolute inset-[-8px] rounded-full border-2 border-cyan-200/70 animate-spin" style={{animationDuration:'7s'}} /><span className="absolute inset-[-15px] rounded-full border border-sky-300/60 animate-spin" style={{animationDuration:'11s',animationDirection:'reverse'}} /></span>
                </div>
                <p className="rs-force-title mt-auto min-h-4 shrink-0 px-2 pt-2 text-xl font-black uppercase tracking-[0.16em] text-cyan-100">⚡ RS FORCE ⚡</p>
                <h2 className="mt-1 min-h-[44px] shrink-0 px-2 text-lg font-black leading-tight text-white [text-shadow:0_2px_5px_rgba(0,0,0,0.9)]">Potenzia la tua ricerca</h2>
                {!rsForceAperta ? (
                  <div className="mt-2 w-full rounded-lg bg-slate-900/95 px-2 py-2 text-xs font-semibold leading-4 text-white">
                    <p>La tua scorciatoia per il catalogo: scegli una ricerca e lascia che i prodotti orbitino intorno alla sfera.</p>
                    <p className="mt-1 text-[10px] font-medium text-cyan-200">RS FORCE cerca nel catalogo; Nova AI resta l'assistente intelligente.</p>
                  </div>
                ) : (
                  <div className="mt-2 grid w-full grid-cols-2 gap-1.5">
                    <a onClick={(e) => e.stopPropagation()} href="/?q=offerta" className="rounded-xl border border-amber-300/50 bg-amber-950/70 p-2 text-[10px] font-bold text-white">🏷️ Cerca offerte</a>
                    <a onClick={(e) => e.stopPropagation()} href="/?q=smartphone" className="rounded-xl border border-cyan-300/50 bg-cyan-950/50 p-2 text-[10px] font-bold text-white">🔎 Smartphone</a>
                    <a onClick={(e) => e.stopPropagation()} href="/?q=cuffie" className="rounded-xl border border-violet-300/50 bg-violet-950/50 p-2 text-[10px] font-bold text-white">🎧 Audio e cuffie</a>
                    <a onClick={(e) => e.stopPropagation()} href="/?showProducts=1" className="rounded-xl border border-emerald-300/50 bg-emerald-950/50 p-2 text-[10px] font-bold text-white">🛍️ Tutto il catalogo</a>
                    <p className="col-span-2 px-1 text-[10px] leading-4 text-cyan-100">Per cercare un articolo diverso, usa la ricerca del marketplace. Le offerte vengono individuate in base alle informazioni presenti negli annunci.</p>
                  </div>
                )}
              </button>
            </section>

            <a id="rs-seller-card" href="/vendi" aria-label="Hai prodotti da vendere? Caricali qui e apri la tua vetrina su RiverSpendShop" className="rs-feature-card relative flex shrink-0 w-[220px] snap-start flex-col items-center justify-end overflow-hidden rounded-2xl border-2 border-emerald-300 bg-slate-950 p-2 text-center shadow-lg shadow-emerald-950/30 focus:outline-none focus:ring-4 focus:ring-emerald-300/70">
              <img src="/rs-vendi-prodotti-banner-640.jpg" alt="Borsa, cuffie, smartphone e smartwatch in vendita su RiverSpend" className="absolute inset-0 h-full w-full object-cover" />
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-slate-950/10" />
              <p className="relative z-10 mt-20 text-[9px] font-extrabold uppercase tracking-wide text-emerald-200">VENDI SU RIVERSPEND</p>
              <h2 className="relative z-10 mt-1 text-xs font-black leading-tight text-white">HAI PRODOTTI DA VENDERE?</h2>
              <p className="relative z-10 mt-1 text-[11px] font-semibold leading-3 text-white">Carica i tuoi prodotti, apri la tua vetrina e inizia a vendere.</p>
              <span className="rs-feature-action relative z-10 mt-2 inline-flex rounded-full border-2 border-white bg-emerald-300 px-2 py-1 text-[9px] font-black leading-tight text-slate-950 shadow-md">CARICA I TUOI PRODOTTI →</span>
              <p className="relative z-10 mt-1 text-[8px] leading-3 text-emerald-100">Commissione del 10% secondo le condizioni applicabili.</p>
            </a>

            <section className="rs-feature-card shrink-0 w-[220px] snap-start rs-fortune-card rounded-2xl border border-amber-400/40 bg-gradient-to-br from-slate-950 via-amber-950/30 to-slate-900 p-2 text-center shadow-lg shadow-amber-950/20">
              <div className="flex h-full w-full flex-col items-center overflow-hidden text-center">
                <p className="shrink-0 min-h-4 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100">🎡 RS FORTUNE</p>
                
                <h2 className="mt-1 min-h-[44px] shrink-0 text-base font-extrabold leading-tight text-white">La ruota della fortuna</h2>
                {rsFortuneAperta ? (
                  <div className="mt-2 flex min-h-0 w-full flex-1 flex-col items-center overflow-hidden">
                    <div className="relative mx-auto h-[112px] w-[112px] shrink-0">
                      <div className="absolute -top-1 left-1/2 z-20 -translate-x-1/2 text-lg">🔻</div>
                      <div className="rs-fortune-wheel relative h-[112px] w-[112px] rounded-full border-4 border-amber-300 shadow-[0_0_22px_rgba(251,191,36,.4)]" style={{transform:`rotate(${rsFortuneRotation}deg)`, transition: rsFortuneSpinning ? "transform 5.2s cubic-bezier(.12,.72,.08,1)" : "none"}}>
                        <div className="rs-fortune-labels" aria-hidden="true">
                          <span>💰<br/>5 RM</span><span>💰<br/>10 RM</span><span>💰<br/>20 RM</span><span>🚚<br/>FREE</span>
                          <span>🏷️<br/>5%</span><span>🔥<br/>BOOST</span><span>🎁<br/>SORPRESA</span><span>⭐<br/>500 RSP</span>
                        </div>
                        <div className="rs-fortune-center">RS<br/>FORTUNE</div>
                      </div>
                    </div>
                    <p className="mt-2 text-[10px] leading-4 text-slate-100">Un solo giro. Una sola fortuna.</p>
                    <button type="button" disabled={rsFortuneSpinning} onClick={(e) => { e.stopPropagation(); giraRsFortune(); }} className="mt-2 shrink-0 rounded-full bg-amber-300 px-4 py-2 text-xs font-extrabold text-amber-950 disabled:opacity-50">{rsFortuneSpinning ? '🎡 Gira…' : '🎡 Gira la ruota'}</button>
                    {rsFortunePrize && <div className="mt-2 max-w-full rounded-xl border border-amber-400/50 bg-amber-950/50 px-2 py-1 text-[10px] font-extrabold text-amber-100">{rsFortunePrize}</div>}
                  </div>
                ) : (
                  <div className="mt-2 flex flex-1 flex-col items-center justify-center overflow-hidden">
                    <img src="/rs-fortune.jpg" alt="RS FORTUNE: ruota dei premi RiverSpend" className="rs-feature-media mt-2 h-20 w-full rounded-xl border border-amber-300/50 object-cover object-center" loading="lazy" />
                    <p className="mt-2 min-h-[32px] px-1 text-[10px] leading-4 text-slate-100">Apri la ruota e prova il giro.</p>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setRsFortuneAperta(true); }} className="rs-feature-action mt-2 inline-flex min-h-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-amber-300 to-amber-500 px-4 py-2 text-[11px] font-extrabold text-slate-950 shadow-md">APRI E GIRA LA RUOTA →</button>
                  </div>
                )}
              </div>
            </section>

            <section className="rs-feature-card shrink-0 w-[220px] snap-start rounded-2xl border border-violet-300/60 bg-gradient-to-br from-[#160b2c] via-violet-950 to-slate-950 p-2 text-center shadow-lg shadow-violet-950/30">
              <a
                href="/rs-lottery"
                aria-label="Apri la pagina dedicata RS Lottery"
                className="flex h-full w-full flex-col items-center overflow-hidden text-center"
              >
                <div className="flex w-full shrink-0 items-center justify-center gap-2">
                  <span className="text-lg" aria-hidden="true">🎟️</span>
                  <p className="min-w-0 text-[11px] font-extrabold uppercase tracking-[0.1em] text-violet-100">RS LOTTERY</p>
                </div>
                <div className="rs-feature-media mt-2 w-full overflow-hidden rounded-xl border border-violet-200/50 bg-black/20">
                  <img src="/rs-lottery.jpg" alt="RS Lottery RiverSpend, iniziative e premi" className="h-20 w-full object-cover object-center transition-transform duration-300" loading="lazy" />
                </div>
                <div className="flex flex-1 flex-col items-center justify-center py-3">
                  <p className="min-h-[28px] text-lg font-extrabold text-white">Premi e iniziative</p>
                  <p className="mt-1 min-h-[40px] text-xs leading-5 text-violet-100">Come funzionerà · categorie di premi · calendario</p>
                  <span className="rs-feature-action mt-2 inline-flex items-center gap-2 rounded-full border border-violet-200/50 bg-violet-800/40 px-4 py-2 text-[11px] font-extrabold text-white">Entra in RS Lottery <span aria-hidden="true">→</span></span>
                  <p className="mt-2 text-[10px] text-amber-200">Iniziativa in preparazione</p>
                </div>
              </a>
            </section>

            <section className="rs-feature-card shrink-0 w-[220px] snap-start rounded-2xl border border-amber-400/60 p-2 text-center shadow-lg shadow-amber-950/30" style={{backgroundColor:"#252719",backgroundImage:"radial-gradient(ellipse at 15% 20%, #606044 0 8%, transparent 9%), radial-gradient(ellipse at 72% 18%, #41432c 0 11%, transparent 12%), radial-gradient(ellipse at 42% 75%, #56583b 0 10%, transparent 11%), radial-gradient(ellipse at 90% 78%, #353824 0 13%, transparent 14%), radial-gradient(ellipse at 28% 48%, #353824 0 12%, transparent 13%), linear-gradient(135deg,#17190f,#303322,#17190f)"}}>
              <a href="/rs-folgore" aria-label="Apri la missione RS Folgore" className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-xl text-center focus:outline-none focus:ring-4 focus:ring-amber-300/70">
                <p className="shrink-0 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100">⚡ RS FOLGORE ⚡</p>
                <div className="rs-feature-media mt-2 w-full overflow-hidden rounded-xl border border-amber-300/60">
                  <img src="/rs-folgore-pacchi.png" alt="RS FOLGORE: aereo RiverSpend che consegna pacchi con paracadute" className="h-20 w-full object-cover" loading="lazy" />
                </div>
                <p className="mt-3 min-h-[40px] text-sm font-extrabold text-white">Offerte che arrivano dal cielo</p>
                <p className="mt-2 min-h-[32px] text-[10px] leading-4 text-amber-50">Offerte lampo per prodotti di ogni categoria.</p>
                <span className="rs-feature-action mt-2 inline-flex items-center justify-center rounded-full border border-amber-300/60 bg-gradient-to-b from-amber-300 to-amber-600 px-4 py-2 text-[11px] font-extrabold text-slate-950">APRI LA MISSIONE →</span>
              </a>
            </section>

            <section className="rs-feature-card shrink-0 w-[220px] snap-start rounded-2xl border border-amber-300/70 bg-gradient-to-br from-[#201707] via-amber-950 to-slate-950 p-2 text-center shadow-lg shadow-amber-950/30">
              <a href={categoriaAttiva ? `/?category=${encodeURIComponent(categoriaAttiva)}&future=offers` : '/?future=offers'} aria-label="Scopri RSSS RiverSpend Super Saldi" className="flex h-full w-full flex-col items-center overflow-hidden text-center">
                <p className="shrink-0 text-[10px] font-extrabold uppercase tracking-[0.2em] text-amber-200">🏷️ RSSS</p>
                <h2 className="mt-1 min-h-[40px] text-base font-extrabold leading-tight text-white">RiverSpend Super Saldi</h2>
                <div className="rs-feature-media mt-3 flex w-full items-center justify-center overflow-hidden rounded-xl border border-amber-300/60 bg-gradient-to-br from-amber-300 via-yellow-600 to-amber-900">
                  <div className="flex flex-col items-center justify-center px-2 text-slate-950">
                    <span className="text-4xl font-black tracking-tight">RSSS</span>
                    <span className="mt-1 text-center text-[10px] font-extrabold uppercase tracking-widest">Sale</span>
                    <span className="mt-2 text-2xl" aria-hidden="true">％</span>
                  </div>
                </div>
                <p className="mt-3 min-h-[40px] px-1 text-xs leading-5 text-amber-50">Occasioni e promozioni da scoprire nel RiverSpendShop.</p>
                <span className="rs-feature-action mt-2 inline-flex items-center justify-center rounded-full border border-amber-200/60 bg-gradient-to-b from-amber-300 to-amber-500 px-4 py-2 text-[11px] font-extrabold text-slate-950">SCOPRI I SALDI →</span>
              </a>
            </section>

            <section className="rs-feature-card shrink-0 w-[220px] snap-start rounded-2xl border border-emerald-300/70 bg-gradient-to-br from-emerald-950 via-green-950 to-slate-950 p-2 text-center shadow-lg shadow-emerald-950/30">
              <a href={categoriaAttiva ? `/?category=${encodeURIComponent(categoriaAttiva)}&future=offers` : '/?future=offers'} aria-label="Scopri RiverSpend Super Sconti" className="flex h-full w-full flex-col items-center overflow-hidden text-center">
                <p className="shrink-0 text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-200">💚 RS SCONTI</p>
                <h2 className="mt-1 min-h-[40px] text-base font-extrabold leading-tight text-white">RiverSpend Super Sconti</h2>
                <div className="rs-feature-media mt-3 flex w-full items-center justify-center overflow-hidden rounded-xl border border-emerald-300/60 bg-gradient-to-br from-emerald-300 via-green-600 to-emerald-950">
                  <div className="flex flex-col items-center justify-center px-2 py-4 text-white">
                    <span className="text-4xl font-black tracking-tight">SUPER</span>
                    <span className="text-2xl font-black tracking-widest">SCONTI</span>
                    <span className="mt-2 text-2xl" aria-hidden="true">％</span>
                  </div>
                </div>
                <p className="mt-3 min-h-[40px] px-1 text-xs leading-5 text-emerald-50">Le offerte dei venditori, da scoprire tutto l’anno.</p>
                <span className="rs-feature-action mt-2 inline-flex items-center justify-center rounded-full border border-emerald-200/60 bg-gradient-to-b from-emerald-300 to-green-500 px-4 py-2 text-[11px] font-extrabold text-slate-950">SCOPRI GLI SCONTI →</span>
              </a>
            </section>
          <a href="/rs-event-ddays" aria-label="Apri RS EVENT D-DAYS Save the Heart e il calendario delle 24 giornate" className="rs-banner-slide group shrink-0 snap-start overflow-hidden rounded-3xl border border-emerald-300/60 bg-slate-950 text-white shadow-xl shadow-emerald-950/30 transition hover:-translate-y-0.5 hover:border-rose-200 focus:outline-none focus:ring-4 focus:ring-emerald-300/70">
            <div className="relative">
              <img src="/rs-event-ddays.svg" alt="RS EVENT D-DAYS Save the Heart: la Terra protetta da un cuore luminoso" className="block aspect-[16/8] w-full object-cover transition duration-500 group-hover:scale-[1.02]" loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-7">
                <p className="text-xs font-extrabold uppercase tracking-[.24em] text-emerald-200 sm:text-sm">24 GIORNATE • NATURA • SOLIDARIETÀ</p>
                <h2 className="mt-1 text-2xl font-black text-white drop-shadow sm:text-4xl">RS EVENT D-DAYS</h2>
                <p className="mt-1 max-w-2xl text-sm font-semibold text-rose-100 sm:text-lg">SAVE THE HEART — 24 giornate per la Terra. Un solo cuore per il futuro.</p>
                <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-300 px-4 py-2 text-[11px] font-extrabold text-slate-950 sm:text-xs">SCOPRI IL CALENDARIO →</span>
              </div>
            </div>
          </a>
          <a href="/rs-ocean-worlds" aria-label="Esplora RS Ocean Worlds, i mondi sommersi dell'oceano" className="rs-banner-slide group shrink-0 snap-start overflow-hidden rounded-3xl border border-cyan-300/60 bg-slate-950 text-white shadow-xl shadow-cyan-950/30 transition hover:-translate-y-0.5 hover:border-cyan-200 focus:outline-none focus:ring-4 focus:ring-cyan-300/70">
            <div className="relative">
              <img src="/rs-ocean-worlds.svg" alt="RS Ocean Worlds: viaggio illustrato dalla superficie marina agli abissi" className="block aspect-[16/8] w-full object-cover transition duration-500 group-hover:scale-[1.02]" loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-7">
                <p className="text-xs font-extrabold uppercase tracking-[.24em] text-cyan-200 sm:text-sm">OCEANI • ABISSI • BIODIVERSITÀ</p>
                <h2 className="mt-1 text-2xl font-black text-white drop-shadow sm:text-4xl">RS OCEAN WORLDS</h2>
                <p className="mt-1 max-w-2xl text-sm font-semibold text-cyan-100 sm:text-lg">I mondi sommersi dell’oceano. Un viaggio dalla luce agli abissi.</p>
                <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-cyan-200 px-4 py-2 text-[11px] font-extrabold text-slate-950 sm:text-xs">INIZIA L’ESPLORAZIONE →</span>
              </div>
            </div>
          </a>
          <a href="/park" aria-label="Scopri RiverSpend Park: apri il catalogo del parco" className="rs-banner-slide rs-park-banner group shrink-0 snap-start overflow-hidden rounded-3xl border border-cyan-300/60 bg-slate-950 shadow-xl shadow-cyan-950/20 transition hover:-translate-y-0.5 hover:border-cyan-200 focus:outline-none focus:ring-4 focus:ring-cyan-300/70">
            <div className="relative">
              <img src="https://raw.githubusercontent.com/5lordmaul5-del/RiverSpend/main/file_00000000070081f4be8d351d407b4017.png" alt="RiverSpend Park: concept del parco con area Terra, area Acqua e attrazioni" className="block aspect-[16/8] w-full object-cover transition duration-500 group-hover:scale-[1.02]" loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-7">
                <p className="text-xs font-extrabold uppercase tracking-[.24em] text-cyan-200 sm:text-sm">Concept Photo • Progetto in sviluppo</p>
                <h2 className="mt-1 text-2xl font-black text-white drop-shadow sm:text-4xl">RiverSpend Park</h2>
                <p className="mt-1 max-w-2xl text-sm font-medium text-white sm:text-base">Un mondo di emozioni tra attrazioni terrestri, montagne russe e avventure acquatiche.</p>
                <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-extrabold text-slate-950 shadow-lg">SCOPRI IL PARCO <span aria-hidden="true">↗</span></span>
              </div>
            </div>
          </a>
          <a href="/rsfv#concept" aria-label="Scopri RS Unità Sicura" className="rs-banner-slide rs-unita-sicura-banner group relative h-[300px] shrink-0 snap-start overflow-hidden rounded-3xl border border-cyan-300/60 bg-slate-950 text-white shadow-xl shadow-cyan-950/20 transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-cyan-300/70 sm:h-[390px]">
            <img src="/Screenshot_2026-10-26-16-10-16-325_com.openai.chatgpt.jpg" alt="Scudo dorato e blu RS Unità Sicura con folgore e sigla U.S." className="absolute inset-0 h-full w-full object-cover object-center scale-[1.35]" loading="eager" decoding="async" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/35 to-transparent p-3 pt-5 sm:p-4 sm:pt-8">
              <p className="text-[8px] font-extrabold uppercase tracking-[.12em] text-cyan-200 sm:text-[10px] sm:tracking-[.18em]">PROTEZIONE • TECNOLOGIA • PERSONE</p>
              <h2 className="mt-1 text-base font-black leading-tight text-white drop-shadow sm:text-2xl">RS UNITÀ SICURA</h2>
              <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-3 py-2 text-[11px] font-extrabold text-slate-950 shadow-lg sm:px-4 sm:text-xs">SCOPRI RS UNITÀ SICURA <span aria-hidden="true">↗</span></span>
            </div>
          </a>
                    <a href="/rsfv#concept" aria-label="Esplora RS FutureCity e tutti i concept del futuro RiverSpend" className="rs-banner-slide rs-futurecity-banner group shrink-0 snap-start overflow-hidden rounded-3xl border border-cyan-300/60 bg-slate-950 text-white shadow-xl shadow-cyan-950/20 transition hover:-translate-y-0.5 hover:border-amber-200 focus:outline-none focus:ring-4 focus:ring-cyan-300/70">
            <div className="relative">
              <div className="grid grid-cols-2 gap-1 bg-[#061722] p-1">
                <img src="/rs-future-city-skyline.svg" alt="RS FutureCity: skyline e architettura della città del futuro" className="h-28 w-full rounded-lg object-cover" loading="lazy" decoding="async" />
                <img src="/rs-future-city-ecology.svg" alt="RS FutureCity: ecologia e spazi verdi" className="h-28 w-full rounded-lg object-cover" loading="lazy" decoding="async" />
                <img src="/rs-future-city-robot.svg" alt="RS FutureCity: robotica e droidi" className="col-span-2 h-24 w-full rounded-lg object-cover" loading="lazy" decoding="async" />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent px-4 pb-4 pt-12 sm:px-7 sm:pb-7">
                <p className="text-xs font-extrabold uppercase tracking-[.24em] text-cyan-200 sm:text-sm">RS · CONCEPT FUTURI</p>
                <h2 className="mt-1 text-2xl font-black text-white drop-shadow sm:text-4xl">RS FutureCity</h2>
                <p className="mt-1 max-w-2xl text-sm font-medium text-slate-100 sm:text-base">Città del futuro, ecologia, energia e robotica: esplora le immagini e tutti i concept RiverSpend.</p>
                <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-300 px-5 py-2.5 text-sm font-extrabold text-slate-950 shadow-lg">ESPLORA FUTURECITY <span aria-hidden="true">↗</span></span>
              </div>
            </div>
          </a>
            <a href="/servizi/ecology#missioni" className="rs-banner-slide rs-ecology-banner rs-world-card rs-campaign-compact border-emerald-400 bg-gradient-to-br from-emerald-950 to-slate-950 text-white"><span className="text-3xl">🌱</span><h2 className="mt-2 text-xl font-extrabold text-white">RiverSpend Ecology</h2><p className="mt-2 text-sm leading-5 text-white">Alberi, terreni, mari, fiumi e biodiversità.</p><span className="mt-auto inline-flex rounded-full bg-emerald-300 px-4 py-2 text-sm font-bold text-slate-950">SCOPRI L’IDEA →</span><small className="mt-2 text-xs font-semibold text-amber-200">In preparazione · Nessuna raccolta attiva</small></a>
            <a href="/servizi/ecology#solidale" className="rs-banner-slide rs-ecology-banner rs-world-card rs-campaign-compact border-rose-400 bg-gradient-to-br from-rose-950 to-slate-950 text-white"><span className="text-3xl">💚</span><h2 className="mt-2 text-xl font-extrabold text-white">RiverSpend Solidale</h2><p className="mt-2 text-sm leading-5 text-white">Aiuto a persone fragili e comunità colpite da emergenze.</p><span className="mt-auto inline-flex rounded-full bg-rose-300 px-4 py-2 text-sm font-bold text-slate-950">SCOPRI L’IDEA →</span><small className="mt-2 text-xs font-semibold text-amber-200">In preparazione · Nessuna raccolta attiva</small></a>
            <a href="/servizi/ecology#future-life" className="rs-banner-slide rs-ecology-banner rs-world-card rs-campaign-compact border-violet-400 bg-gradient-to-br from-violet-950 to-slate-950 text-white"><span className="text-3xl">🏥</span><h2 className="mt-2 text-xl font-extrabold text-white">PiggyBank · Future Life</h2><p className="mt-2 text-sm leading-5 text-white">Ospedali, nuove cure e ricerca scientifica qualificata.</p><span className="mt-auto inline-flex rounded-full bg-violet-300 px-4 py-2 text-sm font-bold text-slate-950">SCOPRI L’IDEA →</span><small className="mt-2 text-xs font-semibold text-amber-200">In preparazione · Nessuna raccolta attiva</small></a>
            <a href="/gift-card" aria-label="Scopri RiverSpendShop Gift Card" className="rs-banner-slide rs-world-card rs-campaign-compact border-amber-300 bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950 text-white"><span className="text-3xl text-amber-300">🎁</span><h2 className="mt-2 text-xl font-extrabold text-white">RiverSpendShop Gift Card</h2><p className="mt-2 text-sm leading-5 text-cyan-50">Regala credito da utilizzare sul RiverSpendShop, anche con saldo residuo.</p><span className="mt-auto inline-flex rounded-full bg-gradient-to-r from-amber-200 to-yellow-500 px-4 py-2 text-sm font-bold text-slate-950">SCOPRI LE GIFT CARD →</span><small className="mt-2 text-xs font-semibold text-amber-200">In preparazione · Acquisto e riscatto non ancora attivi</small></a>
          <a href="/social-network" aria-label="Apri RiverSpend Social: foto, video e community" className="rs-banner-slide rs-social-banner group shrink-0 snap-start overflow-hidden rounded-2xl border border-teal-300/70 bg-gradient-to-br from-teal-950 via-slate-900 to-cyan-950 text-white shadow-lg shadow-teal-950/20 transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-teal-300/70">
            <div className="rs-social-banner-media relative w-full shrink-0 overflow-hidden bg-slate-950">
              <img src="/riverspend-social-banner.svg" alt="RiverSpend Social: uno spazio per condividere foto, video e scoprire la community" className="block h-full w-full object-cover object-center" loading="eager" />
              <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-950/80 to-transparent" aria-hidden="true"></div>
            </div>
            <div className="flex min-h-0 flex-1 flex-col items-start p-3 text-left">
              <h2 className="text-base font-extrabold leading-tight text-white">RiverSpend Social</h2>
              <p className="mt-1 text-xs leading-4 text-cyan-50">Condividi foto e video, scopri contenuti e incontra la community.</p>
              <span className="mt-auto inline-flex rounded-full bg-teal-300 px-3 py-1.5 text-[11px] font-extrabold text-slate-950">ENTRA NEL SOCIAL →</span>
            </div>
          </a>

          <section className="rs-hero rs-banner-slide shrink-0 snap-start overflow-hidden rounded-2xl border border-teal-200 bg-white text-slate-800 shadow-sm">
            <img src="/riverspend-river-market.svg?v=3" alt="Il mercato RiverSpend sul fiume, con negozi, barca e pacchi in acqua turchese" className="block aspect-[16/7] w-full object-cover sm:aspect-[16/5]" loading="eager" />
            <div className="relative bg-white px-5 py-4 sm:px-7 sm:py-5">
              <span className="rs-gold-pebble one" aria-hidden="true" />
              <span className="rs-gold-pebble two" aria-hidden="true" />

              <p className="mb-3 max-w-2xl text-sm leading-5 text-slate-600 sm:text-base">{t('heroBody')}</p>
              <div className="flex flex-wrap gap-3">
                <a href="/vendi" className="rs-button rs-button-primary rounded-xl px-4 py-2.5 text-sm font-bold text-slate-950">{t('sellPhoto')}</a>
                <a href="/ecosistema" className="rounded-xl border border-teal-700 px-4 py-2.5 text-sm font-bold text-teal-800">{t('explore')}</a>
                <a href="/eventi" className="rounded-xl border border-amber-500 px-4 py-2.5 text-sm font-bold text-amber-700">Eventi e festività</a>
              </div>
            </div>
          </section>

          <a href="/servizi/music" aria-label="Apri RS Music" className="rs-banner-slide rs-creator-banner group shrink-0 snap-start overflow-hidden rounded-2xl border border-amber-300/70 bg-gradient-to-br from-amber-950 via-slate-950 to-fuchsia-950 text-white shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-amber-300/70">
            <div className="rs-world-media relative flex h-[112px] shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 via-fuchsia-950 to-amber-900">
              <span className="text-6xl drop-shadow-lg" role="img" aria-label="Microfono musicale">🎙️</span>
              <span className="absolute bottom-2 right-3 text-2xl" aria-hidden="true">🎵</span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col items-start p-3 text-left">
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-amber-200">Artisti • CD • Eventi</p>
              <h2 className="mt-1 text-base font-black leading-tight">RiverSpendYourMusic</h2>
              <p className="mt-1 text-xs leading-4 text-slate-100">Scopri il mondo della musica RiverSpend.</p>
              <span className="mt-auto inline-flex rounded-full bg-amber-300 px-3 py-1.5 text-[11px] font-extrabold text-slate-950">SCOPRI RIVERSPEND YOUR MUSIC →</span>
            </div>
          </a>

          <a href="/servizi/broadcast" aria-label="Apri RS Streaming" className="rs-banner-slide rs-creator-banner group shrink-0 snap-start overflow-hidden rounded-2xl border border-violet-300/70 bg-gradient-to-br from-violet-950 via-slate-950 to-blue-950 text-white shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-violet-300/70">
            <div className="rs-world-media relative flex h-[112px] shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-violet-950 via-indigo-900 to-cyan-900">
              <span className="text-6xl drop-shadow-lg" role="img" aria-label="Schermo streaming">▶️</span>
              <span className="absolute bottom-2 right-3 text-2xl" aria-hidden="true">✨</span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col items-start p-3 text-left">
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-violet-200">Video • Streaming</p>
              <h2 className="mt-1 text-base font-black leading-tight">RiverSpend Streaming</h2>
              <p className="mt-1 text-xs leading-4 text-slate-100">Sei un videomaker, regista o creator? Realizzi film, corti o contenuti video? Scopri il progetto RiverSpend per video e streaming.</p>
              <span className="mt-auto inline-flex rounded-full bg-violet-300 px-3 py-1.5 text-[11px] font-extrabold text-slate-950">ENTRA NELLO STREAMING →</span>
            </div>
          </a>

          <a href="/servizi/tv" aria-label="Apri RiverSpend TV" className="rs-banner-slide rs-creator-banner group shrink-0 snap-start overflow-hidden rounded-2xl border border-cyan-300/70 bg-gradient-to-br from-cyan-950 via-slate-950 to-teal-950 text-white shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-cyan-300/70">
            <div className="rs-world-media relative flex h-[112px] shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-950 via-teal-900 to-blue-900">
              <span className="text-6xl drop-shadow-lg" role="img" aria-label="Televisione">📺</span>
              <span className="absolute bottom-2 right-3 text-2xl" aria-hidden="true">🎬</span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col items-start p-3 text-left">
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-cyan-200">Video • Intrattenimento</p>
              <h2 className="mt-1 text-base font-black leading-tight">RiverSpend TV</h2>
              <p className="mt-1 text-xs leading-4 text-slate-100">Sei un artista, attore, regista o creator? Proponi film, cortometraggi e video per il futuro spazio RiverSpend TV.</p>
              <span className="mt-auto inline-flex rounded-full bg-cyan-300 px-3 py-1.5 text-[11px] font-extrabold text-slate-950">ENTRA IN RiverSpend TV →</span>
            </div>
          </a>

          <a href="/rs-future-world" aria-label="Apri RS Droid e Future City" className="rs-banner-slide rs-creator-banner group shrink-0 snap-start overflow-hidden rounded-2xl border border-teal-300/70 bg-gradient-to-br from-slate-900 via-indigo-950 to-teal-950 text-white shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-teal-300/70">
            <div className="rs-world-media relative flex h-[112px] shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-800 via-indigo-900 to-teal-800">
              <span className="text-6xl drop-shadow-lg" role="img" aria-label="Droid futuristico">🤖</span>
              <span className="absolute bottom-2 right-3 text-2xl" aria-hidden="true">🌆</span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col items-start p-3 text-left">
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-teal-200">Droidi • Future City</p>
              <h2 className="mt-1 text-base font-black leading-tight">RiverSpend Droids</h2>
              <p className="mt-1 text-xs leading-4 text-slate-100">Entra nel mondo futuristico RiverSpend.</p>
              <span className="mt-auto inline-flex rounded-full bg-teal-300 px-3 py-1.5 text-[11px] font-extrabold text-slate-950">SCOPRI RIVERSPEND DROIDS →</span>
            </div>
          </a>

          <a href="/river-space" aria-label="Scopri RiverSpace" className="rs-banner-slide rs-creator-banner group shrink-0 snap-start overflow-hidden rounded-2xl border border-sky-300/70 bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950 text-white shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-sky-300/70">
            <div className="rs-world-media relative flex h-[112px] shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-blue-900 to-cyan-900">
              <span className="text-6xl drop-shadow-lg" role="img" aria-label="Pianeta e spazio">🪐</span>
              <span className="absolute bottom-2 right-3 text-2xl" aria-hidden="true">🚀</span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col items-start p-3 text-left">
              <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-sky-200">Spazio • Ricerca • Futuro</p>
              <h2 className="mt-1 text-base font-black leading-tight">RiverSpace</h2>
              <p className="mt-1 text-xs leading-4 text-slate-100">Beyond Earth. Beyond Limits. Una visione per habitat spaziali e missioni umane di lunga durata.</p>
              <span className="mt-auto inline-flex rounded-full bg-sky-300 px-3 py-1.5 text-[11px] font-extrabold text-slate-950">SCOPRI RIVERSPACE →</span>
            </div>
          </a>

          <a href="/social-network" aria-label="Scopri RiverSpend TV e condividi i tuoi video" className="rs-banner-slide rs-creator-banner group shrink-0 snap-start overflow-hidden rounded-2xl border border-violet-300/70 bg-gradient-to-br from-violet-950 via-slate-950 to-cyan-950 text-white shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-violet-300/70">
            <div className="flex h-full flex-col p-4 text-left">
              <span className="text-3xl" aria-hidden="true">🎬</span>
              <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[.18em] text-cyan-200">Video • Creatività • Community</p>
              <h2 className="mt-1 text-xl font-black leading-tight">RiverSpend TV</h2>
              <p className="mt-2 text-xs leading-4 text-slate-100">Sei un videomaker o realizzi film? Fai conoscere i tuoi video e progetti: RiverSpend TV vuole dare spazio ai creator. Le funzioni di invio e streaming sono in sviluppo.</p>
              <span className="mt-auto inline-flex self-start rounded-full bg-cyan-300 px-3 py-2 text-[11px] font-extrabold text-slate-950">SCOPRI IL SOCIAL →</span>
            </div>
          </a>

          <a href="/servizi/sound-studio-live" aria-label="Scopri RiverSpend Music e RSSoundStudio ISSA" className="rs-banner-slide rs-creator-banner group shrink-0 snap-start overflow-hidden rounded-2xl border border-cyan-300/70 bg-gradient-to-br from-cyan-950 via-slate-950 to-teal-950 text-white shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-cyan-300/70">
            <div className="rs-world-media relative flex h-[64px] shrink-0 items-center justify-center overflow-hidden bg-slate-950 p-1">
              <img src="/rssoundstudio-issa-banner.jpg" alt="RSSoundStudio ISSA — studio di registrazione e produzione musicale" className="block max-h-full max-w-full w-auto h-auto object-contain drop-shadow-lg" loading="lazy" />
            </div>
            <div className="flex min-h-0 flex-1 flex-col items-start p-3 text-left">
              <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-cyan-200">Artisti • Musica • Produzione</p>
              <h2 className="mt-1 text-base font-black leading-tight">RiverSpend Music</h2>
              <p className="mt-1 text-xs leading-4 text-slate-100">Sei un artista? Suoni o crei musica? Entra in RiverSpend Music e RSSoundStudio ISSA: registra, produci e distribuisci la tua musica nel circuito RiverSpend Streaming. Vendi i tuoi brani su RiverSpendShop!</p>
              <span className="mt-auto inline-flex rounded-full bg-cyan-300 px-3 py-1.5 text-[11px] font-extrabold text-slate-950">SCOPRI RIVERSPEND MUSIC →</span>
            </div>
          </a>





          </div>



        <section className="mx-auto max-w-6xl px-2 py-4 sm:px-4">
          <div id="rs-products-section" className="mb-5 scroll-mt-40 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">{t('products')}</h2>
              <p className="text-sm text-slate-400">{prodottiVisibili.length} {t('visible')}</p>
            </div>
            <div className="flex flex-col items-end gap-2"><a href="/rete" className="text-sm font-semibold text-teal-700 underline">{t('myNet')}</a></div>
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
                  <div className="relative">{p.immagini?.[0] ? <div className="rs-product-media flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-white p-0"><img src={p.immagini[0]} alt={p.titolo || 'Prodotto'} className="h-full w-full scale-[1.3] object-contain transition-transform duration-300 group-hover:scale-[1.35]" /></div> : <div className="flex aspect-[4/3] items-center justify-center bg-white text-xs text-slate-500">Foto non disponibile</div>}
                  {(() => { const tipo = String(p.seller_type || p.venditoreTipo || "Privato").toLowerCase(); const river = tipo.includes("river"); const azienda = tipo.includes("aziend") || tipo.includes("business") || tipo.includes("iva") || tipo.includes("profession"); const label = river ? "RSS" : azienda ? "RS azienda" : "Privato"; const color = river ? "border-cyan-300 bg-cyan-100 text-cyan-950" : azienda ? "border-green-300 bg-green-100 text-green-950" : "border-blue-300 bg-blue-100 text-blue-950"; return <span className={`absolute left-2 top-2 z-10 rounded-md border px-2.5 py-1 text-[11px] font-extrabold shadow-sm ${color}`}>{label}</span>; })()} {countryFlag(p.paeseOrigine || p.paeseVenditore) && <span className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white/95 text-lg shadow-sm" title={"Paese: " + (p.paeseOrigine || p.paeseVenditore)} aria-label={"Paese: " + (p.paeseOrigine || p.paeseVenditore)}>{countryFlag(p.paeseOrigine || p.paeseVenditore)}</span>}{p.sponsorizzatoFino && new Date(p.sponsorizzatoFino) > new Date() && <span className="absolute right-2 top-11 rounded-md border border-amber-300 bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-900">RS Spons</span>}</div>
                  <div className="p-2 sm:p-3">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-tight sm:text-base">{p.titolo}</h3>
                    <p className="mt-1 text-base font-bold text-teal-300 sm:text-lg">€ {Number(p.prezzo || 0).toFixed(2)}</p>
                    <p className="text-[11px] leading-tight text-slate-400 sm:text-xs">{p.categoria || 'Altro'} · {p.condizione}</p>
                    <p className="mt-2 text-xs font-semibold text-teal-300 sm:text-sm">{t('openProduct')}</p>
                  </div>
                </a>
                <div className="px-2 pb-2 sm:px-3 sm:pb-3">
                  <button
                    type="button"
                    aria-pressed={reteIds.includes(String(p.id))}
                    onClick={() => toggleReteFromCatalog(p)}
                    className={reteIds.includes(String(p.id))
                      ? "flex min-h-12 w-full items-center justify-center rounded-xl border-2 border-emerald-400 bg-emerald-300 px-2 py-2 text-center text-sm font-extrabold leading-tight text-emerald-950 shadow-sm transition-colors"
                      : "flex min-h-12 w-full items-center justify-center rounded-xl border-2 border-teal-400 bg-teal-500 px-2 py-2 text-center text-sm font-extrabold leading-tight text-slate-950 shadow-sm transition-colors hover:bg-teal-300"}
                  >
                    {reteIds.includes(String(p.id)) ? "✓ Aggiunto alla mia Rete" : "🕸️ Aggiungi alla Rete"}
                  </button>
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
              <a href="/eventi" className="text-amber-200 underline underline-offset-4">Eventi e festività</a>
              <a href="/nova-shield" className="text-teal-200">RS Nova Shield</a>
              <a href="/tutela" className="text-slate-300">Tutela e assistenza</a>
              <a href="/vendi" className="text-slate-300">{t('sell')}</a>
              <a href="/rete" className="text-slate-300">{t('myNet')}</a><a href="/desideri" className="text-slate-300">Desideri</a>
            </nav>
          </div>
        </footer>
      </div>
      {!showSplash && (
        <aside className="fixed bottom-4 right-3 z-40 w-[min(360px,calc(100vw-24px))]" aria-label="Assistente Nova · River AI">
          {novaOpen ? (
            <section className="overflow-hidden rounded-3xl border border-cyan-300/70 bg-slate-950/95 text-white shadow-2xl shadow-cyan-950/50 backdrop-blur">
              <div className="flex items-center justify-between border-b border-cyan-400/30 bg-gradient-to-r from-slate-900 to-teal-950 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-[76px] w-[72px] shrink-0 items-center justify-center overflow-visible rounded-2xl border border-cyan-300/60 bg-slate-900 shadow-[0_0_22px_rgba(34,211,238,.3)]" aria-hidden="true">
                    <svg viewBox="0 0 92 112" className="h-[72px] w-[66px] overflow-visible" role="img" aria-label="Nova River AI, droide umanoide">
                      <defs>
                        <linearGradient id="novaBodyMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff"/><stop offset=".55" stopColor="#dbeafe"/><stop offset="1" stopColor="#64748b"/></linearGradient>
                        <linearGradient id="novaBodyGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fde68a"/><stop offset="1" stopColor="#d97706"/></linearGradient>
                        <radialGradient id="novaCore"><stop offset="0" stopColor="#a5f3fc"/><stop offset="1" stopColor="#0891b2"/></radialGradient>
                      </defs>
                      <ellipse cx="45" cy="105" rx="26" ry="4" fill="#22d3ee" opacity=".22"/>
                      <g className="nova-animated-head">
                        <path d="M32 7 Q45 1 58 7 L65 17 L63 37 Q57 48 45 48 Q33 48 27 37 L25 17Z" fill="url(#novaBodyMetal)" stroke="#22d3ee" strokeWidth="1.8"/>
                        <rect x="29" y="16" width="32" height="23" rx="8" fill="#061827" stroke="#38bdf8" strokeWidth="1.4"/>
                        <path d="M35 26 Q39 21 42 26 M48 26 Q52 21 55 26" fill="none" stroke="#67e8f9" strokeWidth="2.8" strokeLinecap="round"/>
                        <path d="M38 33 Q45 37 52 33" fill="none" stroke="#67e8f9" strokeWidth="1.8" strokeLinecap="round"/>
                        <path d="M39 6 L45 2 L51 6" fill="none" stroke="#fbbf24" strokeWidth="2.2"/>
                      </g>
                      <path d="M38 48 L38 54 L52 54 L52 48" fill="url(#novaBodyMetal)" stroke="#22d3ee" strokeWidth="1.4"/>
                      <path d="M31 53 Q45 48 59 53 L68 65 L64 83 L58 91 L32 91 L26 83 L22 65Z" fill="url(#novaBodyMetal)" stroke="#22d3ee" strokeWidth="1.8"/>
                      <path d="M34 58 L56 58 L60 72 L45 81 L30 72Z" fill="#071827" stroke="#fbbf24" strokeWidth="1.4"/>
                      <circle cx="45" cy="68" r="7" fill="url(#novaCore)" stroke="#67e8f9" strokeWidth="1.2"/>
                      <path d="M28 58 L19 63 L16 78 L22 80 L28 69 M62 58 L71 63 L74 76 L68 80 L62 69" fill="url(#novaBodyMetal)" stroke="#22d3ee" strokeWidth="1.8" strokeLinejoin="round"/>
                      <path className="nova-wave-hand" d="M68 79 L72 68 L72 58 Q74 55 76 59 L76 66 L79 59 Q82 57 82 61 L80 73 L76 83 L69 87Z" fill="url(#novaBodyMetal)" stroke="#22d3ee" strokeWidth="1.5" strokeLinejoin="round"/>
                      <path d="M35 90 L34 99 L29 103 L29 106 L41 106 L43 99 L47 99 L49 106 L61 106 L61 103 L56 99 L55 90" fill="url(#novaBodyMetal)" stroke="#22d3ee" strokeWidth="1.6" strokeLinejoin="round"/>
                      <path d="M34 93 L55 93" stroke="url(#novaBodyGold)" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div><p className="font-black tracking-wide">NOVA · RIVER AI</p><p className="text-xs text-cyan-200">Assistente ufficiale RiverSpendShop</p></div>
                </div>
                <button type="button" onClick={() => setNovaOpen(false)} aria-label="Riduci Nova" className="rounded-full px-3 py-2 text-xl text-white hover:bg-white/10">−</button>
              </div>
              <div className="p-4">
                <p className="text-base font-semibold">Ciao! 👋 Sono Nova · River AI.</p>
                <p className="mt-1 text-sm leading-5 text-slate-300">Posso aiutarti a cercare prodotti e a raggiungere le sezioni di RiverSpend. Tocca il microfono e dimmi cosa vuoi fare.</p>
                <div className="mt-3 flex gap-2">
                  <input value={ricerca} onChange={(event) => setRicerca(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') eseguiRichiestaNovaTestuale(); }} placeholder="Chiedi o cerca un prodotto…" aria-label="Cerca con Nova" className="min-w-0 flex-1 rounded-xl border border-slate-600 bg-slate-900 px-3 py-3 text-sm text-white placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none"/>
                  <button type="button" onClick={eseguiRichiestaNovaTestuale} className="rounded-xl bg-amber-300 px-4 font-black text-slate-950" aria-label="Cerca">➜</button>
                </div>
                <button type="button" onClick={avviaRiverVoice} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-300 bg-cyan-400/10 px-4 py-3 font-bold text-cyan-100 hover:bg-cyan-400/20">
                  <span aria-hidden="true">{riverVoiceActive ? '🔴' : '🎙️'}</span>{riverVoiceActive ? 'Ti ascolto…' : 'Parla con Nova'}
                </button>
                {riverVoiceStatus && <p role="status" className="mt-2 rounded-lg bg-white/5 p-2 text-xs leading-5 text-cyan-100">{riverVoiceStatus}</p>}
                <p className="mt-2 text-[11px] leading-4 text-slate-400">La voce parte solo quando premi il pulsante. Le richieste vocali supportate aprono sezioni o avviano la ricerca; l’assistente AI conversazionale completo sarà un’integrazione successiva.</p>
              </div>
            </section>
          ) : (
            <button type="button" onClick={apriNovaConSaluto} className="ml-auto flex items-center gap-3 rounded-full border border-cyan-300/70 bg-slate-950/95 px-3 py-2 text-left text-white shadow-xl shadow-cyan-950/40 backdrop-blur hover:border-amber-300" aria-label="Apri Nova · River AI">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300 bg-slate-900 shadow-[0_0_18px_rgba(34,211,238,.3)]" aria-hidden="true">
                <svg viewBox="0 0 76 64" className="h-10 w-10">
                  <path d="M13 25 Q10 7 32 6 Q54 7 51 25 L48 43 Q32 57 16 43Z" fill="#e2e8f0" stroke="#22d3ee" strokeWidth="1.8"/>
                  <rect x="16" y="17" width="32" height="24" rx="9" fill="#071827" stroke="#38bdf8" strokeWidth="1.5"/>
                  <path d="M22 28 Q26 21 30 28 Q26 34 22 28 M34 28 Q38 21 42 28 Q38 34 34 28" fill="#67e8f9"/>
                  <path d="M25 35 Q32 41 39 35" fill="none" stroke="#67e8f9" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M25 6 L32 2 L39 6" fill="none" stroke="#fbbf24" strokeWidth="2"/>
                </svg>
              </span>
              <span className="pr-2"><span className="block text-sm font-black">Nova · River AI</span><span className="block text-xs text-cyan-200">Parla con Nova</span></span>
            </button>
          )}
        </aside>
      )}
      <style jsx>{`
        /* Nova · River AI: animazioni leggere, senza librerie aggiuntive. */
        .nova-animated-head { transform-box: fill-box; transform-origin: 50% 85%; animation: nova-head-idle 4.8s ease-in-out infinite; }
        .nova-wave-hand { transform-box: fill-box; transform-origin: 15% 85%; animation: nova-hand-wave 3.8s ease-in-out infinite; }
        @keyframes nova-head-idle { 0%,100% { transform: rotate(0deg) translateY(0); } 28% { transform: rotate(-3deg) translateY(-1px); } 58% { transform: rotate(2deg) translateY(0); } 76% { transform: rotate(0deg) translateY(-1px); } }
        @keyframes nova-hand-wave { 0%,72%,100% { transform: rotate(0deg); } 78% { transform: rotate(-18deg); } 84% { transform: rotate(14deg); } 90% { transform: rotate(-12deg); } 96% { transform: rotate(5deg); } }
        @media (prefers-reduced-motion: reduce) { .nova-animated-head, .nova-wave-hand { animation:none !important; } }

        .rs-apps-grid { display:flex !important; flex-direction:row; flex-wrap:nowrap; width:100%; max-width:100%; box-sizing:border-box; overflow-x:auto; overflow-y:hidden; gap:10px; align-items:stretch; justify-content:flex-start; margin-left:auto; margin-right:auto; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; }
.rs-apps-grid > .rs-banner-slide { flex:0 0 160px !important; width:160px !important; min-width:160px !important; max-width:160px !important; height:228px !important; min-height:228px !important; max-height:228px !important; margin-bottom:0 !important; scroll-snap-align:start; box-sizing:border-box; overflow:hidden; position:relative; }
.rs-apps-grid > .rs-park-banner { flex:0 0 160px !important; width:160px !important; min-width:160px !important; max-width:160px !important; height:228px !important; min-height:228px !important; max-height:228px !important; }
.rs-apps-grid > .rs-ecology-banner { flex:0 0 160px !important; width:160px !important; min-width:160px !important; max-width:160px !important; height:228px !important; min-height:228px !important; max-height:228px !important; }
.rs-apps-grid > .rs-world-card { flex:0 0 160px !important; width:160px !important; min-width:160px !important; max-width:160px !important; height:228px !important; min-height:228px !important; max-height:228px !important; }
.rs-apps-grid > .rs-creator-banner { display:flex; flex-direction:column; align-items:stretch; }
.rs-apps-grid > .rs-creator-banner > div { box-sizing:border-box; min-height:0; height:100%; }
.rs-apps-grid > .rs-creator-banner h2 { overflow-wrap:anywhere; }
.rs-apps-grid > .rs-creator-banner p:not(:first-child) { max-width:100%; }
.rs-apps-grid > .rs-social-banner { display:flex; flex-direction:column; align-items:stretch; }
.rs-apps-grid > .rs-social-banner > .rs-social-banner-media { height:112px; min-height:112px; max-height:112px; flex:0 0 112px; }
.rs-apps-grid > .rs-social-banner > .rs-social-banner-media img { height:100% !important; width:100%; object-fit:cover; object-position:center; }
.rs-apps-grid > .rs-social-banner > div:last-child { height:auto; min-height:0; flex:1 1 auto; box-sizing:border-box; }
.rs-apps-grid > .rs-social-banner h2, .rs-apps-grid > .rs-social-banner p { max-width:100%; overflow-wrap:anywhere; }
.rs-apps-grid > .rs-ecology-banner { flex:0 0 240px; width:240px; min-width:240px; max-width:240px; height:228px; min-height:228px; max-height:228px; box-sizing:border-box; overflow:hidden; display:flex; flex-direction:column; align-items:flex-start; padding:12px !important; gap:0; }
.rs-apps-grid > .rs-ecology-banner > span:first-child { font-size:24px; line-height:1; }
.rs-apps-grid > .rs-ecology-banner > h2 { margin-top:7px; font-size:18px; line-height:1.12; }
.rs-apps-grid > .rs-ecology-banner > p { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; margin-top:6px; font-size:12px; line-height:1.3; }
.rs-apps-grid > .rs-ecology-banner > span:not(:first-child) { margin-top:8px; padding:7px 10px; font-size:11px; line-height:1.2; }
.rs-apps-grid > .rs-ecology-banner > small { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; margin-top:7px; font-size:10px; line-height:1.25; }
.rs-apps-grid > .rs-park-banner { flex:0 0 240px; width:240px; min-width:240px; max-width:240px; height:228px; min-height:228px; max-height:228px; }
.rs-apps-grid > .rs-park-banner > div { position:relative; width:100%; height:100%; min-height:0; overflow:hidden; }
.rs-apps-grid > .rs-park-banner > div > img { position:absolute; inset:0; display:block; width:100%; height:100% !important; max-height:100%; aspect-ratio:auto; object-fit:cover; object-position:center; }
.rs-apps-grid > .rs-park-banner > div > div:last-child { padding:10px; }
.rs-apps-grid > .rs-park-banner > div > div:last-child > p:first-child { font-size:9px; line-height:1.2; letter-spacing:.12em; }
.rs-apps-grid > .rs-park-banner > div > div:last-child > h2 { margin-top:4px; font-size:20px; line-height:1.1; }
.rs-apps-grid > .rs-park-banner > div > div:last-child > p:nth-of-type(2) { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; margin-top:5px; font-size:11px; line-height:1.3; }
.rs-apps-grid > .rs-park-banner > div > div:last-child > span { margin-top:8px; padding:7px 10px; font-size:11px; line-height:1.2; }

.rs-apps-grid > .rs-banner-slide:not(.rs-hero) > div { height:100%; }
.rs-apps-grid > .rs-banner-slide:not(.rs-hero) img { display:block; width:100%; height:100% !important; max-height:100%; object-fit:cover; }
.rs-apps-grid > .rs-banner-slide.rs-hero > img { position:absolute; inset:0; width:100%; height:100% !important; max-height:100%; object-fit:cover; }
.rs-apps-grid > .rs-banner-slide.rs-hero > div { position:absolute; inset:auto 0 0; z-index:2; padding:10px; background:rgba(255,255,255,.94); }
.rs-apps-grid > .rs-banner-slide.rs-hero > div p { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; margin-bottom:8px; font-size:12px; line-height:1.35; }
.rs-apps-grid > .rs-banner-slide.rs-hero > div .flex { gap:6px; }
.rs-apps-grid > .rs-banner-slide.rs-hero > div a { padding:6px 8px; font-size:11px; }
.rs-apps-grid { display:flex !important; flex-direction:row; flex-wrap:nowrap; width:100%; max-width:100%; box-sizing:border-box; overflow-x:auto; overflow-y:hidden; gap:10px; align-items:stretch; justify-content:flex-start; margin-left:auto; margin-right:auto; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; }
        .rs-feature-card { box-sizing:border-box; min-width:160px !important; width:160px !important; max-width:160px; height:228px !important; flex:0 0 160px !important; overflow:hidden; display:flex; scroll-snap-align:start; }
        /* Banner venditore: stessa larghezza delle altre schede nel carosello mobile. */
        #rs-seller-card { box-sizing:border-box; min-width:160px !important; width:160px !important; max-width:160px !important; flex:0 0 160px !important; }
        /* Contrasto leggibile e stato visivo coerente per i pulsanti della Rete. */
        .rs-product-card button[aria-pressed="true"] { background-color:#6ee7b7 !important; color:#064e3b !important; border-color:#34d399 !important; }
        .rs-product-card button[aria-pressed="false"] { background-color:#14b8a6 !important; color:#042f2e !important; border-color:#2dd4bf !important; }
        .rs-feature-card > a, .rs-feature-card > button { display:flex; flex-direction:column; flex:1; min-height:0; }
        .rs-feature-card .rs-feature-media { box-sizing:border-box; height:72px !important; min-height:72px !important; max-height:72px; flex:0 0 72px; }
        .rs-feature-action { margin-top:auto !important; min-height:28px; flex-shrink:0; justify-content:center; }
        .rs-feature-card > button { min-width:0; min-height:0; }
        .rs-feature-card a, .rs-feature-card button { -webkit-tap-highlight-color:transparent; }
        /* RS FORCE segue la stessa gerarchia visiva delle altre schede: titolo, immagine, testo. */
        .rs-force-card > button > .rs-force-stage { order:2 !important; }
        .rs-force-card > button > p:first-of-type { order:0 !important; }
        .rs-force-card > button > h2 { order:1 !important; }
        .rs-force-card > button > p:last-of-type { order:3 !important; }
        .rs-feature-card .rs-feature-media img { display:block; width:100%; height:100% !important; max-height:100%; object-fit:cover; object-position:center; }
        .rs-feature-card > a, .rs-feature-card > button { justify-content:flex-start; }
        .rs-feature-card .rs-feature-action { margin-top:auto !important; }
        @media (max-width:640px) {
          .rs-apps-grid { gap:8px; padding-left:4px; padding-right:4px; }
          .rs-feature-card { height:228px !important; }
        }
        @media (min-width:768px) {
          .rs-apps-grid { max-width:1152px; }
        }
        /* Correzione: le dimensioni delle schede restano quelle originali; si ingrandiscono solo le fotografie. */
        .rs-apps-grid > .rs-feature-card,
        .rs-apps-grid > #rs-seller-card,
        .rs-apps-grid > .rs-park-banner {
          flex-shrink:0;
        }
        .rs-apps-grid > #rs-force-card .rs-force-stage {
          height:112px !important;
          min-height:112px;
        }
        .rs-apps-grid > #rs-force-card .rs-force-stage > img {
          width:100%;
          height:100%;
          object-fit:cover;
          object-position:center;
        }
        .rs-apps-grid > .rs-fortune-card img[src="/rs-fortune.jpg"] {
          height:112px !important;
          min-height:112px;
          object-fit:cover;
          object-position:center;
        }
        /* Le foto riempiono la propria fascia del banner; dimensioni e impaginazione delle schede restano invariate. */
        .rs-apps-grid > .rs-feature-card:has(img[src="/rs-lottery.jpg"]) .rs-feature-media,
        .rs-apps-grid > .rs-feature-card:has(img[src="/rs-folgore-pacchi.png"]) .rs-feature-media {
          height:112px !important;
          min-height:112px !important;
          max-height:112px;
          flex:0 0 112px;
        }
        .rs-apps-grid > .rs-feature-card img[src="/rs-lottery.jpg"],
        .rs-apps-grid > .rs-feature-card img[src="/rs-folgore-pacchi.png"] {
          display:block;
          width:100%;
          height:100% !important;
          min-height:0;
          max-height:100%;
          object-fit:cover;
          object-position:center;
        }
        .rs-apps-grid > .rs-feature-card:has(img[src="/rs-lottery.jpg"]),
        .rs-apps-grid > .rs-feature-card:has(img[src="/rs-folgore-pacchi.png"]) {
          background-image:none !important;
        }
        .rs-apps-grid > #rs-force-card,
        .rs-apps-grid > .rs-fortune-card {
          background-image:none !important;
        }
        #rs-seller-card > img {
          position:absolute;
          inset:0;
          width:100%;
          height:100%;
          object-fit:cover;
          object-position:center;
        }
        @keyframes rs-palantir-pulse {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.05); filter: brightness(1.2); }
        }
        /* RS FORCE: orbita orizzontale tipo pianeti attorno al sole.
           Il movimento resta sul piano orizzontale: destra/sinistra + avanti/indietro,
           con prospettiva per simulare la profondità senza il vecchio cerchio verticale. */
        .rs-force-stage { perspective: 900px; transform-style: preserve-3d; }
        @keyframes rs-force-orbit {
          from { transform: rotateY(0deg) translateX(var(--orbit-radius)); }
          to { transform: rotateY(360deg) translateX(var(--orbit-radius)); }
        }
        .rs-force-orbit {
          position: absolute; left: 50%; top: 50%; width: 0; height: 0;
          animation: rs-force-orbit var(--orbit-duration) linear infinite;
          transform-origin: center center;
          transform-style: preserve-3d;
          will-change: transform;
        }
        .rs-force-product {
          transform: translate(-50%, -50%) rotateY(0deg) scale(var(--orbit-scale, 1));
          will-change: transform, filter;
          transform-style: preserve-3d;
        }
        .rs-fortune-celebration { position:relative; height:0; pointer-events:none; z-index:30; }
        .rs-confetti,.rs-water-drop { position:absolute; left:50%; top:12px; display:block; animation:rs-fortune-burst 1.8s ease-out var(--delay) forwards; opacity:0; }
        .rs-confetti { width:7px; height:13px; border-radius:2px; background:linear-gradient(135deg,#f59e0b,#22d3ee); transform:translateX(-50%); }
        .rs-water-drop { width:8px; height:12px; border-radius:60% 60% 65% 65%; background:rgba(103,232,249,.9); box-shadow:0 0 8px rgba(34,211,238,.7); transform:translateX(-50%); }
        @keyframes rs-fortune-burst { 0% { opacity:1; transform:translate(-50%,0) rotate(0deg) scale(.7); } 100% { opacity:0; transform:translate(calc(-50% + var(--dx)),110px) rotate(300deg) scale(1); } }
        .rs-fortune-wheel {
          margin: 0 auto;
          background: conic-gradient(#f59e0b 0deg 45deg,#fde68a 45deg 90deg,#f59e0b 90deg 135deg,#fde68a 135deg 180deg,#f59e0b 180deg 225deg,#fde68a 225deg 270deg,#f59e0b 270deg 315deg,#fde68a 315deg 360deg);
          transition: transform 5.2s cubic-bezier(.12,.72,.18,1);
          will-change: transform;
          overflow: hidden;
        }
        .rs-fortune-labels {
          position:absolute; inset:0; z-index:1; pointer-events:none;
        }
        .rs-fortune-labels span {
          position:absolute; left:50%; top:50%; width:50px; height:44px;
          margin-left:-25px; margin-top:-22px; text-align:center;
          color:#451a03; font-size:9px; line-height:1.05; font-weight:900;
          text-shadow:0 0 2px rgba(255,255,255,.35); transform-origin:25px 22px;
        }
        .rs-fortune-labels span:nth-child(1){transform:rotate(22.5deg) translateY(-35px);}
        .rs-fortune-labels span:nth-child(2){transform:rotate(67.5deg) translateY(-44px);}
        .rs-fortune-labels span:nth-child(3){transform:rotate(112.5deg) translateY(-53px);}
        .rs-fortune-labels span:nth-child(4){transform:rotate(157.5deg) translateY(-53px);}
        .rs-fortune-labels span:nth-child(5){transform:rotate(202.5deg) translateY(-53px);}
        .rs-fortune-labels span:nth-child(6){transform:rotate(247.5deg) translateY(-53px);}
        .rs-fortune-labels span:nth-child(7){transform:rotate(292.5deg) translateY(-53px);}
        .rs-fortune-labels span:nth-child(8){transform:rotate(337.5deg) translateY(-53px);}
        /* RS FORCE mobile: card compatta, niente area bianca e contenuti leggibili. */
        #rs-force-card {
          height: 390px !important;
          min-height: 390px !important;
          max-height: 390px !important;
          box-sizing: border-box;
          background: linear-gradient(180deg,#071c2d 0%,#082f49 55%,#111827 100%) !important;
        }
        #rs-force-card > button {
          display:flex !important;
          flex:1 1 auto !important;
          width:100% !important;
          height:100% !important;
          min-height:0 !important;
          background:transparent !important;
          color:#fff !important;
          justify-content:flex-start !important;
          gap:0 !important;
        }
        #rs-force-card .rs-force-stage {
          height:132px !important;
          min-height:132px !important;
          max-height:132px !important;
          flex:0 0 132px !important;
          order:2 !important;
          margin-top:8px !important;
        }
        #rs-force-card > button > p:first-of-type { order:0 !important; }
        #rs-force-card > button > h2 { order:1 !important; }
        #rs-force-card > button > p:last-of-type {
          order:3 !important;
          flex:0 0 auto !important;
          margin-top:12px !important;
          min-height:42px !important;
          width:100%;
          box-sizing:border-box;
          background:#0b1724 !important;
          border-radius:10px;
          padding:9px 8px !important;
          color:#fff !important;
          font-size:12px !important;
          line-height:1.35 !important;
        }
        #rs-force-card .rs-force-stage > img { position:absolute; inset:0; }
        #rs-force-card .rs-force-stage > span { flex-shrink:0 !important; }
        .rs-fortune-center {
          position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
          display:flex; align-items:center; justify-content:center; text-align:center;
          width:58px; height:58px; border-radius:9999px; border:4px solid #fef3c7;
          background:#111827; color:#fcd34d; font-size:9px; font-weight:900;
          box-shadow:0 0 20px rgba(251,191,36,.45);
        }
        /* Carosello homepage: mantieni tutti i banner presenti e uniforma misura e scorrimento. */
        .rs-apps-grid {
          display:flex !important;
          flex-wrap:nowrap !important;
          align-items:stretch !important;
          overflow-x:auto !important;
          overflow-y:hidden !important;
          scroll-snap-type:x mandatory !important;
          -webkit-overflow-scrolling:touch;
        }
        .rs-apps-grid > .rs-feature-card,
        .rs-apps-grid > #rs-seller-card,
        .rs-apps-grid > .rs-park-banner,
        .rs-apps-grid > .rs-banner-slide,
        .rs-apps-grid > #rs-force-card {
          box-sizing:border-box !important;
          width:220px !important;
          min-width:220px !important;
          max-width:220px !important;
          height:390px !important;
          min-height:390px !important;
          max-height:390px !important;
          flex:0 0 220px !important;
          align-self:stretch !important;
          scroll-snap-align:start !important;
          overflow:hidden !important;
        }
        .rs-apps-grid > .rs-feature-card > button,
        .rs-apps-grid > .rs-feature-card > a,
        .rs-apps-grid > #rs-seller-card > a,
        .rs-apps-grid > #rs-seller-card > button,
        .rs-apps-grid > .rs-park-banner > a,
        .rs-apps-grid > .rs-park-banner > button {
          box-sizing:border-box !important;
          height:100% !important;
          min-height:0 !important;
        }
        .rs-apps-grid > .rs-feature-card .rs-feature-media,
        .rs-apps-grid > #rs-force-card .rs-force-stage {
          height:112px !important;
          min-height:112px !important;
          max-height:112px !important;
          flex:0 0 112px !important;
        }

        /* RS FORCE: riempi il banner senza ingrandire eccessivamente l'immagine. */
        #rs-force-card { position:relative !important; background:#061522 !important; }
        #rs-force-card > button { position:relative !important; isolation:isolate; }
        #rs-force-card .rs-force-stage {
          position:absolute !important; inset:0 !important; z-index:0 !important;
          width:100% !important; height:100% !important; min-height:100% !important;
          max-height:none !important; flex:0 0 100% !important; margin:0 !important;
          border:0 !important; border-radius:0 !important; overflow:hidden !important;
        }
        #rs-force-card .rs-force-stage > img {
          position:absolute !important; inset:0 !important; display:block !important;
          width:100% !important; height:100% !important; max-height:none !important;
          object-fit:cover !important; object-position:center !important;
        }
        #rs-force-card .rs-force-stage > img:first-child { opacity:1 !important; }
        #rs-force-card .rs-force-stage > img:nth-child(2) { opacity:.90 !important; }
        #rs-force-card .rs-force-stage > span { position:relative !important; z-index:2 !important; }
        #rs-force-card > button > p,
        #rs-force-card > button > h2 { position:relative !important; z-index:3 !important; }
        #rs-force-card > button > p:last-of-type {
          margin-top:auto !important; margin-bottom:8px !important;
          background:rgba(5,18,31,.88) !important;
        }

        /* RiverSpend · uniforma i banner del carosello: immagine a pieno riquadro e testi compatti */
        .rs-apps-grid > .rs-banner-slide:not(.rs-hero) {
          position:relative !important; height:390px !important; min-height:390px !important;
          max-height:390px !important; box-sizing:border-box !important; overflow:hidden !important;
          border-radius:24px !important;
        }
        .rs-apps-grid > .rs-banner-slide:not(.rs-hero) img {
          display:block !important; width:100% !important; height:100% !important;
          max-height:none !important; object-fit:cover !important; object-position:center !important;
        }
        .rs-apps-grid > .rs-unita-sicura-banner { flex:0 0 240px !important; width:240px !important; min-width:240px !important; max-width:240px !important; }
        .rs-apps-grid > .rs-unita-sicura-banner > img { transform:scale(1.35); }
        .rs-apps-grid > .rs-unita-sicura-banner > div { position:absolute !important; inset:auto 0 0 !important; z-index:2 !important; height:auto !important; padding:10px !important; background:linear-gradient(transparent,rgba(2,8,20,.92)) !important; }
        .rs-apps-grid > .rs-unita-sicura-banner > div p { font-size:9px !important; line-height:1.15 !important; letter-spacing:.1em !important; margin:0 !important; }
        .rs-apps-grid > .rs-unita-sicura-banner > div h2 { margin-top:4px !important; font-size:18px !important; line-height:1.08 !important; }
        .rs-apps-grid > .rs-unita-sicura-banner > div span { margin-top:7px !important; padding:7px 10px !important; font-size:11px !important; line-height:1.15 !important; }
        .rs-apps-grid > .rs-futurecity-banner { flex:0 0 240px !important; width:240px !important; min-width:240px !important; max-width:240px !important; }
        .rs-apps-grid > .rs-futurecity-banner h2 { font-size:19px !important; line-height:1.1 !important; }
        .rs-apps-grid > .rs-futurecity-banner p { font-size:11px !important; line-height:1.25 !important; }

        /* RS FORCE: sfera centrata, più grande e titolo luminoso per riempire il vuoto. */
        #rs-force-card .rs-palantir {
          left:0 !important; margin-left:auto !important; margin-right:auto !important;
          transform:translateY(30px) !important; width:144px !important; height:144px !important;
          flex:0 0 144px !important; font-size:60px !important;
          box-shadow:0 0 34px 13px rgba(34,211,238,.78), inset 0 0 28px rgba(255,255,255,.75) !important;
        }
        #rs-force-card .rs-force-title {
          width:100% !important; margin-top:auto !important; padding-top:8px !important;
          font-size:24px !important; line-height:1.1 !important; letter-spacing:.12em !important;
          color:#e0fcff !important;
          text-shadow:0 0 8px #22d3ee,0 0 18px #0891b2,0 2px 5px #000 !important;
        }
        #rs-force-card .rs-force-stage {
          background:radial-gradient(ellipse at 50% 45%,#075985 0%,#062c46 42%,#020817 100%) !important;
        }
        /* RS FORCE: elimina la fascia nera incorporata nell'immagine e riempie il banner. */
        #rs-force-card .rs-force-stage > img:first-child {
          transform:scale(1.72) !important;
          transform-origin:50% 38% !important;
          object-position:center 38% !important;
          opacity:.72 !important;
        }
        #rs-force-card .rs-force-stage > img:nth-child(2) {
          transform:scale(1.16) !important;
          transform-origin:center center !important;
        }
        #rs-force-card > button > h2 {
          margin-top:6px !important;
          margin-bottom:8px !important;
        }

      `}</style>

      <section id="rs-download-apps" className="rs-download-apps" aria-labelledby="rs-download-title">
        <div className="rs-download-head">
          <p className="rs-download-kicker">RIVERSPEND · APP UFFICIALI</p>
          <h2 id="rs-download-title">Le app RiverSpend</h2>
          <p>Per il momento le app non sono pubblicate su Google Play Store. Puoi aprire RiverSpend con Google Chrome e seguire le istruzioni qui sotto.</p>
        </div>
        <div className="rs-download-grid">
          <article className="rs-download-card">
            <div className="rs-download-icon rs-icon-shop" aria-hidden="true"><span>RS</span><b>SHOP</b></div>
            <h3>RiverSpendShop</h3><p>Il marketplace RiverSpend.</p>
            <a className="rs-download-button" href="#rs-install-guide">Come installarla</a>
          </article>
          <article className="rs-download-card">
            <div className="rs-download-icon rs-icon-park" aria-hidden="true"><span>🎢</span><b>PARK</b></div>
            <h3>RiverSpendPark</h3><p>Il mondo delle attrazioni RiverSpend.</p>
            <a className="rs-download-button" href="#rs-install-guide">Come installarla</a>
          </article>
          <article className="rs-download-card">
            <div className="rs-download-icon rs-icon-stream" aria-hidden="true"><span>▶</span><b>STREAM</b></div>
            <h3>RiverSpend Streaming</h3><p>Accesso non ancora attivo.</p>
            <span className="rs-download-locked">🔒 Bloccata fino all’attivazione</span>
          </article>
          <article className="rs-download-card">
            <div className="rs-download-icon rs-icon-music" aria-hidden="true"><span>♫</span><b>SOUND</b></div>
            <h3>RiverSpend SoundStudio</h3><p>Servizi musicali in preparazione.</p>
            <span className="rs-download-locked">🔒 Bloccata fino all’attivazione</span>
          </article>
          <article className="rs-download-card">
            <div className="rs-download-icon rs-icon-panel" aria-hidden="true"><span>⚙</span><b>RSPC</b></div>
            <h3>RSPanelControl</h3><p>Pannello di controllo riservato.</p>
            <span className="rs-download-locked">🔒 Accesso riservato · non scaricabile</span>
          </article>
        </div>
        <div id="rs-install-guide" className="rs-install-guide">
          <h3>Come aggiungere un’app al telefono Android</h3>
          <ol>
            <li>Apri <strong>Google Chrome</strong> sul telefono.</li>
            <li>Digita <strong>www.riverspend.com</strong> nella barra degli indirizzi.</li>
            <li>Apri il menu di Chrome con i <strong>tre puntini ⋮</strong>.</li>
            <li>Se disponibile, tocca <strong>“Installa app”</strong> oppure <strong>“Aggiungi a schermata Home”</strong>.</li>
            <li>Conferma e troverai l’icona sul telefono. Se l’opzione non compare, quella funzione non è ancora disponibile sul dispositivo.</li>
          </ol>
          <p className="rs-install-note"><strong>Importante:</strong> non serve scaricare file APK da siti sconosciuti. Streaming, SoundStudio e RSPanelControl resteranno bloccate finché non saranno predisposti accessi e autorizzazioni. L’eventuale accesso a pagamento dovrà essere configurato e verificato prima di abilitarle.</p>
        </div>
      </section>
      <style jsx>{`
        .rs-download-apps{margin:36px auto 28px;padding:24px 16px;max-width:1200px;color:#073543}
        .rs-download-head{text-align:center;max-width:760px;margin:0 auto 22px}
        .rs-download-kicker{font-size:12px;letter-spacing:.18em;font-weight:800;color:#078a91}
        .rs-download-head h2{font-size:clamp(25px,4vw,38px);margin:7px 0;color:#062c3b}
        .rs-download-head>p:last-child{font-size:15px;line-height:1.55}
        .rs-download-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px}
        .rs-download-card{min-width:0;padding:14px;border:1px solid #b8e6e8;border-radius:20px;background:linear-gradient(160deg,#fff,#eefbfb);box-shadow:0 8px 22px #06374712}
        .rs-download-icon{height:112px;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;color:#fff;font-weight:900;letter-spacing:.08em;background:linear-gradient(145deg,#062c3b,#087e8b);box-shadow:inset 0 0 0 1px #ffffff45}
        .rs-download-icon span{font-size:36px;line-height:1}.rs-download-icon b{font-size:13px}
        .rs-icon-shop{background:linear-gradient(145deg,#062c3b,#0d7f85)}.rs-icon-shop span{font-size:31px;color:#fff}.rs-icon-shop b{color:#f1c75b}
        .rs-icon-park{background:linear-gradient(145deg,#063e35,#12a77c)}.rs-icon-stream{background:linear-gradient(145deg,#071b3c,#2676d2)}.rs-icon-music{background:linear-gradient(145deg,#2b174c,#9b4dd0)}.rs-icon-panel{background:linear-gradient(145deg,#242d3c,#6a7a8a)}
        .rs-download-card h3{font-size:16px;line-height:1.25;margin:13px 0 7px}.rs-download-card p{font-size:13px;line-height:1.4;min-height:36px;margin:0 0 12px}
        .rs-download-button,.rs-download-locked{display:flex;align-items:center;justify-content:center;text-align:center;min-height:40px;padding:8px;border-radius:12px;font-size:12px;font-weight:800;line-height:1.3}
        .rs-download-button{background:#48e1ef;color:#062c3b;text-decoration:none}.rs-download-locked{background:#e6e9ed;color:#4c5661}
        .rs-install-guide{margin:22px auto 0;max-width:850px;border-radius:20px;padding:20px;background:#fff;border:1px solid #c6e9e9;line-height:1.6}
        .rs-install-guide h3{margin-top:0}.rs-install-guide ol{padding-left:22px}.rs-install-note{padding:12px;border-radius:12px;background:#fff8df;font-size:13px}
        @media(max-width:900px){.rs-download-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.rs-download-card:last-child{grid-column:1/-1;max-width:calc(50% - 7px);width:100%;justify-self:center}}
        @media(max-width:420px){.rs-download-apps{padding:20px 10px}.rs-download-grid{gap:9px}.rs-download-card{padding:10px}.rs-download-icon{height:92px}.rs-download-card h3{font-size:14px}}
      `}</style>
    </main>
  );
}
