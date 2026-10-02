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
  ['Future City','Esperienza digitale','Città futuristica animata con nuvole in movimento e droni.']
];

export default function RiverSpendPark() {
  return (
    <main className="min-h-screen bg-white px-4 py-8 text-slate-800">
      <div className="mx-auto max-w-6xl">
        <Link href="/ecosistema" className="text-slate-600 underline">← Ecosistema RiverSpend</Link>
        <header className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-teal-300">RiverSpend • Il parco</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">🎢 RiverSpend Park</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">Un mondo di acqua, avventura, velocità, fantasia e tecnologia. Questa è la raccolta iniziale delle attrazioni da sviluppare con schede, immagini, planimetria e requisiti tecnici.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700">25 attrazioni in catalogo</span>
            <span className="rounded-full border border-teal-700 px-4 py-2 text-sm text-teal-100">Power Shield • sicurezza prioritaria</span>
          </div>
        </header>

        <section className="my-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-xl font-bold text-slate-800">🛡️ Power Shield — principio di progettazione</h2>
          <p className="mt-2 leading-7 text-slate-600">Ogni attrazione dovrà avere valutazione dei rischi, progettazione e collaudo da professionisti abilitati, procedure operative, manutenzione documentata, vie di esodo, accessibilità, gestione meteo e piano di emergenza. Questa pagina è un catalogo concettuale: non costituisce certificazione né autorizzazione all’esercizio.</p>
        </section>

        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-2xl font-bold">Le attrazioni</h2>
          <span className="text-sm text-slate-500">{attrazioni.length} schede</span>
        </div>
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {attrazioni.map(([nome,tema,descrizione],i) => (
            <article key={nome} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">#{String(i+1).padStart(2,'0')}</span>
                <span className="text-xs text-slate-400">{tema}</span>
              </div>
              <h3 className="mt-4 text-xl font-bold">{nome}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{descrizione}</p>
              <p className="mt-4 border-t border-slate-200 pt-3 text-xs font-semibold text-slate-500">Scheda tecnica e immagini: da completare</p>
            </article>
          ))}
        </section>

        <footer className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-800">RiverSpendShop</Link>
          <Link href="/ecosistema" className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700">Tutto l’ecosistema</Link>
        </footer>
      </div>
    </main>
  );
}
