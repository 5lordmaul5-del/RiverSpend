'use client';
import { useState, useEffect } from 'react';

export default function RiverSpendApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [products, setProducts] = useState([
    { id: 1, title: 'Felpa RiverSpend Official', price: 45.00, desc: 'Alta qualita e stile unico per il brand.', image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500' },
    { id: 2, title: 'Accessorio Tech Esclusivo', price: 29.90, desc: 'Gadget indispensabile per il tuo setup.', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500' }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newImage, setNewImage] = useState('');

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('rivers_products');
    if (saved) {
      try { setProducts(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const saveProducts = (updated) => {
    setProducts(updated);
    localStorage.setItem('rivers_products', JSON.stringify(updated));
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return;
    const item = {
      id: Date.now(),
      title: newTitle,
      price: parseFloat(newPrice),
      desc: newDesc || 'Nessuna descrizione.',
      image: newImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'
    };
    saveProducts([item, ...products]);
    setNewTitle('');
    setNewPrice('');
    setNewDesc('');
    setNewImage('');
    setActiveTab('home');
  };

  const handleCheckout = (product) => {
    setSelectedProduct(product);
    setActiveTab('checkout');
    setPaymentSuccess(false);
  };

  const processPayment = (e) => {
    e.preventDefault();
    setTimeout(() => {
      setPaymentSuccess(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-wider text-emerald-400 cursor-pointer" onClick={() => setActiveTab('home')}>
          🌊 RiverSpend
        </h1>
        <nav className="flex gap-3">
          <button 
            onClick={() => setActiveTab('home')} 
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === 'home' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
            Vetrina
          </button>
          <button 
            onClick={() => setActiveTab('sell')} 
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === 'sell' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
            + Vendi Oggetto
          </button>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto p-4 py-8">
        {activeTab === 'home' && (
          <div>
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-extrabold text-white mb-2">Il Marketplace Globale</h2>
              <p className="text-slate-400 text-sm">Esplora gli articoli in vendita o inserisci subito il tuo prodotto per iniziare a incassare.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((item) => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between hover:border-emerald-500/50 transition">
                  <div>
                    <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1 text-white">{item.title}</h3>
                      <p className="text-slate-400 text-xs mb-3 line-clamp-2">{item.desc}</p>
                    </div>
                  </div>
                  <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-800/60 mt-2">
                    <span className="text-emerald-400 font-bold text-lg">€ {item.price.toFixed(2)}</span>
                    <button 
                      onClick={() => handleCheckout(item)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition shadow">
                      Acquista
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sell' && (
          <div className="max-w-lg mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-2 text-emerald-400">Metti in Vendita un Articolo</h2>
            <p className="text-slate-400 text-sm mb-6">Compila i campi per pubblicare istantaneamente il tuo prodotto online.</p>
            
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Titolo Prodotto</label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  required
                  placeholder="Es. Scarpe sportive" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Prezzo (€)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={newPrice} 
                  onChange={(e) => setNewPrice(e.target.value)} 
                  required
                  placeholder="Es. 19.99" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">URL Immagine (facoltativo)</label>
                <input 
                  type="url" 
                  value={newImage} 
                  onChange={(e) => setNewImage(e.target.value)} 
                  placeholder="https://esempio.com/foto.jpg" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Descrizione</label>
                <textarea 
                  value={newDesc} 
                  onChange={(e) => setNewDesc(e.target.value)} 
                  rows="3"
                  placeholder="Descrivi le condizioni e i dettagli..." 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setActiveTab('home')}
                  className="w-1/2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition">
                  Annulla
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-xl transition shadow">
                  Pubblica Subito
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'checkout' && selectedProduct && (
          <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-2 text-emerald-400">Checkout Sicuro</h2>
            <p className="text-slate-400 text-sm mb-6">Stai completando l'acquisto dell'articolo selezionato.</p>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white">{selectedProduct.title}</h4>
                <p className="text-slate-400 text-xs mt-1">Spedizione sicura inclusa</p>
              </div>
              <span className="text-emerald-400 font-bold text-xl">€ {selectedProduct.price.toFixed(2)}</span>
            </div>

            {!paymentSuccess ? (
              <form onSubmit={processPayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Nome Titolare</label>
                  <input type="text" required placeholder="Mario Rossi" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Numero Carta / Dati di Pagamento</label>
                  <input type="text" required placeholder="4000 1234 5678 9010" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setActiveTab('home')} className="w-1/2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition">
                    Indietro
                  </button>
                  <button type="submit" className="w-1/2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-xl transition shadow">
                    Paga € {selectedProduct.price.toFixed(2)}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
                <h3 className="text-xl font-bold text-white">Pagamento Riuscito!</h3>
                <p className="text-slate-400 text-sm">I fondi sono stati elaborati con successo. Grazie per aver usato RiverSpend.</p>
                <button onClick={() => setActiveTab('home')} className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-xl transition shadow">
                  Torna alla Vetrina
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
