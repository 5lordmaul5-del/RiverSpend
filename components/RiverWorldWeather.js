import { useEffect, useState } from 'react';

const weatherLabel = code => {
  if (!code) return 'Condizioni non disponibili';
  if (code.includes('thunder')) return 'Temporale';
  if (code.includes('snow')) return 'Neve';
  if (code.includes('sleet')) return 'Nevischio';
  if (code.includes('rain')) return 'Pioggia';
  if (code.includes('fog')) return 'Nebbia';
  if (code.includes('cloudy')) return 'Nuvoloso';
  if (code.includes('partlycloudy')) return 'Parzialmente nuvoloso';
  if (code.includes('clearsky')) return 'Cielo sereno';
  return 'Variabile';
};
const weatherIcon = code => {
  if (!code) return '🌡️';
  if (code.includes('thunder')) return '⛈️';
  if (code.includes('snow')) return '❄️';
  if (code.includes('rain') || code.includes('sleet')) return '🌧️';
  if (code.includes('fog')) return '🌫️';
  if (code.includes('cloudy')) return '☁️';
  if (code.includes('partlycloudy')) return '⛅';
  if (code.includes('clearsky')) return '☀️';
  return '🌤️';
};
const dateTime = value => value ? new Date(value).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' }) : '—';

export default function RiverWorldWeather() {
  const [place, setPlace] = useState('Roma');
  const [query, setQuery] = useState('Roma');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadWeather(value) {
    const name = (value || '').trim();
    if (!name) return;
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/riverworld/weather?place=' + encodeURIComponent(name));
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Meteo non disponibile.');
      setWeather(data); setPlace(name);
    } catch (err) { setError(err.message || 'Errore meteo.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadWeather('Roma'); }, []);

  return (
    <section className="mt-5 rounded-2xl bg-white p-4 shadow-sm md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><div className="text-xs font-bold uppercase tracking-wider text-teal-700">RiverWorld · Weather</div><h2 className="mt-1 text-2xl font-black text-[#073b4c]">Meteo mondiale</h2><p className="mt-1 text-sm text-slate-500">Previsioni globali per località, con dati meteorologici aggiornati.</p></div>
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">Copertura mondiale</span>
      </div>
      <form onSubmit={event => { event.preventDefault(); loadWeather(query); }} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Cerca città e Paese" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
        <button disabled={loading} className="rounded-xl bg-[#073b4c] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{loading ? 'Caricamento…' : 'Cerca località'}</button>
      </form>
      {error && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
      {weather && <div className="mt-5">
        <div className="rounded-2xl bg-gradient-to-br from-[#073b4c] to-[#087e8b] p-5 text-white">
          <div className="text-sm text-teal-100">{weather.location.displayName}</div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <div><div className="text-6xl font-black">{weather.current.temperature == null ? '—' : Math.round(weather.current.temperature) + '°'}</div><div className="mt-1 text-sm">{weatherLabel(weather.current.symbol)}</div></div>
            <div className="text-6xl">{weatherIcon(weather.current.symbol)}</div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div className="rounded-xl bg-white/10 p-3"><div className="text-xs text-teal-100">Umidità</div><strong>{weather.current.humidity == null ? '—' : Math.round(weather.current.humidity) + '%'}</strong></div>
            <div className="rounded-xl bg-white/10 p-3"><div className="text-xs text-teal-100">Vento</div><strong>{weather.current.wind == null ? '—' : Math.round(weather.current.wind) + ' m/s'}</strong></div>
            <div className="rounded-xl bg-white/10 p-3"><div className="text-xs text-teal-100">Pressione</div><strong>{weather.current.pressure == null ? '—' : Math.round(weather.current.pressure) + ' hPa'}</strong></div>
            <div className="rounded-xl bg-white/10 p-3"><div className="text-xs text-teal-100">Nuvolosità</div><strong>{weather.current.cloud == null ? '—' : Math.round(weather.current.cloud) + '%'}</strong></div>
          </div>
        </div>
        <h3 className="mt-5 font-bold text-[#073b4c]">Prossime ore</h3>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
          {weather.hourly.filter((_, index) => index % 3 === 0).slice(0, 9).map(item => <div key={item.time} className="min-w-[88px] rounded-xl border border-slate-200 bg-slate-50 p-3 text-center"><div className="text-xs text-slate-500">{new Date(item.time).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</div><div className="my-2 text-2xl">{weatherIcon(item.symbol)}</div><div className="font-bold">{item.temperature == null ? '—' : Math.round(item.temperature) + '°'}</div><div className="mt-1 text-[10px] text-slate-500">{weatherLabel(item.symbol)}</div></div>)}
        </div>
        <p className="mt-3 text-[11px] leading-5 text-slate-500">{weather.attribution} <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer" className="underline">CC BY 4.0</a>. {weather.source}. Ultima richiesta: {dateTime(weather.updatedAt)}.</p>
      </div>}
      <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">Le previsioni sono indicative e non sostituiscono gli avvisi ufficiali di protezione civile. La copertura e la frequenza di aggiornamento variano per area geografica.</p>
    </section>
  );
}
