"use client";

import { useRef, useState, useEffect } from "react";
import Head from "next/head";

const demoPrizes = [
  { label: "5 € di buono RiverSpendShop", icon: "🎁" },
  { label: "100 RiverMoney promozionali (demo)", icon: "💧" },
  { label: "Sconto 10% (demo)", icon: "🏷️" },
  { label: "Piccolo premio sorpresa (demo)", icon: "✨" },
  { label: "Nessun premio questa volta (demo)", icon: "🍀" },
];

export default function RsGrattaPage() {
  const canvasRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [prize, setPrize] = useState(null);
  const [demoTicket, setDemoTicket] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const grad = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    grad.addColorStop(0, "#c9a227"); grad.addColorStop(.5, "#f7e7a1"); grad.addColorStop(1, "#9a7414");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = "#183b3b"; ctx.font = "bold 22px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("GRATTA QUI", rect.width/2, rect.height/2);
    ctx.font = "bold 13px sans-serif"; ctx.fillText("RS GRATTA! · DEMO", rect.width/2, rect.height/2+28);
    ctx.globalCompositeOperation = "destination-out";
    const scratch = (e) => {
      const bounds = canvas.getBoundingClientRect();
      const x = (e.clientX-bounds.left), y = (e.clientY-bounds.top);
      ctx.beginPath(); ctx.arc(x,y,24,0,Math.PI*2); ctx.fill();
    };
    const down = (e) => { canvas.setPointerCapture?.(e.pointerId); scratch(e); };
    const move = (e) => { if (e.buttons) scratch(e); };
    canvas.addEventListener("pointerdown",down); canvas.addEventListener("pointermove",move);
    canvas.addEventListener("pointerup",up); canvas.addEventListener("pointercancel",up);
    return () => { canvas.removeEventListener("pointerdown",down); canvas.removeEventListener("pointermove",move); canvas.removeEventListener("pointerup",up); canvas.removeEventListener("pointercancel",up); };
  }, [revealed]);

  function revealDemo() {
    if (revealed) return;
    setPrize(demoPrizes[Math.floor(Math.random()*demoPrizes.length)]);
    setRevealed(true);
  }
  function reset() { setRevealed(false); setPrize(null); setDemoTicket(v=>v+1); }

  return (
    <>
      <Head><title>RS GRATTA! | RiverSpend</title><meta name="description" content="Prototipo dimostrativo del programma promozionale RS GRATTA! RiverSpend." /></Head>
      <main className="min-h-screen bg-slate-950 text-white px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <a href="/" className="text-sm font-bold text-teal-200">← RiverSpendShop</a>
          <section className="mt-5 overflow-hidden rounded-3xl border border-amber-300/30 bg-gradient-to-br from-teal-950 via-slate-900 to-amber-950 p-6 sm:p-10">
            <div className="text-center">
              <div className="text-sm font-black tracking-[.25em] text-amber-300">RIVERSPEND · PROGRAMMA PROMOZIONALE</div>
              <h1 className="mt-2 text-4xl font-black sm:text-6xl">RS <span className="text-amber-300">GRATTA!</span></h1>
              <p className="mx-auto mt-3 max-w-xl text-teal-100">Un biglietto promozionale gratuito associato agli acquisti qualificati, secondo un regolamento da approvare.</p>
            </div>
            <div className="mx-auto mt-8 max-w-xl rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="flex items-center justify-between text-sm"><span className="font-bold text-amber-200">Biglietto demo #{demoTicket}</span><span className="rounded-full bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-200">SIMULAZIONE</span></div>
              <div className="relative mt-4 min-h-[210px] overflow-hidden rounded-xl bg-slate-800">
                {revealed ? <div className="flex min-h-[210px] flex-col items-center justify-center gap-3 text-center"><span className="text-6xl">{prize?.icon}</span><h2 className="text-xl font-black text-amber-200">{prize?.label}</h2></div> : <div className="min-h-[210px]"><canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none cursor-crosshair" style={{touchAction:"none"}}/></div>}
              </div>
              <button onClick={revealDemo} className="mt-4 w-full rounded-xl bg-amber-300 px-5 py-3 font-black text-slate-950 hover:bg-amber-200">{revealed ? "Premio demo rivelato" : "Rivela risultato demo"}</button>
              {revealed && <button onClick={reset} className="mt-2 w-full rounded-xl border border-white/20 px-5 py-3 font-bold hover:bg-white/10">Nuovo biglietto demo</button>}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center"><div className="text-2xl">🎁</div><b>Premi</b><p className="text-xs text-teal-100">Buoni e prodotti</p></div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center"><div className="text-2xl">💧</div><b>RiverMoney</b><p className="text-xs text-teal-100">Crediti promozionali non convertibili</p></div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center"><div className="text-2xl">🛍️</div><b>RiverSpendShop</b><p className="text-xs text-teal-100">Premi da usare nel marketplace</p></div>
            </div>
          </section>
          <section className="mt-5 rounded-2xl border border-amber-200/20 bg-slate-900 p-5 text-sm leading-6 text-slate-300">
            <b className="text-amber-200">Prototipo non attivo.</b> Il risultato è simulato localmente: non assegna premi, non registra acquisti, non crea saldo e non offre probabilità reali. Prima del lancio occorrono regolamento, verifica legale della manifestazione a premio, budget e inventario, logica server-side anti-manomissione, gestione degli ordini idonei e protezione anti-abuso.
          </section>
        </div>
      </main>
    </>
  );
}
