import { useMemo, useState } from 'react';

const LEVELS = [
  { id:'primaria', name:'Scuola primaria', detail:'Classi 1ª–5ª', icon:'🧒', grades:['1ª','2ª','3ª','4ª','5ª'] },
  { id:'medie', name:'Scuola secondaria di primo grado', detail:'Classi 1ª–3ª', icon:'📘', grades:['1ª','2ª','3ª'] },
  { id:'superiori', name:'Scuola secondaria di secondo grado', detail:'Licei, tecnici e professionali', icon:'🎒', grades:['1ª','2ª','3ª','4ª','5ª'] },
  { id:'universita', name:'Università', detail:'Corsi, facoltà e approfondimenti', icon:'🎓', grades:['Base','Intermedio','Avanzato'] },
];
const SUBJECTS = [
  ['Storia','📜'],['Geografia','🌍'],['Matematica','➗'],['Aritmetica','🔢'],['Geometria','📐'],
  ['Scienze','🔬'],['Biologia','🧬'],['Chimica','⚗️'],['Fisica','⚛️'],['Astronomia','🪐'],
  ['Italiano e letteratura','📖'],['Grammatica','✍️'],['Inglese e lingue','🗣️'],['Filosofia','💭'],
  ['Informatica','💻'],['Tecnologia','⚙️'],['Arte e disegno','🎨'],['Musica','🎼'],
  ['Educazione civica','🤝'],['Economia','📈'],['Diritto','⚖️'],['Scienze motorie','🏃'],
];
const SOURCES = [
  { name:'Wikipedia', detail:'Voci di riferimento e concetti introduttivi', url:q=>'https://it.wikipedia.org/w/index.php?search='+encodeURIComponent(q), icon:'🌐' },
  { name:'Wikibooks', detail:'Libri e manuali didattici liberi', url:q=>'https://it.wikibooks.org/w/index.php?search='+encodeURIComponent(q), icon:'📚' },
  { name:'Khan Academy', detail:'Lezioni ed esercizi, soprattutto matematica e scienze', url:q=>'https://www.khanacademy.org/search?page_search_query='+encodeURIComponent(q), icon:'🧠' },
  { name:'GeoGebra', detail:'Geometria, algebra e strumenti interattivi', url:q=>'https://www.geogebra.org/search/'+encodeURIComponent(q), icon:'📐' },
  { name:'PhET', detail:'Simulazioni interattive di fisica, chimica e matematica', url:q=>'https://phet.colorado.edu/it/', icon:'🧪' },
  { name:'OpenStax', detail:'Libri universitari aperti e gratuiti, prevalentemente in inglese', url:q=>'https://openstax.org/subjects', icon:'🎓' },
  { name:'Rai Scuola', detail:'Video e contenuti educativi della Rai', url:q=>'https://www.raiscuola.rai.it/', icon:'📺' },
  { name:'Treccani', detail:'Vocabolario, enciclopedia e approfondimenti', url:q=>'https://www.treccani.it/', icon:'📖' },
];
export default function RiverWorldSchoolHub(){
  const [level,setLevel]=useState('primaria');
  const [grade,setGrade]=useState('1ª');
  const [subject,setSubject]=useState('Storia');
  const [topic,setTopic]=useState('La storia: prime civiltà');
  const [results,setResults]=useState([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const selected=LEVELS.find(x=>x.id===level)||LEVELS[0];
  const searchTerm=useMemo(()=>[subject,topic,selected.name,grade].filter(Boolean).join(' '),[subject,topic,selected.name,grade]);
  async function search(e){
    e?.preventDefault();setLoading(true);setError('');setResults([]);
    try{
      const params=new URLSearchParams({q:topic.trim()||subject,lang:'it',subject,level,grade});
      const response=await fetch('/api/riverworld/learning?'+params.toString());
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||'Ricerca didattica non disponibile.');
      setResults(data.results||[]);
      if(!data.results?.length)setError('Nessuna voce trovata. Prova un argomento più semplice o usa le risorse qui sotto.');
    }catch(err){setError(err.message||'Errore durante la ricerca.');}
    finally{setLoading(false);}
  }
  return <section className="mt-5 rounded-2xl bg-white p-4 shadow-sm md:p-6">
    <div className="text-xs font-bold uppercase tracking-wider text-teal-700">RiverWorld · Formazione</div>
    <h2 className="mt-1 text-2xl font-black text-[#073b4c]">🎓 Scuola e Università</h2>
    <p className="mt-2 text-sm text-slate-600">Percorsi dalla primaria all'università, ricerca di argomenti didattici e accesso a risorse educative aperte.</p>
    <h3 className="mt-5 font-extrabold text-[#073b4c]">1. Scegli il percorso</h3>
    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">{LEVELS.map(x=><button key={x.id} onClick={()=>{setLevel(x.id);setGrade(x.grades[0]);}} className={'rounded-xl border p-3 text-left '+(level===x.id?'border-teal-600 bg-teal-50':'border-slate-200')}><span className="text-xl">{x.icon}</span><span className="mt-1 block text-sm font-bold">{x.name}</span><span className="text-xs text-slate-500">{x.detail}</span></button>)}</div>
    <div className="mt-4"><div className="text-sm font-bold text-[#073b4c]">Classe / livello</div><div className="mt-2 flex flex-wrap gap-2">{selected.grades.map(x=><button key={x} onClick={()=>setGrade(x)} className={'rounded-full border px-4 py-2 text-sm font-semibold '+(grade===x?'border-teal-700 bg-teal-50 text-teal-900':'border-slate-200 text-slate-600')}>{x}</button>)}</div></div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-2"><h3 className="font-extrabold text-[#073b4c]">2. Scegli la materia</h3><span className="text-xs text-slate-500">22 materie</span></div>
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">{SUBJECTS.map(([name,icon])=><button key={name} onClick={()=>setSubject(name)} className={'rounded-xl border p-3 text-left text-sm font-semibold '+(subject===name?'border-teal-600 bg-teal-50 text-teal-900':'border-slate-200 text-slate-700')}><span className="mr-2">{icon}</span>{name}</button>)}</div>
    <form onSubmit={search} className="mt-5 rounded-xl bg-[#eef8f8] p-4">
      <label className="block text-sm font-extrabold text-[#073b4c]">3. Cerca un argomento</label>
      <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Es. frazioni, cellula, Antico Egitto, equazioni…" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"/>
      <p className="mt-2 text-xs text-slate-600">Percorso: {selected.name} · {grade} · {subject}</p>
      <button disabled={loading||!topic.trim()} className="mt-3 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{loading?'Ricerca…':'Cerca materiali didattici'}</button>
      {error&&<p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
      {results.length>0&&<div className="mt-4 grid gap-2">{results.map((item,i)=><article key={item.url||i} className="rounded-xl border border-slate-200 bg-white p-3"><div className="text-xs font-bold uppercase text-teal-700">{item.source}</div><h4 className="mt-1 font-bold text-[#073b4c]">{item.title}</h4><p className="mt-1 text-sm text-slate-600" {item.snippet}/><a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex text-sm font-bold text-teal-800 underline">Apri la risorsa ↗</a></article>)}</div>}
    </form>
    <div className="mt-5"><h3 className="font-extrabold text-[#073b4c]">4. Biblioteche e strumenti educativi</h3><p className="mt-1 text-xs text-slate-500">Risorse esterne: disponibilità, lingua e condizioni d'uso dipendono dai rispettivi enti.</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{SOURCES.map(item=><a key={item.name} href={item.url(searchTerm)} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-slate-200 p-3 hover:border-teal-400 hover:bg-teal-50"><span className="text-xl">{item.icon}</span><span className="ml-2 font-bold text-[#073b4c]">{item.name}</span><p className="mt-1 text-xs text-slate-600">{item.detail}</p></a>)}</div></div>
    <p className="mt-4 text-xs leading-5 text-slate-500">RiverWorld organizza la ricerca e collega materiali esterni; non certifica i programmi scolastici né sostituisce docenti, testi ufficiali o verifiche delle fonti.</p>
  </section>;
}
