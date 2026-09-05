'use client';
import { useState } from 'react';

export default function RiverSpendApp() {
  const [profile, setProfile] = useState('Blu');
  const [cartCount, setCartCount] = useState(0);
  const [toast,- setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  return (
    <main style={{ padding: '20px', maxWidth: '480px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', color: '#60a5fa', margin: 0 }}>RiverSpend</h1>
        <p style={{ fontSize: '13px', color: '#94a3b8' }}>Nuova Architettura Next.js Interattiva</p>
      </header>

      <div style={{ background: '#1e293b', padding: '15px', borderRadius: '12px', marginBottom: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ margin: '0 0 10px 0', fontSize: '13px' }}>Profilo Attivo: <strong style={{ color: '#3b82f6' }}>{profile}</strong></p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['Blu', 'Rosso', 'Giallo'].map((p) => (
            <button
              key={p}
              onClick={() => { setProfile(p); showToast(`Profilo impostato su ${p}`); }}
              style={{
                flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
                background: profile === p ? '#3b82f6' : '#334155', color: 'white', fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => showToast('Sezione Vendi aperta')} style={{ padding: '14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>+ Vendi</button>
        <button onClick={() => showToast('Carrello aperto')} style={{ padding: '14px', background: '#334155', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>🛒 Carrello ({cartCount})</button>
        <button onClick={() => showToast('PiggyBank & RiverClub')} style={{ padding: '14px', background: '#334155', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', gridColumn: 'span 2' }}>🐷 PiggyBank & RiverClub</button>
      </div>

      <h2 style={{ fontSize: '16px', marginBottom: '10px' }}>Catalogo Prodotti</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ background: '#1e293b', padding: '14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>Watch Test</h4>
            <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold' }}>€ 29,99</span>
          </div>
          <button onClick={() => { setCartCount(c => c + 1); showToast('Watch Test aggiunto!'); }} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Aggiungi</button>
        </div>
        <div style={{ background: '#1e293b', padding: '14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>Trinciapollo</h4>
            <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold' }}>€ 10,00</span>
          </div>
          <button onClick={() => { setCartCount(c => c + 1); showToast('Trinciapollo aggiunto!'); }} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Aggiungi</button>
        </div>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: 'white', padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 1000 }}>
          {toast}
        </div>
      )}
    </main>
  );
}
