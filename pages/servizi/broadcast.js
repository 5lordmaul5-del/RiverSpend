import Link from 'next/link';

export default function BroadcastHome() {
  return (
    <main className="min-h-screen bg-[#071a25] px-4 py-6 text-white sm:py-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/ecosistema" className="text-[#67e4d0] underline">← Ecosistema RiverSpend</Link>
        <header className="mt-5 border-b border-[#1d5960] pb-6"><p className="text-sm font-semibold uppercase tracking-[.18em] text-[#67e4d0]">RiverSpend</p><h1 className="mt-2 text-3xl font-bold sm:text-5xl">BroadCast · TV / Audio / Video</h1><p className="mt-4 max-w-3xl text-lg leading-7 text-slate-300">Un’unica area per caricare, verificare e distribuire contenuti audio e video: dai singoli musicali ai film.</p></header>
        <section className="mt-7 border-l-4 border-[#67e4d0] bg-[#0c2a36] p-5 sm:p-8"><p className="text-sm font-semibold uppercase tracking-wider text-[#67e4d0]">Area creator</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">Pubblica il tuo brano, video o film</h2><p className="mt-3 max-w-3xl leading-7 text-slate-300">Caricamento del contenuto, dichiarazione dei diritti d’autore, controllo prima della pubblicazione e scelta del prezzo per download. Con prezzo di 1 € o 2 €, la commissione RiverSpend prevista è del 10%.</p><Link href="/servizi/broadcast-music" className="mt-6 inline-flex bg-[#67e4d0] px-5 py-3 font-bold text-[#071a25]">Apri area caricamento →</Link></section>
        <div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="bg-[#0c2a36] p-5"><h3 className="font-bold">Audio</h3><p className="mt-2 text-sm leading-6 text-slate-300">Singoli e album di artisti e band.</p></div><div className="bg-[#0c2a36] p-5"><h3 className="font-bold">Video</h3><p className="mt-2 text-sm leading-6 text-slate-300">Videoclip e contenuti video con diritti verificati.</p></div><div className="bg-[#0c2a36] p-5"><h3 className="font-bold">Film</h3><p className="mt-2 text-sm leading-6 text-slate-300">Cortometraggi e lungometraggi con controllo delle autorizzazioni.</p></div></div>
        <p className="mt-6 text-sm leading-6 text-slate-400">Interfaccia dimostrativa: upload protetto, verifica effettiva dei diritti, pagamenti, streaming e download devono essere collegati prima dell’uso reale.</p>
        <div className="mt-6 flex flex-wrap gap-3"><Link href="/" className="border border-[#28505a] px-5 py-3 font-semibold text-[#8bf0df]">Vai al RiverSpendShop</Link><Link href="/ecosistema" className="border border-[#28505a] px-5 py-3 font-semibold text-slate-300">Ecosistema</Link></div>
      </div>
    </main>
  );
}
