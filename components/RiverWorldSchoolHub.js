import { useState } from 'react';
import RiverWorldTopicFeed from './RiverWorldTopicFeed';

const LEVELS = [
  { id:'primaria', name:'Scuola primaria', detail:'Classi 1ª–5ª', icon:'🧒' },
  { id:'medie', name:'Scuola secondaria di primo grado', detail:'Classi 1ª–3ª', icon:'📘' },
  { id:'superiori', name:'Scuola secondaria di secondo grado', detail:'Licei, tecnici e professionali', icon:'🎒' },
  { id:'universita', name:'Università', detail:'Corsi, facoltà e approfondimenti', icon:'🎓' },
];
const SUBJECTS = [
  ['Storia','📜'],['Geografia','🌍'],['Matematica','➗'],['Aritmetica','🔢'],['Geometria','📐'],
  ['Scienze','🔬'],['Biologia','🧬'],['Chimica','⚗️'],['Fisica','⚛️'],['Astronomia','🪐'],
  ['Italiano e letteratura','📖'],['Grammatica','✍️'],['Inglese e lingue','🗣️'],['Filosofia','💭'],
  ['Informatica','💻'],['Tecnologia','⚙️'],['Arte e disegno','🎨'],['Musica','🎼'],
  ['Educazione civica','🤝'],['Economia','📈'],['Diritto','⚖️'],['Scienze motorie','🏃'],
];
export default function RiverWorldSchoolHub(){
  const [level,setLevel]=useState('primaria');
  const [subject,setSubject]=useState('Storia');
  const selected=LEVELS.find(x=>x.id===level)||LEVELS[0];
  return <section className="mt-5 rounded-2xl bg-white p-4 shadow-sm md:p-6">
    <div className="text-xs font-bold uppercase tracking-wider text-teal-700">RiverWorld · Formazione</div>
    <h2 className="mt-1 text-2xl font-black text-[#073b4c]">🎓 Scuola e Università</h2>
    <p className="mt-2 text-sm text-slate-600">Percorsi dalla primaria all'università. Scegli il livello e la materia per cercare spiegazioni e approfondimenti.</p>
    <h3 className="mt-5 font-extrabold text-[#073b4c]">1. Scegli il percorso</h3>
    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
      {LEVELS.map(x=><button key={x.id} onClick={()=>setLevel(x.id)} className={'rounded-xl border p-3 text-left '+(level===x.id?'border-teal-600 bg-teal-50':'border-slate-200')}><span className="text-xl">{x.icon}</span><span className="mt-1 block text-sm font-bold">{x.name}</span><span className="text-xs text-slate-500">{x.detail}</span></button>)}
    </div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-2"><h3 className="font-extrabold text-[#073b4c]">2. Scegli la materia</h3><span className="text-xs text-slate-500">22 materie e aree</span></div>
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {SUBJECTS.map(([name,icon])=><button key={name} onClick={()=>setSubject(name)} className={'rounded-xl border p-3 text-left text-sm font-semibold '+(subject===name?'border-teal-600 bg-teal-50 text-teal-900':'border-slate-200 text-slate-700')}><span className="mr-2">{icon}</span>{name}</button>)}
    </div>
    <div className="mt-5 rounded-xl bg-[#eef8f8] p-4"><div className="text-xs font-bold uppercase text-teal-800">Percorso selezionato</div><div className="mt-1 font-extrabold text-[#073b4c]">{selected.name} · {subject}</div><p className="mt-1 text-xs text-slate-600">Le risorse sono esterne e vanno verificate rispetto ai programmi scolastici e universitari.</p></div>
    <RiverWorldTopicFeed section="scuola" initialQuery={subject+' '+selected.name} />
  </section>;
}
