'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen({ onEnter }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const inTimer = setTimeout(() => setVisible(true), 50);

    const outTimer = setTimeout(() => {
      setVisible(false);

      setTimeout(() => {
        if (onEnter) onEnter();
      }, 900);
    }, 5000);

    return (
    <div className={`fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-[#8edcf0] transition-opacity duration-[500ms] ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex w-full flex-col items-center justify-center px-5 text-center">
        <h1 className="whitespace-nowrap text-[clamp(2.8rem,13vw,5.5rem)] font-extrabold leading-none tracking-tight text-[#087f91]">
          RiverSpend
        </h1>
        <span className="mt-1 translate-x-8 -rotate-6 text-xl font-bold italic text-amber-500">Shop</span>
        <p className="mt-4 text-xs font-semibold tracking-[0.22em] text-[#31566f]">YOUR SHOP • YOUR FLOW</p>
      </div>
    </div>
  );
}
