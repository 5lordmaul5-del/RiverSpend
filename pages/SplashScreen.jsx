'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen({ onEnter }) {
  const [visible, setVisible] = useState(false);

  function enter() {
    setVisible(false);
    window.setTimeout(() => { if (onEnter) onEnter(); }, 500);
  }

  useEffect(() => {
    const inTimer = window.setTimeout(() => setVisible(true), 50);
    const outTimer = window.setTimeout(enter, 5000);
    return () => {
      window.clearTimeout(inTimer);
      window.clearTimeout(outTimer);
    };
  }, [onEnter]);

  return (
    <div className={`fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-hidden bg-[#08b8d0] transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <button
        type="button"
        onClick={enter}
        aria-label="Entra in RiverSpend"
        className="absolute inset-0 flex h-full w-full cursor-pointer flex-col items-center justify-center border-0 bg-transparent px-6"
      >
        <div className="flex items-center justify-center text-center text-[clamp(2.5rem,10vw,6.5rem)] font-semibold leading-none tracking-[-0.065em]">
          <span className="text-white">River</span>
          <span className="bg-gradient-to-b from-[#fff4c2] to-[#d9a52e] bg-clip-text text-transparent">Spend</span>
        </div>
        <svg
          aria-hidden="true"
          viewBox="0 0 180 30"
          className="mt-3 h-7 w-36"
          fill="none"
        >
          <path d="M4 15 C18 1 32 1 46 15 S74 29 88 15 S116 1 130 15 S158 29 176 12" stroke="#e8fbff" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M4 23 C18 9 32 9 46 23 S74 37 88 23 S116 9 130 23 S158 37 176 20" stroke="#b9f4fb" strokeWidth="2" strokeLinecap="round" opacity=".9" />
        </svg>
        <span className="mt-5 text-xs font-medium tracking-[0.28em] text-white/90 sm:text-sm">YOUR SHOP • YOUR FLOW</span>
        <span className="absolute bottom-8 text-xs text-white/75">Tocca per entrare</span>
      </button>
    </div>
  );
}
