'use client';
import { useState } from 'react';

export default function RiverSpendMarketplace() {
  const [cartCount, setCartCount] = useState(0);

  const products = [
    { id: 1, title: 'Smartwatch Minimal', price: '€129.00', badge: 'RiverLogistics' },
    { id: 2, title: 'Kit Benessere Eco', price: '€45.00', badge: 'Protezione Shield' },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8 selection:bg-emerald-500 selection:text-slate-950">
      {/* Header */}
      <header className="max-w-4xl mx-auto flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            RiverSpend
          </h1>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-medium">
            your shop your flow
          </p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm font-medium hover:border-emerald-500/50 transition-all flex items-center gap-2">
          🛒 Carrello <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs">{cartCount}</span>
        </button>
      </header>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto mt-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-slate-200">🔥 In Evidenza nel Flusso</h2>
          <span className="text-xs text-emerald-400 font-medium">Sistema Attivo</span>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map((p) => (
            <div key={p.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-3">
              <div className="h-40 rounded-xl bg-slate-800 flex items-center justify-center text-3xl">
                📦
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-sm text-slate-100">{p.title}</h3>
                  <p className="text-xs text-emerald-400 font-semibold mt-1">{p.price}</p>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  {p.badge}
                </span>
              </div>
              <button 
                onClick={() => setCartCount(cartCount + 1)}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all active:scale-95 shadow-lg shadow-emerald-500/10"
              >
                Aggiungi al Carrello
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
