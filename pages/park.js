import Link from 'next/link';

const attrazioni = [
  ['RiverStorm','Acqua e avventura','Un percorso scenografico tra rapide, spruzzi e scenografie fluviali.'],
  ['Volcano Escape','Avventura indoor','Missione immersiva tra ambientazioni vulcaniche, effetti e passaggi dinamici.'],
  ['SkyRocket','Adrenalina','Attrazione panoramica ad alta velocità, da progettare con standard certificati.'],
  ['RiverRacer','Acqua e competizione','Sfida su corsie parallele in un percorso d’acqua.'],
  ['Dark River','Dark ride','Viaggio narrativo nelle profondità del fiume, tra luci e scenografie.'],
  ['Lost Temple','Avventura','Esplorazione di un tempio perduto con effetti scenici e misteri.'],
  ['Pirate River','Famiglie','Avventura fluviale a tema pirati.'],
  ['Dragon Flight','Volo e fantasia','Esperienza a tema draghi con vista sul parco.'],
  ['Ice Mountain','Montagna e ghiaccio','Percorso immersivo in un paesaggio glaciale.'],
  ['Avalanche','Adrenalina','Discesa tematizzata tra scenografie di montagna.'],
  ['Canyon Run','Adrenalina','Percorso dinamico ambientato in un canyon.'],
  ['SkyWalk','Panoramica','Camminamento sopraelevato con punti di osservazione.'],
  ['River Rafting Extreme','Acqua e avventura','Discesa su gommoni in un corso d’acqua tematizzato.'],
  ['Water Cannon Battle','Interattiva','Battaglia d’acqua tra postazioni e imbarcazioni.'],
  ['Jungle Splash','Famiglie e acqua','Percorso acquatico nella giungla con finale splash.'],
  ['Robot Factory','Futuristico','Viaggio interattivo in una fabbrica di robot.'],
  ['Cyber River','Futuristico','Esperienza digitale immersiva lungo un fiume tecnologico.'],
  ['Moon Mission','Spazio','Missione spaziale ambientata sulla Luna.'],
  ['Mars Explorer','Spazio','Esplorazione scenografica del pianeta rosso.'],
  ['Time Machine','Viaggio nel tempo','Percorso attraverso epoche e ambientazioni differenti.'],
  ['RiverSpend Infinity','Icona del parco','Esperienza simbolo che unisce scenografia, tecnologia e panorama.'],
  ['The Minator','Miniera','Carrelli da miniera in un percorso tematizzato.'],
  ['Velocity – The Power of Speed','Velocità','Attrazione ad alta velocità con identità originale RiverSpend.'],
  ['Viking Norway Rune','Avventura nordica','Esperienza ispirata a rune e paesaggi norreni.'],
  ['Future City','Esperienza digitale','Città futuristica animata con nuvole in movimento e droni.'],
  ['WW2 Battle Experience','Storia immersiva','Percorso narrativo in nove tappe: sbarco su Omaha Beach, villaggio, ponte, tunnel U-Boot, hangar Zeppelin, portaerei, battaglia aerea e atterraggio finale.']
];

