import Link from 'next/link';

import { useState } from 'react';

function distanzaKm(a, b, c, d) {
  const rad = (v) => (v * Math.PI) / 180;
  const x = rad(c - a);
  const y = rad(d - b);
  const h = Math.sin(x / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(y / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function RSLocalFinder() {
  const [citta, setCitta] = useState('');
  const [provincia, setProvincia] = useState('');
  const [centro, setCentro] = useState(null);
  const [attivita, setAttivita] = useState([]);
  const [raggio, setRaggio] = useState('5000');
  const [stato, setStato] = useState('');
  const [caricamento, setCaricamento] = useState(false);

  async function cerca(lat, lon, etichetta) {
    setCaricamento(true);
    setStato('Cerco attività reali nella zona…');
    setAttivita([]);
    setCentro({ lat, lon, etichetta });
    try {
      const query = '[out:json][timeout:25];(node(around:' + raggio + ',' + lat + ',' + lon + ')[shop];way(around:' + raggio + ',' + lat + ',' + lon + ')[shop];relation(around:' + raggio + ',' + lat + ',' + lon + ')[shop];node(around:' + raggio + ',' + lat + ',' + lon + ')[amenity~"restaurant|cafe|bar|fast_food|pharmacy|bank|post_office|fuel|clinic|doctors|美容"];way(around:' + raggio + ',' + lat + ',' + lon + ')[amenity~"restaurant|cafe|bar|fast_food|pharmacy|bank|post_office|fuel|clinic|doctors"];);out center tags;';
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: 'data=' + encodeURIComponent(query)
      });
      if (!response.ok) throw new Error('Il servizio cartografico non risponde (' + response.status + '). Riprova tra poco.');
      const data = await response.json();
      const found = (data.elements || []).map((item) => {
        const pLat = item.lat ?? item.center?.lat;
        const pLon = item.lon ?? item.center?.lon;
        if (typeof pLat !== 'number' || typeof pLon !== 'number') return null;
        const tags = item.tags || {};
        const nome = tags.name || tags.brand || tags.operator || tags.shop || tags.amenity || 'Attività locale';
        const indirizzo = [tags['addr:street'], tags['addr:housenumber'], tags['addr:postcode'], tags['addr:city']].filter(Boolean).join(' ');
        return { id: item.type + '-' + item.id, nome, tipo: tags.shop ? 'Negozio' : (tags.amenity || 'Servizio'), indirizzo, lat: pLat, lon: pLon, distanza: distanzaKm(lat, lon, pLat, pLon) };
      }).filter(Boolean).sort((a, b) => a.distanza - b.distanza);
      setAttivita(found);
      setStato(found.length ? 'Trovate ' + found.length + ' attività nei dati OpenStreetMap. Verifica sempre indirizzo e disponibilità.' : 'Nessuna attività trovata in questo raggio. Prova ad aumentarlo o cambia zona.');
    } catch (e) {
      setStato(e.message || 'Ricerca non riuscita. Riprova.');
    } finally {
      setCaricamento(false);
    }
  }

  async function cercaCitta(e) {
    e.preventDefault();
    const luogo = [citta.trim(), provincia.trim(), 'Italia'].filter(Boolean).join(', ');
    if (!citta.trim()) { setStato('Inserisci almeno una città o località.'); return; }
    setCaricamento(true);
    setStato('Cerco la località…');
    try {
      const res = await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&country=Italy&q=' + encodeURIComponent(luogo), { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('Ricerca località momentaneamente non disponibile.');
      const results = await res.json();
      if (!results.length) throw new Error('Località non trovata. Controlla città e provincia.');
      await cerca(Number(results[0].lat), Number(results[0].lon), results[0].display_name);
    } catch (e) {
      setStato(e.message || 'Non riesco a trovare questa località.');
      setCaricamento(false);
    }
  }

  function usaGps() {
    if (!navigator.geolocation) { setStato('La geolocalizzazione non è supportata da questo dispositivo.'); return; }
    setCaricamento(true);
    setStato('In attesa del permesso GPS…');
    navigator.geolocation.getCurrentPosition(
      (pos) => cerca(pos.coords.latitude, pos.coords.longitude, 'La tua posizione'),
      (err) => { setCaricamento(false); setStato(err.code === 1 ? 'Permesso posizione negato. Inserisci città e provincia.' : 'Posizione non disponibile. Inserisci città e provincia.'); },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  }

  const bbox = centro ? [centro.lon - 0.035, centro.lat - 0.025, centro.lon + 0.035, centro.lat + 0.025].join('%2C') : '';
  const mapUrl = centro ? 'https://www.openstreetmap.org/export/embed.html?bbox=' + bbox + '&layer=mapnik&marker=' + centro.lat + '%2C' + centro.lon : '';

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <h2 className="text-2xl font-bold text-slate-900">Trova attività vicino a te</h2>
      <p className="mt-2 text-slate-600">Scegli una città oppure consenti l’uso della posizione GPS. Vedrai attività presenti sulla mappa e la distanza approssimativa dal punto scelto.</p>
      <form onSubmit={cercaCitta} className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">Città / località
          <input value={citta} onChange={(e) => setCitta(e.target.value)} placeholder="Es. Cannobio" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900" />
        </label>
        <label className="text-sm font-semibold text-slate-700">Provincia
          <input value={provincia} onChange={(e) => setProvincia(e.target.value)} placeholder="Es. Verbano-Cusio-Ossola" className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900" />
        </label>
        <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Raggio di ricerca
          <select value={raggio} onChange={(e) => setRaggio(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900">
            <option value="1000">1 km</option><option value="3000">3 km</option><option value="5000">5 km</option><option value="10000">10 km</option><option value="20000">20 km</option>
          </select>
        </label>
        <button type="submit" disabled={caricamento} className="rounded-xl bg-teal-700 px-4 py-3 font-bold text-white disabled:opacity-60">Cerca per città</button>
        <button type="button" onClick={usaGps} disabled={caricamento} className="rounded-xl border border-teal-700 px-4 py-3 font-bold text-teal-800 disabled:opacity-60">📍 Usa la mia posizione GPS</button>
      </form>
      {stato && <p aria-live="polite" className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{caricamento ? '⏳ ' : ''}{stato}</p>}
      {centro && <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-3 text-sm text-slate-700"><strong>{centro.etichetta}</strong><a className="font-semibold text-teal-800 underline" href={'https://www.openstreetmap.org/?mlat=' + centro.lat + '&mlon=' + centro.lon + '#map=14/' + centro.lat + '/' + centro.lon} target="_blank" rel="noreferrer">Apri mappa completa</a></div>
        <iframe title="Mappa delle attività vicine" src={mapUrl} className="h-72 w-full border-0" loading="lazy" />
      </div>}
      {attivita.length > 0 && <div className="mt-5">
        <h3 className="mb-3 text-lg font-bold text-slate-900">Attività vicine</h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          {attivita.map((item) => <li key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3"><div><p className="font-bold text-slate-900">{item.nome}</p><p className="mt-1 text-sm capitalize text-slate-600">{item.tipo}</p>{item.indirizzo && <p className="mt-1 text-sm text-slate-600">{item.indirizzo}</p>}</div><span className="shrink-0 rounded-full bg-teal-50 px-2 py-1 text-sm font-bold text-teal-900">{item.distanza.toFixed(1)} km</span></div>
            <a className="mt-3 inline-block text-sm font-semibold text-teal-800 underline" href={'https://www.openstreetmap.org/?mlat=' + item.lat + '&mlon=' + item.lon + '#map=18/' + item.lat + '/' + item.lon} target="_blank" rel="noreferrer">Vedi sulla mappa</a>
          </li>)}
        </ul>
      </div>}
      <p className="mt-4 text-xs leading-5 text-slate-500">Dati cartografici OpenStreetMap. I risultati dipendono dai dati disponibili nella zona; non sono ancora cataloghi, venditori verificati o disponibilità di acquisto RiverSpend.</p>
    </section>
  );
}


const servizi = {
  local: {
    titolo: 'RS Local',
    icona: '📍',
    descrizione: 'RS Local è il servizio RiverSpend dedicato alle attività del territorio: un punto d’incontro tra persone, negozi, ristoranti e servizi locali.',
    stato: 'Presentazione informativa; cataloghi, ordini e consegne sono da sviluppare'
  },
  tv: {
    titolo: 'RiverSpend TV',
    icona: '📺',
    descrizione: 'Canale RiverSpend per video, presentazioni, storie del marketplace e contenuti del parco.',
    stato: 'Area informativa pronta; pubblicazione video da collegare'
  },
  pay: {
    titolo: 'RiverSpend Pay',
    icona: '💳',
    descrizione: 'Area pagamenti RiverSpend: metodi di pagamento, stato transazioni, rimborsi e storico.',
    stato: 'Integrazione pagamenti da collegare'
  },
  box: {
    titolo: 'RiverSpend Box',
    icona: '📦',
    descrizione: 'La logistica di RiverSpendShop: spedizioni tra privati, tracciamento e ritiro presso punti convenzionati, attraverso operatori da integrare.',
    stato: 'Progettazione del flusso; collegamenti con i corrieri da attivare'
  },
  fidelity: {
    titolo: 'RS Fidelity',
    icona: '💎',
    descrizione: 'Programma fedeltà e vantaggi per la community RiverSpend.',
    stato: 'Base ecosistema pronta'
  },
  park: {
    titolo: 'RiverSpend Park',
    icona: '🎢',
    descrizione: 'Il mondo del parco RiverSpend: attrazioni, esperienze, sicurezza e future aree tematiche.',
    stato: 'Base ecosistema pronta'
  },
  broadcast: {
    titolo: 'RiverSpend Broadcast',
    icona: '📡',
    descrizione: 'Canale di comunicazione RiverSpend per contenuti, aggiornamenti e novità.',
    stato: 'Base ecosistema pronta'
  },
  experience: {
    titolo: 'RiverSpend Experience',
    icona: '🌊',
    descrizione: 'L’esperienza immersiva RiverSpend: atmosfera, identità e future funzioni SurroundSpaceAroundExperience.',
    stato: 'Base ecosistema pronta'
  },
  ecology: {
    titolo: 'RiverSpend Ecology',
    icona: '🌱',
    descrizione: 'Area dedicata a sostenibilità, ambiente e iniziative ecologiche RiverSpend.',
    stato: 'Base ecosistema pronta'
  },
  oracle: {
    titolo: 'RiverSpend Oracle',
    icona: '🔮',
    descrizione: 'Area informativa e futura assistenza intelligente dell’ecosistema.',
    stato: 'Base ecosistema pronta'
  },
  recovery: {
    titolo: 'RiverSpend Recovery',
    icona: '♻️',
    descrizione: 'Gestione recupero, assistenza post-vendita e flussi di supporto.',
    stato: 'Base ecosistema pronta'
  },
  fortress: {
    titolo: 'RiverSpend Fortress',
    icona: '🏰',
    descrizione: 'Area di sicurezza dell’ecosistema con controlli e protezioni avanzate.',
    stato: 'Base ecosistema pronta'
  }
};

export default function Servizio({ slug }) {
  const servizio = servizi[slug];

  if (!servizio) {
    return (
      <main className={slug === 'local' ? "min-h-screen bg-white px-4 py-8 text-slate-900" : "min-h-screen bg-slate-950 px-4 py-8 text-white"}>
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="text-teal-300 underline">← Torna al RiverSpendShop</Link>
          <h1 className="mt-8 text-3xl font-bold">Area non trovata</h1>
        </div>
      </main>
    );
  }

  return (
    <main className={slug === 'local' ? "min-h-screen bg-white px-4 py-8 text-slate-900" : "min-h-screen bg-slate-950 px-4 py-8 text-white"}>
      <div className="mx-auto max-w-4xl">
        <Link href="/ecosistema" className={slug === 'local' ? "text-teal-700 underline" : "text-teal-300 underline"}>← Ecosistema RiverSpend</Link>

        <section className={slug === 'local' ? "mt-6 rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm sm:p-10" : "mt-6 rounded-3xl border border-teal-800 bg-gradient-to-br from-slate-900 to-sky-950 p-6 sm:p-10"}>
          <div className="text-5xl">{servizio.icona}</div>
          <p className={slug === 'local' ? "mt-5 text-sm font-semibold uppercase tracking-widest text-teal-700" : "mt-5 text-sm font-semibold uppercase tracking-widest text-teal-300"}>RiverSpend</p>
          <h1 className="mt-2 text-4xl font-bold">{servizio.titolo}</h1>
          <p className={slug === 'local' ? "mt-5 max-w-2xl text-lg leading-8 text-slate-700" : "mt-5 max-w-2xl text-lg leading-8 text-slate-300"}>{servizio.descrizione}</p>

          {slug === 'box' && (
            <div className="mt-8 grid gap-4">
              <section className={slug === 'local' ? "rounded-2xl border border-slate-200 bg-white p-5" : "rounded-2xl border border-teal-800/80 bg-slate-950/50 p-5"}>
                <h2 className={slug === 'local' ? "text-xl font-bold text-teal-800" : "text-xl font-bold text-teal-200"}>Spedisci tra privati, con RiverSpend</h2>
                <p className={slug === 'local' ? "mt-3 leading-7 text-slate-700" : "mt-3 leading-7 text-slate-300"}>
                  RiverSpend Box è pensato per collegare chi vende su RiverSpendShop con chi acquista,
                  utilizzando operatori di spedizione e punti di ritiro già presenti sul territorio.
                  L’obiettivo è rendere semplice preparare, consegnare e seguire un pacco.
                </p>
              </section>
              <section className={slug === 'local' ? "rounded-2xl border border-slate-200 bg-white p-5" : "rounded-2xl border border-teal-800/80 bg-slate-950/50 p-5"}>
                <h2 className={slug === 'local' ? "text-xl font-bold text-teal-800" : "text-xl font-bold text-teal-200"}>Come sarà il percorso</h2>
                <ol className="mt-3 grid gap-3 sm:grid-cols-2">
                  <li className="rounded-xl border border-slate-200 bg-slate-50 p-4"><span className="text-2xl">🛍️</span><p className="mt-2 font-semibold text-slate-900">1. Vendita conclusa</p><p className="mt-1 text-sm leading-6 text-slate-700">Il venditore prepara il pacco dopo l’ordine.</p></li>
                  <li className="rounded-xl border border-slate-200 bg-slate-50 p-4"><span className="text-2xl">📲</span><p className="mt-2 font-semibold text-slate-900">2. Etichetta o QR</p><p className="mt-1 text-sm leading-6 text-slate-700">Il corriere collegato fornisce l’etichetta o il codice QR valido per la spedizione.</p></li>
                  <li className="rounded-xl border border-slate-200 bg-slate-50 p-4"><span className="text-2xl">📮</span><p className="mt-2 font-semibold text-slate-900">3. Consegna del pacco</p><p className="mt-1 text-sm leading-6 text-slate-700">Il venditore lo porta al punto previsto o usa il ritiro, se disponibile.</p></li>
                  <li className="rounded-xl border border-slate-200 bg-slate-50 p-4"><span className="text-2xl">📍</span><p className="mt-2 font-semibold text-slate-900">4. Tracking e ricezione</p><p className="mt-1 text-sm leading-6 text-slate-700">L’acquirente segue la spedizione e, dove previsto, ritira presso un punto abilitato.</p></li>
                </ol>
              </section>
              <section className={slug === 'local' ? "rounded-2xl border border-slate-200 bg-white p-5" : "rounded-2xl border border-teal-800/80 bg-slate-950/50 p-5"}>
                <h2 className={slug === 'local' ? "text-xl font-bold text-teal-800" : "text-xl font-bold text-teal-200"}>Partiamo con operatori già esistenti</h2>
                <p className={slug === 'local' ? "mt-3 leading-7 text-slate-700" : "mt-3 leading-7 text-slate-300"}>
                  Nella prima fase RiverSpend non avrà una flotta propria: valuteremo l’integrazione
                  con corrieri, uffici postali, negozi e locker che consentono spedizione o ritiro.
                  In futuro potremo aggiungere servizi di consegna RS Local separati dalla spedizione
                  nazionale tra privati.
                </p>
              </section>
              <p className="text-sm leading-6 text-slate-400">Nota: RiverSpend Box è in progettazione. Al momento non genera etichette o QR di spedizione e non prenota ritiri: queste funzioni richiedono accordi e integrazioni con gli operatori.</p>
            </div>
          )}

          {slug === 'local' && <RSLocalFinder />}

          <div className={slug === 'local' ? "mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-4" : "mt-7 rounded-2xl border border-slate-700 bg-slate-950/60 p-4"}>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Stato</p>
            <p className={slug === 'local' ? "mt-1 font-semibold text-teal-800" : "mt-1 font-semibold text-teal-200"}>{servizio.stato}</p>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/" className="rs-button rs-button-primary rounded-xl px-5 py-3 font-bold">Vai al RiverSpendShop</Link>
            <Link href="/rete" className={slug === 'local' ? "rounded-xl border border-teal-700 px-5 py-3 font-semibold text-teal-800" : "rounded-xl border border-teal-800 px-5 py-3 font-semibold text-teal-200"}>🕸️ La mia rete</Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export function getStaticPaths() {
  return {
    paths: Object.keys(servizi)
      .filter((slug) => slug !== 'broadcast')
      .map((slug) => ({ params: { slug } })),
    fallback: false
  };
}

export function getStaticProps({ params }) {
  return { props: { slug: params.slug } };
}
