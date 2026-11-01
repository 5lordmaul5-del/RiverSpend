import Link from 'next/link';
import { useState } from 'react';

const chapters = [
  { id: 'orione', number: '01', title: 'La cintura di Orione', subtitle: 'La costellazione nel cielo', text: 'Osserva le tre stelle Alnitak, Alnilam e Mintaka e scopri perché Orione ha affascinato popoli e osservatori del cielo. La mappa è una rappresentazione artistica, non una carta astronomica di precisione.' },
  { id: 'giza', number: '02', title: 'La piana di Giza', subtitle: 'Faraoni, piramidi e cielo', text: 'Esplora Cheope, Chefren e Micerino, la storia dell’antico Egitto e il suggestivo confronto tra la disposizione delle piramidi e la cintura di Orione, noto come correlazione di Orione: un’ipotesi interpretativa discussa, non una prova di contatti extraterrestri.' },
  { id: 'maya', number: '03', title: 'Il mondo Maya', subtitle: 'Calendari e piramidi', text: 'Entra nelle città Maya, osserva le piramidi a gradoni e scopri il calendario rituale Tzolk’in, il calendario Haab’ e il Conto Lungo. Architettura, astronomia e misura del tempo raccontano una civiltà straordinaria, senza bisogno di attribuirne le opere agli alieni.' },
  { id: 'mistero', number: '04', title: 'Il ponte tra i mondi', subtitle: 'Mito, mistero e immaginazione', text: 'Una narrazione fantascientifica mette in dialogo Orione, Giza, le città Maya e visitatori provenienti dallo spazio. Qui il collegamento alieno è dichiaratamente una leggenda creativa da esplorare, non un fatto storico dimostrato.' }
];

