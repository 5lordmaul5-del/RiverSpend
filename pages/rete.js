import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Rete() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('riverspend-rete') || '[]');
      setItems(Array.isArray(saved) ? saved : []);
    } catch {
      setItems([]);
    }
  }, []);

  function remove(id) {
    const next = items.filter((item) => String(item.id) !== String(id));
    setItems(next);
    localStorage.setItem('riverspend-rete', JSON.stringify(next));
  }

  function clearAll() {
    setItems([]);
    localStorage.removeItem('riverspend-rete');
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-teal-300 underline">← Torna al RiverSpendShop</Link>
        <header className="mt-6 mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-300">RiverSpendShop</p>
          <h1 className="mt-2 text-4xl font-bold">🕸️ La mia rete</h1>
          <p className="mt-2 text-slate-400">{items.length} articol{items.length === 1 ? 'o' : 'i'} nella tua rete.</p>
        </header>

        {items.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-slate-700 p-10 text-center">
            <p className="text-lg font-semibold">La rete è vuota</p>
            <p className="mt-2 text-sm text-slate-400">Apri un prodotto e aggiungilo alla rete.</p>
            <Link href="/" className="mt-5 inline-flex rounded-xl bg-teal-500 px-5 py-3 font-bold text-slate-950">Esplora prodotti</Link>
          </section>
        ) : (
          <>
            <div className="mb-5 flex justify-end">
              <button onClick={clearAll} className="rounded-xl border border-slate-700 px-4 py-2 text-sm">Svuota rete</button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                  {item.image ? <img src={item.image} alt={item.title || 'Prodotto'} className="h-48 w-full object-cover" /> : <div className="flex h-48 items-center justify-center bg-slate-800 text-slate-500">Foto non disponibile</div>}
                  <div className="p-4">
                    <h2 className="font-bold">{item.title || 'Prodotto'}</h2>
                    <p className="mt-2 text-xl font-bold text-teal-300">€ {Number(item.price || 0).toFixed(2)}</p>
                    <div className="mt-4 flex gap-2">
                      <Link href={'/prodotto/' + encodeURIComponent(item.id)} className="rounded-lg bg-teal-500 px-3 py-2 text-sm font-bold text-slate-950">Apri</Link>
                      <button onClick={() => remove(item.id)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm">Rimuovi</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
