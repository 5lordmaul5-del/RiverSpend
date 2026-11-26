import { useEffect, useState } from 'react';

const topics = [
  ['all', 'Tutte le notizie'], ['world', 'Mondo'], ['politics', 'Politica'],
  ['economy', 'Economia'], ['technology', 'Tecnologia e scienza'],
  ['sport', 'Sport'], ['environment', 'Ambiente'], ['health', 'Salute'],
];
const countries = [
  ['', 'Tutti i Paesi'], ['it', 'Italia'], ['no', 'Norvegia'], ['gb', 'Regno Unito'],
  ['us', 'Stati Uniti'], ['fr', 'Francia'], ['de', 'Germania'], ['es', 'Spagna'],
  ['se', 'Svezia'], ['fi', 'Finlandia'], ['nl', 'Paesi Bassi'], ['jp', 'Giappone'],
  ['cn', 'Cina'], ['in', 'India'], ['au', 'Australia'], ['ca', 'Canada'],
  ['br', 'Brasile'], ['za', 'Sudafrica'], ['ua', 'Ucraina'],
];
const sources = [
  ['', 'Tutte le testate'], ['bbc', 'BBC News'], ['rai', 'Rai News'], ['mediaset', 'Mediaset / TGCOM24'],
  ['nrk', 'NRK Norvegia'], ['france24', 'France 24'], ['dw', 'Deutsche Welle'],
  ['reuters', 'Reuters'], ['ap', 'Associated Press'], ['aljazeera', 'Al Jazeera'],
  ['nhk', 'NHK Giappone'], ['cbc', 'CBC Canada'], ['cnn', 'CNN'], ['guardian', 'The Guardian'],
];

export default function RiverWorldNews() {
  const [topic, setTopic] = useState('all');
  const [country, setCountry] = useState('');
  const [source, setSource] = useState('');
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ topic, country, source });
        if (search.trim()) params.set('q', search.trim());
        const response = await fetch('/api/riverworld/news?' + params.toString(), { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Notizie temporaneamente non disponibili.');
        setArticles(Array.isArray(data.articles) ? data.articles : []);
        setUpdatedAt(data.updatedAt || '');
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || 'Errore nel caricamento delle notizie.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [topic, country, source, search, refreshKey]);

  const formatDate = value => {
    if (!value) return 'Orario non disponibile';
    const normalized = value.replace(/^(\d{4})(\d{2})(\d{2})T/, '$1-$2-$3T');
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <section className="mt-5 rounded-2xl bg-white p-4 shadow-sm md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><div className="text-xs font-bold uppercase tracking-wider text-teal-700">RiverWorld · Global News</div><h2 className="mt-1 text-2xl font-black text-[#073b4c]">Notizie dal mondo</h2><p className="mt-1 text-sm text-slate-500">Articoli individuati da fonti internazionali monitorate, con accesso alla pubblicazione originale.</p></div>
        <button onClick={() => setRefreshKey(value => value + 1)} disabled={loading} className="rounded-xl bg-[#073b4c] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">↻ Aggiorna</button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs font-semibold text-slate-600">Argomento<select value={topic} onChange={e => setTopic(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">{topics.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="text-xs font-semibold text-slate-600">Paese della testata<select value={country} onChange={e => setCountry(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">{countries.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="text-xs font-semibold text-slate-600">Testata<select value={source} onChange={e => setSource(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">{sources.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="text-xs font-semibold text-slate-600">Cerca nel mondo<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Es. elezioni, clima, energia…" className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm" /></label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 text-xs text-slate-500">
        <span>{loading ? 'Ricerca delle notizie in corso…' : articles.length + ' articoli trovati nelle ultime 24 ore'}</span>
        {updatedAt && <span>Aggiornamento ricerca: {formatDate(updatedAt)}</span>}
      </div>

      {error && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</div>}
      {loading && <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="h-28 animate-pulse rounded-xl bg-slate-100" /><div className="h-28 animate-pulse rounded-xl bg-slate-100" /></div>}
      {!loading && !error && articles.length === 0 && <p className="mt-5 rounded-xl bg-slate-50 p-5 text-sm text-slate-600">Nessun articolo trovato con questi filtri. Prova un altro argomento, Paese o testata.</p>}

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {articles.map((article, index) => (
          <article key={article.url || index} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            {article.image && <a href={article.url} target="_blank" rel="noreferrer"><img src={article.image} alt="" loading="lazy" className="h-40 w-full object-cover" /></a>}
            <div className="p-4">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-teal-800"><span>{article.domain}</span>{article.sourceCountry && <><span>·</span><span>{article.sourceCountry}</span></>}<span>·</span><span>{formatDate(article.publishedAt)}</span></div>
              <h3 className="mt-2 text-base font-bold leading-snug text-slate-900">{article.title}</h3>
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-sm font-bold text-teal-800 underline decoration-teal-300 underline-offset-4">Leggi sulla testata originale ↗</a>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-5 border-t border-slate-100 pt-3 text-[11px] leading-5 text-slate-500">Ricerca fornita da The GDELT Project. RiverWorld Live mostra metadati, titoli e collegamenti alle fonti: il contenuto completo resta sul sito dell'editore. La copertura dipende dalle fonti monitorate e dalla disponibilità del servizio.</p>
    </section>
  );
}
