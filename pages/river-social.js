import { useEffect } from 'react';

export default function RiverSocialRedirect() {
  useEffect(() => {
    window.location.replace('/riverspend-social-network');
  }, []);
  return (
    <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,fontFamily:'system-ui,sans-serif',color:'#0f766e'}}>
      <p>Stiamo aprendo il social network RiverSpend unificato…</p>
      <a href="/riverspend-social-network">Apri RiverSpend Social</a>
    </main>
  );
}
