import { useMemo } from 'react';

const events = [
  { id:'ambient', title:'RS Ambient Day', eyebrow:'LA TERRA CI UNISCE', description:'Fiumi puliti, biodiversità, riciclo e iniziative per proteggere il pianeta.', image:'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=85', tone:'from-emerald-950/95', badge:'🌿 Ambiente', date:'Data configurabile in RSPC' },
  { id:'vulcan', title:'RS VulcanDay', eyebrow:'LA FORZA DELLA TERRA', description:'Scopri i vulcani con quiz scientifici, geologia e simulazioni visive.', image:'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=85', tone:'from-orange-950/95', badge:'🌋 Scienza', date:'Data configurabile in RSPC' },
  { id:'glacial', title:'RS Glacial Day', eyebrow:'IL MONDO DI GHIACCIO', description:'Ghiacciai, clima e paesaggi artici attraverso sfide e curiosità.', image:'https://images.unsplash.com/photo-1464278533981-50106e6176b1?auto=format&fit=crop&w=1200&q=85', tone:'from-sky-950/95', badge:'❄️ Clima', date:'Data configurabile in RSPC' },
  { id:'tsunami', title:'RS TsunamiDay', eyebrow:'CONOSCERE PER PROTEGGERSI', description:'Impara i segnali di allarme e le regole di sicurezza in caso di maremoto.', image:'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=85', tone:'from-blue-950/95', badge:'🌊 Sicurezza', date:'Data configurabile in RSPC' },
  { id:'enigma', title:'RS Codice Enigma', eyebrow:'LA SFIDA DELLA LOGICA', description:'Quiz di logica, sequenze e crittografia ispirati alla storia di Alan Turing. Gli sconti saranno assegnati solo dopo aver implementato e testato le regole premio.', image:'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=85', tone:'from-slate-950/95', badge:'🧠 Enigmi', date:'Sfide in preparazione' },
];

function easterSunday(year) {
  const a=year%19, b=Math.floor(year/100), c=year%100, d=Math.floor(b/4), e=b%4;
  const f=Math.floor((b+8)/25), g=Math.floor((b-f+1)/3);
  const h=(19*a+b-d-g+15)%30, i=Math.floor(c/4), k=c%4;
  const l=(32+2*e+2*i-h-k)%7, m=Math.floor((a+11*h+22*l)/451);
  const month=Math.floor((h+l-7*m+114)/31), day=((h+l-7*m+114)%31)+1;
  return new Date(year,month-1,day);
}
function activeSeason(now) {
  const year=now.getFullYear(), month=now.getMonth(), day=now.getDate();
  // Christmas atmosphere: 8 December through 6 January, inclusive.
  if ((month===11 && day>=8) || (month===0 && day<=6)) return { key:'christmas', name:'Atmosfera natalizia', icon:'🎄', detail:'Luci, neve e decorazioni festive', className:'season-christmas' };
  // Halloween atmosphere: 25 October through 1 November, inclusive.
  if ((month===9 && day>=25) || (month===10 && day<=1)) return { key:'halloween', name:'Atmosfera Halloween', icon:'🎃', detail:'Zucca, ragnatele e mistero', className:'season-halloween' };
  // Easter atmosphere: Palm Sunday through Easter Monday.
  const easter=easterSunday(year);
  const start=new Date(easter); start.setDate(easter.getDate()-7);
  const end=new Date(easter); end.setDate(easter.getDate()+1);
  if (now>=start && now<=end) return { key:'easter', name:'Atmosfera di Pasqua', icon:'🐣', detail:'Uova colorate e primavera', className:'season-easter' };
  // New Year: 31 December through 1 January (already covered by Christmas season).
  return { key:'normal', name:'RiverSpend tutto l’anno', icon:'🌊', detail:'Il tema stagionale si attiva automaticamente', className:'' };
}

