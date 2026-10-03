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
    <main className="min-h-screen bg-[#c9f1f3] px-4 py-8 text-[#173f4a]">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-[#075b78] underline">← Torna al RiverSpendShop</Link>
        <header className="mt-6 mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#087f9b]">RiverSpendShop</p>
          <h1 className="mt-2 text-4xl font-bold">🕸️ La mia rete</h1>
          <p className="mt-2 text-[#496575]">{items.length} articol{items.length === 1 ? 'o' : 'i'} nella tua rete.</p>
        </header>

        {items.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-[#8bd9e3] bg-[#f4feff] p-10 text-center shadow-lg shadow-[#075b78]/5">
            <p className="text-lg font-semibold text-[#173f4a]">La rete è vuota</p>
            <p className="mt-2 text-sm text-[#496575]">Apri un prodotto e aggiungilo alla rete.</p>
            <Link href="/" className="mt-5 inline-flex rounded-xl bg-[#079fbd] px-5 py-3 font-bold text-white shadow-md shadow-[#075b78]/15">Esplora prodotti</Link>
          </section>
        ) : (
          <>
            <div className="mb-5 flex justify-end">
              <button onClick={clearAll} className="rounded-xl border border-[#8bd9e3] bg-[#f4feff] px-4 py-2 text-sm text-[#075b78]">Svuota rete</button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-2xl border border-[#a8dfe5] bg-[#f4feff] shadow-lg shadow-[#075b78]/5">
                  {item.image ? <img src={item.image} alt={item.title || 'Prodotto'} className="h-48 w-full object-cover" /> : <div className="flex h-48 items-center justify-center bg-[#e4f8fa] text-[#66838d]">Foto non disponibile</div>}
                  <div className="p-4">
                    <h2 className="font-bold text-[#173f4a]">{item.title || 'Prodotto'}</h2>
                    <p className="mt-2 text-xl font-bold text-[#087f9b]">€ {Number(item.price || 0).toFixed(2)}</p>
                    <div className="mt-4 flex gap-2">
                      <Link href={'/prodotto/' + encodeURIComponent(item.id)} className="rounded-lg bg-[#079fbd] px-3 py-2 text-sm font-bold text-white">Apri</Link>
                      <button onClick={() => remove(item.id)} className="rounded-lg border border-[#8bd9e3] bg-white px-3 py-2 text-sm text-[#075b78]">Rimuovi</button>
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
