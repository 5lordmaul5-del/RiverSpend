'use client';
import { useState } from 'react';

export default function RiverSpendNewHome() {
  const [entered, setEntered] = useState(false);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 selection:bg-emerald-500 selection:text-slate-950">
      <div className="max-w-md w-full text-center space-y-8">
        
        {/* Logo & Brand */}
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 shadow-2xl shadow-emerald-500/10 mb-2">
            <span className="text-4xl">🌊</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
            RiverSpend
          </h1>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-400 font-semibold">
            your shop your flow
          </p>
        </div>

        {/* Descrizione Benvenuto */}
        <p className="text-slate-400 text-sm leading-relaxed">
          Benvenuto nella nuovissima generazione del marketplace. Flusso rapido, sicuro e completamente riprogettato.
        </p>

        {/* Azione Principale */}
        <div className="space-y-3 pt-4">
          <button 
            onClick={() => setEntered(true)}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm tracking-wide transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            {entered ? '✨ Flusso Connesso!' : 'Entra nel Nuovo Marketplace 🚀'}
          </button>
          
          <p className="text-[11px] text-slate-500">
            {entered ? 'Ottimo! La base è attiva. Qual è il prossimo blocco che vuoi aggiungere?' : 'Tocca il pulsante per avviare la nuova esperienza.'}
          </p>
        </div>

      </div>
    </main>
  );
}
