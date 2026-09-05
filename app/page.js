'use client';
import { useState } from 'react';

export default function RiverSpendHome() {
  const [isActive, setIsActive] = useState(false);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 selection:bg-emerald-500 selection:text-slate-950">
      <div className="text-center space-y-6 max-w-lg w-full">
        
        {/* Logo Interattivo */}
        <div 
          onClick={() => setIsActive(!isActive)}
          className="cursor-pointer group inline-flex flex-col items-center p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all shadow-2xl hover:shadow-emerald-500/10"
        >
          <div className="flex items-center gap-3">
            <span className={`text-5xl transition-transform duration-300 ${isActive ? 'scale-125 rotate-12' : 'group-hover:scale-110'}`}>
              🌊
            </span>
            <h1 className="text-4xl font-extrabold tracking-wider bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              RiverSpend
            </h1>
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mt-3 font-medium">
            your shop your flow
          </p>
          
          <div className={`mt-6 text-xs px-4 py-1.5 rounded-full transition-all ${isActive ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}>
            {isActive ? '✨ Sistema Attivo & Connesso' : 'Tocca per attivare il flusso'}
          </div>
        </div>

        <p className="text-slate-400 text-sm">
          Pagina di apertura pulita. Da qui in poi aggiungeremo i prossimi blocchi passo dopo passo, esattamente come desideri.
        </p>

      </div>
    </main>
  );
}