export default function RiverSpendPark() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <Link href="/ecosistema" className="text-teal-300 underline">← Ecosistema RiverSpend</Link>
        <header className="mt-6 overflow-hidden rounded-3xl border border-teal-800 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-950 p-6 sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-teal-300">RiverSpend • Il parco</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">🎢 RiverSpend Park</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">Un mondo di acqua, avventura, velocità, fantasia e tecnologia. Questa è la raccolta iniziale delle attrazioni da sviluppare con schede, immagini, planimetria e requisiti tecnici.</p>

        <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Galleria RiverSpend Park">
          <figure className="overflow-hidden rounded-2xl border border-teal-800 bg-slate-900">
            <img src="https://raw.githubusercontent.com/5lordmaul5-del/RiverSpend/main/file_00000000070081f4be8d351d407b4017.png" alt="Concept panoramico di RiverSpend Park" className="aspect-[4/3] w-full object-cover" loading="lazy" />
            <figcaption className="p-3 text-sm font-semibold text-teal-100">Il mondo RiverSpend Park</figcaption>
          </figure>
          <figure className="overflow-hidden rounded-2xl border border-teal-800 bg-slate-900">
            <img src="https://raw.githubusercontent.com/5lordmaul5-del/RiverSpend/main/file_0000000017408243a1a21bd3fec53f5f.png" alt="Concept di attrazioni e ambientazioni RiverSpend" className="aspect-[4/3] w-full object-cover" loading="lazy" />
            <figcaption className="p-3 text-sm font-semibold text-teal-100">Attrazioni e avventura</figcaption>
          </figure>
          <figure className="overflow-hidden rounded-2xl border border-teal-800 bg-slate-900 sm:col-span-2 lg:col-span-1">
            <img src="https://raw.githubusercontent.com/5lordmaul5-del/RiverSpend/main/file_00000000db008246926cc5b0d85ffd53.png" alt="Concept di esperienze e aree tematiche RiverSpend" className="aspect-[4/3] w-full object-cover" loading="lazy" />
            <figcaption className="p-3 text-sm font-semibold text-teal-100">Esperienze da scoprire</figcaption>
          </figure>
        </section>
        <p className="mt-4 rounded-xl border border-cyan-900 bg-cyan-950/50 p-4 text-sm leading-6 text-cyan-100">Questa è la galleria iniziale del progetto. Aggiungeremo progressivamente una foto dedicata a ogni attrazione, mantenendo i nomi ufficiali e senza sostituire l'elenco già approvato.</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full border border-teal-700 px-4 py-2 text-sm text-teal-100">25 attrazioni in catalogo</span>
            <span className="rounded-full border border-teal-700 px-4 py-2 text-sm text-teal-100">Power Shield • sicurezza prioritaria</span>
          </div>
        </header>

        <section className="my-8 rounded-2xl border border-amber-800 bg-amber-950/40 p-5">
          <h2 className="text-xl font-bold text-amber-100">🛡️ Power Shield — principio di progettazione</h2>
          <p className="mt-2 leading-7 text-amber-50/90">Ogni attrazione dovrà avere valutazione dei rischi, progettazione e collaudo da professionisti abilitati, procedure operative, manutenzione documentata, vie di esodo, accessibilità, gestione meteo e piano di emergenza. Questa pagina è un catalogo concettuale: non costituisce certificazione né autorizzazione all’esercizio.</p>
        </section>

        <section className="my-8 overflow-hidden rounded-3xl border border-red-900/60 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-red-300">Nuova esperienza RiverSpend Park</p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">🪖 WW2 Battle Experience</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Un viaggio immersivo nella memoria della Seconda guerra mondiale, costruito come percorso scenografico e narrativo. L'obiettivo è raccontare gli eventi e il costo umano della guerra, con un finale dedicato alla memoria e alla pace.</p>
            </div>
            <span className="rounded-full border border-red-800 px-4 py-2 text-xs font-bold text-red-200">9 tappe</span>
          </div>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-700 bg-slate-950 p-3">
            <svg viewBox="0 0 1000 520" className="min-w-[760px] w-full" role="img" aria-label="Piantina schematica del percorso WW2 Battle Experience">
              <defs>
                <linearGradient id="ww2sea" x1="0" x2="1"><stop offset="0" stopColor="#123b52"/><stop offset="1" stopColor="#1e6070"/></linearGradient>
                <linearGradient id="ww2land" x1="0" x2="1"><stop offset="0" stopColor="#4b5563"/><stop offset="1" stopColor="#374151"/></linearGradient>
              </defs>
              <rect width="1000" height="520" rx="28" fill="#0f172a"/>
              <path d="M0 0H250C205 70 220 130 170 185C125 235 150 315 90 380C55 420 45 470 0 520Z" fill="url(#ww2sea)"/>
              <path d="M220 0H1000V520H70C150 450 125 400 190 345C255 290 220 230 275 175C330 120 255 70 220 0Z" fill="url(#ww2land)"/>
              <path d="M165 445 C245 380 250 315 315 280 S420 210 475 235 S560 330 625 285 S690 165 760 205 S825 315 900 250" fill="none" stroke="#ef4444" strokeWidth="10" strokeLinecap="round"/>
              <path d="M165 445 C245 380 250 315 315 280 S420 210 475 235 S560 330 625 285 S690 165 760 205 S825 315 900 250" fill="none" stroke="#fbbf24" strokeWidth="3" strokeDasharray="14 12"/>
              <g fontFamily="Arial, sans-serif" fontWeight="700" textAnchor="middle">
                <g><circle cx="150" cy="445" r="27" fill="#991b1b"/><text x="150" y="452" fontSize="22" fill="white">1</text><text x="150" y="490" fontSize="17" fill="white">OMAHA BEACH</text></g>
                <g><circle cx="245" cy="365" r="27" fill="#991b1b"/><text x="245" y="372" fontSize="22" fill="white">2</text><text x="245" y="405" fontSize="17" fill="white">DIFESE</text></g>
                <g><circle cx="330" cy="280" r="27" fill="#991b1b"/><text x="330" y="287" fontSize="22" fill="white">3</text><text x="330" y="320" fontSize="17" fill="white">VILLAGGIO</text></g>
                <g><circle cx="470" cy="235" r="27" fill="#991b1b"/><text x="470" y="242" fontSize="22" fill="white">4</text><text x="470" y="195" fontSize="17" fill="white">PONTE</text></g>
                <g><circle cx="625" cy="285" r="27" fill="#991b1b"/><text x="625" y="292" fontSize="22" fill="white">5</text><text x="625" y="325" fontSize="17" fill="white">TUNNEL U-BOOT</text></g>
                <g><circle cx="690" cy="165" r="27" fill="#991b1b"/><text x="690" y="172" fontSize="22" fill="white">6</text><text x="690" y="125" fontSize="17" fill="white">HANGAR ZEPPELIN</text></g>
                <g><circle cx="760" cy="205" r="27" fill="#991b1b"/><text x="760" y="212" fontSize="22" fill="white">7</text><text x="760" y="165" fontSize="17" fill="white">PORTAEREI</text></g>
                <g><circle cx="825" cy="315" r="27" fill="#991b1b"/><text x="825" y="322" fontSize="22" fill="white">8</text><text x="825" y="355" fontSize="17" fill="white">BATTAGLIA AEREA</text></g>
                <g><circle cx="900" cy="250" r="27" fill="#991b1b"/><text x="900" y="257" fontSize="22" fill="white">9</text><text x="900" y="290" fontSize="17" fill="white">AEROPORTO</text></g>
              </g>
              <g fontFamily="Arial, sans-serif" fontSize="14" fill="#cbd5e1"><text x="35" y="35">PIANTINA SCHEMATICA • NON IN SCALA</text><text x="35" y="55">Percorso principale</text></g>
            </svg>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4"><strong>🌊 1–2 · Sbarco</strong><p className="mt-1 text-sm text-slate-400">Imbarcazioni scenografiche e arrivo sulla spiaggia tematizzata.</p></div>
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4"><strong>🏚️ 3–6 · Avanzata</strong><p className="mt-1 text-sm text-slate-400">Villaggio, ponte, tunnel U-Boot e grande hangar Zeppelin.</p></div>
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4"><strong>✈️ 7–9 · Missione finale</strong><p className="mt-1 text-sm text-slate-400">Portaerei tematizzata, simulazione aerea e arrivo all'aeroporto.</p></div>
          </div>
          <div className="mt-4 rounded-xl border border-amber-800 bg-amber-950/30 p-4 text-sm leading-6 text-amber-100">🛡️ <strong>Power Shield:</strong> ogni effetto di suono, luce, movimento, acqua, fumo o simulazione dovrà essere progettato e validato da professionisti qualificati, con vie di esodo indipendenti, arresto di emergenza, accessibilità e procedure operative.</div>
        </section>

        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-2xl font-bold">Le attrazioni</h2>
          <span className="text-sm text-slate-400">{attrazioni.length} schede</span>
        </div>
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {attrazioni.map(([nome,tema,descrizione],i) => (
            <article key={nome} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-teal-950 px-3 py-1 text-xs font-bold text-teal-200">#{String(i+1).padStart(2,'0')}</span>
                <span className="text-xs text-slate-400">{tema}</span>
              </div>
              <h3 className="mt-4 text-xl font-bold">{nome}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{descrizione}</p>
              <p className="mt-4 border-t border-slate-800 pt-3 text-xs font-semibold text-amber-200">Scheda tecnica e immagini: da completare</p>
            </article>
          ))}
        </section>

        <footer className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="rounded-xl bg-teal-500 px-5 py-3 font-bold text-slate-950">RiverSpendShop</Link>
          <Link href="/ecosistema" className="rounded-xl border border-teal-800 px-5 py-3 font-semibold text-teal-100">Tutto l’ecosistema</Link>
        </footer>
      </div>
    </main>
  );
}
