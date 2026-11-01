import Link from 'next/link';
import { useState } from 'react';

const topics = [
 {id:'nibiru',title:'NIBIRU',subtitle:'Il pianeta del mito moderno',text:'Nibiru è diventato famoso nella cultura popolare come pianeta misterioso in rotta verso la Terra. Le narrazioni catastrofiste diffuse online non sono supportate da prove astronomiche: non esiste evidenza verificata di un pianeta chiamato Nibiru diretto verso il nostro mondo.',points:['Origini del racconto moderno','Interpretazioni e teorie diffuse','Confronto tra affermazioni e verifiche']},
 {id:'planetx',title:'PLANET X',subtitle:'La ricerca di un possibile pianeta lontano',text:'“Planet X” è un nome storico usato per ipotizzare un pianeta ancora sconosciuto. In astronomia si studiano possibili perturbazioni nelle orbite di alcuni oggetti transnettuniani; l’eventuale Pianeta Nove resta un’ipotesi scientifica, non una scoperta confermata.',points:['Ipotesi del Pianeta Nove','Oggetti transnettuniani e orbite','Osservazioni e ricerche in corso']},
 {id:'sky',title:'DEEP SPACE',subtitle:'Esplorazione del sistema solare esterno',text:'Un viaggio tra Nettuno, la fascia di Kuiper, pianeti nani e regioni remote del Sistema Solare. Le distanze sono immense: le rappresentazioni grafiche dell’app saranno dichiarate schematiche e non in scala.',points:['Nettuno e oltre','Fascia di Kuiper e pianeti nani','Mappe e distanze astronomiche']}
];

export default function RsPlaneX() {
 const [active,setActive]=useState('nibiru');
 const current=topics.find((item)=>item.id===active)||topics[0];
 return (
  <main className="min-h-screen overflow-hidden bg-[#030914] text-slate-100">
   <div className="pointer-events-none fixed inset-0 opacity-70" style={{backgroundImage:'radial-gradient(circle at 20% 20%, #123c65 0, transparent 30%), radial-gradient(circle at 80% 35%, #39235e 0, transparent 28%), radial-gradient(circle at 50% 90%, #12414b 0, transparent 35%)'}}/>
   <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6">
    <Link href="/rs-ovni-ufo" className="text-cyan-200 underline">← RS OVNI UFO</Link>
    <header className="py-14 text-center">
     <p className="text-xs font-black uppercase tracking-[.4em] text-amber-300">RiverSpend Space Exploration</p>
     <h1 className="mt-4 text-6xl font-black tracking-tight sm:text-8xl">RSPlaneX</h1>
     <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-300">Nibiru, Planet X e i confini del Sistema Solare: esploriamo le grandi domande dello spazio, separando astronomia, ipotesi scientifiche e leggende.</p>
    </header>
    <section className="relative overflow-hidden rounded-[2rem] border border-cyan-200/20 bg-slate-950/70 p-6 sm:p-10">
     <div className="absolute right-8 top-8 h-48 w-48 rounded-full border border-cyan-200/20 shadow-[0_0_70px_rgba(34,211,238,.12)]"/>
     <div className="absolute right-20 top-20 h-24 w-24 rounded-full bg-gradient-to-br from-slate-300 to-slate-700 opacity-60 blur-[1px]"/>
     <p className="text-xs font-bold tracking-[.3em] text-cyan-200">THE OUTER FRONTIER</p>
     <h2 className="mt-4 max-w-2xl text-3xl font-black sm:text-4xl">Cosa si nasconde oltre i pianeti conosciuti?</h2>
     <p className="mt-4 max-w-2xl leading-7 text-slate-300">Un archivio interattivo per seguire la ricerca astronomica e conoscere le storie che hanno alimentato il mistero di Nibiru.</p>
    </section>
    <section className="mt-7 grid gap-3 md:grid-cols-3">
     {topics.map((item)=> <button key={item.id} type="button" onClick={()=>setActive(item.id)} aria-pressed={active===item.id} className={`rounded-2xl border p-5 text-left transition ${active===item.id?'border-amber-300 bg-amber-300/10':'border-cyan-100/15 bg-slate-900/80 hover:border-cyan-200/60'}`}>
      <p className="text-xs font-bold tracking-[.25em] text-amber-300">SPACE FILE</p><h3 className="mt-3 text-2xl font-black">{item.title}</h3><p className="mt-2 text-sm text-slate-400">{item.subtitle}</p>
     </button>)}
    </section>
    <section className="mt-5 rounded-3xl border border-cyan-100/15 bg-slate-900/80 p-6 sm:p-9" aria-live="polite">
     <p className="text-xs font-bold tracking-[.3em] text-cyan-200">EXPLORATION DOSSIER</p><h2 className="mt-3 text-3xl font-black">{current.title}</h2><p className="mt-1 text-amber-200">{current.subtitle}</p><p className="mt-5 max-w-4xl leading-8 text-slate-300">{current.text}</p>
     <ul className="mt-6 grid gap-3 md:grid-cols-3">{current.points.map((point)=><li key={point} className="rounded-xl border border-cyan-100/10 bg-black/20 p-4 text-sm">✦ {point}</li>)}</ul>
    </section>
    <section className="my-8 rounded-2xl border border-amber-300/30 bg-amber-200/5 p-5 text-sm leading-7 text-amber-100"><strong>Nota scientifica:</strong> al momento non ci sono prove affidabili che Nibiru esista o sia in rotta di collisione con la Terra. L’eventuale Pianeta Nove è una distinta ipotesi astronomica ancora da confermare. RSPlaneX distinguerà sempre dati osservati, ipotesi e narrazioni.</section>
    <section className="mb-10 rounded-3xl border border-violet-300/30 bg-gradient-to-r from-violet-950/70 via-slate-900 to-cyan-950/70 p-6">
     <p className="text-xs font-black tracking-[.35em] text-violet-200">THE ALIEN BRIDGE</p><h2 className="mt-3 text-3xl font-black">Dal mistero terrestre allo spazio profondo</h2><p className="mt-3 leading-7 text-slate-300">Collega CropCircles, avvistamenti e civiltà antiche con l’esplorazione dei mondi lontani.</p>
     <div className="mt-5 flex flex-wrap gap-4"><Link href="/orion-giza-maya" className="text-cyan-200 underline">Orione • Giza • Maya</Link><Link href="/rs-ovni-ufo" className="text-cyan-200 underline">RS OVNI UFO</Link></div>
    </section>
   </div>
  </main>
 );
}
