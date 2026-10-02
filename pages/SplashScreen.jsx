'use client';

import { useEffect, useState } from 'react';

const OPENING_IMAGE = 'https://raw.githubusercontent.com/5lordmaul5-del/RiverSpend/main/riverspend-opening.jpg';

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
      <button type="button" onClick={enter} aria-label="Entra in RiverSpend" className="absolute inset-0 h-full w-full cursor-pointer border-0 bg-transparent p-0">
        <img src={OPENING_IMAGE} alt="Apertura azzurra RiverSpend con il fiume luminoso e il pulsante Entra in RiverSpend" className="h-full w-full object-contain" />
      </button>
    </div>
  );
}
