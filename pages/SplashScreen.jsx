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
        <h1 className="w-full whitespace-nowrap text-center text-[clamp(3.6rem,19vw,8rem)] font-extrabold leading-none tracking-[-0.055em] text-[#173653]">RiverSpend</h1>
        <span className="mt-0 translate-x-12 -rotate-6 text-5xl font-extrabold italic text-[#B8860B] drop-shadow-[0_1px_0_#F5D76E] sm:text-6xl">Shop</span>
        <p className="mt-5 text-base font-bold tracking-[0.18em] text-slate-700 sm:text-lg">YOUR SHOP • YOUR FLOW</p>
      </div>
    </div>
  );
}
