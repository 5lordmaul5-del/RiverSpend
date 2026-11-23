import { useMemo, useState } from 'react';

const LANGUAGES = [
  ['it','Italiano'],['en','English'],['fr','Français'],['de','Deutsch'],['es','Español'],
  ['pt','Português'],['ja','日本語'],['zh','中文'],['ar','العربية'],['ru','Русский'],
];
const DOMAINS = ['Tutti','Scienze','Storia','Geografia','Matematica','Tecnologia','Medicina','Arte e cultura','Natura','Economia','Diritto','Filosofia','Spazio'];
function calculateExpression(input) {
  const source = input.replace(/π/g,'pi').replace(/×/g,'*').replace(/÷/g,'/');
  const tokens = source.match(/(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|(?:sqrt|sin|cos|tan|asin|acos|atan|log|ln|abs|pi|e)|[()+\-*/^]/gi);
  if (!tokens || tokens.join('') !== source.replace(/\s+/g,'')) throw new Error('Controlla l’espressione: contiene simboli non validi.');
  let pos = 0;
  const peek = () => tokens[pos];
  const take = () => tokens[pos++];
  const primary = () => {
    const t = take();
    if (t === undefined) throw new Error('Espressione incompleta.');
    if (t === '+') return primary();
    if (t === '-') return -primary();
    if (t === '(') { const v = add(); if (take() !== ')') throw new Error('Manca una parentesi di chiusura.'); return v; }
    if (/^\d|^\.\d/.test(t)) return Number(t);
    const name = t.toLowerCase();
    if (name === 'pi') return Math.PI;
    if (name === 'e') return Math.E;
    if (['sqrt','sin','cos','tan','asin','acos','atan','log','ln','abs'].includes(name)) {
      if (take() !== '(') throw new Error('Usa la funzione con parentesi, per esempio sqrt(25).');
      const x = add(); if (take() !== ')') throw new Error('Manca una parentesi di chiusura.');
      const fn = {sqrt:Math.sqrt,sin:Math.sin,cos:Math.cos,tan:Math.tan,asin:Math.asin,acos:Math.acos,atan:Math.atan,log:Math.log10,ln:Math.log,abs:Math.abs}[name];
      return fn(x);
    }
    throw new Error('Elemento non riconosciuto: '+t);
  };
  const power = () => { let a=primary(); if(peek()==='^'){take();a=Math.pow(a,power());} return a; };
  const multiply = () => { let a=power(); while(peek()==='*'||peek()==='/'){const op=take(),b=power();a=op==='*'?a*b:a/b;} return a; };
  const add = () => { let a=multiply(); while(peek()==='+'||peek()==='-'){const op=take(),b=multiply();a=op==='+'?a+b:a-b;} return a; };
  const result = add();
  if (pos !== tokens.length) throw new Error('Controlla parentesi e operatori.');
  if (!Number.isFinite(result)) throw new Error('Il risultato non è un numero finito.');
  return result;
}
export default function RSEncyclopedia(){
  const [term,setTerm]=useState('');
  const [language,setLanguage]=useState('it');
  const [domain,setDomain]=useState('Tutti');
  const [results,setResults]=useState([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [expression,setExpression]=useState('sqrt(144) + 25^2');
  const [calcResult,setCalcResult]=useState(null);
  const [calcError,setCalcError]=useState('');
  const [activeTab,setActiveTab]=useState('enciclopedia');
  async function search(e){
    e?.preventDefault();
    if(!term.trim()) return;
    setLoading(true);setError('');setResults([]);
    try{
      const params=new URLSearchParams({q:term.trim(),lang:language,domain});
      const response=await fetch('/api/riverworld/encyclopedia?'+params.toString());
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||'Ricerca non disponibile.');
      setResults(data.results||[]);
      if(!data.results?.length) setError('Nessuna voce trovata. Prova con un termine più specifico o cambia lingua.');
    }catch(err){setError(err.message||'Errore durante la ricerca.');}
    finally{setLoading(false);}
  }
  const examples = useMemo(()=>['(125 * 48) / 6','sqrt(2025)','sin(pi/2)','log(1000)','(3^5 + 2^8) / 7'],[]);
  function runCalc(value=expression){try{setCalcResult(calculateExpression(value));setCalcError('');}catch(e){setCalcResult(null);setCalcError(e.message);}}
  return <section className="mt-5 rounded-2xl bg-white p-4 shadow-sm md:p-6">
    <div className="flex flex-wrap items-center justify-between gap-2"><div><div className="text-xs font-bold uppercase tracking-wider text-teal-700">RiverWorld · Knowledge & computation</div><h2 className="mt-1 text-2xl font-black text-[#073b4c]">🌐 RS Encyclopedia</h2><p className="mt-1 text-sm text-slate-600">Conoscenza mondiale, ricerca multidisciplinare e calcolo scientifico.</p></div><span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">Ricerca · Studio · Calcolo</span></div>
    <div className="mt-5 flex flex-wrap gap-2"><button onClick={()=>setActiveTab('enciclopedia')} className={'rounded-full px-4 py-2 text-sm font-bold '+(activeTab==='enciclopedia'?'bg-[#073b4c] text-white':'bg-slate-100 text-slate-700')}>📚 Enciclopedia</button><button onClick={()=>setActiveTab('calcolo')} className={'rounded-full px-4 py-2 text-sm font-bold '+(activeTab==='calcolo'?'bg-[#073b4c] text-white':'bg-slate-100 text-slate-700')}>🧮 Calcolo scientifico</button></div>
    {activeTab==='enciclopedia' && <div className="mt-5">
      <form onSubmit={search} className="grid gap-2 sm:grid-cols-[1fr_170px_auto]"><input value={term} onChange={e=>setTerm(e.target.value)} placeholder="Cerca un argomento, una persona, una formula, un luogo…" className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-teal-600"/><select value={language} onChange={e=>setLanguage(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm">{LANGUAGES.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select><button disabled={loading||!term.trim()} className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{loading?'Ricerca…':'Cerca'}</button></form>
      <div className="mt-3 flex flex-wrap gap-2">{DOMAINS.map(x=><button key={x} onClick={()=>setDomain(x)} className={'rounded-full border px-3 py-1.5 text-xs font-semibold '+(domain===x?'border-teal-700 bg-teal-50 text-teal-900':'border-slate-200 text-slate-600')}>{x}</button>)}</div>
      {error&&<p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
      <div className="mt-4 grid gap-3">{results.map((item,i)=><article key={item.url||i} className="rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><h3 className="font-extrabold text-[#073b4c]">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-700" dangerouslySetInnerHTML={{__html:item.snippet||''}} /></div>{item.thumbnail&&<img src={item.thumbnail} alt="" loading="lazy" className="h-20 w-20 rounded-lg object-cover"/>}</div>
        <a href={item.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-bold text-teal-800 underline">Apri la voce e consulta la fonte ↗</a>
      </article>)}</div>
      <p className="mt-4 text-xs leading-5 text-slate-500">Le voci provengono dalla ricerca Wikipedia nella lingua scelta. Sono contenuti enciclopedici collaborativi: verifica le fonti citate, soprattutto per medicina, diritto, finanza e decisioni importanti. Non è un archivio scientifico certificato né sostituisce un professionista.</p>
    </div>}
    {activeTab==='calcolo' && <div className="mt-5 rounded-2xl bg-[#f1f8f8] p-4 md:p-5">
      <h3 className="text-lg font-extrabold text-[#073b4c]">Laboratorio matematico</h3><p className="mt-1 text-sm text-slate-600">Operazioni, parentesi, potenze, radici e funzioni trigonometriche e logaritmiche. Angoli trigonometrici in radianti.</p>
      <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-slate-500">Espressione</label><input value={expression} onChange={e=>setExpression(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')runCalc();}} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-4 font-mono text-base outline-none focus:border-teal-600" placeholder="Esempio: (125*48)/6"/>
      <div className="mt-3 flex flex-wrap gap-2"><button onClick={()=>runCalc()} className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white">Calcola</button><button onClick={()=>{setExpression('');setCalcResult(null);setCalcError('');}} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold">Azzera</button></div>
      {calcResult!==null&&<div className="mt-4 rounded-xl border border-emerald-200 bg-white p-4"><div className="text-xs font-bold uppercase text-emerald-800">Risultato</div><div className="mt-1 break-all text-2xl font-black tabular-nums text-[#073b4c]">{calcResult.toLocaleString('it-IT',{maximumFractionDigits:12})}</div><div className="mt-1 font-mono text-xs text-slate-500">{String(calcResult)}</div></div>}
      {calcError&&<p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{calcError}</p>}
      <div className="mt-5"><div className="text-xs font-bold uppercase tracking-wide text-slate-500">Esempi rapidi</div><div className="mt-2 flex flex-wrap gap-2">{examples.map(x=><button key={x} onClick={()=>{setExpression(x);runCalc(x);}} className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-700">{x}</button>)}</div></div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2"><div className="rounded-xl bg-white p-3 text-sm"><b>Operatori</b><p className="mt-1 text-slate-600">+ − × ÷ · potenza ^ · parentesi ()</p></div><div className="rounded-xl bg-white p-3 text-sm"><b>Funzioni</b><p className="mt-1 text-slate-600">sqrt, sin, cos, tan, log, ln, abs, asin, acos, atan, pi, e</p></div></div>
      <p className="mt-4 text-xs text-slate-500">Calcolo eseguito nel browser. Per risultati numerici ad alta precisione, ingegneria critica o uso scientifico certificato occorrono strumenti specializzati e verifica indipendente.</p>
    </div>}
  </section>;
}
