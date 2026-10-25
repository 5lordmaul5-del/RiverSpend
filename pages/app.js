import Head from 'next/head';

const apps = [
  {
    name: 'RiverSpendShop',
    subtitle: 'Il marketplace',
    description: 'Scopri prodotti, crea la tua rete e metti in vendita i tuoi articoli.',
    icon: '🛍️',
    href: '/',
    color: '#0891b2',
    action: 'Apri RiverSpendShop'
  },
  {
    name: 'RiverSpend Streaming',
    subtitle: 'Video e musica',
    description: 'Accedi all’area dedicata ai contenuti RiverSpend.',
    icon: '🎬',
    href: '/servizi/broadcast',
    color: '#7c3aed',
    action: 'Apri Streaming'
  },
  {
    name: 'RS PanelControl',
    subtitle: 'Area privata del CEO',
    description: 'Pannello riservato agli account autorizzati. L’accesso richiede autenticazione.',
    icon: '🔐',
    href: '/rs-control-center',
    color: '#0f172a',
    action: 'Apri PanelControl'
  },
  {
    name: 'RiverSpend Special Park',
    subtitle: 'Il mondo delle attrazioni',
    description: 'Scopri il parco e le sue attrazioni.',
    icon: '🎢',
    href: '/park',
    color: '#0891b2',
    action: 'Apri Special Park'
  }
];

export default function RiverSpendApps() {
  return (
    <>
      <Head>
        <title>Scarica le app | RiverSpend</title>
        <meta name="description" content="Apri e installa le quattro app RiverSpend sul tuo telefono." />
      </Head>
      <main style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#062b45,#071426)', color: '#fff', padding: '28px 16px 48px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <a href="/" style={{ color: '#67e8f9', textDecoration: 'none', fontWeight: 700 }}>← Torna a RiverSpend</a>
          <header style={{ textAlign: 'center', padding: '30px 0 24px' }}>
            <div style={{ fontSize: 13, letterSpacing: 4, color: '#fbbf24', fontWeight: 800 }}>YOUR SHOP • YOUR FLOW</div>
            <h1 style={{ fontSize: 'clamp(30px,6vw,48px)', lineHeight: 1.1, margin: '12px 0', fontWeight: 900 }}>Le app RiverSpend</h1>
            <p style={{ color: '#cbd5e1', maxWidth: 650, margin: '0 auto', lineHeight: 1.6 }}>Scegli l’app che ti interessa. Aprila e usa il menu del browser per aggiungerla alla schermata Home o installarla, quando l’opzione è disponibile.</p>
          </header>
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,230px),1fr))', gap: 16 }}>
            {apps.map((app) => (
              <article key={app.name} style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(103,232,249,.28)', borderRadius: 22, padding: 22, display: 'flex', flexDirection: 'column', minHeight: 270, boxShadow: '0 12px 32px rgba(0,0,0,.18)' }}>
                <div aria-hidden="true" style={{ width: 68, height: 68, display: 'grid', placeItems: 'center', borderRadius: 18, background: app.color, fontSize: 34, marginBottom: 16, boxShadow: '0 0 22px rgba(34,211,238,.18)' }}>{app.icon}</div>
                <h2 style={{ fontSize: 21, fontWeight: 850, margin: '0 0 5px' }}>{app.name}</h2>
                <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: 13, marginBottom: 10 }}>{app.subtitle}</div>
                <p style={{ color: '#cbd5e1', lineHeight: 1.55, fontSize: 14, flexGrow: 1 }}>{app.description}</p>
                <a href={app.href} style={{ display: 'block', textAlign: 'center', background: '#06b6d4', color: '#062b45', fontWeight: 850, borderRadius: 12, padding: '12px 10px', textDecoration: 'none' }}>{app.action} →</a>
              </article>
            ))}
          </section>
          <aside style={{ marginTop: 24, padding: 18, borderRadius: 16, background: 'rgba(6,182,212,.10)', border: '1px solid rgba(103,232,249,.22)', color: '#dbeafe', lineHeight: 1.65, fontSize: 14 }}>
            <strong style={{ color: '#67e8f9' }}>Come installare</strong><br />
            <strong>Android:</strong> apri l’app in Chrome, tocca ⋮ e scegli “Installa app” oppure “Aggiungi a schermata Home”.<br />
            <strong>iPhone:</strong> apri la pagina in Safari, tocca Condividi e scegli “Aggiungi alla schermata Home”.<br />
            <span style={{ color: '#fcd34d' }}>Nota:</span> l’opzione d’installazione dipende dal browser e dalla configurazione dell’app. PanelControl è riservato e richiede un account autorizzato.
          </aside>
        </div>
      </main>
    </>
  );
}
