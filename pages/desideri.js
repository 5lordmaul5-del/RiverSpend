import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Desideri() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    try { const x = JSON.parse(localStorage.getItem('riverspend-wishlist') || '[]'); setItems(Array.isArray(x) ? x : []); } catch { setItems([]); }
  }, []);
  function remove(id) {
    const next = items.filter((x) => String(x.id) !== String(id));
    setItems(next);
    localStorage.setItem('riverspend-wishlist', JSON.stringify(next));
  }
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-teal-300 underline">← RiverSpendShop</Link>
        <h1 className="mt-6 text-4xl font-bold">♡ Lista dei desideri</h1>
        <p className="mt-2 text-slate-400">{items.length} articol{items.length === 1 ? 'o' : 'i'}</p>
        {!items.length ? (
          <section className="mt-8 rounded-2xl border border-dashed border-slate-700 p-10 text-center">
            <p className="font-semibold">Nessun desiderio salvato</p>
            <Link href="/" className="mt-5 inline-block rounded-xl bg-teal-500 px-5 py-3 font-bold text-slate-950">Esplora prodotti</Link>
          </section>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                {item.image ? <img src={item.image} alt={item.title || 'Prodotto'} className="h-48 w-full object-cover" /> : null}
                <div className="p-4">
                  <h2 className="font-bold">{item.title}</h2>
                  <p className="mt-2 text-xl font-bold text-teal-300">€ {Number(item.price || 0).toFixed(2)}</p>
                  <div className="mt-4 flex gap-2">
                    <Link href={'/prodotto/' + encodeURIComponent(item.id)} className="rounded-lg bg-teal-500 px-3 py-2 text-sm font-bold text-slate-950">Apri</Link>
                    <button onClick={() => remove(item.id)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm">Rimuovi</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