export default function OrionGizaMaya() {
  const [active, setActive] = useState('orione');
  const current = chapters.find((chapter) => chapter.id === active) || chapters[0];

  return (
    <main className="min-h-screen overflow-hidden bg-[#050b1b] text-slate-100">
      <div className="relative isolate">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-70" style={{backgroundImage:'radial-gradient(circle at 18% 20%, #164b76 0, transparent 28%), radial-gradient(circle at 82% 12%, #422d70 0, transparent 25%), radial-gradient(circle at 50% 75%, #0b5265 0, transparent 38%)'}} />
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <Link href="/ecosistema" className="text-cyan-200 underline">← Ecosistema RiverSpend</Link>
          <header className="py-12 text-center sm:py-16">
            <p className="text-xs font-bold uppercase tracking-[.35em] text-amber-300">RiverSpend Experience • esplorazione cosmica</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">ORIONE • GIZA • MAYA</h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">Un viaggio interattivo tra stelle, faraoni, calendari antichi e misteri dello spazio. Storia e archeologia incontrano il mito e la fantascienza.</p>
          </header>

          <section className="overflow-hidden rounded-[2rem] border border-cyan-300/30 bg-slate-950/60 shadow-2xl shadow-cyan-950/30">
            <div className="border-b border-cyan-100/10 px-5 py-4 text-center">
              <p className="text-xs font-bold tracking-[.25em] text-cyan-200">MAPPA COSMICA • VISIONE ARTISTICA</p>
            </div>
            <svg viewBox="0 0 1000 480" role="img" aria-label="Illustrazione artistica della cintura di Orione sopra le piramidi di Giza e una piramide Maya" className="w-full">
              <defs>
                <linearGradient id="spaceSky" x2="0" y2="1"><stop stopColor="#07152d"/><stop offset="1" stopColor="#102b48"/></linearGradient>
                <linearGradient id="pyramidGold" x2="1" y2="1"><stop stopColor="#ffe5a0"/><stop offset="1" stopColor="#93602d"/></linearGradient>
                <radialGradient id="starGlow"><stop stopColor="#fff7c9"/><stop offset="1" stopColor="#8ceaff" stopOpacity="0"/></radialGradient>
              </defs>
              <rect width="1000" height="480" fill="url(#spaceSky)"/>
              {Array.from({length:70},(_,i)=><circle key={i} cx={(i*137+41)%1000} cy={(i*71+19)%310} r={i%7===0?2:1} fill="#d9f6ff" opacity={i%3===0?.9:.45}/>)}
              <g stroke="#7ddff5" strokeWidth="2" opacity=".65" fill="none"><path d="M370 90 L500 68 L635 95"/><path d="M370 90 L330 35 M635 95 L690 40"/></g>
              <g><circle cx="370" cy="90" r="34" fill="url(#starGlow)"/><circle cx="500" cy="68" r="34" fill="url(#starGlow)"/><circle cx="635" cy="95" r="34" fill="url(#starGlow)"/><g fill="#fff4c2"><circle cx="370" cy="90" r="7"/><circle cx="500" cy="68" r="8"/><circle cx="635" cy="95" r="7"/></g></g>
              <g fill="#bcefff" fontSize="17" fontFamily="Arial" textAnchor="middle"><text x="370" y="137">Alnitak</text><text x="500" y="115">Alnilam</text><text x="635" y="142">Mintaka</text><text x="500" y="28" fontSize="20" fontWeight="bold" letterSpacing="4">CINTURA DI ORIONE</text></g>
              <path d="M0 350 Q230 315 430 350 T1000 340 V480 H0Z" fill="#152b39"/>
              <g stroke="#f4d18b" strokeWidth="3"><path d="M80 420 L205 215 L330 420Z" fill="url(#pyramidGold)"/><path d="M260 420 L385 250 L510 420Z" fill="#c99a58"/><path d="M450 420 L520 320 L590 420Z" fill="#a97943"/></g>
              <path d="M700 420 L790 280 L880 420Z" fill="#b68c4f" stroke="#f5d68c" strokeWidth="3"/>
              <path d="M720 390H860 M740 360H840 M760 330H820" stroke="#f5d68c" strokeWidth="5" opacity=".8"/>
              <g fill="#f7dfaa" fontSize="18" fontFamily="Arial" textAnchor="middle"><text x="300" y="455">GIZA • EGITTO</text><text x="790" y="455">MONDO MAYA</text></g>
              <path d="M500 150 Q500 240 300 280" fill="none" stroke="#73e4ff" strokeDasharray="7 9" strokeWidth="2" opacity=".55"/>
              <path d="M500 150 Q600 240 790 260" fill="none" stroke="#73e4ff" strokeDasharray="7 9" strokeWidth="2" opacity=".55"/>
            </svg>
            <p className="px-5 pb-5 text-center text-xs text-slate-400">Illustrazione simbolica: non rappresenta una prova di allineamento astronomico esatto tra i siti.</p>
          </section>

          <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Capitoli dell'esplorazione">
            {chapters.map((chapter) => (
              <button key={chapter.id} type="button" onClick={() => setActive(chapter.id)} aria-pressed={active===chapter.id} className={`rounded-2xl border p-4 text-left transition ${active===chapter.id ? 'border-amber-300 bg-amber-300/10 shadow-lg shadow-amber-900/20' : 'border-cyan-100/15 bg-slate-900/70 hover:border-cyan-200/60'}`}>
                <span className="text-xs font-bold tracking-widest text-amber-300">{chapter.number}</span>
                <h2 className="mt-2 text-lg font-extrabold">{chapter.title}</h2>
                <p className="mt-1 text-sm text-slate-400">{chapter.subtitle}</p>
              </button>
            ))}
          </section>

          <section className="mt-5 rounded-3xl border border-cyan-200/20 bg-gradient-to-br from-slate-900 to-[#10243b] p-6 sm:p-9" aria-live="polite">
            <p className="text-xs font-bold uppercase tracking-[.25em] text-cyan-200">Capitolo {current.number}</p>
            <h2 className="mt-3 text-3xl font-black">{current.title}</h2>
            <p className="mt-1 font-semibold text-amber-200">{current.subtitle}</p>
            <p className="mt-5 max-w-4xl text-base leading-8 text-slate-300">{current.text}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              {chapters.map((chapter) => <button key={chapter.id} type="button" onClick={() => setActive(chapter.id)} className="rounded-full border border-cyan-100/30 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-100/10">{chapter.title}</button>)}
            </div>
          </section>

          <section className="my-8 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-cyan-100/15 bg-slate-900/70 p-5"><p className="text-2xl">🔭</p><h3 className="mt-3 text-lg font-bold">Osservatorio stellare</h3><p className="mt-2 text-sm leading-6 text-slate-400">Un’area per conoscere le costellazioni, le stelle e i pianeti con schede divulgative.</p></article>
            <article className="rounded-2xl border border-cyan-100/15 bg-slate-900/70 p-5"><p className="text-2xl">🏺</p><h3 className="mt-3 text-lg font-bold">Atlante delle civiltà</h3><p className="mt-2 text-sm leading-6 text-slate-400">Un percorso tra Egitto e civiltà Maya, con cronologie, architetture e calendari.</p></article>
            <article className="rounded-2xl border border-cyan-100/15 bg-slate-900/70 p-5"><p className="text-2xl">🛸</p><h3 className="mt-3 text-lg font-bold">Il mistero extraterrestre</h3><p className="mt-2 text-sm leading-6 text-slate-400">Una storia interattiva di fantasia che collega antichi simboli e visitatori cosmici, chiaramente distinta dalle evidenze storiche.</p></article>
          </section>


          <section className="my-8 rounded-3xl border border-violet-300/30 bg-gradient-to-r from-violet-950/70 via-slate-900 to-cyan-950/70 p-6 shadow-xl sm:p-8">
            <p className="text-xs font-black tracking-[.35em] text-violet-200">IL COLLEGAMENTO TRA I DUE MONDI</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">THE ALIEN BRIDGE</h2>
            <p className="mt-3 max-w-3xl leading-7 text-slate-300">Dal cielo antico ai misteri moderni: attraversa il ponte narrativo che collega Orione, Giza e il mondo Maya ai CropCircles e ai fenomeni OVNI. Un percorso tra storia, documenti, ipotesi e fantascienza, con le fonti sempre distinte dalle interpretazioni.</p>
            <Link href="/rs-ovni-ufo" className="mt-6 inline-flex rounded-full border border-cyan-200/50 bg-cyan-300/10 px-6 py-3 font-bold text-cyan-100 hover:bg-cyan-300/20">Attraversa THE ALIEN BRIDGE → RS OVNI UFO</Link>
          </section>

          <div className="mb-10 rounded-2xl border border-amber-300/30 bg-amber-200/5 p-5 text-sm leading-6 text-amber-100"><strong>Una distinzione importante:</strong> le piramidi egizie e Maya sono opere delle rispettive civiltà umane. I collegamenti con gli alieni appartengono al mito moderno e alla fantascienza: l’app li propone come racconto immersivo, senza presentarli come fatti provati.</div>
          <footer className="pb-8"><Link href="/park" className="text-cyan-200 underline">← Torna a RiverSpend Park</Link></footer>
        </div>
      </div>
    </main>
  );
}
