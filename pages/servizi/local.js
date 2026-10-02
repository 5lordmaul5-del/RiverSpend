import { useMemo, useState } from 'react';
import Link from 'next/link';

const distances = [200, 500, 1000, 3000, 5000, 10000, 0];

export default function RSLocal() {
  const [radius, setRadius] = useState(3000);
  const [place, setPlace] = useState('');
  const [position, setPosition] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const mapUrl = useMemo(() => {
    if (!position) return '';
    const delta = Math.max(0.003, radius === 0 ? 0.08 : radius / 100000);
    const { lat, lon } = position;
    const bbox = [lon - delta, lat - delta, lon + delta, lat + delta].join('%2C');
    return 'https://www.openstreetmap.org/export/embed.html?bbox=' + bbox + '&layer=mapnik&marker=' + lat + '%2C' + lon;
  }, [position, radius]);

  function locateMe() {
    if (!navigator.geolocation) {
      setStatus('La posizione non è supportata da questo dispositivo. Puoi cercare una zona manualmente.');
      return;
    }
    setLoading(true);
    setStatus('In attesa del consenso alla posizione…');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPosition({ lat: coords.latitude, lon: coords.longitude });
        setStatus('Posizione acquisita sul dispositivo. Non mostriamo il tuo indirizzo preciso.');
        setLoading(false);
      },
      () => {
        setStatus('Posizione non disponibile o consenso non concesso. Puoi continuare senza attivarla.');
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }

  function searchPlace(e) {
    e.preventDefault();
    const q = place.trim();
    if (!q) return;
    window.open('https://www.openstreetmap.org/search?query=' + encodeURIComponent(q), '_blank', 'noopener,noreferrer');
    setStatus('La ricerca della zona si apre su OpenStreetMap. Il catalogo delle attività locali sarà collegato quando avremo i dati reali.');
  }

  const radiusLabel = radius === 0 ? 'Senza limite' : radius >= 1000 ? (radius / 1000) + ' km' : radius + ' m';

  return (
    <main className="min-h-screen bg-sky-50 px-4 py-6 text-slate-800 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/ecosistema" className="text-sm font-semibold text-sky-800 underline">← Ecosistema RiverSpend</Link>
        <header className="mt-5 rounded-3xl border border-sky-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="text-4xl">📍</div>
          <p className="mt-4 text-xs font-bold uppercase tracking-[.2em] text-sky-700">RiverSpend • Territorio</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">RS Local</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Scopri negozi, ristoranti, bar e servizi vicino alla zona che ti interessa. La posizione è facoltativa: puoi scegliere tu se condividerla oppure cercare manualmente.</p>
        </header>

        <section className="mt-5 rounded-3xl border border-sky-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-bold text-slate-900">Da dove vuoi partire?</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={locateMe} disabled={loading} className="rounded-2xl bg-sky-700 px-5 py-4 text-left font-semibold text-white hover:bg-sky-800 disabled:opacity-60">
              <span className="block text-lg">◎ Usa la mia posizione</span>
              <span className="mt-1 block text-sm font-normal text-sky-100">Solo dopo il tuo consenso</span>
            </button>
            <form onSubmit={searchPlace} className="flex gap-2">
              <label className="sr-only" htmlFor="rs-local-place">Città o zona</label>
              <input id="rs-local-place" value={place} onChange={e => setPlace(e.target.value)} placeholder="Città, quartiere o CAP" className="min-w-0 flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100" />
              <button className="rounded-2xl bg-slate-900 px-4 font-semibold text-white hover:bg-slate-700" type="submit">Cerca</button>
            </form>
          </div>
          {status && <p role="status" className="mt-3 text-sm leading-6 text-slate-600">{status}</p>}
        </section>

        <section className="mt-5 rounded-3xl border border-sky-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-bold text-slate-900">Quanto vicino?</h2>
          <p className="mt-1 text-sm text-slate-600">Seleziona il raggio di ricerca.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {distances.map(d => (
              <button key={d} type="button" onClick={() => setRadius(d)} aria-pressed={radius === d} className={'rounded-full border px-4 py-2 text-sm font-semibold transition ' + (radius === d ? 'border-sky-700 bg-sky-700 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-sky-500')}>
                {d === 0 ? 'Senza limite' : d >= 1000 ? (d / 1000) + ' km' : d + ' m'}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-slate-500">Raggio selezionato: <strong className="text-slate-800">{radiusLabel}</strong></p>
        </section>

        <section className="mt-5 overflow-hidden rounded-3xl border border-sky-200 bg-white shadow-sm">
          <div className="p-5 sm:p-7">
            <h2 className="text-xl font-bold text-slate-900">Mappa della zona</h2>
            <p className="mt-1 text-sm text-slate-600">Mappa OpenStreetMap. La posizione viene mostrata solo se scegli di condividerla.</p>
          </div>
          {mapUrl ? (
            <iframe title="Mappa RS Local" src={mapUrl} className="h-80 w-full border-0" loading="lazy" />
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center bg-sky-100 px-6 py-10 text-center">
              <span className="text-5xl">🗺️</span>
              <p className="mt-4 max-w-md font-semibold text-slate-800">Scegli una zona o consenti la posizione per centrare la mappa.</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">Non attiviamo il GPS automaticamente.</p>
            </div>
          )}
          {position && <div className="p-4 text-right"><a className="text-sm font-semibold text-sky-800 underline" href={'https://www.openstreetmap.org/?mlat=' + position.lat + '&mlon=' + position.lon + '#map=15/' + position.lat + '/' + position.lon} target="_blank" rel="noreferrer">Apri la mappa completa ↗</a></div>}
        </section>

        <section className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-7">
          <h2 className="text-lg font-bold text-slate-900">Attività e recensioni</h2>
          <p className="mt-2 leading-7 text-slate-700">Qui appariranno le attività aderenti a RiverSpend, con schede, orari, proposte e recensioni. Le recensioni verificate saranno distinte da quelle non verificate. In questa prima base non mostriamo negozi o recensioni inventati: il catalogo reale richiede il collegamento ai dati delle attività.</p>
        </section>
        <p className="mt-6 text-center text-xs leading-5 text-slate-500">RS Local è in fase di sviluppo. La mappa è fornita da OpenStreetMap; risultati, schede attività e recensioni saranno attivati con le relative integrazioni.</p>
      </div>
    </main>
  );
}
