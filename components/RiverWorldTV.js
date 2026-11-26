import { useMemo, useState } from 'react';

const channels = [
  { country: 'Italia', language: 'Italiano', name: 'RaiPlay · Dirette', category: 'Pubblica', url: 'https://www.raiplay.it/dirette', note: 'Canali Rai disponibili secondo diritti e area geografica.' },
  { country: 'Germania', language: 'Tedesco', name: 'ARD · Live', category: 'Pubblica', url: 'https://www.ardmediathek.de/live', note: 'Dirette dei canali ARD.' },
  { country: 'Germania', language: 'Tedesco', name: 'ZDF · Live-TV', category: 'Pubblica', url: 'https://www.zdf.de/live-tv', note: 'Canali ZDF e partner disponibili online.' },
  { country: 'Francia', language: 'Francese / Inglese', name: 'France 24 · Live', category: 'Notizie', url: 'https://www.france24.com/en/live', note: 'Notizie internazionali in diretta.' },
  { country: 'Germania', language: 'Inglese / Tedesco', name: 'DW · Live', category: 'Notizie', url: 'https://www.dw.com/en/live-tv/s-100825', note: 'Informazione internazionale.' },
  { country: 'Giappone', language: 'Inglese / Giapponese', name: 'NHK World-Japan', category: 'Notizie / Cultura', url: 'https://www3.nhk.or.jp/nhkworld/en/live/', note: 'Notizie e programmi dal Giappone.' },
  { country: 'Qatar', language: 'Inglese / Arabo', name: 'Al Jazeera · Live', category: 'Notizie', url: 'https://www.aljazeera.com/live', note: 'Canale internazionale; disponibilità secondo area.' },
  { country: 'Europa', language: 'Multilingue', name: 'Euronews · Live', category: 'Notizie', url: 'https://www.euronews.com/live', note: 'Notizie europee e internazionali.' },
  { country: 'Stati Uniti', language: 'Inglese', name: 'NASA+', category: 'Scienza / Spazio', url: 'https://plus.nasa.gov/', note: 'Programmi e dirette NASA gratuiti.' },
  { country: 'Australia', language: 'Inglese', name: 'ABC News Australia · Live', category: 'Notizie', url: 'https://www.abc.net.au/news/newschannel', note: 'Canale di notizie australiano con diretta ufficiale sul sito ABC.' },
  { country: 'Stati Uniti', language: 'Inglese', name: 'CBS News · 24/7', category: 'Notizie', url: 'https://www.cbsnews.com/live/', note: 'Flusso gratuito CBS News 24/7 e canali locali; disponibilità secondo area.' },
  { country: 'Stati Uniti', language: 'Inglese', name: 'PBS NewsHour', category: 'Informazione / Cultura', url: 'https://www.pbs.org/newshour/', note: 'Edizioni trasmesse in diretta sul sito secondo il palinsesto.' },
  { country: 'Cina', language: 'Inglese / Spagnolo / Francese / Arabo / Russo', name: 'CGTN · Canali live', category: 'Notizie / Documentari', url: 'https://www.cgtn.com/tv', note: 'Canali internazionali CGTN, incluso CGTN Documentary; disponibilità secondo area.' },
  { country: 'Regno Unito', language: 'Inglese', name: 'Sky News · Live', category: 'Notizie', url: 'https://news.sky.com/watch-live', note: 'Diretta ufficiale Sky News; eventuali limitazioni geografiche.' },
  { country: 'Internazionale', language: 'Multilingue', name: 'UN Web TV', category: 'Istituzioni / Documentari', url: 'https://webtv.un.org/', note: 'Riunioni, conferenze e contenuti audiovisivi delle Nazioni Unite.' },
  { country: 'Francia', language: 'Francese / Inglese', name: 'ARTE · Direct', category: 'Cultura / Documentari', url: 'https://www.arte.tv/', note: 'Documentari, cultura e programmi; catalogo e dirette secondo diritti territoriali.' },
  { country: 'Spagna', language: 'Spagnolo', name: 'RTVE Play · Directo', category: 'Pubblica / Intrattenimento', url: 'https://www.rtve.es/play/', note: 'Canali e programmi del servizio pubblico spagnolo; alcuni contenuti possono essere geobloccati.' },
  { country: 'Brasile', language: 'Portoghese', name: 'TV Brasil · Ao vivo', category: 'Pubblica / Cultura', url: 'https://tvbrasil.ebc.com.br/webtv/', note: 'Web TV ufficiale EBC; parte della programmazione è disponibile online secondo i diritti.' },
  { country: 'India', language: 'Inglese', name: 'NDTV · Live TV', category: 'Notizie', url: 'https://www.ndtv.com/livetv-ndtv24x7', note: 'Diretta ufficiale NDTV, con disponibilità gratuita dichiarata dall’emittente.' },
  { country: 'Corea del Sud', language: 'Inglese / Coreano', name: 'Arirang TV · Live', category: 'Notizie / Cultura', url: 'https://www.arirang.com/', note: 'Emittente internazionale coreana con canale live sul sito ufficiale.' },
  { country: 'Sudafrica', language: 'Inglese', name: 'eNCA · Live', category: 'Notizie', url: 'https://www.enca.com/streaming', note: 'Servizio ufficiale di notizie 24 ore; disponibilità dello streaming secondo area.' },
];

