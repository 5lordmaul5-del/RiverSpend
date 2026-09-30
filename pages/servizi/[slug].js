import Link from 'next/link';

const servizi = {
  local: {
    titolo: 'RS Local',
    icona: '📍',
    descrizione: 'Scopri attività, negozi, professionisti, servizi e opportunità vicino a te. RS Local collega il marketplace alla comunità del territorio.',
    stato: 'Scheda informativa pronta; geolocalizzazione e inserimento attività da collegare'
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
    descrizione: 'Area logistica: spedizioni, tracking, consegna e gestione del flusso ordine.',
    stato: 'Integrazione logistica da collegare'
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
      <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="text-teal-300 underline">← Torna al RiverSpendShop</Link>
          <h1 className="mt-8 text-3xl font-bold">Area non trovata</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-4xl">
        <Link href="/ecosistema" className="text-teal-300 underline">← Ecosistema RiverSpend</Link>

        <section className="mt-6 rounded-3xl border border-teal-800 bg-gradient-to-br from-slate-900 to-sky-950 p-6 sm:p-10">
          <div className="text-5xl">{servizio.icona}</div>
          <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-teal-300">RiverSpend</p>
          <h1 className="mt-2 text-4xl font-bold">{servizio.titolo}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">{servizio.descrizione}</p>

          <div className="mt-7 rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Stato</p>
            <p className="mt-1 font-semibold text-teal-200">{servizio.stato}</p>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/" className="rs-button rs-button-primary rounded-xl px-5 py-3 font-bold">Vai al RiverSpendShop</Link>
            <Link href="/rete" className="rounded-xl border border-teal-800 px-5 py-3 font-semibold text-teal-200">🕸️ La mia rete</Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export function getStaticPaths() {
  return {
    paths: Object.keys(servizi).map((slug) => ({ params: { slug } })),
    fallback: false
  };
}

export function getStaticProps({ params }) {
  return { props: { slug: params.slug } };
}
