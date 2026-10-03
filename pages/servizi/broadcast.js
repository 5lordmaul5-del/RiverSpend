import Link from 'next/link';

export default function BroadcastHome() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-4xl">
        <Link href="/ecosistema" className="text-teal-300 underline">← Ecosistema RiverSpend</Link>
        <section className="mt-6 rounded-3xl border border-teal-800 bg-gradient-to-br from-slate-900 to-sky-950 p-6 sm:p-10">
          <div className="text-5xl">📡</div>
          <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-teal-300">RiverSpend</p>
          <h1 className="mt-2 text-4xl font-bold">BroadCast · TV / Audio / Video</h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">Il mondo RiverSpend dedicato a contenuti, intrattenimento, audio e video.</p>
          <div className="mt-8 rounded-3xl border border-teal-700 bg-slate-950/60 p-6">
            <div className="text-4xl">🎵</div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-teal-300">Nuova area</p>
            <h2 className="mt-2 text-3xl font-bold">RiverSpend BroadCast Music</h2>
            <p className="mt-3 leading-7 text-slate-300">Band e artisti potranno presentare singoli e album con anteprime a pagamento da 0,10 € per brano, firma vocale RiverSpend ogni 10 secondi e download acquistabili al prezzo scelto dall’artista. Commissione RiverSpend prevista: 10% sulle vendite.</p>
            <Link href="/servizi/broadcast-music" className="mt-6 inline-flex rounded-xl bg-teal-400 px-5 py-3 font-bold text-slate-950 hover:bg-teal-300">🎧 Entra in BroadCast Music →</Link>
          </div>
          <p className="mt-6 text-sm leading-6 text-slate-400">Le schermate sono state inserite nel progetto. Streaming, pagamenti, caricamento protetto e download devono ancora essere collegati ai servizi reali.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/" className="rounded-xl border border-teal-800 px-5 py-3 font-semibold text-teal-200">Vai al RiverSpendShop</Link>
            <Link href="/ecosistema" className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300">Ecosistema</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
