import Link from 'next/link';

const servizi = {
  local: {
    titolo: 'RS Local',
    icona: '📍',
    descrizione: 'RS Local è il servizio RiverSpend dedicato alle attività del territorio: un punto d’incontro tra persone, negozi, ristoranti e servizi locali.',
    stato: 'Presentazione informativa; cataloghi, ordini e consegne sono da sviluppare'
  },
  tv: {
    titolo: 'RiverSpend TV',
    icona: '📺',
    descrizione: 'Canale RiverSpend per video, presentazioni, storie del marketplace e contenuti del parco.',
    stato: 'Area informativa pronta; pubblicazione video da collegare'
  },
  pay: {
    titolo: 'RiverSpend Pay',
    icona: '💳',
    descrizione: 'Area pagamenti RiverSpend: metodi di pagamento, stato transazioni, rimborsi e storico.',
    stato: 'Integrazione pagamenti da collegare'
  },
  box: {
    titolo: 'RiverSpend Box',
    icona: '📦',
    descrizione: 'La logistica di RiverSpendShop: spedizioni tra privati, tracciamento e ritiro presso punti convenzionati, attraverso operatori da integrare.',
    stato: 'Progettazione del flusso; collegamenti con i corrieri da attivare'
  },
  fidelity: {
    titolo: 'RS Fidelity',
    icona: '💎',
    descrizione: 'Programma fedeltà e vantaggi per la community RiverSpend.',
    stato: 'Base ecosistema pronta'
  },
  park: {
    titolo: 'RiverSpend Park',
    icona: '🎢',
    descrizione: 'Il mondo del parco RiverSpend: attrazioni, esperienze, sicurezza e future aree tematiche.',
    stato: 'Base ecosistema pronta'
  },
  broadcast: {
    titolo: 'RiverSpend Broadcast',
    icona: '📡',
    descrizione: 'Canale di comunicazione RiverSpend per contenuti, aggiornamenti e novità.',
    stato: 'Base ecosistema pronta'
  },
  experience: {
    titolo: 'RiverSpend Experience',
    icona: '🌊',
    descrizione: 'L’esperienza immersiva RiverSpend: atmosfera, identità e future funzioni SurroundSpaceAroundExperience.',
    stato: 'Base ecosistema pronta'
  },
  ecology: {
    titolo: 'RiverSpend Ecology',
    icona: '🌱',
    descrizione: 'Area dedicata a sostenibilità, ambiente e iniziative ecologiche RiverSpend.',
    stato: 'Base ecosistema pronta'
  },
  oracle: {
    titolo: 'RiverSpend Oracle',
    icona: '🔮',
    descrizione: 'Area informativa e futura assistenza intelligente dell’ecosistema.',
    stato: 'Base ecosistema pronta'
  },
  recovery: {
    titolo: 'RiverSpend Recovery',
    icona: '♻️',
    descrizione: 'Gestione recupero, assistenza post-vendita e flussi di supporto.',
    stato: 'Base ecosistema pronta'
  },
  fortress: {
    titolo: 'RiverSpend Fortress',
    icona: '🏰',
    descrizione: 'Area di sicurezza dell’ecosistema con controlli e protezioni avanzate.',
    stato: 'Base ecosistema pronta'
  }
};

