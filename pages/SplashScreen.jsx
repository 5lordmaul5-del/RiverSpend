'use client';

import { useEffect, useRef, useState } from 'react';

export default function SplashScreen({ onEnter }) {
  const [visible, setVisible] = useState(false);
  const entered = useRef(false);

  function enterShop() {
    if (entered.current) return;
    entered.current = true;
    setVisible(false);
    window.setTimeout(() => {
      if (onEnter) onEnter();
    }, 250);
  }

  useEffect(() => {
    const inTimer = window.setTimeout(() => setVisible(true), 30);
    // Mantiene una sola apertura breve; si l'utente vuole entrare prima,
    // può usare il pulsante visibile.
    const outTimer = window.setTimeout(() => enterShop(), 5000);

    return () => {
      window.clearTimeout(inTimer);
      window.clearTimeout(outTimer);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#12b7df] transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-label="Apertura RiverSpend"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#72edf0] via-[#12b7df] to-[#087f9e]" />
      <div className="relative flex h-full w-full max-w-5xl flex-col items-center justify-center gap-5 px-4 py-8">
        <img
          src="/riverspend-home-river-market.svg"
          alt="RiverSpend — YOUR SHOP • YOUR FLOW"
          className="max-h-[68dvh] w-full object-contain drop-shadow-xl"
        />
        <button
          type="button"
          onClick={enterShop}
          className="rounded-full border border-white/80 bg-white px-8 py-4 text-base font-extrabold tracking-wide text-[#07566c] shadow-xl transition-transform active:scale-95"
        >
          ENTRA IN RIVERSPENDSHOP →
        </button>
        <p className="text-center text-xs font-semibold tracking-[0.2em] text-white">
          YOUR SHOP • YOUR FLOW
        </p>
      </div>
    </div>
  );
}
