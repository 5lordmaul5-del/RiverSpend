'use client';

import { useState } from 'react';
import SplashScreen from './SplashScreen';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <main className="relative min-h-screen bg-slate-950 text-white">

      {showSplash && (
        <SplashScreen
          onEnter={() => setShowSplash(false)}
        />
      )}

      <div
        className={`transition-opacity duration-700 ${
          showSplash ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <header className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-teal-400">
              RiverSpend
            </h2>
            <span className="text-sm text-slate-400">
              Your shop, your flow
            </span>
          </div>
        </header>

        <section className="p-8 max-w-6xl mx-auto">
          <h3 className="text-3xl font-semibold mb-6">
            Catalogo Prodotti & Pagamenti
          </h3>

          <p className="text-slate-400">
            Benvenuto in RiverSpend.
          </p>
        </section>
      </div>

    </main>
  );
}