const filmSources = [
  { name: 'Internet Archive · Feature Films', type: 'Catalogo da verificare titolo per titolo', url: 'https://archive.org/details/feature_films', note: 'La disponibilità gratuita non garantisce da sola il pubblico dominio: controllare i diritti sulla scheda di ogni film.' },
  { name: 'Library of Congress · National Screening Room', type: 'Archivio storico', url: 'https://www.loc.gov/collections/national-screening-room/', note: 'Film storici e materiali audiovisivi con indicazioni sui diritti nella singola scheda.' },
  { name: 'Wikimedia Commons · Films', type: 'Pubblico dominio / licenze libere', url: 'https://commons.wikimedia.org/wiki/Category:Films', note: 'Verificare la licenza specifica, l’autore e gli obblighi di attribuzione.' },
  { name: 'National Film Board of Canada', type: 'Selezione gratuita ufficiale', url: 'https://www.nfb.ca/', note: 'Film e documentari disponibili gratuitamente secondo le condizioni del catalogo.' },
];

export default function RiverWorldTV() {
  const [tab, setTab] = useState('tv');
  const [country, setCountry] = useState('Tutti');
  const [term, setTerm] = useState('');
  const countries = useMemo(() => ['Tutti', ...new Set(channels.map(item => item.country))], []);
  const visibleChannels = channels.filter(item => (country === 'Tutti' || item.country === country) && (item.name + ' ' + item.country + ' ' + item.language + ' ' + item.category).toLowerCase().includes(term.toLowerCase()));
  const visibleFilms = filmSources.filter(item => (item.name + ' ' + item.type + ' ' + item.note).toLowerCase().includes(term.toLowerCase()));

  return <section className="mt-5 rounded-2xl bg-white p-4 shadow-sm md:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><div className="text-xs font-bold uppercase tracking-wider text-teal-700">RiverSpend · World Television</div><h2 className="mt-1 text-2xl font-black text-[#073b4c]">📺 RiverWorld TV</h2><p className="mt-1 text-sm text-slate-600">Canali ufficiali e cinema gratuito con diritti verificabili.</p></div>
      <div className="flex rounded-xl bg-slate-100 p-1"><button onClick={() => setTab('tv')} className={`rounded-lg px-4 py-2 text-sm font-bold ${tab === 'tv' ? 'bg-white text-teal-800 shadow' : 'text-slate-600'}`}>TV mondiale</button><button onClick={() => setTab('films')} className={`rounded-lg px-4 py-2 text-sm font-bold ${tab === 'films' ? 'bg-white text-teal-800 shadow' : 'text-slate-600'}`}>Film gratuiti</button></div>
    </div>
    <input value={term} onChange={e => setTerm(e.target.value)} placeholder="Cerca canale, Paese, lingua o archivio…" className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-600" />
    {tab === 'tv' ? <>
      <div className="mt-3 flex flex-wrap gap-2">{countries.map(item => <button key={item} onClick={() => setCountry(item)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${country === item ? 'border-teal-700 bg-teal-50 text-teal-900' : 'border-slate-200 text-slate-600'}`}>{item}</button>)}</div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{visibleChannels.map(item => <article key={item.name} className="rounded-xl border border-slate-200 p-4"><div className="text-xs font-bold uppercase tracking-wide text-teal-700">{item.country} · {item.language}</div><h3 className="mt-1 font-extrabold text-slate-900">{item.name}</h3><div className="mt-1 text-xs text-slate-500">{item.category}</div><p className="mt-2 text-sm text-slate-600">{item.note}</p><a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex rounded-lg bg-[#073b4c] px-3 py-2 text-sm font-bold text-white">Apri diretta ufficiale ↗</a></article>)}</div>
      {visibleChannels.length === 0 && <p className="mt-4 text-sm text-slate-500">Nessun canale trovato con questi filtri.</p>}
    </> : <>
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">Catalogo di fonti gratuite: ogni film dovrà mostrare la propria licenza o dichiarazione dei diritti. Non consideriamo automaticamente libero un titolo solo perché si può guardare gratis.</div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{visibleFilms.map(item => <article key={item.name} className="rounded-xl border border-slate-200 p-4"><div className="text-xs font-bold uppercase tracking-wide text-teal-700">{item.type}</div><h3 className="mt-1 font-extrabold text-slate-900">{item.name}</h3><p className="mt-2 text-sm text-slate-600">{item.note}</p><a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex rounded-lg bg-[#073b4c] px-3 py-2 text-sm font-bold text-white">Esplora archivio ↗</a></article>)}</div>
    </>}
    <p className="mt-5 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">RiverWorld TV collega le pagine ufficiali dei broadcaster e degli archivi. Geoblocchi, registrazione, pubblicità e disponibilità dei singoli programmi dipendono dall’ente titolare. I contenuti restano di proprietà dei rispettivi titolari.</p>
  </section>;
}
