import { useMemo, useState } from 'react';
import Link from 'next/link';

const distances = [200, 500, 1000, 3000, 5000, 10000, 0];
const overpass = 'https://overpass-api.de/api/interpreter';

export default function RSLocal() {
  const [radius, setRadius] = useState(3000);
  const [place, setPlace] = useState('');
  const [position, setPosition] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState([]);
  const [view, setView] = useState('list');
  const [searched, setSearched] = useState(false);
  const [filter, setFilter] = useState('');

  const mapUrl = useMemo(() => {
    if (!position) return '';
    const delta = Math.max(0.002, (radius || 10000) / 100000);
    const { lat, lon } = position;
    const bbox = [lon - delta, lat - delta, lon + delta, lat + delta].join('%2C');
    return 'https://www.openstreetmap.org/export/embed.html?bbox=' + bbox + '&layer=mapnik&marker=' + lat + '%2C' + lon;
  }, [position, radius]);

  async function loadNearby(point, selectedRadius = radius) {
    setLoading(true);
    setStatus('Cerco le attività presenti nei dati OpenStreetMap…');
    setPosition(point);
    setSearched(true);
    const meters = selectedRadius === 0 ? 10000 : selectedRadius;
    const query = '[out:json][timeout:20];(node(around:' + meters + ',' + point.lat + ',' + point.lon + ')[name];way(around:' + meters + ',' + point.lat + ',' + point.lon + ')[name];relation(around:' + meters + ',' + point.lat + ',' + point.lon + ')[name];);out center tags;';
    try {
      const response = await fetch(overpass, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }, body: 'data=' + encodeURIComponent(query) });
      if (!response.ok) throw new Error('Servizio momentaneamente non disponibile');
      const data = await response.json();
      const rows = (data.elements || []).map(item => {
        const lat = item.lat ?? item.center?.lat;
        const lon = item.lon ?? item.center?.lon;
        const tags = item.tags || {};
        if (!Number.isFinite(lat) || !Number.isFinite(lon) || !tags.name) return null;
        return { id: item.type + '/' + item.id, name: tags.name, category: tags.amenity || tags.shop || tags.tourism || tags.leisure || tags.office || 'Attività', lat, lon, address: [tags['addr:street'], tags['addr:housenumber'], tags['addr:city']].filter(Boolean).join(', '), url: 'https://www.openstreetmap.org/' + item.type + '/' + item.id };
      }).filter(Boolean);
      const unique = Array.from(new Map(rows.map(item => [item.id, item])).values());
      setPlaces(unique);
      setStatus(unique.length ? 'Trovate ' + unique.length + ' attività nei dati OpenStreetMap.' : 'Nessuna attività nominata trovata in quest’area. Prova un raggio più ampio.');
    } catch (error) {
      setPlaces([]);
      setStatus('Non riesco a caricare i risultati in questo momento. Riprova tra poco o cambia zona.');
    } finally {
      setLoading(false);
    }
  }

  function locateMe() {
    if (!navigator.geolocation) {
      setStatus('La posizione non è supportata. Puoi cercare una zona manualmente.');
      return;
    }
    setLoading(true);
    setStatus('In attesa del consenso alla posizione…');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => loadNearby({ lat: coords.latitude, lon: coords.longitude }),
      () => { setLoading(false); setStatus('Posizione non disponibile o consenso non concesso. Puoi continuare con la ricerca manuale.'); },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }

  async function searchPlace(e) {
    e.preventDefault();
    const q = place.trim();
    if (!q) return;
    setLoading(true);
    setStatus('Cerco la zona…');
    try {
      const response = await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=' + encodeURIComponent(q), { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Ricerca non disponibile');
      const results = await response.json();
      if (!results.length) { setStatus('Zona non trovata. Prova con città e provincia.'); setLoading(false); return; }
      await loadNearby({ lat: Number(results[0].lat), lon: Number(results[0].lon) });
    } catch (error) {
      setLoading(false);
      setStatus('Ricerca non disponibile in questo momento. Riprova tra poco.');
    }
  }

  function changeRadius(value) {
    setRadius(value);
    if (position) loadNearby(position, value);
  }

  const radiusLabel = radius === 0 ? 'Senza limite*' : radius >= 1000 ? (radius / 1000) + ' km' : radius + ' m';
  const visiblePlaces = places.filter(item => (item.name + ' ' + item.category + ' ' + item.address).toLocaleLowerCase('it').includes(filter.trim().toLocaleLowerCase('it')));
  const categoryLabel = value => ({ restaurant: 'Ristorante', cafe: 'Bar e caffè', fast_food: 'Ristorazione veloce', pub: 'Pub', supermarket: 'Supermercato', convenience: 'Alimentari', clothes: 'Abbigliamento', shoes: 'Calzature', hairdresser: 'Parrucchiere', beauty: 'Estetica', pharmacy: 'Farmacia', bank: 'Banca', dentist: 'Dentista', doctors: 'Medico', school: 'Scuola', hotel: 'Hotel', bakery: 'Panetteria', books: 'Libreria' }[value] || value.replace(/_/g, ' '));

  return (
    <main className="min-h-screen bg-sky-50 px-4 py-6 text-slate-800 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/ecosistema" className="text-sm font-semibold text-sky-800 underline">← Ecosistema RiverSpend</Link>
        <header className="mt-5 rounded-3xl border border-sky-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="text-4xl">📍</div>
          <p className="mt-4 text-xs font-bold uppercase tracking-[.2em] text-sky-700">RiverSpend • Territorio</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">RS Local</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Scopri attività e servizi nella zona che ti interessa. La posizione è facoltativa: puoi scegliere se condividerla oppure cercare manualmente.</p>
        </header>

        <section className="mt-5 rounded-3xl border border-sky-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-bold text-slate-900">Da dove vuoi partire?</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={locateMe} disabled={loading} className="rounded-2xl bg-sky-700 px-5 py-4 text-left font-semibold text-white hover:bg-sky-800 disabled:opacity-60">
              <span className="block text-lg">◎ Usa la mia posizione</span><span className="mt-1 block text-sm font-normal text-sky-100">Solo dopo il tuo consenso</span>
            </button>
            <form onSubmit={searchPlace} className="flex gap-2">
              <label className="sr-only" htmlFor="rs-local-place">Città o zona</label>
              <input id="rs-local-place" value={place} onChange={e => setPlace(e.target.value)} placeholder="Città, quartiere o CAP" className="min-w-0 flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100" />
              <button disabled={loading} className="rounded-2xl bg-slate-900 px-4 font-semibold text-white disabled:opacity-60" type="submit">Cerca</button>
            </form>
          </div>
          {status && <p role="status" aria-live="polite" className="mt-3 text-sm leading-6 text-slate-600">{status}</p>}
        </section>

        <section className="mt-5 rounded-3xl border border-sky-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-bold text-slate-900">Quanto vicino?</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {distances.map(d => <button key={d} type="button" onClick={() => changeRadius(d)} aria-pressed={radius === d} className={'rounded-full border px-4 py-2 text-sm font-semibold ' + (radius === d ? 'border-sky-700 bg-sky-700 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-sky-500')}>{d === 0 ? 'Senza limite' : d >= 1000 ? (d / 1000) + ' km' : d + ' m'}</button>)}
          </div>
          <p className="mt-3 text-sm text-slate-600">Raggio selezionato: <strong className="text-slate-900">{radiusLabel}</strong></p>
          {radius === 0 && <p className="mt-1 text-xs text-slate-500">*Per non sovraccaricare il servizio, la ricerca “Senza limite” mostra fino a 10 km dalla zona scelta.</p>}
        </section>

        <section className="mt-5 overflow-hidden rounded-3xl border border-sky-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-7">
            <div><h2 className="text-xl font-bold text-slate-900">Esplora la zona</h2><p className="mt-1 text-sm text-slate-600">Locali, negozi e servizi nella zona scelta. Dati OpenStreetMap: non indicano ancora attività aderenti RiverSpend.</p></div>
            <div className="flex rounded-xl border border-slate-300 p-1" aria-label="Modalità di visualizzazione">
              <button type="button" onClick={() => setView('list')} aria-pressed={view === 'list'} className={'rounded-lg px-3 py-2 text-sm font-semibold ' + (view === 'list' ? 'bg-slate-900 text-white' : 'text-slate-700')}>Elenco</button>
              <button type="button" onClick={() => setView('map')} aria-pressed={view === 'map'} className={'rounded-lg px-3 py-2 text-sm font-semibold ' + (view === 'map' ? 'bg-slate-900 text-white' : 'text-slate-700')}>Mappa</button>
            </div>
          </div>
          {view === 'map' ? (mapUrl ? <iframe title="Mappa RS Local" src={mapUrl} className="h-96 w-full border-0" loading="lazy" /> : <div className="bg-sky-100 p-10 text-center text-slate-700">Cerca una zona o consenti la posizione per visualizzare la mappa.</div>) : (
            <div className="border-t border-slate-100">
              {!searched ? <p className="p-6 text-sm text-slate-600">Scegli una zona per vedere locali, negozi e servizi vicini.</p> : loading ? <p className="p-6 text-sm text-slate-600">Caricamento risultati…</p> : places.length ? <><div className="border-t border-slate-100 p-4 sm:px-6"><label htmlFor="rs-local-filter" className="mb-2 block text-sm font-semibold text-slate-700">Cerca tra i locali trovati</label><input id="rs-local-filter" value={filter} onChange={e => setFilter(e.target.value)} placeholder="Nome, categoria o indirizzo" className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100" /><p className="mt-2 text-xs text-slate-500">Visualizzati {visiblePlaces.length} di {places.length} risultati</p></div>{visiblePlaces.length ? <ul className="divide-y divide-slate-100">{visiblePlaces.map(item => <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-6"><div><h3 className="font-semibold text-slate-900">{item.name}</h3><p className="mt-1 text-sm capitalize text-slate-600">{categoryLabel(item.category)}{item.address ? ' · ' + item.address : ''}</p></div><a className="text-sm font-semibold text-sky-800 underline" href={item.url} target="_blank" rel="noreferrer">Dettagli OSM ↗</a></li>)}</ul> : <p className="p-6 text-sm text-slate-600">Nessun locale corrisponde alla ricerca. Prova un altro nome o categoria.</p>}</> : <p className="p-6 text-sm text-slate-600">Nessun risultato disponibile per questa ricerca.</p>}
            </div>
          )}
        </section>
        <section className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-7">
          <h2 className="text-lg font-bold text-slate-900">Un’informazione importante</h2>
          <p className="mt-2 leading-7 text-slate-700">I risultati provengono da OpenStreetMap e possono essere incompleti o non aggiornati. Non sono recensioni né attività verificate da RiverSpend. Le schede degli esercenti, le recensioni verificate e il collegamento con RS Maps saranno sviluppati in una fase successiva.</p>
        </section>
        <p className="mt-6 text-center text-xs leading-5 text-slate-500">RS Local è in fase di test. La ricerca usa servizi OpenStreetMap; la disponibilità dipende dai loro server e dai dati presenti.</p>
      </div>
    </main>
  );
}
