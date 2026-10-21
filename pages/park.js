import Link from 'next/link';

const kidsWaterPark = [
  ['Megalondontе','Scivolo acquatico tematizzato','Un grande percorso d’acqua con tunnel, curve e una scenografia ispirata al megalodonte. Concept in sviluppo.'],
  ['Tsunami Wave','Onda e acqua','Un’esperienza acquatica ispirata alla forza delle onde, da definire nel progetto tecnico.'],
  ['Octopus','Attrazione acquatica a tema marino','Un’area scenografica con tentacoli, spruzzi e giochi d’acqua. Concept in sviluppo.'],
  ['River Rapidi','Rafting per gruppi','Discesa su gommoni tra rapide, cascate e curve scenografiche. Concept in sviluppo.'],
  ['Leviatan','Grande attrazione acquatica','Un’avventura acquatica ispirata a una creatura leggendaria. Concept in sviluppo.'],
  ['Whale','Esperienza marina per famiglie','Un’ambientazione con balena e giochi d’acqua pensata per il divertimento in famiglia. Concept in sviluppo.'],
  ['Manta','Scivolata acquatica panoramica','Un percorso ispirato al movimento della manta, con curve e spruzzi. Concept in sviluppo.'],
  ['Orca','Avventura marina','Un’esperienza tematizzata sull’orca, con scenografia oceanica e giochi d’acqua. Concept in sviluppo.'],
  ['Trichechi','Area marina per famiglie','Un’ambientazione giocosa con trichechi e attività d’acqua. Concept in sviluppo.'],
  ['FreeFall','Discesa adrenalinica','Un concept di discesa ripida; altezza, velocità e accesso saranno definiti e verificati da progettisti qualificati.'],
  ['RiverFlow','Percorso d’acqua rilassante','Un percorso acquatico continuo per godersi il fiume e la tematizzazione del parco. Concept in sviluppo.'],
];

