import { useEffect, useRef, useState } from 'react';

const styles = {
  premium: { name: '🏆 Premium', bg: ['#071c2c', '#0e7490'], accent: '#f5c451' },
  energia: { name: '⚡ Energia', bg: ['#111827', '#0891b2'], accent: '#67e8f9' },
  luxury: { name: '💎 Luxury', bg: ['#111827', '#312e81'], accent: '#f5d0fe' },
  social: { name: '📱 Social', bg: ['#082f49', '#0f766e'], accent: '#a7f3d0' }
};

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = URL.createObjectURL(file);
  });
}

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
  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState('');
  const [resultType, setResultType] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => () => { if (resultUrl) URL.revokeObjectURL(resultUrl); }, [resultUrl]);

  function onPhotos(e) { setPhotos(Array.from(e.target.files || []).slice(0, 20)); }
  function onLogo(e) { setLogo(e.target.files?.[0] || null); }

  async function createSpot() {
    if (!photos.length) { alert('Carica almeno una foto per creare lo spot.'); return; }
    if (!canvasRef.current || !window.MediaRecorder) {
      alert('Il browser non supporta il rendering video automatico richiesto.');
      return;
    }

    setRendering(true); setProgress(0);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl('');

    const canvas = canvasRef.current;
    canvas.width = 720; canvas.height = 1280;
    const ctx = canvas.getContext('2d');
    const imgs = await Promise.all(photos.map(loadImage));
    const totalFrames = Math.max(1, Math.round(duration * 20));
    const fps = 20;
    const stream = canvas.captureStream(fps);

    let audioContext;
    let destination;
    if (music !== 'none') {
      audioContext = new AudioContext();
      destination = audioContext.createMediaStreamDestination();
      const gain = audioContext.createGain();
      gain.gain.value = 0.035;
      gain.connect(destination);
      const notes = music === 'energetic' ? [220, 277, 330, 440] : music === 'elegant' ? [196, 247, 294, 392] : [174, 220, 261, 329];
      const step = audioContext.sampleRate ? 0.45 : 0.45;
      const endAt = audioContext.currentTime + duration + 1;
      let i = 0;
      const tick = () => {
        if (!audioContext || audioContext.currentTime >= endAt) return;
        const osc = audioContext.createOscillator();
        const g = audioContext.createGain();
        osc.frequency.value = notes[i++ % notes.length];
        osc.type = music === 'social' ? 'square' : 'sine';
        g.gain.setValueAtTime(0.0001, audioContext.currentTime);
        g.gain.exponentialRampToValueAtTime(0.05, audioContext.currentTime + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + step);
        osc.connect(g).connect(gain); osc.start(); osc.stop(audioContext.currentTime + step);
        setTimeout(tick, step * 1000);
      };
      tick();
    }

    const tracks = [...stream.getVideoTracks()];
    if (destination) tracks.push(destination.stream.getAudioTracks()[0]);
    const mixed = new MediaStream(tracks);
    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm';
    const recorder = new MediaRecorder(mixed, { mimeType: mime, videoBitsPerSecond: 4500000 });
    const chunks = [];
    recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    const done = new Promise(resolve => { recorder.onstop = resolve; });
    recorder.start(250);

    const theme = styles[style] || styles.premium;
    for (let frame = 0; frame < totalFrames; frame++) {
      const t = frame / totalFrames;
      const index = Math.min(imgs.length - 1, Math.floor(t * imgs.length));
      const img = imgs[index];
      const local = (t * imgs.length) % 1;
      const scale = 1.02 + local * 0.05;
      ctx.fillStyle = theme.bg[0]; ctx.fillRect(0, 0, 720, 1280);
      const ratio = Math.max(720 / img.width, 780 / img.height) * scale;
      const w = img.width * ratio, h = img.height * ratio;
      ctx.drawImage(img, (720 - w) / 2, 110 + (780 - h) / 2);

      const gradient = ctx.createLinearGradient(0, 650, 0, 1280);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,.88)');
      ctx.fillStyle = gradient; ctx.fillRect(0, 450, 720, 830);

      ctx.fillStyle = theme.accent; ctx.font = 'bold 24px sans-serif'; ctx.fillText('RS SPONS · DEMO', 40, 55);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 54px sans-serif';
      wrapText(ctx, headline || 'IL TUO BRAND', 40, 930, 620, 62);
      ctx.font = 'bold 30px sans-serif'; wrapText(ctx, offer || 'La tua offerta, resa uno spot.', 40, 1055, 620, 40);
      ctx.fillStyle = theme.accent; roundRect(ctx, 40, 1150, 300, 62, 31); ctx.fillStyle = '#071c2c'; ctx.font = 'bold 25px sans-serif'; ctx.fillText(cta || 'Scopri ora', 65, 1190);
      ctx.fillStyle = '#d1d5db'; ctx.font = '18px sans-serif'; ctx.fillText(category.toUpperCase() + ' · ' + (voice === 'nessuna' ? 'MUSICA' : 'VOCE + MUSICA'), 40, 1245);

      setProgress(Math.round((frame / (totalFrames - 1)) * 100));
      await new Promise(r => requestAnimationFrame(r));
    }

    recorder.stop();
    await done;
    audioContext?.close();
    const blob = new Blob(chunks, { type: mime });
    setResultType('video/webm');
    setResultUrl(URL.createObjectURL(blob));
    setRendering(false); setProgress(100);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-cyan-100 via-sky-50 to-white px-4 py-7 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <a href="/rs-spons" className="text-sm font-bold text-cyan-700">← RS Spons</a>
        <header className="mt-5 rounded-3xl border border-amber-300 bg-white p-6 shadow-xl sm:p-9">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-700">RS SPONS CREATOR · RENDER REALE DEMO</span>
          <h1 className="mt-4 text-3xl font-black sm:text-5xl">🎬 Crea automaticamente il tuo spot</h1>
          <p className="mt-3 max-w-3xl text-slate-600">Carichi il materiale, scegli stile, durata e audio: il browser di RiverSpend genera realmente un video pubblicitario demo.</p>
        </header>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <section className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
              <h2 className="text-xl font-black">1 · Materiale</h2>
              <label className="mt-4 block cursor-pointer rounded-2xl border-2 border-dashed border-cyan-300 bg-cyan-50 p-5">
                <strong>📸 Foto prodotto · fino a 20</strong><p className="mt-1 text-sm text-slate-600">Il Creator le trasforma in uno spot verticale.</p>
                <input type="file" accept="image/*" multiple className="mt-3 w-full text-sm" onChange={onPhotos} />
              </label>
              <label className="mt-3 block cursor-pointer rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-5">
                <strong>🏷️ Logo aziendale · opzionale</strong><input type="file" accept="image/*" className="mt-3 w-full text-sm" onChange={onLogo} />
              </label>
              <p className="mt-3 text-sm text-slate-600">{photos.length ? '✅ ' + photos.length + ' foto pronte' : 'Nessuna foto caricata'}{logo ? ' · ✅ Logo pronto' : ''}</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
              <h2 className="text-xl font-black">2 · Pubblicità</h2>
              <div className="mt-4 grid gap-3">
                <input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="Titolo · es. NUOVA OFFERTA" className="rounded-xl border border-slate-300 px-4 py-3" />
                <input value={offer} onChange={e => setOffer(e.target.value)} placeholder="Offerta · es. -30% questa settimana" className="rounded-xl border border-slate-300 px-4 py-3" />
                <input value={cta} onChange={e => setCta(e.target.value)} placeholder="CTA · es. Scopri ora" className="rounded-xl border border-slate-300 px-4 py-3" />
                <select value={category} onChange={e => setCategory(e.target.value)} className="rounded-xl border border-slate-300 px-4 py-3"><option value="retail">🛒 Retail</option><option value="food">🍔 Food</option><option value="tech">📱 Tecnologia</option><option value="fashion">👕 Moda</option><option value="travel">✈️ Viaggi</option><option value="services">🧰 Servizi</option><option value="other">✨ Altro</option></select>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
              <h2 className="text-xl font-black">3 · Montaggio professionale</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">{Object.entries(styles).map(([id, s]) => <button key={id} type="button" onClick={() => setStyle(id)} className={'rounded-2xl border p-4 text-left ' + (style === id ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-100' : 'border-slate-200')}><strong>{s.name}</strong><p className="mt-1 text-xs text-slate-500">{id === 'premium' ? 'Elegante e istituzionale' : id === 'energia' ? 'Ritmo commerciale' : id === 'luxury' ? 'Alta gamma' : 'Social mobile-first'}</p></button>)}</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <label className="rounded-xl bg-slate-50 p-3 text-sm font-bold">Durata<select value={duration} onChange={e => setDuration(Number(e.target.value))} className="mt-2 w-full rounded-lg border p-2">{[6,10,15,20,30].map(n => <option key={n}>{n}</option>)}</select></label>
                <label className="rounded-xl bg-slate-50 p-3 text-sm font-bold">🎙️ Voce<select value={voice} onChange={e => setVoice(e.target.value)} className="mt-2 w-full rounded-lg border p-2"><option value="nessuna">Nessuna</option><option value="femminile">Voce femminile</option><option value="maschile">Voce maschile</option><option value="neutra">Voce neutra</option></select></label>
                <label className="rounded-xl bg-slate-50 p-3 text-sm font-bold">🎵 Audio<select value={music} onChange={e => setMusic(e.target.value)} className="mt-2 w-full rounded-lg border p-2"><option value="cinematic">Cinematic</option><option value="energetic">Energetic</option><option value="elegant">Elegant</option><option value="social">Social Beat</option><option value="none">Nessuna musica</option></select></label>
              </div>
            </div>

            <button disabled={rendering} type="button" onClick={createSpot} className="w-full rounded-2xl bg-cyan-600 px-6 py-4 text-lg font-black text-white shadow-xl disabled:opacity-60">
              {rendering ? '⏳ PRODUZIONE SPOT ' + progress + '%' : '✨ PRODUCI LO SPOT AUTOMATICAMENTE'}
            </button>
            <canvas ref={canvasRef} className="hidden" />
          </section>

          <aside className="h-fit rounded-3xl border border-amber-300 bg-white p-5 shadow-xl lg:sticky lg:top-5">
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-amber-600">Produzione</p>
            {resultUrl ? <div className="mt-4"><video src={resultUrl} controls playsInline className="w-full rounded-2xl bg-black" /><a href={resultUrl} download="riverspend-rs-spons-demo.webm" className="mt-4 block rounded-xl bg-cyan-600 px-4 py-3 text-center font-black text-white">⬇️ Scarica lo spot demo</a><p className="mt-3 text-xs text-slate-500">Formato generato: {resultType}. È un vero file video creato dal browser.</p></div> : <div className="mt-4 flex min-h-[430px] items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 p-6 text-center text-white"><div><div className="text-5xl">🎬</div><p className="mt-4 font-bold">Pronto a produrre lo spot</p><p className="mt-2 text-sm text-slate-300">Il rendering avviene direttamente sul dispositivo.</p></div></div>}
          </aside>
        </div>
      </div>
    </main>
  );
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(' ');
  let line = '';
  let yy = y;
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) { ctx.fillText(line, x, yy); line = word; yy += lineHeight; } else line = test;
  }
  ctx.fillText(line, x, yy);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill();
}
