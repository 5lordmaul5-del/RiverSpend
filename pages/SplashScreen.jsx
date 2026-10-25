'use client';

import { useEffect, useRef, useState } from 'react';

export default function SplashScreen({ onEnter }) {
  const [visible, setVisible] = useState(true);
  const entered = useRef(false);

  function enterShop(withVoice = false) {
    if (entered.current) return;
    entered.current = true;

    // I browser mobili bloccano l'audio automatico: la voce parte solo dopo
    // una scelta esplicita del visitatore.
    if (withVoice && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const welcome = new SpeechSynthesisUtterance(
          'Bip… bip… Sistema RiverSpend attivo. Benvenuti su RiverSpendShop! Il vostro shopping, il vostro mondo. Io sono Nova, la vostra assistente virtuale. Pronti a esplorare? RiverSpendShop… il futuro dello shopping è qui!'
        );
        welcome.lang = 'it-IT';
        welcome.pitch = 0.78;
        welcome.rate = 0.92;
        welcome.volume = 0.9;
        const italianVoice = window.speechSynthesis.getVoices().find((voice) => /^it([-_]|$)/i.test(voice.lang));
        if (italianVoice) welcome.voice = italianVoice;
        window.speechSynthesis.speak(welcome);
      } catch (error) {
        console.warn('Voce di benvenuto Nova non disponibile:', error);
      }
    }

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
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => enterShop(true)}
            className="rounded-full border border-white/90 bg-white px-8 py-4 text-base font-extrabold tracking-wide text-[#07566c] shadow-xl transition-transform active:scale-95"
          >
            🔊 ENTRA CON NOVA
          </button>
          <button
            type="button"
            onClick={() => enterShop(false)}
            className="rounded-full border border-white/60 bg-[#07566c]/25 px-6 py-2.5 text-sm font-bold text-white shadow transition-transform active:scale-95"
          >
            Entra senza audio
          </button>
        </div>
      </div>
    </div>
  );
}
