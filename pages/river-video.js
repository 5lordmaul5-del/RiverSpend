import Head from 'next/head';
import Link from 'next/link';

const categories = [
  ['🎬', 'Film', 'Film, cortometraggi e produzioni originali.'],
  ['📺', 'Serie', 'Serie, documentari e programmi.'],
  ['⭐', 'Creator', 'Canali e contenuti dei creator River.'],
  ['🔴', 'Live', 'Eventi e dirette, quando il servizio sarà attivo.'],
  ['🎵', 'Musica', 'Videoclip, concerti e live session.'],
  ['🎟️', 'Eventi', 'Première, festival e contenuti speciali.'],
];

export default function RiverVideo() {
  return (
    <>
      <Head>
        <title>River Video | River Ecosystem</title>
        <meta name="description" content="River Video: film, serie, creator, live e produzioni originali River." />
        <meta name="apple-mobile-web-app-title" content="River Video" />
      </Head>
      <main style={{ minHeight: '100vh', background: '#071426', color: '#f8fafc', padding: '24px 16px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <nav style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: '#67e8f9', textDecoration: 'none', fontWeight: 800 }}>← RiverSpend</Link>
            <Link href="/app" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Tutte le app River</Link>
          </nav>
          <section style={{ marginTop: 28, borderRadius: 28, padding: 'clamp(24px,5vw,52px)', background: 'linear-gradient(125deg,#102b49,#172554 55%,#312e81)', border: '1px solid #334b75' }}>
            <div style={{ color: '#67e8f9', fontSize: 12, fontWeight: 900, letterSpacing: 4 }}>RIVER ECOSYSTEM</div>
            <h1 style={{ fontSize: 'clamp(42px,8vw,76px)', lineHeight: 1, fontWeight: 950, margin: '16px 0' }}>RIVER <span style={{ color: '#67e8f9' }}>VIDEO</span></h1>
            <p style={{ maxWidth: 720, color: '#dbeafe', fontSize: 18, lineHeight: 1.7 }}>
              La casa dei video River: film, serie, documentari, creator, concerti e produzioni originali.
              Un’esperienza pensata per smartphone, tablet, computer e, in una fase successiva, TV.
            </p>
            <div style={{ marginTop: 24, display: 'inline-flex', borderRadius: 999, padding: '10px 16px', background: 'rgba(251,191,36,.14)', border: '1px solid rgba(251,191,36,.5)', color: '#fde68a', fontSize: 13, fontWeight: 800 }}>
              ANTEPRIMA — RIPRODUZIONE VIDEO NON ANCORA ATTIVA
            </div>
          </section>
          <section style={{ marginTop: 28 }}>
            <h2 style={{ fontSize: 26, fontWeight: 900 }}>Esplora River Video</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,250px),1fr))', gap: 14, marginTop: 16 }}>
              {categories.map(([icon, title, description]) => (
                <article key={title} style={{ borderRadius: 20, padding: 22, background: '#111f35', border: '1px solid #263a59' }}>
                  <div style={{ fontSize: 32 }}>{icon}</div>
                  <h3 style={{ fontSize: 20, fontWeight: 850, marginTop: 12 }}>{title}</h3>
                  <p style={{ color: '#cbd5e1', lineHeight: 1.6, marginTop: 8 }}>{description}</p>
                  <span style={{ display: 'inline-block', marginTop: 16, color: '#fbbf24', fontSize: 12, fontWeight: 800 }}>IN PREPARAZIONE</span>
                </article>
              ))}
            </div>
          </section>
          <section style={{ marginTop: 28, padding: 24, borderRadius: 22, background: '#0c2035', border: '1px solid #263a59' }}>
            <h2 style={{ fontSize: 22, fontWeight: 900 }}>Diritti e sicurezza dei contenuti</h2>
            <p style={{ color: '#cbd5e1', lineHeight: 1.7, marginTop: 10 }}>
              Ogni contenuto dovrà superare i controlli su titolarità, licenze, territori, durata e autorizzazioni.
              Nessun film, brano o video sarà pubblicato o monetizzato senza una verifica dei diritti.
            </p>
          </section>
          <footer style={{ marginTop: 32, color: '#94a3b8', fontSize: 12 }}>
            River Video · Parte dell’ecosistema River · La disponibilità dei contenuti e della riproduzione sarà comunicata dopo i test tecnici.
          </footer>
        </div>
      </main>
    </>
  );
}
