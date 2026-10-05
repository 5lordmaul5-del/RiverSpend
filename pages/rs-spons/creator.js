import { useMemo, useState } from 'react';

const styles = [
  ['premium', '🏆 Premium', 'Elegante, pulito, da grande brand'],
  ['energia', '⚡ Energia', 'Veloce, dinamico, commerciale'],
  ['luxury', '💎 Luxury', 'Ritmo lento, elegante, alta gamma'],
  ['social', '📱 Social', 'Verticale, rapido, mobile-first']
];

const durations = [6, 10, 15, 20, 30];

export default function RsSponsCreator() {
  const [photos, setPhotos] = useState([]);
  const [logo, setLogo] = useState(null);
  const [style, setStyle] = useState('premium');
  const [duration, setDuration] = useState(15);
  const [voice, setVoice] = useState('nessuna');
  const [music, setMusic] = useState('cinematic');
  const [category, setCategory] = useState('retail');
  const [headline, setHeadline] = useState('');
  const [offer, setOffer] = useState('');
  const [cta, setCta] = useState('Scopri ora');
  const [generated, setGenerated] = useState(false);

  const photoNames = useMemo(() => photos.map((file) => file.name), [photos]);

  function onPhotos(event) {
    setPhotos(Array.from(event.target.files || []).slice(0, 20));
  }

  function generateDemo() {
    setGenerated(true);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-cyan-100 via-sky-50 to-white px-4 py-7 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <a href="/rs-spons" className="text-sm font-bold text-cyan-700">← RS Spons</a>

        <header className="mt-5 rounded-3xl border border-amber-300 bg-white p-6 shadow-xl sm:p-9">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-700">DEMO · RS SPONS CREATOR</span>
          <h1 className="mt-4 text-3xl font-black sm:text-5xl">🎬 Crea la tua pubblicità</h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            Tu fornisci materiale, messaggio e obiettivo. RiverSpend prepara automaticamente la struttura dello spot.
          </p>
        </header>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <section className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
              <h2 className="text-xl font-black">1 · Materiale</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="cursor-pointer rounded-2xl border-2 border-dashed border-cyan-300 bg-cyan-50 p-5">
                  <span className="font-extrabold">📸 Foto prodotto</span>
                  <p className="mt-1 text-sm text-slate-600">Fino a 20 immagini</p>
                  <input type="file" accept="image/*" multiple className="mt-3 w-full text-sm" onChange={onPhotos} />
                </label>
                <label className="cursor-pointer rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50 p-5">
                  <span className="font-extrabold">🎥 Video opzionale</span>
                  <p className="mt-1 text-sm text-slate-600">Il Creator potrà usarlo nel montaggio</p>
                  <input type="file" accept="video/*" className="mt-3 w-full text-sm" />
                </label>
                <label className="cursor-pointer rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-5 sm:col-span-2">
                  <span className="font-extrabold">🏷️ Logo aziendale</span>
                  <input type="file" accept="image/*" className="mt-3 w-full text-sm" onChange={(e) => setLogo(e.target.files?.[0] || null)} />
                </label>
              </div>
              {photoNames.length > 0 && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">Caricate: <strong>{photoNames.length}</strong> foto</p>}
              {logo && <p className="mt-2 text-sm text-slate-600">Logo: <strong>{logo.name}</strong></p>}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
              <h2 className="text-xl font-black">2 · Messaggio pubblicitario</h2>
              <div className="mt-4 grid gap-3">
                <input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Titolo, es. NUOVA OFFERTA" className="rounded-xl border border-slate-300 px-4 py-3" />
                <input value={offer} onChange={(e) => setOffer(e.target.value)} placeholder="Offerta, es. -30% questa settimana" className="rounded-xl border border-slate-300 px-4 py-3" />
                <input value={cta} onChange={(e) => setCta(e.target.value)} placeholder="Pulsante, es. Scopri ora" className="rounded-xl border border-slate-300 px-4 py-3" />
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-slate-300 px-4 py-3">
                  <option value="retail">🛒 Retail</option>
                  <option value="food">🍔 Food</option>
                  <option value="tech">📱 Tecnologia</option>
                  <option value="fashion">👕 Moda</option>
                  <option value="travel">✈️ Viaggi</option>
                  <option value="services">🧰 Servizi</option>
                  <option value="other">✨ Altro</option>
                </select>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
              <h2 className="text-xl font-black">3 · Montaggio automatico</h2>
              <p className="mt-1 text-sm text-slate-600">Scegli lo stile. Il Creator decide ritmo, transizioni e disposizione del materiale.</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {styles.map(([id, name, desc]) => (
                  <button key={id} type="button" onClick={() => setStyle(id)} className={'rounded-2xl border p-4 text-left ' + (style === id ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-100' : 'border-slate-200 bg-white')}>
                    <strong>{name}</strong><p className="mt-1 text-xs text-slate-500">{desc}</p>
                  </button>
                ))}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <label className="rounded-xl bg-slate-50 p-3 text-sm font-bold">Durata<select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-2">{durations.map((n) => <option key={n}>{n}</option>)}</select></label>
                <label className="rounded-xl bg-slate-50 p-3 text-sm font-bold">🎙️ Voce<select value={voice} onChange={(e) => setVoice(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-2"><option value="nessuna">Nessuna</option><option value="femminile">Voce femminile</option><option value="maschile">Voce maschile</option><option value="neutra">Voce neutra</option></select></label>
                <label className="rounded-xl bg-slate-50 p-3 text-sm font-bold">🎵 Audio<select value={music} onChange={(e) => setMusic(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-2"><option value="cinematic">Cinematic</option><option value="energetic">Energetic</option><option value="elegant">Elegant</option><option value="social">Social Beat</option><option value="none">Nessuna musica</option></select></label>
              </div>
            </div>

            <button type="button" onClick={generateDemo} className="w-full rounded-2xl bg-cyan-600 px-6 py-4 text-lg font-black text-white shadow-xl hover:bg-cyan-700">
              ✨ CREA AUTOMATICAMENTE LO SPOT DEMO
            </button>
          </section>

          <aside className="h-fit rounded-3xl border border-amber-300 bg-white p-5 shadow-xl lg:sticky lg:top-5">
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-amber-600">Anteprima automatica</p>
            {!generated ? (
              <div className="mt-4 flex min-h-[430px] items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 p-6 text-center text-white">
                <div><div className="text-5xl">🎬</div><p className="mt-4 font-bold">Qui vedrai il tuo spot RS Spons</p><p className="mt-2 text-sm text-slate-300">Carica il materiale e premi “Crea automaticamente”.</p></div>
              </div>
            ) : (
              <div className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 text-white">
                <div className="flex min-h-[430px] flex-col justify-between p-6">
                  <div className="text-right text-xs font-bold text-amber-300">RS SPONS · DEMO</div>
                  <div>
                    <div className="text-5xl">✨</div>
                    <p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-cyan-300">{category}</p>
                    <h3 className="mt-2 text-3xl font-black">{headline || 'IL TUO BRAND'}</h3>
                    <p className="mt-3 text-xl font-bold">{offer || 'La tua offerta, resa uno spot.'}</p>
                  </div>
                  <div>
                    <p className="mb-4 text-sm text-slate-300">{photos.length ? photos.length + ' foto' : 'Materiale demo'} · {duration}s · {style} · 🎵 {music} · 🎙️ {voice}</p>
                    <span className="inline-block rounded-full bg-cyan-500 px-5 py-3 font-black">{cta}</span>
                  </div>
                </div>
              </div>
            )}
            <div className="mt-4 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-slate-700">
              <strong>🤖 Automatico:</strong> nella versione reale il motore genererà il montaggio video, mixerà audio/voce, applicherà transizioni e produrrà il file pubblicitario finale.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