const attrazioni = [
  ['RiverStorm','Acqua e avventura','Segui il corso del fiume tra rapide, spruzzi e passaggi scenografici. RiverStorm è pensata come un’avventura d’acqua da vivere in gruppo, con cambi di ritmo, scorci naturali e momenti sorprendenti. Il percorso e le caratteristiche operative saranno definiti nella fase di progettazione tecnica.'],
  ['Volcano Escape','Avventura indoor','Entra in un mondo vulcanico tra rocce, bagliori di lava scenografica, fumo controllato ed effetti luminosi. Volcano Escape propone una missione immersiva attraverso ambientazioni sotterranee e passaggi narrativi, con sorprese lungo il percorso. Gli effetti reali e le modalità di partecipazione saranno stabiliti dal progetto definitivo e dalle verifiche di sicurezza.'],
  ['SkyRocket','Adrenalina e panorama','Preparati a guardare il parco da una prospettiva completamente diversa. SkyRocket è il concept di un’attrazione ad alta velocità con salita panoramica e discesa emozionante. Altezza, velocità, limiti di accesso e funzionamento non sono ancora specifiche certificate: saranno definiti da progettisti e fornitori specializzati.'],
  ['RiverRacer','Acqua e competizione','Sfida amici e familiari in una corsa acquatica su corsie parallele. RiverRacer unisce spirito di squadra, spruzzi e un finale scenografico, con un concept pensato per trasformare una semplice discesa in una gara divertente. La configurazione delle corsie e i requisiti di sicurezza saranno stabiliti nel progetto tecnico.'],
  ['Dark River','Dark ride immersiva','Lasciati guidare nelle profondità di un fiume misterioso, tra scenografie, giochi di luce, suoni e ambientazioni narrative. Dark River è un viaggio che alterna momenti di calma a sorprese visive, creando un’avventura da scoprire a ogni curva. Il percorso descritto è concettuale e dovrà essere sviluppato e validato tecnicamente.'],
  ['Lost Temple','Esplorazione e mistero','Attraversa un antico tempio nascosto tra vegetazione, pietre monumentali e passaggi segreti. Lost Temple propone una spedizione scenografica ricca di enigmi visivi, luci e ambientazioni da esplorare, per chi ama l’avventura e la scoperta. Gli eventuali elementi mobili o effetti speciali saranno progettati con adeguati sistemi di sicurezza.'],
  ['Pirate River','Avventura per famiglie','Salpa per un viaggio tra approdi dei pirati, ponti, grotte e tesori nascosti. Pirate River è pensata come un’avventura fluviale condivisa, con scenografie a tema e piccoli colpi di scena lungo il tragitto. Imbarcazioni, capienza, accessibilità e modalità d’imbarco saranno definite soltanto dopo la progettazione e le verifiche tecniche.'],
  ['Dragon Flight','Volo e fantasia','Entra nel regno dei draghi e attraversa scenari fantastici tra montagne, castelli e luci spettacolari. Dragon Flight immagina un’esperienza panoramica che unisce il senso del volo alla narrazione fantasy. La tipologia effettiva dell’attrazione, i movimenti e i limiti di accesso dovranno essere stabiliti da professionisti qualificati.'],
  ['Ice Mountain','Montagna e ghiaccio','Esplora una montagna immaginaria di ghiaccio tra grotte scintillanti, cristalli, ponti e paesaggi innevati. Ice Mountain punta su un’atmosfera immersiva fatta di scenografie, illuminazione e suoni, con un percorso da scoprire insieme. Temperatura, superfici, accessi e ogni eventuale elemento mobile dovranno rispettare il progetto tecnico e gli standard applicabili.'],
  ['Avalanche','Discesa tra le montagne','Preparati a un’avventura ispirata alla forza della montagna, con curve scenografiche, gole rocciose e un finale travolgente. Avalanche è un concept dedicato a chi ama le ambientazioni alpine e le emozioni dinamiche. Non sono dichiarate velocità o prestazioni certificate: ogni dato sarà pubblicato solo dopo la definizione e la validazione del progetto.'],
  ['Canyon Run','Avventura nel canyon','Attraversa un canyon immaginario tra pareti rocciose, ponti, gole e scorci spettacolari. Canyon Run è concepita come un percorso dinamico che alterna tratti suggestivi e momenti di sorpresa. La forma definitiva, i sistemi di trasporto e le regole di partecipazione saranno definiti nella progettazione dell’attrazione.'],
  ['SkyWalk','Panorama e scoperta','Scopri RiverSpend Park da un camminamento panoramico sopraelevato, con punti di osservazione e scorci dedicati alle diverse aree tematiche. SkyWalk è pensato per una visita più tranquilla, per fermarsi a osservare il parco e scattare fotografie. Percorso, parapetti, accessibilità e capienza dovranno essere verificati nel progetto definitivo.'],
  ['River Rafting Extreme','Acqua e avventura','Affronta una discesa su gommoni attraverso un fiume tematizzato, tra rapide simulate, spruzzi e scenografie naturali. River Rafting Extreme vuole offrire un’esperienza condivisa, nella quale il tragitto diventa parte dell’avventura. Portata dell’acqua, imbarcazioni, protezioni e condizioni di accesso dovranno essere stabilite da progettisti specializzati.'],
  ['Water Cannon Battle','Gioco interattivo','Prendi parte a una battaglia d’acqua giocosa tra postazioni e imbarcazioni tematizzate. Water Cannon Battle è pensata per coinvolgere gruppi e famiglie in una sfida divertente, con bersagli scenografici e momenti di interazione. Pressione, distanze, protezioni e regole d’utilizzo saranno valutate nel progetto tecnico per garantire un’esperienza controllata.'],
  ['Jungle Splash','Giungla e divertimento acquatico','Entra in una giungla rigogliosa tra piante scenografiche, animali fantastici, cascate e giochi d’acqua. Jungle Splash immagina un percorso colorato e coinvolgente, adatto a essere vissuto con amici e famiglia, con un finale pieno di spruzzi. Requisiti di età, altezza e accesso saranno definiti dopo la progettazione e i collaudi.'],
  ['Robot Factory','Mondo futuristico','Entra in una fabbrica futuristica popolata da robot, macchinari scenografici e pannelli luminosi. Robot Factory propone un viaggio interattivo in cui scoprire una città tecnologica attraverso ambientazioni e piccoli compiti narrativi. Qualsiasi elemento interattivo sarà progettato per un uso chiaro e sicuro, con procedure e limiti definiti prima dell’apertura.'],
  ['Cyber River','Fiume digitale','Un viaggio lungo un fiume del futuro, dove acqua, luci e scenografie tecnologiche si incontrano. Cyber River immagina ambienti digitali, effetti visivi e una storia che accompagna i visitatori attraverso un mondo in trasformazione. Gli effetti e le tecnologie definitive saranno selezionati in base a fattibilità, accessibilità e sicurezza.'],
  ['Moon Mission','Missione spaziale','Preparati a una missione immaginaria sulla Luna tra basi spaziali, crateri, rover e paesaggi extraterrestri. Moon Mission è un’esperienza tematica dedicata alla curiosità e all’esplorazione, con scenografie e racconto immersivo. Eventuali simulatori o movimenti saranno specificati solo dopo la progettazione e le verifiche tecniche.'],
  ['Mars Explorer','Esplorazione del pianeta rosso','Parti alla scoperta di Marte tra canyon rossi, moduli di ricerca e panorami ispirati allo spazio. Mars Explorer vuole far vivere ai visitatori una spedizione fantastica attraverso un ambiente alieno, con effetti scenici e tappe narrative. Le attività effettive e le eventuali componenti interattive saranno definite nel progetto finale.'],
  ['Time Machine','Viaggio nel tempo','Attraversa epoche differenti in un’unica esperienza narrativa: dalla preistoria alle civiltà antiche, fino a città contemporanee e scenari futuristici. Time Machine è pensata per unire scoperta, fantasia e ambientazioni sorprendenti. La successione delle scene e la tecnologia di trasporto saranno precisate quando il concept sarà sviluppato tecnicamente.'],
  ['RiverSpend Infinity','L’icona del parco','RiverSpend Infinity rappresenta l’esperienza simbolo del parco: un incontro tra acqua, paesaggio, luce e tecnologia. Il concept punta a creare un momento memorabile, riconoscibile e capace di riunire le diverse anime di RiverSpend Park. Forma, capienza, funzionamento e requisiti di sicurezza restano da definire attraverso una progettazione professionale.'],
  ['The Minator','Avventura nella miniera','Scendi nel mondo di una miniera leggendaria tra gallerie, cristalli, rocce e riflessi dorati. The Minator propone un percorso a tema estrattivo con scenografie che raccontano la ricerca di minerali e tesori nascosti. Strutture, veicoli, illuminazione e percorsi di evacuazione dovranno essere progettati e collaudati prima dell’eventuale esercizio.'],
  ['Viking Norway Rune','Leggende nordiche','Entra in un paesaggio ispirato alla mitologia nordica, tra rune, villaggi vichinghi, montagne e simboli leggendari. Viking Norway Rune è un’avventura narrativa che celebra esplorazione e immaginazione, con scenografie pensate per trasportare il visitatore in un altro mondo. Gli eventuali elementi dinamici saranno specificati solo dopo le verifiche tecniche.'],
  ['Future City','La città del futuro','Scopri una città futuristica animata da architetture luminose, nuvole in movimento e droni scenografici. Future City racconta un possibile domani attraverso ambienti digitali e installazioni visive, invitando a esplorare il rapporto tra tecnologia, città e immaginazione. Animazioni e dispositivi reali saranno selezionati e verificati nella fase di realizzazione.'],
  ['WW2 Battle Experience','Storia immersiva e memoria','Un percorso narrativo in nove tappe dedicato alla memoria della Seconda guerra mondiale: sbarco scenografico su Omaha Beach, villaggio, ponte, tunnel U-Boot, hangar Zeppelin, portaerei, battaglia aerea simulata e arrivo finale. L’esperienza dovrà raccontare il contesto storico con rispetto e attenzione alle vittime, evitando di glorificare la guerra. Ogni suono, luce, movimento o simulazione dovrà essere progettato e validato da professionisti qualificati, con procedure di emergenza e accessibilità.'],
  ['Megalodonte','Lo scivolo che ti ingoia nel divertimento','Un enorme squalo preistorico domina una montagna acquatica. Il concept accompagna i visitatori dalla partenza alla discesa, passando per curve, sezioni trasparenti e tunnel scenografici, fino a un ingresso a forma di bocca e a un finale pieno di spruzzi. La sequenza narrativa comprende La Partenza, La Discesa, L’Incontro, Nella Bocca, Il Tunnel e Il Gran Finale. Tracciato, portata, capienza e sistemi di protezione saranno definiti da specialisti e verificati prima dell’apertura.'],
  ['Valkiria','La corsa verso il Valhalla','Un’avventura ispirata alle leggende nordiche, tra montagne, cascate, statue vichinghe e curve mozzafiato. Valkiria è un concept adrenalinico che trasforma il viaggio in una saga fantastica. Eventuali dati come altezza, velocità e requisiti minimi non sono da considerare certificati e dovranno essere confermati dal progetto tecnico e dal fornitore.'],
  ['Dragon Ride','Il risveglio del drago','Un viaggio epico tra draghi leggendari, paesaggi fantastici e avventure spettacolari, dove fantasia e adrenalina si incontrano. Il percorso immagina grotte, castelli e scenografie luminose che accompagnano i visitatori in una storia di scoperta. Tipologia di attrazione, movimenti e condizioni di accesso saranno definiti nella progettazione finale.'],
  ['TimeCars','Il viaggio delle auto parlanti','Un percorso divertente attraverso epoche e scenari fantastici, con auto interattive e sorprese per tutta la famiglia. TimeCars unisce una storia semplice da seguire a scenografie che cambiano nel tempo, offrendo un’esperienza pensata per essere condivisa. Modalità di guida o movimento, capienza e accessibilità dovranno essere precisate nel progetto tecnico.'],
  ['FlipFly','Il volo degli amici','Mongolfiere colorate, animali fantastici e un mondo di meraviglie per i piccoli visitatori e le loro famiglie. FlipFly immagina un’esperienza allegra e panoramica, con scenografie morbide e un racconto pieno di fantasia. L’eventuale movimento dell’attrazione, i limiti di accesso e la supervisione richiesta saranno definiti da professionisti qualificati.'],
  ['DragonFly','Il volo del drago','Un’avventura tra acqua, montagne e scenari luminosi, pensata per far vivere la sensazione di volare in un mondo fantastico. DragonFly accompagna i visitatori in un viaggio immaginario dove il drago diventa guida e compagno d’esplorazione. Configurazione, movimenti e requisiti di partecipazione saranno stabiliti nella fase di progettazione e collaudo.'],
  ['Il Draghetto Volante','Il parco delle meraviglie','Un mondo colorato con creature simpatiche, giochi e avventure per i più piccoli, dove immaginazione e divertimento si incontrano. Il Draghetto Volante è pensato come un’esperienza familiare e accogliente, con scenografie fantastiche e una storia facile da seguire. Età consigliata, altezza minima e modalità di accompagnamento saranno definite in base all’attrazione effettivamente realizzata.'],
  ['Monster Vulcan','Nel cuore della Terra','Avventurati tra vulcani, dinosauri, miniere di diamanti, cristalli e lava scenografica. Monster Vulcan immagina un viaggio sotterraneo in un mondo primordiale, con grandi creature e paesaggi spettacolari che accompagnano il racconto. Ogni effetto scenico e ogni eventuale componente mobile dovrà essere progettata, testata e gestita secondo le norme applicabili.'],
  ['RiverSpend Waterpark','Acqua, scivoli e relax','Un’area acquatica immaginata per diverse età e livelli di avventura, con scivoli, piscine, zone gioco e spazi relax. RiverSpend Waterpark vuole combinare divertimento e momenti di riposo in un ambiente riconoscibile e curato. Profondità, sorveglianza, accessi, qualità dell’acqua e procedure di emergenza dovranno essere definiti e controllati da professionisti prima dell’apertura.'],
  ['Crop Circles','Misteri tra Terra e universo','Un viaggio fantascientifico tra UFO, campi misteriosi, galassie e dimensioni parallele. Crop Circles immagina ambientazioni sorprendenti e una storia da ricostruire attraversando installazioni luminose e scenografie enigmatiche. Gli effetti e le attività definitive saranno scelti in base alla fattibilità tecnica e alle verifiche di sicurezza.'],
  ['Wild West Wood','Avventura nel Far West','Un viaggio nel Far West tra treni, canyon, miniere d’oro e paesaggi da leggenda. Wild West Wood porta i visitatori in un mondo western ricco di scenografie, piccoli misteri e racconti di frontiera. Veicoli, percorsi, capienza e accessibilità saranno definiti nella fase di progettazione dell’esperienza.'],
  ['River 01','Accoglienza e assistenza visitatori','River 01 è il concept di un punto di supporto per orientarsi nel parco: informazioni, indicazioni sui percorsi, accessibilità, assistenza multilingue e aiuto per le esigenze dei visitatori. Il servizio dovrà rendere più semplice trovare attrazioni, servizi e punti di riferimento, con informazioni chiare e aggiornate. Le funzioni effettivamente disponibili saranno definite nell’organizzazione operativa del parco.'],
  ['Universe','Un viaggio tra le galassie','Un’avventura immersiva tra pianeti, stelle e galassie, con effetti scenici e ambientazioni spaziali. Universe invita a esplorare l’universo attraverso scenari fantastici, luci e un racconto che accompagna il visitatore da un mondo all’altro. Le tecnologie e gli eventuali elementi interattivi saranno specificati e verificati durante lo sviluppo.'],
  ['Prehistoric River','Il fiume della preistoria','Naviga in una giungla preistorica tra dinosauri, creature giganti, rapide e scenografie immersive. Prehistoric River combina un ambiente naturale immaginario con incontri spettacolari e un percorso narrativo pensato per incuriosire grandi e piccoli. Tracciato, acqua, imbarcazioni e requisiti di accesso dovranno essere definiti e collaudati da professionisti.'],
  ['Tsunami Wave & Octopus','Onde giganti e polpo gigante','Due concept acquatici collegati: una grande esperienza a onde e un’area di scivoli ispirata a un gigantesco polpo. Tsunami Wave & Octopus vuole offrire un ambiente marino fantastico, con forme scenografiche riconoscibili e aree per differenti livelli di avventura. Dimensioni, profondità, capienza e sistemi di sorveglianza saranno determinati dal progetto tecnico.'],
  ['Zombies Zone','Zona misteriosa','Un’esperienza horror scenografica tra vicoli abbandonati, luci inquietanti, suoni e personaggi di fantasia. Zombies Zone punta su suspense e narrazione, non su pericoli reali, con un percorso progettato per accompagnare il visitatore tra scene e sorprese. Livello d’intensità, accessibilità e avvertenze per il pubblico saranno comunicati chiaramente.'],
  ['The Crypt','Il mistero della cripta','Esplora una cripta immaginaria tra antiche pietre, simboli, corridoi e segreti da scoprire. The Crypt è un’esperienza narrativa basata su atmosfera, luci e suoni, pensata per chi ama il mistero. Percorso, illuminazione di emergenza, uscite e gestione dei flussi dovranno essere parte essenziale del progetto tecnico.'],
  ['River Rapids','Le rapide del grande fiume','Affronta un percorso d’acqua tra curve, spruzzi, cascate e scenografie naturali. River Rapids è pensata per un’avventura condivisa, in cui il movimento del fiume accompagna i visitatori verso un finale spettacolare. Portata, gommoni, capienza, protezioni e limiti di partecipazione dovranno essere verificati e certificati prima dell’apertura.'],
  ['WWII Air Combat Coaster','La missione nei cieli della storia','Un concept ispirato agli aerei storici della Seconda guerra mondiale, con veicoli tematizzati, scenografie e audio immersivo. L’obiettivo è raccontare un contesto storico attraverso un’esperienza spettacolare e rispettosa della memoria, senza glorificare il conflitto. Tracciato, movimenti, effetti e requisiti di accesso saranno stabiliti da progettisti e fornitori specializzati.']
];

