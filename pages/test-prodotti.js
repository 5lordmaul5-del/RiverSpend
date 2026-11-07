import { useState, useEffect } from 'react';

export default function TestProdotti() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/prodotti');
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (err) {
      console.error('Errore nel caricamento:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price) return;

    await fetch('/api/prodotti', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price: parseFloat(price), description: 'Prodotto di test', image_url: '' })
    });

    setName('');
    setPrice('');
    fetchProducts();
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Test Database Locale SQLite (RiverSpend)</h1>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Nome prodotto" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          style={{ marginRight: '10px', padding: '8px' }}
        />
        <input 
          type="number" 
          placeholder="Prezzo" 
          value={price} 
          onChange={(e) => setPrice(e.target.value)} 
          style={{ marginRight: '10px', padding: '8px' }}
        />
        <button type="submit" style={{ padding: '8px 16px' }}>Aggiungi Prodotto</button>
      </form>

      <h2>Lista Prodotti nel DB:</h2>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            <strong>{p.name}</strong> - €{p.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
