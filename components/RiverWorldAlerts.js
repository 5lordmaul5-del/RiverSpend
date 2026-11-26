import { useEffect, useState } from 'react';

export default function RiverWorldAlerts() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/riverworld/alerts', { signal: controller.signal })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Feed non disponibile.');
        setEvents(data.events || []); setUpdatedAt(data.updatedAt || '');
      })
      .catch(err => { if (err.name !== 'AbortError') setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  return <section className="mt-5 rounded-2xl bg-white p-4 shadow-sm md:p-6">
    <div className="text-xs font-bold uppercase tracking-wider text-amber-700">RiverWorld · Safety Monitor</div>
    <h2 className="mt-1 text-2xl font-black text-[#073b4c]">Allerte e attività sismica</h2>
    <p className="mt-1 text-sm text-slate-500">Eventi sismici significativi registrati nel feed globale USGS nelle ultime 24 ore.</p>
    {loading && <p className="mt-4 text-sm text-slate-500">Caricamento degli eventi…</p>}
    {error && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
    {!loading && !error && events.length === 0 && <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Nessun evento significativo presente nel feed al momento.</p>}
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {events.map(event => <article key={event.id} className="rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between gap-2"><span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-900">Magnitudo {event.magnitude ?? 'n/d'}</span><span className="text-xs text-slate-500">{event.time ? new Date(event.time).toLocaleString('it-IT') : 'Ora n/d'}</span></div>
        <h3 className="mt-3 font-bold text-slate-900">{event.place}</h3>
        {event.coordinates && <p className="mt-1 text-xs text-slate-500">Coordinate: {event.coordinates.latitude.toFixed(2)}, {event.coordinates.longitude.toFixed(2)} · Profondità {event.coordinates.depthKm} km</p>}
        {event.tsunami && <p className="mt-2 text-xs font-bold text-amber-800">Indicatore tsunami presente nel feed USGS: verifica sempre gli avvisi ufficiali locali.</p>}
        {event.url && <a href={event.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-bold text-teal-800 underline">Dettagli USGS ↗</a>}
      </article>)}
    </div>
    <p className="mt-4 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">Fonte: USGS Earthquake Hazards Program. Questo pannello è informativo, non è un sistema di allarme in tempo reale né sostituisce Protezione Civile, autorità locali o servizi di emergenza. {updatedAt ? 'Ultimo aggiornamento: ' + new Date(updatedAt).toLocaleString('it-IT') + '.' : ''}</p>
  </section>;
}
