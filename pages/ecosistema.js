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

const piattaforme = [
  ['🗄️','RS Database','Database centrale dell’ecosistema RiverSpend','Supabase'],
  ['🖼️','RS Storage','Storage per foto, video e media dei prodotti','Supabase Storage'],
  ['☁️','RS Cloud','Backend, servizi cloud e collegamento dell’ecosistema','Cloud'],
  ['📺','RiverSpendStream','Streaming: film, musica, creator, live e Originals','/river-spend-stream'],
  ['📱','RiverSpendShop App','App marketplace per Android e Apple iOS','Android • Apple'],
  ['🎛️','RiverSpend Panel Control','RSPC: pannello CEO e collaboratori autorizzati','/rs-control-center']
];

export default function Ecosistema() {
  return (
    <main className="min-h-screen bg-white px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-teal-700 underline">← Torna al RiverSpendShop</Link>
        <header className="mt-6 mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">YOUR SHOP • YOUR FLOW</p>
          <h1 className="mt-2 text-4xl font-bold">L’ecosistema RiverSpend</h1>
          <p className="mt-3 max-w-2xl text-slate-600">Un unico mondo: marketplace, protezione, servizi locali, fedeltà, logistica e RiverSpend Park.</p>
        </header>

        <section>
          <h2 className="mb-4 text-2xl font-black">🌊 Servizi RiverSpend</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {aree.map(([icon,title,note,href]) => (
              <Link href={href} key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-teal-500">
                <div className="text-3xl">{icon}</div>
                <h3 className="mt-3 text-xl font-bold">{title}</h3>
                <p className="mt-1 text-sm text-slate-600">{note}</p>
                <p className="mt-5 font-semibold text-teal-600">Apri →</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-2 text-2xl font-black">⚙️ Piattaforme, Cloud & App</h2>
          <p className="mb-4 max-w-3xl text-sm text-slate-600">
            La parte tecnica che sostiene RiverSpend: database, storage media, cloud, streaming,
            app mobile e pannello di controllo.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {piattaforme.map(([icon,title,note,linkOrStatus]) => {
              const isLink = linkOrStatus.startsWith('/');
              const content = (
                <>
                  <div className="text-3xl">{icon}</div>
                  <h3 className="mt-3 text-xl font-bold">{title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{note}</p>
                  <p className="mt-4 text-sm font-semibold text-teal-700">
                    {isLink ? 'Apri →' : linkOrStatus}
                  </p>
                </>
              );

              return isLink ? (
                <Link
                  href={linkOrStatus}
                  key={title}
                  className="rounded-2xl border border-teal-100 bg-gradient-to-br from-white to-cyan-50 p-5 shadow-sm hover:border-teal-500"
                >
                  {content}
                </Link>
              ) : (
                <article
                  key={title}
                  className="rounded-2xl border border-teal-100 bg-gradient-to-br from-white to-cyan-50 p-5 shadow-sm"
                >
                  {content}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