export default function EventiRiverSpend() {
  const season=useMemo(()=>activeSeason(new Date()),[]);
  return <main className={`min-h-screen bg-slate-950 text-white ${season.className}`}>
    <header className="relative isolate overflow-hidden border-b border-teal-800 px-5 py-14 sm:px-8">
      <div className="absolute inset-0 -z-20 bg-gradient-to-br from-teal-950 via-slate-950 to-slate-900"/>
      <div className="absolute inset-0 -z-10 opacity-30" style={{backgroundImage:'radial-gradient(circle at 15% 25%, #2dd4bf 0, transparent 35%), radial-gradient(circle at 85% 75%, #fbbf24 0, transparent 28%)'}}/>
      <a href="/" className="text-sm font-bold text-teal-200">← Torna a RiverSpend</a>
      <p className="mt-8 text-xs font-black uppercase tracking-[.28em] text-amber-300">YOUR SHOP • YOUR FLOW</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-black sm:text-6xl">Eventi, feste e sfide</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">Un calendario di esperienze RiverSpend: stagioni automatiche, giornate tematiche e giochi d’intelligenza.</p>
      <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-teal-700 bg-slate-900/80 px-4 py-3">
        <span className="text-2xl">{season.icon}</span><span><strong className="block">{season.name}</strong><span className="text-sm text-slate-300">{season.detail}</span></span>
      </div>
    </header>
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <div className="mb-5"><p className="text-xs font-black uppercase tracking-[.25em] text-teal-300">CALENDARIO AUTOMATICO</p><h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Le feste durante l’anno</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Natale: dall’8 dicembre al 6 gennaio. Halloween: dal 25 ottobre al 1 novembre. Pasqua: dalla Domenica delle Palme al Lunedì dell’Angelo, con data calcolata ogni anno.</p></div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <article className="overflow-hidden rounded-3xl border border-emerald-700/70 bg-slate-900 shadow-xl">
          <div className="relative h-52"><img src="https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&w=1200&q=85" alt="Albero di Natale illuminato" className="h-full w-full object-cover"/><span className="absolute bottom-3 left-3 rounded-full bg-slate-950/85 px-3 py-1 text-sm">🎄 8 dic – 6 gen</span></div>
          <div className="p-5"><h3 className="text-xl font-black">Natale</h3><p className="mt-2 text-sm leading-6 text-slate-300">Luci, neve decorativa, alberi e atmosfera natalizia. Audio facoltativo e animazioni leggere.</p></div>
        </article>
        <article className="overflow-hidden rounded-3xl border border-orange-700/70 bg-slate-900 shadow-xl">
          <div className="relative h-52"><img src="https://images.unsplash.com/photo-1509557965875-b88c97052f0e?auto=format&fit=crop&w=1200&q=85" alt="Zucca decorativa di Halloween" className="h-full w-full object-cover"/><span className="absolute bottom-3 left-3 rounded-full bg-slate-950/85 px-3 py-1 text-sm">🎃 25 ott – 1 nov</span></div>
          <div className="p-5"><h3 className="text-xl font-black">Halloween</h3><p className="mt-2 text-sm leading-6 text-slate-300">Zucche, ragnatele, ombre e decorazioni misteriose, senza rallentare acquisti e checkout.</p></div>
        </article>
        <article className="overflow-hidden rounded-3xl border border-pink-700/70 bg-slate-900 shadow-xl">
          <div className="relative h-52"><img src="https://images.unsplash.com/photo-1457301547464-91995555cd25?auto=format&fit=crop&w=1200&q=85" alt="Uova colorate per Pasqua" className="h-full w-full object-cover"/><span className="absolute bottom-3 left-3 rounded-full bg-slate-950/85 px-3 py-1 text-sm">🐣 Date mobili</span></div>
          <div className="p-5"><h3 className="text-xl font-black">Pasqua</h3><p className="mt-2 text-sm leading-6 text-slate-300">Uova colorate, fiori e dettagli primaverili. Il periodo si aggiorna automaticamente ogni anno.</p></div>
        </article>
      </div>
    </section>
    <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-8">
      <p className="text-xs font-black uppercase tracking-[.25em] text-amber-300">ESPERIENZE RIVERSPEND</p><h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Eventi Day e Codice Enigma</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{events.map(event=><article key={event.id} className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-xl">
        <div className="relative h-48"><img src={event.image} alt={event.title} loading="lazy" className="h-full w-full object-cover"/><div className={`absolute inset-0 bg-gradient-to-t ${event.tone} to-transparent`}/><span className="absolute bottom-3 left-4 rounded-full border border-white/20 bg-slate-950/70 px-3 py-1 text-xs font-bold">{event.badge}</span></div>
        <div className="p-5"><p className="text-[10px] font-black tracking-[.2em] text-teal-300">{event.eyebrow}</p><h3 className="mt-2 text-xl font-black">{event.title}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{event.description}</p><p className="mt-4 text-xs font-semibold text-amber-200">{event.date}</p></div>
      </article>)}</div>
      <p className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-4 text-sm leading-6 text-slate-300">Le date di Ambient Day, VulcanDay, Glacial Day e TsunamiDay sono da definire nel pannello di controllo. La pagina presenta il programma; l’attivazione automatica dei temi su tutte le pagine e la gestione RSPC richiedono un’integrazione successiva.</p>
    </section>
    <style jsx>{`
      .season-christmas { background-image: radial-gradient(circle at 12% 8%,rgba(16,185,129,.2),transparent 25%),linear-gradient(180deg,#071c20,#020617); }
      .season-halloween { background-image: radial-gradient(circle at 85% 5%,rgba(249,115,22,.22),transparent 26%),linear-gradient(180deg,#21100c,#020617); }
      .season-easter { background-image: radial-gradient(circle at 85% 5%,rgba(244,114,182,.18),transparent 26%),linear-gradient(180deg,#102b2c,#020617); }
    `}</style>
  </main>;
}
