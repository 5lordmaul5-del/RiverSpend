'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

function countryFlag(country) {
  const value = String(country || '').trim().toLowerCase();
  const codes = {
    it: '🇮🇹', italia: '🇮🇹', italy: '🇮🇹', fr: '🇫🇷', francia: '🇫🇷', france: '🇫🇷',
    no: '🇳🇴', norvegia: '🇳🇴', norway: '🇳🇴', de: '🇩🇪', germania: '🇩🇪', germany: '🇩🇪',
    es: '🇪🇸', spagna: '🇪🇸', spain: '🇪🇸', pt: '🇵🇹', portogallo: '🇵🇹', portugal: '🇵🇹',
    gb: '🇬🇧', uk: '🇬🇧', 'regno unito': '🇬🇧', 'united kingdom': '🇬🇧',
    us: '🇺🇸', usa: '🇺🇸', 'stati uniti': '🇺🇸', 'united states': '🇺🇸',
    ch: '🇨🇭', svizzera: '🇨🇭', switzerland: '🇨🇭', at: '🇦🇹', austria: '🇦🇹',
    nl: '🇳🇱', olanda: '🇳🇱', netherlands: '🇳🇱', be: '🇧🇪', belgio: '🇧🇪', belgium: '🇧🇪',
    se: '🇸🇪', svezia: '🇸🇪', sweden: '🇸🇪', dk: '🇩🇰', danimarca: '🇩🇰', denmark: '🇩🇰',
    fi: '🇫🇮', finlandia: '🇫🇮', finland: '🇫🇮', pl: '🇵🇱', polonia: '🇵🇱', poland: '🇵🇱',
    gr: '🇬🇷', grecia: '🇬🇷', greece: '🇬🇷', ie: '🇮🇪', irlanda: '🇮🇪', ireland: '🇮🇪',
    jp: '🇯🇵', giappone: '🇯🇵', japan: '🇯🇵', cn: '🇨🇳', cina: '🇨🇳', china: '🇨🇳',
    au: '🇦🇺', australia: '🇦🇺', ca: '🇨🇦', canada: '🇨🇦', br: '🇧🇷', brasile: '🇧🇷', brazil: '🇧🇷'
  };
  if (codes[value]) return codes[value];
  if (/^[a-z]{2}$/i.test(value)) return String.fromCodePoint(...value.toUpperCase().split('').map((char) => 127397 + char.charCodeAt(0)));
  return '';
}

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
  const [mappaLocalita, setMappaLocalita] = useState(null);
  const [spotInCorso, setSpotInCorso] = useState(false);
  const [spotCompletato, setSpotCompletato] = useState(false);
  const [spotSecondi, setSpotSecondi] = useState(5);

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

  useEffect(() => {
    if (!spotInCorso) return;
    const timer = setInterval(() => {
      setSpotSecondi((secondi) => {
        if (secondi <= 1) {
          clearInterval(timer);
          setSpotInCorso(false);
          setSpotCompletato(true);
          return 0;
        }
        return secondi - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [spotInCorso]);

  useEffect(() => {
    if (!prodotto) return;
    const luogo = [prodotto.localita, prodotto.provincia, prodotto.regione, 'Italia'].filter(Boolean).join(', ');
    if (!luogo || luogo === 'Italia') return;
    let attivo = true;
    fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&country=Italy&q=' + encodeURIComponent(luogo), { headers: { Accept: 'application/json' } })
      .then((res) => res.ok ? res.json() : [])
      .then((results) => {
        if (!attivo || !results?.length) return;
        setMappaLocalita({ lat: Number(results[0].lat), lon: Number(results[0].lon), nome: luogo });
      })
      .catch(() => {});
    return () => { attivo = false; };
  }, [prodotto]);

  const immagini = Array.isArray(prodotto?.immagini) ? prodotto.immagini : [];
  const media = Array.isArray(prodotto?.media) ? prodotto.media : [];
  const contenuti = media.length ? media : immagini.map((url) => ({ url, type: 'image' }));
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
      const serialized = JSON.stringify(next);
      localStorage.setItem(key, serialized);
      sessionStorage.setItem(key, serialized);
      if (key === 'riverspend-rete') {
        document.cookie = 'riverspend-rete-ids=' + encodeURIComponent(next.map((item) => item.id).join(',')) + '; path=/; max-age=31536000; SameSite=Lax';
      }
      setter(!exists);
      setFeedback(exists ? removed : added);
    } catch { setFeedback('Impossibile salvare su questo dispositivo.'); }
  }

  if (caricamento) return <main className="min-h-screen bg-white p-6 text-slate-800">Il fiume sta preparando la scheda…</main>;
  if (errore || !prodotto) return (
    <main className="min-h-screen bg-white p-6 text-slate-900">
      <Link href="/" className="text-[#8a692b] underline">← Torna al RiverSpendShop</Link>
      <p className="mt-6">{errore || 'Prodotto non trovato.'}</p>
    </main>
  );

  const badge = sellerBadge(prodotto.venditoreTipo);
  const sponsorizzato = Boolean(prodotto.sponsorizzato);
  const quantita = Number(prodotto.quantita ?? 1);

  return (
    <main className="rs-product-page min-h-screen bg-white px-3 py-4 text-slate-900 sm:px-5 sm:py-7">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">← RiverSpendShop</Link>
          <span className="text-xs font-semibold tracking-[.18em] text-slate-600">YOUR SHOP • YOUR FLOW</span>
        </nav>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="grid md:grid-cols-[1.08fr_.92fr]">
            <section className="min-w-0 bg-white p-3 text-slate-900 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700">La vetrina sul fiume</span>
                <span className={'rounded-full border px-3 py-1 text-xs font-extrabold shadow-sm ' + badge.style}>{badge.label}</span>
              </div>
              {contenuti.length ? (
                <>
                  <div className="relative flex min-h-[330px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white sm:min-h-[510px]">
                    {contenuti[fotoAttiva]?.type === 'video' ? (
                      <div className="relative h-[330px] w-full overflow-hidden rounded-2xl bg-black sm:h-[510px]">
                        {!spotCompletato ? (
                          <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-cyan-950 via-slate-950 to-slate-900 p-6 text-center text-white">
                            <div className="rounded-full border border-amber-300/60 bg-amber-300/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[.2em] text-amber-300">
                              🎬 RS Spons · DEMO
                            </div>
                            <h3 className="mt-5 text-2xl font-black sm:text-3xl">Spot pubblicitario</h3>
                            <p className="mt-2 max-w-md text-sm text-slate-300">
                              In questa demo lo sponsor viene mostrato prima del video dell'utente.
                            </p>
                            {spotInCorso ? (
                              <div className="mt-6 rounded-xl bg-white/10 px-6 py-4 font-bold">
                                Spot demo in riproduzione · {spotSecondi}s
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => { setSpotSecondi(5); setSpotInCorso(true); }}
                                className="mt-6 rounded-xl bg-cyan-500 px-6 py-3 font-extrabold text-white shadow-lg"
                              >
                                ▶ Avvia spot demo
                              </button>
                            )}
                            <p className="mt-4 text-xs text-slate-400">Pubblicità dimostrativa · nessun pagamento</p>
                          </div>
                        ) : (
                          <>
                            <div className="absolute left-3 top-3 z-10 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white">
                              RS Spons · DEMO
                            </div>
                            <video controls playsInline preload="metadata" className="h-[330px] w-full object-contain sm:h-[510px]">
                              <source src={contenuti[fotoAttiva].url} />
                            </video>
                          </>
                        )}
                      </div>
                    ) : (
                      <img src={contenuti[fotoAttiva]?.url || immagini[0]} alt={prodotto.titolo || 'Foto prodotto'} className="h-[330px] w-full object-contain sm:h-[510px]" />
                    )}
                    {countryFlag(prodotto.paeseOrigine || prodotto.paeseVenditore) && <span className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white/95 text-xl shadow-sm" title={"Paese: " + (prodotto.paeseOrigine || prodotto.paeseVenditore)} aria-label={"Paese: " + (prodotto.paeseOrigine || prodotto.paeseVenditore)}>{countryFlag(prodotto.paeseOrigine || prodotto.paeseVenditore)}</span>}
                  </div>
                  {contenuti.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {contenuti.map((item, index) => <button key={item.url + index} type="button" onClick={() => setFotoAttiva(index)} aria-label={item.type === 'video' ? 'Riproduci video del prodotto' : 'Mostra foto ' + (index + 1)} className={'relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white ' + (fotoAttiva === index ? 'border-teal-500 ring-2 ring-teal-200' : 'border-slate-300')}>
                      {item.type === 'video' ? <div className="flex h-full w-full items-center justify-center bg-slate-900 text-2xl text-white">▶️</div> : <img src={item.url} alt={'Anteprima foto ' + (index + 1)} className="h-full w-full object-contain" />}
                    </button>)}
                  </div>}
                  <p className="mt-2 text-center text-xs text-slate-500">{fotoAttiva + 1} / {contenuti.length} {contenuti.some((item) => item.type === 'video') ? 'contenuti' : 'immagini'}</p>
                </>
              ) : <div className="flex min-h-[330px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-slate-500 sm:min-h-[510px]">Foto o video non ancora disponibile</div>}
            </section>

            <section className="p-4 sm:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[.2em] text-[#9b762e]">RiverSpendShop</span>
                {sponsorizzato && <span className="rounded-full border border-amber-300/60 bg-amber-300/15 px-3 py-1 text-xs font-bold text-amber-800">✦ In evidenza</span>}
              </div>
              <h1 className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl">{prodotto.titolo}</h1>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Valore dell’articolo</p>
                <p className="mt-1 text-3xl font-black text-amber-800">€ {Number(prodotto.prezzo || 0).toFixed(2)}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-white px-3 py-1 text-slate-700 border border-slate-200">{prodotto.condizione || 'Condizione non indicata'}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-slate-700 border border-slate-200">{prodotto.categoria || 'Categoria da definire'}</span>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div><p className="text-xs text-slate-600">Disponibilità dichiarata</p><p className="mt-1 font-bold">{quantita > 0 ? (quantita === 1 ? 'Ultimo pezzo disponibile' : quantita + ' pezzi disponibili') : 'Disponibilità da verificare'}</p></div>
                  <span className="text-2xl" aria-hidden="true">🪙</span>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <button type="button" onClick={() => toggleLista('riverspend-rete', inRete, setInRete, '🕸️ Articolo aggiunto alla tua Rete.', 'Articolo rimosso dalla Rete.')} className="rounded-xl bg-slate-100 border border-slate-300 px-5 py-4 text-base font-extrabold text-slate-900 shadow-sm shadow-slate-200/60">
                  {inRete ? '✓ Nella mia Rete' : '🕸️ Aggiungi alla Rete'}
                </button>
                <button type="button" onClick={() => toggleLista('riverspend-wishlist', wishlist, setWishlist, '♡ Aggiunto ai tuoi desideri.', 'Rimosso dai desideri.')} className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-800">
                  {wishlist ? '♥ Nei miei desideri' : '♡ Aggiungi ai desideri'}
                </button>
              </div>
              {feedback && <p role="status" className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">{feedback}</p>}
              <Link href="/rete" className="mt-3 inline-block text-sm font-semibold text-[#8a692b] underline underline-offset-4">Apri la mia Rete →</Link>

              <div className="mt-6 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[11px] uppercase tracking-wider text-slate-400">Tutela</p><p className="mt-1 font-bold text-[#8a692b]">RS Shield</p><p className="mt-1 text-xs text-slate-600">Spazio dedicato alla protezione</p></div>
                <div className="rounded-xl border border-slate-200 bg-white p-3"><p className="text-[11px] uppercase tracking-wider text-slate-400">Venditore</p><p className="mt-1 font-bold text-slate-900">{badge.note}</p><span className={'mt-2 inline-flex rounded-md border px-2 py-1 text-xs font-extrabold ' + badge.style}>{badge.label}</span></div>
              </div>
            </section>
          </div>

          <section className="border-t border-slate-200 bg-white p-4 sm:p-7">
            <div className="grid gap-6 md:grid-cols-[1.4fr_.6fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.2em] text-[#9b762e]">Storia dell’articolo</p>
                <h2 className="mt-2 text-xl font-bold">Descrizione</h2>
                <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">{prodotto.descrizione || 'Il venditore non ha ancora inserito una descrizione.'}</p>
              </div>
              <aside className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-white p-4">
                <p className="font-bold text-[#8a692b]">Dettagli del fiume</p>
                <dl className="mt-3 space-y-3 text-sm">
                  <div><dt className="text-slate-400">Categoria</dt><dd className="font-semibold">{prodotto.categoria || 'Non indicata'}</dd></div>
                  <div><dt className="text-slate-400">Condizione</dt><dd className="font-semibold">{prodotto.condizione || 'Non indicata'}</dd></div>
                  {prodotto.paeseOrigine && <div><dt className="text-slate-400">Paese d’origine</dt><dd className="font-semibold">{prodotto.paeseOrigine}</dd></div>}
                  {prodotto.paeseVenditore && <div><dt className="text-slate-400">Paese venditore</dt><dd className="font-semibold">{prodotto.paeseVenditore}</dd></div>}
                  {(prodotto.localita || prodotto.provincia || prodotto.regione) && <div><dt className="text-slate-400">Località dell’articolo</dt><dd className="font-semibold">{[prodotto.localita, prodotto.provincia, prodotto.regione].filter(Boolean).join(' · ')}</dd></div>}
                </dl>
                {(prodotto.localita || prodotto.provincia || prodotto.regione) && (
                  <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between gap-2 bg-slate-50 p-3 text-xs text-slate-700">
                      <strong>📍 Zona dell’articolo</strong>
                      <a className="font-semibold text-teal-800 underline" href={'https://www.openstreetmap.org/search?query=' + encodeURIComponent([prodotto.localita, prodotto.provincia, prodotto.regione, 'Italia'].filter(Boolean).join(', '))} target="_blank" rel="noreferrer">Apri mappa</a>
                    </div>
                    {mappaLocalita ? (
                      <iframe title="Mappa della zona dell’articolo" src={'https://www.openstreetmap.org/export/embed.html?bbox=' + [mappaLocalita.lon - 0.035, mappaLocalita.lat - 0.025, mappaLocalita.lon + 0.035, mappaLocalita.lat + 0.025].join('%2C') + '&layer=mapnik&marker=' + mappaLocalita.lat + '%2C' + mappaLocalita.lon} className="h-56 w-full border-0" loading="lazy" />
                    ) : <p className="p-3 text-xs text-slate-500">Mappa della zona in caricamento; se non appare, usa “Apri mappa”. La posizione indica la località dichiarata, non l’indirizzo preciso del venditore.</p>}
                  </div>
                )}
              </aside>
            </div>
          </section>
        </div>
        <footer className="py-6 text-center text-xs tracking-wider text-slate-400">RiverSpend · YOUR SHOP • YOUR FLOW</footer>
      </div>
    </main>
  );
}
