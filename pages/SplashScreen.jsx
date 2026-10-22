'use client';

import { useEffect, useRef, useState } from 'react';

export default function SplashScreen({ onEnter }) {
  const [visible, setVisible] = useState(true);
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
    return undefined;
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#12b7df] transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-label="RiverSpendShop"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#72edf0] via-[#12b7df] to-[#087f9e]" />
      <div className="relative flex h-full w-full flex-col items-center justify-center gap-8 px-5 py-8">
        <h1 className="text-center text-4xl font-black tracking-tight text-white drop-shadow-lg sm:text-6xl">
          RiverSpendShop
        </h1>
        <button
          type="button"
          onClick={enterShop}
          className="rounded-full border border-white/80 bg-white px-8 py-4 text-base font-extrabold tracking-wide text-[#07566c] shadow-xl transition-transform active:scale-95"
        >
          CLICCA PER ENTRARE
        </button>
      </div>
    </div>
  );
}
