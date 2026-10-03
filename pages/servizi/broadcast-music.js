import Link from 'next/link';
import { useState } from 'react';

const tracks = [
  'Traccia 01 · Singolo di apertura',
  'Traccia 02 · Secondo brano',
  'Traccia 03 · Terzo brano',
  'Traccia 04 · Quarto brano',
  'Traccia 05 · Quinto brano',
  'Traccia 06 · Sesto brano',
  'Traccia 07 · Settimo brano',
  'Traccia 08 · Ottavo brano',
  'Traccia 09 · Nono brano',
  'Traccia 10 · Decimo brano',
  'Traccia 11 · Undicesimo brano',
  'Traccia 12 · Dodicesimo brano'
];

export default function BroadcastMusic() {
  const [prices, setPrices] = useState({});
  const [notice, setNotice] = useState('');

  function choosePrice(index, price) {
    setPrices((current) => ({ ...current, [index]: price }));
    setNotice('Prezzo demo aggiornato. Le vendite saranno attivate con i pagamenti.');
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/servizi/broadcast" className="text-teal-300 underline">← RiverSpend BroadCast</Link>
        <section className="mt-6 overflow-hidden rounded-3xl border border-teal-800 bg-gradient-to-br from-slate-900 via-slate-950 to-sky-950 p-6 sm:p-10">
          <div className="text-5xl">🎵</div>
          <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-teal-300">RiverSpend BroadCast · Audio & Video</p>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">BroadCast Music</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            Uno spazio per band e artisti: presenta i tuoi brani, fai ascoltare un’anteprima con la firma audio RiverSpend e vendi download musicali e album.
          </p>
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-teal-800 bg-slate-950/60 p-4"><p className="text-sm text-slate-400">Ascolto anteprima</p><p className="mt-1 text-2xl font-bold text-teal-200">0,10 €</p><p className="mt-1 text-sm text-slate-400">per singolo brano</p></div>
            <div className="rounded-2xl border border-teal-800 bg-slate-950/60 p-4"><p className="text-sm text-slate-400">Prezzo download</p><p className="mt-1 text-2xl font-bold text-teal-200">1 / 2 / 5 €</p><p className="mt-1 text-sm text-slate-400">scelto dall’artista</p></div>
            <div className="rounded-2xl border border-teal-800 bg-slate-950/60 p-4"><p className="text-sm text-slate-400">Commissione RiverSpend</p><p className="mt-1 text-2xl font-bold text-teal-200">10%</p><p className="mt-1 text-sm text-slate-400">sulle vendite, secondo condizioni</p></div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-sm font-semibold uppercase tracking-wider text-teal-300">Area artista</p><h2 className="mt-1 text-2xl font-bold">Pubblica la tua musica</h2></div>
            <span className="rounded-full border border-amber-700/70 bg-amber-950/40 px-3 py-1 text-xs font-semibold text-amber-200">Anteprima interfaccia</span>
          </div>
          <p className="mt-3 leading-7 text-slate-300">L’artista potrà caricare copertina, informazioni, singoli, album e videoclip, dopo la verifica dei diritti sui contenuti.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-slate-300">Nome artista o band<input className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" placeholder="Es. Nome artista" /></label>
            <label className="text-sm text-slate-300">Titolo album<input className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white" placeholder="Es. Il mio album" /></label>
          </div>
          <div className="mt-5 rounded-2xl border border-dashed border-teal-800 bg-slate-950/60 p-5">
            <p className="font-semibold text-teal-200">＋ Aggiungi copertina, brani e video</p>
            <p className="mt-1 text-sm text-slate-400">Caricamento e archiviazione saranno collegati nella fase tecnica successiva.</p>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-300">Esempio album · 12 brani</p>
          <h2 className="mt-1 text-2xl font-bold">Ascolta l’anteprima, poi scegli</h2>
          <p className="mt-3 leading-7 text-slate-300">Ogni anteprima costa 0,10 €. Durante l’anteprima è prevista la firma vocale “RiverSpend BroadCast Music” ogni 10 secondi. Il file acquistato sarà il brano originale, senza la firma dell’anteprima.</p>
          <div className="mt-5 divide-y divide-slate-800">
            {tracks.map((track, index) => (
              <div key={track} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div><p className="font-semibold">{track}</p><p className="mt-1 text-xs text-slate-400">Anteprima: 0,10 € · Download a pagamento</p></div>
                <div className="flex flex-wrap items-center gap-2">
                  {[1, 2, 5].map((price) => (
                    <button key={price} type="button" onClick={() => choosePrice(index, price)} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${prices[index] === price ? 'border-teal-300 bg-teal-900 text-teal-100' : 'border-slate-700 bg-slate-950 text-slate-300'}`}>{price} €</button>
                  ))}
                  <span className="min-w-24 text-right text-xs text-slate-400">{prices[index] ? `Prezzo: ${prices[index]} €` : 'Scegli prezzo'}</span>
                </div>
              </div>
            ))}
          </div>
          {notice && <p role="status" className="mt-4 rounded-xl bg-teal-950/60 p-3 text-sm text-teal-200">{notice}</p>}
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-teal-800 bg-slate-900 p-5"><h2 className="text-xl font-bold text-teal-200">Per chi ascolta</h2><p className="mt-2 leading-7 text-slate-300">Paga 0,10 € per ogni anteprima. Se il brano ti piace, acquistalo e scarica la versione originale. Sarà possibile acquistare anche l’intero album.</p></div>
          <div className="rounded-2xl border border-teal-800 bg-slate-900 p-5"><h2 className="text-xl font-bold text-teal-200">Per l’artista</h2><p className="mt-2 leading-7 text-slate-300">Sceglie i prezzi e consulta ascolti, vendite, commissione RiverSpend del 10% e quota maturata. Potrà inoltre acquistare visibilità sponsorizzata, segnalata come tale.</p></div>
        </section>
        <p className="mt-6 text-sm leading-6 text-slate-500">Questa è la schermata iniziale inserita nel progetto. Pagamenti, upload protetto, streaming, download, rendicontazione e classifica sponsorizzata richiedono ancora integrazioni reali. Nessun pagamento viene effettuato da questa anteprima.</p>
        <div className="mt-7"><Link href="/servizi/broadcast" className="rounded-xl border border-teal-700 px-5 py-3 font-semibold text-teal-200">← Torna a BroadCast</Link></div>
      </div>
    </main>
  );
}