export default function Servizio({ slug }) {
  const servizio = servizi[slug];

  if (!servizio) {
    return (
      <main className="min-h-screen bg-[#c9f1f3] px-4 py-8 text-[#173f4a]">
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="text-[#087f9b] underline">← Torna al RiverSpendShop</Link>
          <h1 className="mt-8 text-3xl font-bold">Area non trovata</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#c9f1f3] px-4 py-8 text-[#173f4a]">
      <div className="mx-auto max-w-4xl">
        <Link href="/ecosistema" className="text-[#087f9b] underline">← Ecosistema RiverSpend</Link>

        <section className="mt-6 rounded-3xl border border-[#a8dfe5] bg-gradient-to-br from-white to-[#e8fbfc] p-6 sm:p-10">
          <div className="text-5xl">{servizio.icona}</div>
          <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-[#087f9b]">RiverSpend</p>
          <h1 className="mt-2 text-4xl font-bold">{servizio.titolo}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#496575]">{servizio.descrizione}</p>

          {slug === 'box' && (
            <div className="mt-8 grid gap-4">
              <section className="rounded-2xl border border-[#a8dfe5] bg-white/90 p-5">
                <h2 className="text-xl font-bold text-[#087f9b]">Spedisci tra privati, con RiverSpend</h2>
                <p className="mt-3 leading-7 text-[#496575]">
                  RiverSpend Box è pensato per collegare chi vende su RiverSpendShop con chi acquista,
                  utilizzando operatori di spedizione e punti di ritiro già presenti sul territorio.
                  L’obiettivo è rendere semplice preparare, consegnare e seguire un pacco.
                </p>
              </section>
              <section className="rounded-2xl border border-[#a8dfe5]/80 bg-[#c9f1f3]/50 p-5">
                <h2 className="text-xl font-bold text-[#087f9b]">Come sarà il percorso</h2>
                <ol className="mt-3 grid gap-3 sm:grid-cols-2">
                  <li className="rounded-xl bg-white p-4"><span className="text-2xl">🛍️</span><p className="mt-2 font-semibold text-[#173f4a]">1. Vendita conclusa</p><p className="mt-1 text-sm leading-6 text-[#496575]">Il venditore prepara il pacco dopo l’ordine.</p></li>
                  <li className="rounded-xl bg-white p-4"><span className="text-2xl">📲</span><p className="mt-2 font-semibold text-[#173f4a]">2. Etichetta o QR</p><p className="mt-1 text-sm leading-6 text-[#496575]">Il corriere collegato fornisce l’etichetta o il codice QR valido per la spedizione.</p></li>
                  <li className="rounded-xl bg-white p-4"><span className="text-2xl">📮</span><p className="mt-2 font-semibold text-[#173f4a]">3. Consegna del pacco</p><p className="mt-1 text-sm leading-6 text-[#496575]">Il venditore lo porta al punto previsto o usa il ritiro, se disponibile.</p></li>
                  <li className="rounded-xl bg-white p-4"><span className="text-2xl">📍</span><p className="mt-2 font-semibold text-[#173f4a]">4. Tracking e ricezione</p><p className="mt-1 text-sm leading-6 text-[#496575]">L’acquirente segue la spedizione e, dove previsto, ritira presso un punto abilitato.</p></li>
                </ol>
              </section>
              <section className="rounded-2xl border border-[#a8dfe5]/80 bg-[#c9f1f3]/50 p-5">
                <h2 className="text-xl font-bold text-[#087f9b]">Partiamo con operatori già esistenti</h2>
                <p className="mt-3 leading-7 text-[#496575]">
                  Nella prima fase RiverSpend non avrà una flotta propria: valuteremo l’integrazione
                  con corrieri, uffici postali, negozi e locker che consentono spedizione o ritiro.
                  In futuro potremo aggiungere servizi di consegna RS Local separati dalla spedizione
                  nazionale tra privati.
                </p>
              </section>
              <p className="text-sm leading-6 text-[#607d88]">Nota: RiverSpend Box è in progettazione. Al momento non genera etichette o QR di spedizione e non prenota ritiri: queste funzioni richiedono accordi e integrazioni con gli operatori.</p>
            </div>
          )}

          {slug === 'local' && (
            <div className="mt-8 grid gap-4">
              <section className="rounded-2xl border border-[#a8dfe5]/80 bg-[#c9f1f3]/50 p-5">
                <h2 className="text-xl font-bold text-[#087f9b]">Cos’è RS Local?</h2>
                <p className="mt-3 leading-7 text-[#496575]">
                  È la parte di RiverSpend pensata per aiutarti a trovare ciò che offre il tuo territorio.
                  Riunirà in un unico spazio attività locali, ristoranti, negozi e servizi, così potrai
                  consultarne le proposte senza dover cercare su tanti canali diversi.
                </p>
              </section>
              <section className="rounded-2xl border border-[#a8dfe5]/80 bg-[#c9f1f3]/50 p-5">
                <h2 className="text-xl font-bold text-[#087f9b]">A cosa serve?</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 leading-7 text-[#496575]">
                  <li><strong className="text-[#173f4a]">Per chi cerca:</strong> scoprire attività, prodotti e servizi nella propria zona.</li>
                  <li><strong className="text-[#173f4a]">Per le attività:</strong> presentare il proprio negozio e le proprie proposte alla comunità locale.</li>
                  <li><strong className="text-[#173f4a]">Per gli ordini:</strong> in una fase successiva, consultare i cataloghi, ordinare e scegliere tra consegna e ritiro, dove disponibili.</li>
                </ul>
              </section>
              <section className="rounded-2xl border border-[#a8dfe5]/80 bg-[#c9f1f3]/50 p-5">
                <h2 className="text-xl font-bold text-[#087f9b]">Come funzionerà</h2>
                <ol className="mt-3 grid gap-3 sm:grid-cols-3">
                  <li className="rounded-xl bg-white p-4"><span className="text-2xl">📍</span><p className="mt-2 font-semibold text-[#173f4a]">1. Scegli la zona</p><p className="mt-1 text-sm leading-6 text-[#496575]">Indichi città o area che ti interessa.</p></li>
                  <li className="rounded-xl bg-white p-4"><span className="text-2xl">🛍️</span><p className="mt-2 font-semibold text-[#173f4a]">2. Scopri le attività</p><p className="mt-1 text-sm leading-6 text-[#496575]">Esplori negozi, ristoranti e le loro proposte.</p></li>
                  <li className="rounded-xl bg-white p-4"><span className="text-2xl">🛵</span><p className="mt-2 font-semibold text-[#173f4a]">3. Ordina o ritira</p><p className="mt-1 text-sm leading-6 text-[#496575]">Quando il servizio sarà attivo, potrai scegliere le opzioni offerte dall’attività.</p></li>
                </ol>
              </section>
              <p className="text-sm leading-6 text-[#607d88]">Nota: RS Local è in fase di sviluppo. Al momento questa pagina presenta il progetto; non è ancora possibile effettuare ordini o richiedere consegne.</p>
            </div>
          )}

          <div className="mt-7 rounded-2xl border border-slate-700 bg-[#c9f1f3]/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#607d88]">Stato</p>
            <p className="mt-1 font-semibold text-[#087f9b]">{servizio.stato}</p>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/" className="rs-button rs-button-primary rounded-xl px-5 py-3 font-bold">Vai al RiverSpendShop</Link>
            <Link href="/rete" className="rounded-xl border border-[#a8dfe5] px-5 py-3 font-semibold text-[#087f9b]">🕸️ La mia rete</Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export function getStaticPaths() {
  return {
    paths: Object.keys(servizi)
      .filter((slug) => slug !== 'local')
      .map((slug) => ({ params: { slug } })),
    fallback: false
  };
}

export function getStaticProps({ params }) {
  return { props: { slug: params.slug } };
}
