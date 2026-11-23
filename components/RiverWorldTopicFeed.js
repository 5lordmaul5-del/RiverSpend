import { useEffect, useState } from 'react';

const CONFIG = {
  documentari: { title:'Documentari · Storia e civiltà del mondo', subtitle:'Egitto antico, civiltà asiatiche orientali, archeologia, storia, natura, scienza e spazio.', icon:'🎥', tags:['Antico Egitto','Piramidi e faraoni','Mesopotamia','Grecia e Roma','Cina antica','Giappone e Corea','India','Africa e civiltà africane','Maya e Aztechi','Archeologia','Natura','Spazio e universo'] },
  scuola: { title:'Risorse didattiche e universitarie', subtitle:'Materiali e approfondimenti per il percorso e la materia selezionati.', icon:'🎓', tags:['Storia','Geografia','Matematica','Geometria','Scienze','Biologia','Chimica','Fisica','Italiano','Inglese','Filosofia','Informatica'] },
  cinema: { title:'Cinema e Film', subtitle:'Uscite, festival, registi, attori, premi e industria cinematografica.', icon:'🎬', tags:['Cinema mondiale','Festival','Film in uscita','Premi e box office'] },
  moda: { title:'Moda & Fashion', subtitle:'Sfilate, collezioni, designer, streetwear, beauty e tendenze internazionali.', icon:'👗', tags:['Milano Fashion Week','Paris Fashion Week','London Fashion Week','New York Fashion Week','Designer','Streetwear'] },
  sport: { title:'Tutti gli sport del mondo', subtitle:'Copertura multisport: dalle discipline più seguite agli sport meno raccontati.', icon:'🏆', tags:['Arti marziali','Taekwondo','Tennis','Nuoto e tuffi','Ciclismo MTB','Arrampicata','Baseball','Atletica','Basket','Sport invernali'] },
  'arti-marziali': { title:'Arti marziali · Taekwondo in primo piano', subtitle:'Taekwondo, Judo e Karate in evidenza, insieme alle discipline da combattimento e alle arti tradizionali di tutto il mondo.', icon:'🥋', tags:['Taekwondo','Judo','Karate','Kickboxing','Muay Thai','MMA','Sumo','Lotta','Kung Fu','Aikido','Kendo','Arti samurai'] },
  spettacolo: { title:'Spettacolo & Celebrities', subtitle:'Televisione, artisti, premi, musica, personaggi e intrattenimento.', icon:'✨', tags:['Televisione','Celebrities','Musica','Premi','Show business'] },
};
const COUNTRY_OPTIONS = [['','Tutti i Paesi'],['IT','Italia'],['GB','Regno Unito'],['US','Stati Uniti'],['FR','Francia'],['DE','Germania'],['NO','Norvegia'],['ES','Spagna'],['JP','Giappone'],['KR','Corea del Sud'],['IN','India'],['BR','Brasile']];
const fmt = value => { if(!value) return 'Data non disponibile'; const s=value.replace(/^(\\d{4})(\\d{2})(\\d{2})T/,'$1-$2-$3T'); const d=new Date(s); return Number.isNaN(d.getTime())?value:d.toLocaleString('it-IT',{dateStyle:'short',timeStyle:'short'}); };

export default function RiverWorldTopicFeed({ section='cinema', initialQuery='' }) {
  const config = CONFIG[section] || CONFIG.cinema;
  const [query,setQuery]=useState(initialQuery);
  const [country,setCountry]=useState('');
  const [articles,setArticles]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [updated,setUpdated]=useState('');
  const [refresh,setRefresh]=useState(0);
  useEffect(()=>{
    const controller=new AbortController();
    async function load(){
      setLoading(true);setError('');
      try{
        const params=new URLSearchParams({section});
        if(query.trim()) params.set('q',query.trim());
        if(country) params.set('country',country);
        const response=await fetch('/api/riverworld/topics?'+params.toString(),{signal:controller.signal});
        const data=await response.json();
        if(!response.ok) throw new Error(data.error || 'Contenuti non disponibili.');
        setArticles(data.articles||[]);setUpdated(data.updatedAt||'');
      }catch(err){if(err.name!=='AbortError')setError(err.message||'Errore di caricamento.');}
      finally{if(!controller.signal.aborted)setLoading(false);}
    }
    load();return()=>controller.abort();
  },[section,query,country,refresh]);
  return <section className="mt-5 rounded-2xl bg-white p-4 shadow-sm md:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><div className="text-xs font-bold uppercase tracking-wider text-teal-700">RiverWorld · {section}</div><h2 className="mt-1 text-2xl font-black text-[#073b4c]">{config.icon} {config.title}</h2><p className="mt-1 max-w-2xl text-sm text-slate-500">{config.subtitle}</p></div>
      <button onClick={()=>setRefresh(v=>v+1)} disabled={loading} className="rounded-xl bg-[#073b4c] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">↻ Aggiorna</button>
    </div>
    <div className="mt-4 flex flex-wrap gap-2">{config.tags.map(tag=><button key={tag} onClick={()=>setQuery(tag)} className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-900">{tag}</button>)}</div>
    <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_190px]">
      <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={'Cerca in '+config.title+'…'} className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"/>
      <select value={country} onChange={e=>setCountry(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm">{COUNTRY_OPTIONS.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
    </div>
    <div className="mt-4 flex flex-wrap justify-between gap-2 border-b border-slate-100 pb-3 text-xs text-slate-500"><span>{loading?'Ricerca in corso…':articles.length+' articoli trovati negli ultimi 7 giorni'}</span>{updated&&<span>Ricerca: {fmt(updated)}</span>}</div>
    {error&&<p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
    {!loading&&!error&&articles.length===0&&<p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Nessun risultato. Prova un termine diverso o rimuovi il filtro Paese.</p>}
    <div className="mt-4 grid gap-3 lg:grid-cols-2">
      {articles.map((a,i)=><article key={a.url||i} className="overflow-hidden rounded-xl border border-slate-200">
        {a.image&&<a href={a.url} target="_blank" rel="noreferrer"><img src={a.image} alt="" loading="lazy" className="h-40 w-full object-cover"/></a>}
        <div className="p-4"><div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase text-teal-800"><span>{a.domain}</span>{a.country&&<span>· {a.country}</span>}<span>· {fmt(a.publishedAt)}</span></div><h3 className="mt-2 font-bold leading-snug text-slate-900">{a.title}</h3><a href={a.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-sm font-bold text-teal-800 underline underline-offset-4">Apri la fonte originale ↗</a></div>
      </article>)}
    </div>
    <p className="mt-5 border-t border-slate-100 pt-3 text-[11px] leading-5 text-slate-500">Ricerca tramite The GDELT Project. I risultati sono articoli individuati dall'indice globale, non un elenco esaustivo né una certificazione editoriale. I contenuti restano sui siti degli editori e sono soggetti ai rispettivi diritti.</p>
  </section>;
}
