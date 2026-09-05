'use client';
import { useState } from 'react';

export default function SplashScreen({ onEnter }) {
  const [fadeOut, setFadeOut] = useState(false);

  const handleStart = () => {
    // Riproduce il suono rilassante di un ruscello
    const streamAudio = new Audio('https://actions.google.com/sounds/v1/water/stream_water.ogg');
    streamAudio.play().catch(err => console.log("Audio riprodotto in autoplay limitato:", err));

    // Avvia l'animazione di chiusura della schermata
    setFadeOut(true);
    
    // Rimuove la schermata dopo la dissolvenza
    setTimeout(() => {
      if (onEnter) onEnter();
    }, 1000);
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-sky-950 to-blue-900 text-white transition-opacity duration-1000 ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="text-center px-6 max-w-2xl">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-teal-300 via-sky-200 to-white bg-clip-text text-transparent drop-shadow-md">
          RiverSpend
        </h1>
        <p className="text-xl md:text-2xl font-light tracking-wide text-sky-200/90 mb-10 italic">
          "Your shop, your flow"
        </p>
        
        <button
          onClick={handleStart}
          className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-teal-500 text-slate-950 font-bold text-lg shadow-lg shadow-teal-500/30 hover:bg-teal-400 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-teal-300/50 cursor-pointer"
        >
          <span>Entra nell'esperienza</span>
          <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>

      <div className="absolute bottom-8 text-xs text-sky-300/60 tracking-widest uppercase font-mono">
        Digital Commerce Flow
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import SplashScreen from './SplashScreen'; // o il percorso corretto

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <main className="relative min-h-screen bg-slate-900 text-white">
      {showSplash && (
        <SplashScreen onEnter={() => setShowSplash(false)} />
      )}

      {/* Contenuto principale del tuo shop RiverSpend */}
      <div className={`transition-opacity duration-700 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        <header className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-teal-400">RiverSpend</h2>
          <span className="text-sm text-slate-400">Your shop, your flow</span>
        </header>
        
        <section className="p-8 max-w-6xl mx-auto">
          <h3 className="text-3xl font-semibold mb-6">Catalogo Prodotti & Pagamenti</h3>
          {/* Qui va il resto della tua applicazione */}
        </section>
      </div>
    </main>
  );
}

