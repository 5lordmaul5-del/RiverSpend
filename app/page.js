'use client';
import { useState, useEffect } from 'react';

export default function RiverSpendApp() {
  const [activeModal, setActiveModal] = useState(null); 
  const [selectedCategory, setSelectedCategory] = useState('Tutti');
  const [filterTab, setFilterTab] = useState('vetrina'); 
  
  const [products, setProducts] = useState([
    { id: 1, title: 'Smartwatch Test', price: 29.99, category: 'Elettronica', type: 'vetrina', desc: 'Smartwatch multifunzione con monitor cardio.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500' },
    { id: 2, title: 'Trinciapollo', price: 10.00, category: 'Casa', type: 'privati', desc: 'Utensile da cucina resistente.', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500' },
    { id: 3, title: 'Console Gaming', price: 199.00, category: 'Giochi', type: 'aziende', desc: 'Usato ottime condizioni.', image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500' },
    { id: 4, title: 'Creatina Monoidrata', price: 15.00, category: 'Salute', type: 'vetrina', desc: 'Integratore alimentare sportivo.', image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500' }
  ]);

  const [cart, setCart] = useState([]);
  const [lang, setLang] = useState('Italiano');

  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCat, setNewCat] = useState('Elettronica');
  const [newType, setNewType] = useState('privati');

  const [piggyGoal, setPiggyGoal] = useState('');
  const [piggyAmount, setPiggyAmount] = useState('');
  const [piggyCashback, setPiggyCashback] = useState(12.50);

  // Gemini Chat State
  const [novaMessages, setNovaMessages] = useState([
    { sender: 'nova', text: 'Ciao! Sono Gemini, il tuo assistente IA. Posso aiutarti a cercare prodotti, capire come vendere, usare il carrello o verificare la sicurezza.' }
  ]);
  const [novaInput, setNovaInput] = useState('');

  useEffect(() => {
    const savedProd = localStorage.getItem('rivers_products');
    if (savedProd) { try { setProducts(JSON.parse(savedProd)); } catch(e){} }
    const savedCart = localStorage.getItem('rivers_cart');
    if (savedCart) { try { setCart(JSON.parse(savedCart)); } catch(e){} }
  }, []);

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('rivers_cart', JSON.stringify(newCart));
  };

  const addToCart = (product) => {
    saveCart([...cart, product]);
    alert(`${product.title} aggiunto al carrello!`);
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return;
    const item = {
      id: Date.now(),
      title: newTitle,
      price: parseFloat(newPrice),
      category: newCat,
      type: newType,
      desc: newDesc || 'Nessuna descrizione.',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'
    };
    const updated = [item, ...products];
    setProducts(updated);
    localStorage.setItem('rivers_products', JSON.stringify(updated));
    setActiveModal(null);
    setNewTitle(''); setNewPrice(''); setNewDesc('');
    alert('Prodotto pubblicato con successo!');
  };

  const sendNovaMessage = (e) => {
    e.preventDefault();
    if (!novaInput) return;
    const userMsg = novaInput;
    setNovaMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setNovaInput('');
    setTimeout(() => {
      let reply = "Ho analizzato la tua richiesta nel marketplace. Posso assisterti con transazioni e sicurezza.";
      if (userMsg.toLowerCase().includes('compro')) reply = "Per comprare basta cliccare 'Aggiungi al Carrello' e procedere al checkout protetto.";
      if (userMsg.toLowerCase().includes('vendi')) reply = "Usa il tasto 'Vendi su RiverSpend' per pubblicare subito il tuo articolo.";
      setNovaMessages(prev => [...prev, { sender: 'nova', text: reply }]);
    }, 800);
  };

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'Tutti' || p.category === selectedCategory;
    const matchTab = filterTab === 'vetrina' ? p.type === 'vetrina' : filterTab === 'aziende' ? p.type === 'aziende' : p.type === 'privati';
    return matchCat && matchTab;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-16">
      
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveModal(null)}>
          <span className="text-2xl">🌊</span>
          <div>
            <h1 className="text-lg font-bold tracking-wider text-emerald-400">RiverSpend</h1>
            <p className="text-[10px] text-slate-400">your shop your flow</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveModal('cart')}
            className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-2 rounded-xl flex items-center gap-1 font-semibold border border-slate-700">
            🛒 Carrello ({cart.length})
          </button>
          <button 
            onClick={() => setActiveModal('profile')}
            className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 text-xs px-3 py-2 rounded-xl flex items-center gap-1 font-semibold border border-emerald-500/30">
            👤 Ospite ▾
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">

        <div className="bg-gradient-to-r from-slate-900 to-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            🌍 Il mondo RiverSpend
          </h2>
          <p className="text-slate-400 text-xs mt-1">Prima scopri, cerca e compra. Qui sotto trovi tutti i servizi del tuo account.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setActiveModal('profile')} className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 p-3 rounded-xl text-left flex items-center gap-3 transition">
            <span className="text-blue-400 text-xl">👤</span>
            <div>
              <div className="font-bold text-sm">Profilo</div>
              <div className="text-[10px] text-slate-400">Gestione account</div>
            </div>
          </button>

          <button onClick={() => setActiveModal('sell')} className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 p-3 rounded-xl text-left flex items-center gap-3 transition">
            <span className="text-emerald-400 text-xl">🏷️</span>
            <div>
              <div className="font-bold text-sm">Vendi su RiverSpend</div>
              <div className="text-[10px] text-slate-400">Inserisci articolo</div>
            </div>
          </button>

          <button onClick={() => setActiveModal('ads')} className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 p-3 rounded-xl text-left flex items-center gap-3 transition">
            <span className="text-rose-400 text-xl">📈</span>
            <div>
              <div className="font-bold text-sm">RiverSpend Ads</div>
              <div className="text-[10px] text-slate-400">Promuovi prodotti</div>
            </div>
          </button>

          <button onClick={() => setActiveModal('piggy')} className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 p-3 rounded-xl text-left flex items-center gap-3 transition">
            <span className="text-amber-400 text-xl">🐷</span>
            <div>
              <div className="font-bold text-sm">PiggyBank</div>
              <div className="text-[10px] text-slate-400">Salvadanaio & Obiettivi</div>
            </div>
          </button>

          <button onClick={() => setActiveModal('nova')} className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 p-3 rounded-xl text-left flex items-center gap-3 transition">
            <span className="text-cyan-400 text-xl">🤖</span>
            <div>
              <div className="font-bold text-sm">Gemini</div>
              <div className="text-[10px] text-slate-400">Assistente IA operativo</div>
            </div>
          </button>

          <button onClick={() => setActiveModal('returns')} className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 p-3 rounded-xl text-left flex items-center gap-3 transition">
            <span className="text-indigo-400 text-xl">🔄</span>
            <div>
              <div className="font-bold text-sm">Resi & Rimborsi</div>
              <div className="text-[10px] text-slate-400">Gestione ordini</div>
            </div>
          </button>

          <button onClick={() => setActiveModal('shield')} className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 p-3 rounded-xl text-left flex items-center gap-3 transition">
            <span className="text-blue-500 text-xl">🛡️</span>
            <div>
              <div className="font-bold text-sm">RiverSpendShield</div>
              <div className="text-[10px] text-slate-400">Protezione e regole</div>
            </div>
          </button>

          <button onClick={() => setActiveModal('protector')} className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 p-3 rounded-xl text-left flex items-center gap-3 transition">
            <span className="text-yellow-500 text-xl">🔐</span>
            <div>
              <div className="font-bold text-sm">RiverSpend Protector</div>
              <div className="text-[10px] text-slate-400">Data Security Service</div>
            </div>
          </button>

          <button onClick={() => setActiveModal('lang')} className="bg-slate-900 hover:bg-slate-800/80 border border-slate-800 p-3 rounded-xl text-left flex items-center gap-3 transition col-span-2">
            <span className="text-emerald-400 text-xl">🌐</span>
            <div>
              <div className="font-bold text-sm">Multilanguage ({lang})</div>
              <div className="text-[10px] text-slate-400">Cambia lingua della piattaforma</div>
            </div>
          </button>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-800">
          <div className="flex gap-2 items-center">
            <span className="text-xs font-semibold text-slate-400">📁 Categoria:</span>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none">
              <option value="Tutti">Tutti</option>
              <option value="Elettronica">Elettronica</option>
              <option value="Moda">Moda</option>
              <option value="Casa">Casa</option>
              <option value="Salute">Salute</option>
              <option value="Sport">Sport</option>
              <option value="Giochi">Giochi</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setFilterTab('vetrina')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${filterTab === 'vetrina' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
              ⭐ Vetrina RiverSpend
            </button>
            <button 
              onClick={() => setFilterTab('aziende')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${filterTab === 'aziende' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
              🏢 Aziende
            </button>
            <button 
              onClick={() => setFilterTab('privati')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${filterTab === 'privati' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
              👤 Privati
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            🛍️ Prodotti in Evidenza ({filteredProducts.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProducts.length === 0 ? (
              <p className="text-slate-500 text-xs col-span-2 text-center py-8">Nessun prodotto in questa sezione.</p>
            ) : (
              filteredProducts.map(item => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between shadow">
                  <div>
                    <img src={item.image} alt={item.title} className="w-full h-36 object-cover rounded-xl mb-2" />
                    <h4 className="font-bold text-sm text-white">{item.title}</h4>
                    <p className="text-slate-400 text-[11px] line-clamp-1 mt-0.5">{item.desc}</p>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80">
                    <span className="text-emerald-400 font-bold text-base">€ {item.price.toFixed(2)}</span>
                    <button 
                      onClick={() => addToCart(item)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition">
                      Aggiungi al Carrello
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>

      {activeModal === 'sell' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-emerald-400">🏷️ Carica e Vendi</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 font-bold">✕</button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold">Nome Prodotto</label>
                <input type="text" value={newTitle} onChange={e=>setNewTitle(e.target.value)} required placeholder="Es. Creatina 500g" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Prezzo (€)</label>
                  <input type="number" step="0.01" value={newPrice} onChange={e=>setNewPrice(e.target.value)} required placeholder="15.00" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold">Categoria</label>
                  <select value={newCat} onChange={e=>setNewCat(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white">
                    <option value="Elettronica">Elettronica</option>
                    <option value="Casa">Casa</option>
                    <option value="Salute">Salute</option>
                    <option value="Sport">Sport</option>
                    <option value="Giochi">Giochi</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold">Sezione Vendita</label>
                <select value={newType} onChange={e=>setNewType(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white">
                  <option value="privati">Privati</option>
                  <option value="aziende">Aziende</option>
                  <option value="vetrina">Vetrina RiverSpend</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold">Descrizione</label>
                <textarea value={newDesc} onChange={e=>setNewDesc(e.target.value)} rows="2" placeholder="Descrivi il prodotto..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"></textarea>
              </div>
              <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-xl text-xs transition mt-2">
                Pubblica e Vendi su RiverSpend
              </button>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'piggy' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-amber-400">🐷 RiverSpend PiggyBank</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 font-bold">✕</button>
            </div>
            <p className="text-slate-400 text-xs mb-4">Salva i tuoi soldi per un obiettivo e guadagna cashback extra.</p>
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl mb-4">
              <div className="text-xs text-slate-400">Cashback Accumulato</div>
              <div className="text-xl font-bold text-emerald-400">€ {piggyCashback.toFixed(2)}</div>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="Cosa vuoi comprare?" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white" />
              <input type="number" placeholder="Obiettivo €" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white" />
              <button onClick={() => alert('Obiettivo salvato nel salvadanaio!')} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-xl text-xs transition">
                Salva nel PiggyBank
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GEMINI CHAT MODAL */}
      {activeModal === 'nova' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-md w-full h-[80vh] flex flex-col justify-between">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-lg text-cyan-400 flex items-center gap-2">🤖 Gemini</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 font-bold">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto py-3 space-y-2">
              {novaMessages.map((m, i) => (
                <div key={i} className={`p-3 rounded-xl text-xs max-w-[80%] ${m.sender === 'user' ? 'bg-emerald-600 text-white ml-auto' : 'bg-slate-950 text-slate-300 border border-slate-800'}`}>
                  {m.text}
                </div>
              ))}
            </div>
            <form onSubmit={sendNovaMessage} className="flex gap-2 pt-3 border-t border-slate-800">
              <input type="text" value={novaInput} onChange={e=>setNovaInput(e.target.value)} placeholder="Scrivi a Gemini..." className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white" />
              <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs">Invia</button>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'cart' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-emerald-400">🛒 Il tuo Carrello</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 font-bold">✕</button>
            </div>
            {cart.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-6">Il carrello è vuoto.</p>
            ) : (
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                    <span>{item.title}</span>
                    <span className="text-emerald-400 font-bold">€ {item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t border-slate-800 font-bold text-sm mb-4">
              <span>Totale:</span>
              <span className="text-emerald-400">€ {cart.reduce((acc, cur) => acc + cur.price, 0).toFixed(2)}</span>
            </div>
            {cart.length > 0 && (
              <button onClick={() => { alert('Pagamento simulato con successo!'); saveCart([]); setActiveModal(null); }} className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-xl text-xs transition">
                Procedi al Checkout Sicuro 🚀
              </button>
            )}
          </div>
        </div>
      )}

      {activeModal === 'lang' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-emerald-400">🌐 Seleziona Lingua</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 font-bold">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['Italiano', 'English', 'Español', 'Français', 'Deutsch', 'Română'].map((l) => (
                <button key={l} onClick={() => { setLang(l); setActiveModal(null); }} className={`p-2.5 rounded-xl text-xs font-bold border transition ${lang === l ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-950 text-slate-300 border-slate-800'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {['profile', 'ads', 'returns', 'shield', 'protector'].includes(activeModal) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-md w-full text-center space-y-4">
            <h3 className="font-bold text-lg text-emerald-400 capitalize">{activeModal}</h3>
            <p className="text-slate-400 text-xs">Sezione operativa del sistema protetta e sincronizzata con RiverSpend Core.</p>
            <button onClick={() => setActiveModal(null)} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs">
              Chiudi
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

