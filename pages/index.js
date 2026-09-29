'use client';

import { useEffect, useState } from 'react';
import SplashScreen from './SplashScreen';
import { supabase } from '../lib/supabase';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setLoadingProducts(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, price, condition, category, image, status')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (!active) return;
      if (error) {
        console.error('Errore caricamento prodotti RiverSpend:', error);
        setProductsError('Non è stato possibile caricare i prodotti. Riprova più tardi.');
        setProducts([]);
      } else {
        setProducts(data || []);
        setProductsError('');
      }
      setLoadingProducts(false);
    }

    loadProducts();
    return () => { active = false; };
  }, []);

  return (
    <main className="relative min-h-screen bg-slate-50 text-slate-900">
      {showSplash && (
        <SplashScreen onEnter={() => setShowSplash(false)} />
      )}

      <div className={`transition-opacity duration-700 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
        <header className="p-5 border-b border-slate-200 bg-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-teal-600">RiverSpend</h2>
            <span className="text-sm text-slate-500">YOUR SHOP • YOUR FLOW</span>
          </div>
        </header>

        <section className="p-5 max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">RiverSpendShop</h1>
          <p className="text-slate-600 mb-6">Scopri i prodotti pubblicati dalla community.</p>

          <h2 className="text-2xl font-semibold mb-4">Prodotti disponibili</h2>

          {loadingProducts && (
            <p className="text-slate-600" role="status">Caricamento prodotti…</p>
          )}

          {!loadingProducts && productsError && (
            <p className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700" role="alert">
              {productsError}
            </p>
          )}

          {!loadingProducts && !productsError && products.length === 0 && (
            <p className="rounded-xl bg-white border border-slate-200 p-4 text-slate-600">
              Al momento non ci sono prodotti pubblicati.
            </p>
          )}

          {!loadingProducts && !productsError && products.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <article key={product.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name || 'Prodotto RiverSpend'}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="h-40 bg-cyan-50 flex items-center justify-center text-cyan-700 text-sm">
                      Foto non disponibile
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-semibold leading-snug">{product.name || 'Prodotto senza nome'}</h3>
                    {product.condition && <p className="text-sm text-slate-500 mt-1">{product.condition}</p>}
                    {product.category && <p className="text-xs text-slate-500 mt-1">{product.category}</p>}
                    <p className="text-lg font-bold text-teal-700 mt-2">
                      {product.price != null ? new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number(product.price)) : 'Prezzo non disponibile'}
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
