'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen({ onEnter }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const inTimer = setTimeout(() => setVisible(true), 50);
    const outTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => { if (onEnter) onEnter(); }, 500);
    }, 3000);
    return () => {
      clearTimeout(inTimer);
      clearTimeout(outTimer);
    };
  }, [onEnter]);

  return (
    <div className={`fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-white transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex w-full flex-col items-center justify-center px-5 text-center">
        <h1 className="whitespace-nowrap text-[clamp(3.2rem,15vw,6rem)] font-extrabold leading-none tracking-tight text-slate-800">RiverSpend</h1>
        <span className="mt-1 translate-x-8 -rotate-6 text-xl font-bold italic text-amber-500">Shop</span>
        <p className="mt-4 text-xs font-semibold tracking-[0.22em] text-slate-600">YOUR SHOP • YOUR FLOW</p>
      </div>
    </div>
  );
}