const immaginiAttrazioni = [
  "/1000186325.png",
  "/1000186325.png",
  "/1000186326.png",
  "/1000186327.png",
  "/1000186351.png",
  "/1000186352.png",
  "/1000186353.png",
  "/1000186354.png",
  "/1000186355.png",
  "/1000186365.png",
  "/1000186366.png",
  "/1000186367.png",
  "/1000186372.png",
  "/1000186373.png",
  "/1000186381.png",
  "/1000186382.png",
  "/1000186392.png",
  "/1000186393_2.png",
  "/1000186394.png",
  "/1000186395.png",
  "/1000186396.png",
  "/1000186397.png",
  "/1000186398.png",
  "/1000186399.png",
  "/1000186400.png",
  "/1000186402.png",
  "/1000186423.png"
];

export default function RiverSpendPark() {
  return (
    <main className="min-h-screen bg-cyan-50 px-4 py-8 text-slate-800">
      <div className="mx-auto max-w-6xl">
        <Link href="/ecosistema" className="text-teal-800 underline">← Ecosistema RiverSpend</Link>
        <header className="mt-6 overflow-hidden rounded-3xl border border-teal-800 bg-gradient-to-br from-cyan-100 via-cyan-50 to-white p-6 text-slate-800 sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-teal-800">RiverSpend • Il parco</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">🎢 RiverSpend Park</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">Un mondo di acqua, avventura, velocità, fantasia e tecnologia. Questa è la raccolta iniziale delle attrazioni da sviluppare con schede, immagini, planimetria e requisiti tecnici.</p>

        <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Galleria RiverSpend Park">
          <figure className="overflow-hidden rounded-2xl border border-teal-800 bg-slate-900">
            <img src="https://raw.githubusercontent.com/5lordmaul5-del/RiverSpend/main/file_00000000070081f4be8d351d407b4017.png" alt="Manifesto panoramico concept di RiverSpend Park: rapide e cascate, dinosauri, tunnel acquatici, castelli e aree tematiche dal passato al futuro" className="aspect-[4/3] w-full object-cover" loading="lazy" />
            <figcaption className="p-3 text-sm font-semibold text-teal-100">Concept panoramico • Progetto in sviluppo — avventura tra preistoria, civiltà antiche, Medioevo, WWII, spazio, futuro e mondo acquatico. Illustrazione generale del parco, non foto di una singola attrazione.</figcaption>
          </figure>
        </section>
          <figure className="overflow-hidden rounded-2xl border border-amber-400 bg-slate-950 shadow-lg ">
            <img src="https://raw.githubusercontent.com/5lordmaul5-del/RiverSpend/main/public/Screenshot_2026-10-20-20-11-58-215_com.openai.chatgpt-edit.jpg" alt="La famiglia ufficiale di RiverSpendPark: Sylver, Scarlett, Simba, Sofia e Stone" className="w-full h-auto object-contain" loading="lazy" />
            <figcaption className="p-4 text-center text-base font-bold text-amber-200">La famiglia ufficiale di RiverSpendPark — Sylver, Scarlett, Simba, Sofia e Stone</figcaption>
          </figure>

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
        <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Altre immagini di RiverSpend Park">
          <figure className="overflow-hidden rounded-2xl border border-teal-800 bg-slate-900">
            <img src="https://raw.githubusercontent.com/5lordmaul5-del/RiverSpend/main/file_0000000017408243a1a21bd3fec53f5f.png" alt="Concept di attrazioni e ambientazioni RiverSpend" className="aspect-[4/3] w-full object-cover" loading="lazy" />
            <figcaption className="p-3 text-sm font-semibold text-teal-100">Attrazioni e avventura</figcaption>
          </figure>
          <figure className="overflow-hidden rounded-2xl border border-teal-800 bg-slate-900 sm:col-span-2 lg:col-span-1">
            <img src="https://raw.githubusercontent.com/5lordmaul5-del/RiverSpend/main/file_00000000db008246926cc5b0d85ffd53.png" alt="Concept di esperienze e aree tematiche RiverSpend" className="aspect-[4/3] w-full object-cover" loading="lazy" />
            <figcaption className="p-3 text-sm font-semibold text-teal-100">Esperienze da scoprire</figcaption>
          </figure>
        </section>
        <p className="mt-4 rounded-xl border border-cyan-900 bg-cyan-950/50 p-4 text-sm leading-6 text-slate-800 ">Questa è la galleria iniziale del progetto. Aggiungeremo progressivamente una foto dedicata a ogni attrazione, mantenendo i nomi ufficiali e senza sostituire l'elenco già approvato.</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full border border-teal-700 px-4 py-2 text-sm text-teal-800">Catalogo delle attrazioni</span>
            <span className="rounded-full border border-teal-700 px-4 py-2 text-sm text-teal-800">Power Shield • sicurezza prioritaria</span>
          </div>
        </header>

        <section className="my-8 rounded-2xl border border-amber-800 bg-amber-950/40 p-5">
          <h2 className="text-xl font-bold text-amber-100">🛡️ Power Shield — principio di progettazione</h2>
          <p className="mt-2 leading-7 text-amber-50/90">Ogni attrazione dovrà avere valutazione dei rischi, progettazione e collaudo da professionisti abilitati, procedure operative, manutenzione documentata, vie di esodo, accessibilità, gestione meteo e piano di emergenza. Questa pagina è un catalogo concettuale: non costituisce certificazione né autorizzazione all’esercizio.</p>
        </section>



        <section className="my-8 rounded-2xl border border-cyan-300 bg-gradient-to-br from-sky-950 via-blue-950 to-teal-950 p-5 text-white" aria-labelledby="kids-waterpark-title">
          <div className="mb-5">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">Zona Kids / WaterPark</p>
            <h2 id="kids-waterpark-title" className="mt-1 text-2xl font-extrabold">Le 11 attrazioni acquatiche</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-sky-100">Catalogo concettuale in fase di sviluppo. Ogni scheda avrà la propria immagine dedicata, abbinata al nome corretto; le caratteristiche tecniche definitive saranno stabilite da progettisti e fornitori qualificati.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {kidsWaterPark.map(([nome,tema,descrizione],i) => (
              <article key={nome} className="overflow-hidden rounded-2xl border border-cyan-800 bg-slate-950/80 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-cyan-300 px-3 py-1 text-xs font-black text-slate-950">{String(i+1).padStart(2,'0')}</span>
                  <span className="text-xs font-semibold text-cyan-200">{tema}</span>
                </div>
                <h3 className="mt-3 text-lg font-extrabold">{nome}</h3>
                <div className="mt-3 flex aspect-[4/3] items-center justify-center rounded-xl border-2 border-dashed border-cyan-700 bg-slate-900 p-4 text-center text-sm font-semibold text-cyan-200" role="img" aria-label={`Immagine dedicata da inserire per ${nome}`}>Immagine dedicata da associare a<br />{nome}</div>
                <p className="mt-3 text-sm leading-6 text-slate-200">{descrizione}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-2xl font-bold">Le attrazioni</h2>
          <span className="text-sm text-slate-400">{attrazioni.length} schede</span>
        </div>
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {attrazioni.map(([nome,tema,descrizione],i) => (
            <article key={nome} className="rounded-2xl border border-cyan-200 bg-white p-5 text-slate-800 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-teal-950 px-3 py-1 text-xs font-bold text-teal-200">#{String(i+1).padStart(2,'0')}</span>
                <span className="text-xs text-slate-400">{tema}</span>
              </div>
              <h3 className="mt-4 text-xl font-bold">{nome}</h3>
              <div className="mt-4 flex aspect-[4/3] w-full items-center justify-center rounded-xl border-2 border-dashed border-cyan-300 bg-cyan-50 p-4 text-center text-sm font-semibold text-teal-800" role="img" aria-label={`Foto da associare correttamente: ${nome}`}>Foto dedicata da inserire per<br />{nome}</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{descrizione}</p>
              {nome === 'RiverSpeed' && (
                <div className="mt-4 space-y-3 border-t border-cyan-100 pt-4 text-sm leading-6 text-slate-700">
                  <h4 className="font-bold text-slate-800">Cosa ti aspetta</h4>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>Rapide e cascate scenografiche.</li>
                    <li>Tunnel luminosi ed effetti immersivi.</li>
                    <li>Ambientazioni preistoriche, storiche e futuristiche.</li>
                    <li>Un viaggio attraverso mondi fantastici.</li>
                    <li>Un’avventura da vivere in compagnia.</li>
                  </ul>
                  <p><strong>Sicurezza:</strong> accesso, altezza minima, condizioni di partecipazione e modalità d’imbarco saranno definiti in base al progetto tecnico e alle verifiche di sicurezza dell’attrazione.</p>
                  <p className="font-bold text-teal-800">RiverSpend Park — Vivi ogni epoca in un’unica avventura.</p>
                </div>
              )}
            </article>
          ))}
        </section>

        <footer className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="rounded-xl bg-teal-500 px-5 py-3 font-bold text-slate-950">RiverSpendShop</Link>
          <Link href="/ecosistema" className="rounded-xl border border-teal-800 px-5 py-3 font-semibold text-teal-800">Tutto l’ecosistema</Link>
        </footer>
      </div>
    </main>
  );
}
