'use client';

import { useEffect, useState } from 'react';

export default function Vendi() {
  const [products, setProducts] = useState([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('Nuovo');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function loadProducts() {
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title || !price) {
      setMessage('Inserisci almeno nome e prezzo.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          price,
          description,
          condition,
          image
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Errore');
      }

      setProducts(prev => [data, ...prev]);
      setTitle('');
      setPrice('');
      setDescription('');
      setCondition('Nuovo');
      setImage('');
      setMessage('✅ Prodotto pubblicato!');
    } catch (error) {
      setMessage('❌ Errore: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 p-4">
      <div className="max-w-5xl mx-auto">

        <header className="mb-6">
          <h1 className="text-3xl font-bold text-teal-700">
            RiverSpend
          </h1>
          <p className="text-slate-600">
            Vendi i tuoi prodotti
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow p-5 mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">
            Carica un prodotto
          </h2>

          <input
            className="w-full border rounded-xl p-3 mb-3"
            placeholder="Nome prodotto"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          <input
            className="w-full border rounded-xl p-3 mb-3"
            type="number"
            step="0.01"
            placeholder="Prezzo €"
            value={price}
            onChange={e => setPrice(e.target.value)}
          />

          <select
            className="w-full border rounded-xl p-3 mb-3"
            value={condition}
            onChange={e => setCondition(e.target.value)}
          >
            <option>Nuovo</option>
            <option>Usato</option>
            <option>Come nuovo</option>
          </select>

          <input
            className="w-full border rounded-xl p-3 mb-3"
            placeholder="URL foto prodotto"
            value={image}
            onChange={e => setImage(e.target.value)}
          />

          <textarea
            className="w-full border rounded-xl p-3 mb-4"
            rows="4"
            placeholder="Descrizione prodotto"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white font-bold rounded-xl p-3"
          >
            {loading ? 'Pubblicazione...' : '🚀 PUBBLICA PRODOTTO'}
          </button>

          {message && (
            <p className="mt-4 font-semibold">
              {message}
            </p>
          )}
        </form>

        <section>
          <h2 className="text-2xl font-bold mb-4">
            Prodotti in vendita
          </h2>

          {products.length === 0 ? (
            <p>Nessun prodotto disponibile.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map(product => (
                <article
                  key={product.id}
                  className="bg-white rounded-2xl shadow overflow-hidden"
                >
                  {product.images?.[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-48 object-cover"
                    />
                  )}

                  <div className="p-4">
                    <h3 className="font-bold text-lg">
                      {product.title}
                    </h3>

                    <p className="text-teal-700 text-xl font-bold mt-2">
                      € {Number(product.price).toFixed(2)}
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                      {product.condition}
                    </p>

                    <p className="text-slate-600 mt-2">
                      {product.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
