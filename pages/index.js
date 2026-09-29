'use client';

import { useEffect, useState } from 'react';
import SplashScreen from './SplashScreen';
import { supabase } from '../lib/supabase';

const pageStyle = { minHeight: '100vh', background: '#eaf8f8', color: '#12343b', fontFamily: 'Arial, Helvetica, sans-serif' };

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
    <main style={pageStyle}>
      {showSplash && <SplashScreen onEnter={() => setShowSplash(false)} />}
      <div style={{ opacity: showSplash ? 0 : 1, transition: 'opacity 700ms' }}>
        <header style={{ background: 'linear-gradient(110deg,#063b52,#087e91)', color: 'white', padding: '18px 20px', boxShadow: '0 3px 12px #073b522b' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.5px' }}>RiverSpend</div>
            <div style={{ fontSize: 11, letterSpacing: 2, marginTop: 3 }}>YOUR SHOP • YOUR FLOW</div>
          </div>
        </header>
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '26px 16px 48px' }}>
          <div style={{ background: 'linear-gradient(120deg,#d2f5f1,#ffffff)', borderRadius: 18, padding: '22px 20px', marginBottom: 24, border: '1px solid #b7e5df' }}>
            <div style={{ fontSize: 12, color: '#087e91', fontWeight: 700, letterSpacing: 1 }}>IL TUO MARKETPLACE</div>
            <h1 style={{ fontSize: 30, lineHeight: 1.15, margin: '8px 0', color: '#073b52' }}>RiverSpendShop</h1>
            <p style={{ margin: 0, color: '#42636a' }}>Scopri i prodotti pubblicati dalla community.</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 }}>
            <h2 style={{ fontSize: 22, margin: 0, color: '#073b52' }}>Prodotti disponibili</h2>
            <span style={{ fontSize: 13, color: '#527078' }}>{products.length ? products.length + ' prodotti' : ''}</span>
          </div>
          {loadingProducts && <p style={{ padding: 16, background: 'white', borderRadius: 12 }}>Caricamento prodotti…</p>}
          {!loadingProducts && productsError && <p role="alert" style={{ padding: 16, background: '#fff1f0', border: '1px solid #e9aaa5', borderRadius: 12, color: '#8c2420' }}>{productsError}</p>}
          {!loadingProducts && !productsError && products.length === 0 && <p style={{ padding: 16, background: 'white', borderRadius: 12 }}>Al momento non ci sono prodotti pubblicati.</p>}
          {!loadingProducts && !productsError && products.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(155px,1fr))', gap: 14 }}>
              {products.map((product) => (
                <article key={product.id} style={{ overflow: 'hidden', borderRadius: 15, border: '1px solid #d2e5e4', background: '#fff', boxShadow: '0 3px 12px #0b46500d' }}>
                  {product.image
                    ? <img src={product.image} alt={product.name || 'Prodotto RiverSpend'} style={{ display: 'block', width: '100%', height: 155, objectFit: 'cover', background: '#e2f4f3' }} />
                    : <div style={{ height: 155, background: 'linear-gradient(135deg,#d9f5f2,#f2fbfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4c8184', fontSize: 13 }}>Foto non disponibile</div>}
                  <div style={{ padding: 12 }}>
                    <h3 style={{ fontSize: 16, lineHeight: 1.3, margin: '0 0 8px', color: '#12343b' }}>{product.name || 'Prodotto senza nome'}</h3>
                    {product.condition && <p style={{ margin: '0 0 6px', color: '#60777b', fontSize: 12 }}>{product.condition}</p>}
                    {product.category && <p style={{ margin: '0 0 8px', color: '#60777b', fontSize: 12 }}>{product.category}</p>}
                    <p style={{ margin: 0, color: '#087e91', fontWeight: 800, fontSize: 18 }}>{product.price != null ? new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number(product.price)) : 'Prezzo non disponibile'}</p>
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
