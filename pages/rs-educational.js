import Link from 'next/link';

const lessons = [
  ['📞','Chiamare i soccorsi','Quali informazioni preparare per comunicare con chiarezza agli operatori.'],
  ['🩹','Primo soccorso','Nozioni introduttive da fonti sanitarie ufficiali, con revisione di professionisti qualificati.'],
  ['🌍','Terremoti e maremoti','Preparazione, comportamenti di sicurezza e indicazioni delle autorità.'],
  ['🔥','Incendi e fumo','Prevenzione, vie di fuga e quando allontanarsi e chiedere aiuto.'],
  ['🌧️','Alluvioni e meteo estremo','Prepararsi a piogge intense, vento, caldo e freddo.'],
  ['🚗','Incidenti stradali','Proteggere la propria sicurezza e attivare i soccorsi.'],
  ['🏠','Emergenze domestiche','Blackout, kit essenziale e rischi in casa.'],
  ['🤝','Persone vulnerabili','Preparazione e supporto per bambini, anziani e persone con disabilità.']
];

export default function RSEducational() {
  return (
    <main className="min-h-screen bg-[#f7fafc] text-slate-900">
      <header className="bg-gradient-to-br from-[#082c3a] via-[#07566a] to-[#0e7490] px-5 py-16 text-white sm:px-8 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <Link href="/ecosistema" className="text-sm font-semibold text-cyan-100 underline">← Ecosistema RiverSpend</Link>
          <p className="mt-10 text-xs font-black uppercase tracking-[.35em] text-amber-200">RiverSpend • Imparare per proteggersi</p>
          <h1 className="mt-4 text-5xl font-black sm:text-7xl">RS<span className="text-cyan-200">Educational</span></h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-cyan-50">Conoscere i rischi, prepararsi con responsabilità e sapere come chiedere aiuto. Guide semplici, accessibili e basate su fonti affidabili.</p>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
        <h2 className="text-3xl font-black">Imparare, prevenire, aiutare</h2>
        <p className="mt-3 max-w-3xl leading-7 text-slate-600">Queste sono le aree didattiche previste per il progetto. I moduli pratici saranno pubblicati solo dopo verifica delle fonti e revisione da parte di professionisti qualificati.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map(([icon,title,description]) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><span className="text-3xl">{icon}</span><h3 className="mt-3 text-xl font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p><p className="mt-4 text-xs font-bold uppercase tracking-wider text-teal-700">Modulo in preparazione</p></article>)}
        </div>
        <div className="mt-10 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-950">
          <h2 className="text-lg font-black">⚠️ In caso di emergenza</h2>
          <p className="mt-2 text-sm leading-6">Se c'è un pericolo immediato, in Italia chiama il 112 dove operativo o il numero di emergenza locale. Non aspettare di consultare RiverSpend. Segui sempre le indicazioni degli operatori e delle autorità competenti.</p>
        </div>
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600">
          <strong className="text-slate-900">Nota di sicurezza:</strong> RSEducational è un progetto informativo in preparazione. Non è un servizio di soccorso, non sostituisce corsi certificati, personale sanitario o istruzioni ufficiali. Ogni guida dovrà indicare fonte, territorio e data di revisione.
        </div>
        <Link href="/rs-dizionario" className="mt-8 inline-flex rounded-full bg-teal-700 px-6 py-3 font-bold text-white hover:bg-teal-800">Scopri RSDizionario →</Link>
      </section>
    </main>
  );
}
