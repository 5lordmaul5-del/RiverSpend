import Link from 'next/link';

const aree = [
  ['🛒','RiverSpendShop','Marketplace tra privati e aziende','/'],
  ['💎','RS Fidelity','Programma fedeltà e vantaggi','/servizi/fidelity'],
  ['🛡️','RS Nova Shield','Protezione e controlli di sicurezza','/nova-shield'],
  ['📍','RS Local','Scopri attività, offerte e servizi locali','/servizi/local'],
  ['💳','RiverSpend Pay','Pagamenti e gestione transazioni','/servizi/pay'],
  ['📦','RiverSpend Box','Spedizioni, tracking e consegne','/servizi/box'],
  ['🎢','RiverSpend Park','Parco, attrazioni e sicurezza Power Shield','/park'],
  ['📡','RiverSpend Broadcast','Comunicazione e aggiornamenti','/servizi/broadcast'],
  ['📺','RiverSpend TV','Video e contenuti RiverSpend','/servizi/tv'],
  ['🌊','RiverSpend Experience','Esperienza immersiva e audio ambientale','/servizi/experience'],
  ['🌱','RiverSpend Ecology','Sostenibilità e iniziative ambientali','/servizi/ecology'],
  ['🔮','RiverSpend Oracle','Informazione e assistenza intelligente','/servizi/oracle'],
  ['♻️','RiverSpend Recovery','Recupero e assistenza post-vendita','/servizi/recovery'],
  ['🏰','RiverSpend Fortress','Sicurezza dell’ecosistema','/servizi/fortress']
];

export default function Ecosistema() {
  return (
    <main className="min-h-screen bg-[#f2f8ff] px-4 py-8 text-[#18364b]">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-[#155b86] underline">← Torna al RiverSpendShop</Link>
        <header className="mt-6 mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#087fbd]">YOUR SHOP • YOUR FLOW</p>
          <h1 className="mt-2 text-4xl font-bold">L’ecosistema RiverSpend</h1>
          <p className="mt-3 max-w-2xl text-[#526f84]">Un unico mondo: marketplace, protezione, servizi locali, fedeltà, logistica e RiverSpend Park.</p>
        </header>
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {aree.map(([icon,title,note,href]) => (
            <Link href={href} key={title} className="rounded-2xl border border-[#c7e3f5] bg-white p-5 shadow-sm hover:border-[#77bce8]">
              <div className="text-3xl">{icon}</div>
              <h2 className="mt-3 text-xl font-bold">{title}</h2>
              <p className="mt-1 text-sm text-[#526f84]">{note}</p>
              <p className="mt-5 font-semibold text-[#087fbd]">Apri →</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
