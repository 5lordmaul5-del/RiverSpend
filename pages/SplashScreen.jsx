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

    return () => {
      clearTimeout(inTimer);
      clearTimeout(outTimer);
    };
  }, [onEnter]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-black transition-opacity duration-[900ms] ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="relative h-full w-full overflow-hidden bg-gradient-to-b from-sky-900 via-cyan-700 to-blue-950">
        <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_50%_15%,rgba(255,255,255,.8),transparent_18%),linear-gradient(180deg,#075985,#0891b2_45%,#082f49)]" />

        <div className="absolute left-1/2 top-[42%] -translate-x-1/2 text-center">
          <h1 className="whitespace-nowrap text-5xl font-extrabold tracking-tight">
            <span className="text-cyan-300">River</span><span className="text-yellow-400">Spend</span>
          </h1>
          <p className="mt-3 text-sm font-medium tracking-[0.25em] text-white">
            YOUR SHOP, YOUR FLOW
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-blue-950 via-cyan-900/60 to-transparent" />

        <div className="absolute bottom-[12%] left-1/2 h-16 w-[85%] -translate-x-1/2 rounded-[50%] bg-cyan-300/20 blur-xl animate-pulse" />

        <div className="absolute left-[12%] top-[55%] text-4xl animate-[swim_7s_ease-in-out_infinite]">🐟</div>
        <div className="absolute right-[12%] top-[38%] text-4xl animate-[swim_8s_ease-in-out_infinite_reverse]">🐠</div>
        <div className="absolute right-[18%] bottom-[25%] text-3xl animate-[swim_9s_ease-in-out_infinite]">🐟</div>

        <style jsx>{`
          @keyframes swim {
            0%,100% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(45px) translateY(-18px); }
          }
        `}</style>
      </div>
    </div>
  );
}
