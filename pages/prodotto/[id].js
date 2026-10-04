'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

function sellerBadge(tipo) {
  const value = String(tipo || 'Privato').toLowerCase();
  if (value.includes('river') || value === 'rss' || value.includes('riverspend')) {
    return { label: 'RSS', style: 'border-cyan-300 bg-cyan-400 text-slate-950', note: 'RiverSpend' };
  }
  if (value.includes('aziend') || value.includes('business') || value.includes('iva')) {
    return { label: 'RS azienda', style: 'border-emerald-300 bg-emerald-500 text-slate-950', note: 'Venditore professionale' };
  }
  return { label: 'RSprivato', style: 'border-rose-300 bg-rose-500 text-white', note: 'Venditore privato' };
}

export default function Prodotto() {
  const [prodotto, setProdotto] = useState(null);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState('');
  const [fotoAttiva, setFotoAttiva] = useState(0);
  const [inRete, setInRete] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    let attivo = true;
    const id = window.location.pathname.split('/').filter(Boolean).pop();
    fetch('/api/products', { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Prodotto non disponibile');
        const trovato = (Array.isArray(data) ? data : []).find((item) => String(item.id) === decodeURIComponent(id || ''));
        if (!trovato) throw new Error('Questo prodotto non è disponibile.');
        return trovato;
      })
      .then((item) => {
        if (!attivo) return;
        setProdotto(item);
        try {
          const rete = JSON.parse(localStorage.getItem('riverspend-rete') || '[]');
          const desideri = JSON.parse(localStorage.getItem('riverspend-wishlist') || '[]');
          setInRete(Array.isArray(rete) && rete.some((x) => String(x.id) === String(item.id)));
          setWishlist(Array.isArray(desideri) && desideri.some((x) => String(x.id) === String(item.id)));
        } catch { setInRete(false); setWishlist(false); }
      })
      .catch((err) => { if (attivo) setErrore(err.message || 'Errore nel caricamento.'); })
      .finally(() => { if (attivo) setCaricamento(false); });
    return () => { attivo = false; };
  }, []);

  const immagini = Array.isArray(prodotto?.immagini) ? prodotto.immagini : [];
  const record = useMemo(() => prodotto ? ({
    id: prodotto.id, title: prodotto.titolo, price: Number(prodotto.prezzo || 0),
    image: prodotto.immagini?.[0] || ''
  }) : null, [prodotto]);

  function toggleLista(key, active, setter, added, removed) {
    if (!record) return;
    try {
      const current = JSON.parse(localStorage.getItem(key) || '[]');
      const safe = Array.isArray(current) ? current : [];
      const exists = safe.some((x) => String(x.id) === String(record.id));
      const next = exists ? safe.filter((x) => String(x.id) !== String(record.id)) : [record, ...safe];
      localStorage.setItem(key, JSON.stringify(next));
      setter(!exists);
      setFeedback(exists ? removed : added);
    } catch { setFeedback('Impossibile salvare su questo dispositivo.'); }
  }

  if (caricamento) return <main className="min-h-screen bg-slate-950 p-6 text-teal-100">Il fiume sta preparando la scheda…</main>;
  if (errore || !prodotto) return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <Link href="/" className="text-teal-300 underline">← Torna al RiverSpendShop</Link>
      <p className="mt-6">{errore || 'Prodotto non trovato.'}</p>
    </main>
  );

  const badge = sellerBadge(prodotto.venditoreTipo);
  const sponsorizzato = Boolean(prodotto.sponsorizzato);
  const quantita = Number(prodotto.quantita ?? 1);

  return (
    <main className="rs-product-page min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-sky-950 px-3 py-4 text-white sm:px-5 sm:py-7">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-teal-800 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-teal-200">← RiverSpendShop</Link>
          <span className="text-xs font-semibold tracking-[.18em] text-teal-300">YOUR SHOP • YOUR FLOW</span>
        </nav>

        <div className="overflow-hidden rounded-3xl border border-teal-800/70 bg-slate-900/90 shadow-2xl shadow-cyan-950/30">
          <div className="grid md:grid-cols-[1.08fr_.92fr]">
            <section className="min-w-0 bg-gradient-to-br from-white via-slate-100 to-sky-100 p-3 text-slate-900 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="rounded-full border border-sky-300 bg-sky-100 px-3 py-1 text-xs font-bold text-sky-950">La vetrina sul fiume</span>
                <span className={'rounded-full border px-3 py-1 text-xs font-extrabold shadow-sm ' + badge.style}>{badge.label}</span>
              </div>
              {immagini.length ? (
                <>
                  <div className="flex min-h-[330px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white sm:min-h-[510px]">
                    <img src={immagini[Math.min(fotoAttiva, immagini.length - 1)]} alt={prodotto.titolo || 'Foto prodotto'} className="h-[330px] w-full object-contain sm:h-[510px]" />
                  </div>
                  {immagini.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {immagini.map((url, index) => <button key={url + index} type="button" onClick={() => setFotoAttiva(index)} aria-label={'Mostra foto ' + (index + 1)} aria-pressed={fotoAttiva === index} className={'h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white ' + (fotoAttiva === index ? 'border-teal-500 ring-2 ring-teal-200' : 'border-slate-300')}>
                      <img src={url} alt={'Anteprima ' + (index + 1)} className="h-full w-full object-contain" />
                    </button>)}
                  </div>}
                  <p className="mt-2 text-center text-xs text-slate-500">{fotoAttiva + 1} / {immagini.length} immagini</p>
                </>
              ) : <div className="flex min-h-[330px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-slate-500 sm:min-h-[510px]">Foto non ancora disponibile</div>}
            </section>

            <section className="p-4 sm:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[.2em] text-teal-300">RiverSpendShop</span>
                {sponsorizzato && <span className="rounded-full border border-amber-300/60 bg-amber-300/15 px-3 py-1 text-xs font-bold text-amber-200">✦ In evidenza</span>}
              </div>
              <h1 className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl">{prodotto.titolo}</h1>
              <div className="mt-5 rounded-2xl border border-teal-800 bg-gradient-to-r from-slate-800 to-sky-950 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-200">Valore dell’articolo</p>
                <p className="mt-1 text-3xl font-black text-amber-300">€ {Number(prodotto.prezzo || 0).toFixed(2)}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-slate-200">{prodotto.condizione || 'Condizione non indicata'}</span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-slate-200">{prodotto.categoria || 'Categoria da definire'}</span>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div><p className="text-xs text-slate-400">Disponibilità dichiarata</p><p className="mt-1 font-bold">{quantita > 0 ? (quantita === 1 ? 'Ultimo pezzo disponibile' : quantita + ' pezzi disponibili') : 'Disponibilità da verificare'}</p></div>
                  <span className="text-2xl" aria-hidden="true">🪙</span>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <button type="button" onClick={() => toggleLista('riverspend-rete', inRete, setInRete, '🕸️ Articolo aggiunto alla tua Rete.', 'Articolo rimosso dalla Rete.')} className="rounded-xl bg-gradient-to-r from-teal-400 to-cyan-300 px-5 py-4 text-base font-extrabold text-slate-950 shadow-lg shadow-teal-950/30">
                  {inRete ? '✓ Nella mia Rete' : '🕸️ Aggiungi alla Rete'}
                </button>
                <button type="button" onClick={() => toggleLista('riverspend-wishlist', wishlist, setWishlist, '♡ Aggiunto ai tuoi desideri.', 'Rimosso dai desideri.')} className="rounded-xl border border-teal-700 bg-slate-800 px-5 py-3 font-bold text-teal-100">
                  {wishlist ? '♥ Nei miei desideri' : '♡ Aggiungi ai desideri'}
                </button>
              </div>
              {feedback && <p role="status" className="mt-3 rounded-xl border border-teal-700 bg-teal-950/60 p-3 text-sm text-teal-100">{feedback}</p>}
              <Link href="/rete" className="mt-3 inline-block text-sm font-semibold text-teal-300 underline underline-offset-4">Apri la mia Rete →</Link>

              <div className="mt-6 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-teal-900 bg-slate-950/70 p-3"><p className="text-[11px] uppercase tracking-wider text-slate-400">Tutela</p><p className="mt-1 font-bold text-teal-200">RS Shield</p><p className="mt-1 text-xs text-slate-400">Spazio dedicato alla protezione</p></div>
                <div className="rounded-xl border border-teal-900 bg-slate-950/70 p-3"><p className="text-[11px] uppercase tracking-wider text-slate-400">Venditore</p><p className="mt-1 font-bold text-white">{badge.note}</p><span className={'mt-2 inline-flex rounded-md border px-2 py-1 text-xs font-extrabold ' + badge.style}>{badge.label}</span></div>
              </div>
            </section>
          </div>

          <section className="border-t border-teal-900 bg-slate-950/70 p-4 sm:p-7">
            <div className="grid gap-6 md:grid-cols-[1.4fr_.6fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-300">Storia dell’articolo</p>
                <h2 className="mt-2 text-xl font-bold">Descrizione</h2>
                <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-300">{prodotto.descrizione || 'Il venditore non ha ancora inserito una descrizione.'}</p>
              </div>
              <aside className="rounded-2xl border border-teal-900 bg-gradient-to-br from-sky-950 to-slate-900 p-4">
                <p className="font-bold text-teal-200">Dettagli del fiume</p>
                <dl className="mt-3 space-y-3 text-sm">
                  <div><dt className="text-slate-400">Categoria</dt><dd className="font-semibold">{prodotto.categoria || 'Non indicata'}</dd></div>
                  <div><dt className="text-slate-400">Condizione</dt><dd className="font-semibold">{prodotto.condizione || 'Non indicata'}</dd></div>
                  {prodotto.paeseOrigine && <div><dt className="text-slate-400">Paese d’origine</dt><dd className="font-semibold">{prodotto.paeseOrigine}</dd></div>}
                  {prodotto.paeseVenditore && <div><dt className="text-slate-400">Paese venditore</dt><dd className="font-semibold">{prodotto.paeseVenditore}</dd></div>}
                </dl>
              </aside>
            </div>
          </section>
        </div>
        <footer className="py-6 text-center text-xs tracking-wider text-slate-400">RiverSpend · YOUR SHOP • YOUR FLOW</footer>
      </div>
    </main>
  );
}
