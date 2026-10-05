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
  const mediaAttivo = contenuti[fotoAttiva] || contenuti[0];

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
                    {mediaAttivo?.type === 'video' ? (
                      <video
                        controls
                        playsInline
                        preload="metadata"
                        className="h-[330px] w-full object-contain bg-black sm:h-[510px]"
                      >
                        <source src={mediaAttivo.url} />
                      </video>
                    ) : (
                      <img
                        src={mediaAttivo?.url || immagini[0]}
                        alt={prodotto.titolo || 'Foto prodotto'}
                        className="h-[330px] w-full object-contain sm:h-[510px]"
                      />
                    )}
                    {countryFlag(prodotto.paeseOrigine || prodotto.paeseVenditore) && <span className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white/95 text-xl shadow-sm" title={"Paese: " + (prodotto.paeseOrigine || prodotto.paeseVenditore)} aria-label={"Paese: " + (prodotto.paeseOrigine || prodotto.paeseVenditore)}>{countryFlag(prodotto.paeseOrigine || prodotto.paeseVenditore)}</span>}
                  </div>
                  {contenuti.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {contenuti.map((item, index) => <button key={item.url + index} type="button" onClick={() => setFotoAttiva(index)} aria-label={item.type === 'video' ? 'Riproduci video del prodotto' : 'Mostra foto ' + (index + 1)} className={'relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white ' + (fotoAttiva === index ? 'border-teal-500 ring-2 ring-teal-200' : 'border-slate-300')}>
                      {item.type === 'video' ? (
                        <div className="flex h-full w-full items-center justify-center bg-slate-900 text-2xl text-white">▶️</div>
                      ) : (
                        <img src={item.url} alt={'Anteprima foto ' + (index + 1)} className="h-full w-full object-contain" />
                      )}
                    </button>)}
                  </div>}
                  <p className="mt-2 text-center text-xs text-slate-500">
                    {fotoAttiva + 1} / {contenuti.length} {contenuti.some((item) => item.type === 'video') ? 'contenuti' : 'immagini'}
                  </p>
                </>
              ) : <div className="flex min-h-[330px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-slate-500 sm:min-h-[510px]">Foto o video non ancora disponibile</div>}

