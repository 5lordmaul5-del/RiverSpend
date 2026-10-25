import Head from 'next/head';

const apps = [
  {
    name: 'RiverSpendShop',
    subtitle: 'Il marketplace',
    description: 'Scopri prodotti, crea la tua rete e metti in vendita i tuoi articoli.',
    logo: '/riverspend-river-market.svg',
    href: '/',
    color: '#0891b2',
    action: 'Apri RiverSpendShop'
  },
  {
    name: 'RiverSpend Streaming',
    subtitle: 'Video e contenuti',
    description: 'Accedi all’area dedicata ai contenuti RiverSpend.',
    logo: '/Screenshot_2026-10-20-20-11-58-215_com.openai.chatgpt-edit.jpg',
    href: '/servizi/broadcast',
    color: '#7c3aed',
    action: 'Apri Streaming'
  },
  {
    name: 'RS SoundStudio',
    subtitle: 'Studio audio in sviluppo',
    description: 'Il progetto RiverSpend dedicato a mixer, tracce ed effetti audio. Le funzioni devono essere completate e verificate prima del lancio.',
    logo: '/rssoundstudio-issa-banner.jpg',
    href: '/rs-sound-studio',
    color: '#0e7490',
    action: 'Apri SoundStudio'
  },
  {
    name: 'RiverSpend Music',
    subtitle: 'Musica',
    description: 'Apri l’area musicale RiverSpend.',
    logo: '/riverspend-home-river-market.svg',
    href: '/servizi/music',
    color: '#a21caf',
    action: 'Apri RiverSpend Music'
  },
  {
    name: 'RS PanelControl',
    subtitle: 'Area privata del CEO',
    description: 'Pannello riservato agli account autorizzati. L’accesso richiede autenticazione.',
    logo: '/1000186325.png',
    href: '/rs-control-center',
    color: '#0f172a',
    action: 'Apri PanelControl'
  },
  {
    name: 'RiverSpend Special Park',
    subtitle: 'Il mondo delle attrazioni',
    description: 'Scopri il parco e le sue attrazioni.',
    logo: '/1000187343.png',
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
        <meta name="description" content="Apri le app RiverSpend e aggiungile alla schermata Home quando l’installazione è disponibile." />
      </Head>
      <main style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#062b45,#071426)', color: '#fff', padding: '28px 16px 48px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <a href="/" style={{ color: '#67e8f9', textDecoration: 'none', fontWeight: 700 }}>← Torna a RiverSpend</a>
          <header style={{ textAlign: 'center', padding: '30px 0 24px' }}>
            <div style={{ fontSize: 13, letterSpacing: 4, color: '#fbbf24', fontWeight: 800 }}>YOUR SHOP • YOUR FLOW</div>
            <h1 style={{ fontSize: 'clamp(30px,6vw,48px)', lineHeight: 1.1, margin: '12px 0', fontWeight: 900 }}>Le app RiverSpend</h1>
            <p style={{ color: '#cbd5e1', maxWidth: 650, margin: '0 auto 18px', lineHeight: 1.6 }}>Scegli una delle app RiverSpend. Aprila e usa il menu del browser per aggiungerla alla schermata Home o installarla, quando l’opzione è disponibile.</p>
            <button type="button" onClick={async () => {
              const shareData = { title: 'Le app RiverSpend', text: 'Scopri e apri le app RiverSpend!', url: window.location.origin + '/app' };
              try {
                if (navigator.share) {
                  await navigator.share(shareData);
                } else if (navigator.clipboard && navigator.clipboard.writeText) {
                  await navigator.clipboard.writeText(shareData.url);
                  window.alert('Link copiato! Ora puoi condividerlo.');
                } else {
                  window.prompt('Copia questo link per condividerlo:', shareData.url);
                }
              } catch (error) {
                if (error && error.name !== 'AbortError') window.alert('Non è stato possibile condividere automaticamente. Puoi copiare il link dalla barra del browser: ' + shareData.url);
              }
            }} style={{ display: 'inline-block', border: '1px solid #fbbf24', background: '#fbbf24', color: '#062b45', fontWeight: 850, borderRadius: 999, padding: '12px 22px', cursor: 'pointer', fontSize: 15 }}>
              ↗ Condividi le app RiverSpend
            </button>
          </header>
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,230px),1fr))', gap: 16 }}>
            {apps.map((app) => (
              <article key={app.name} style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(103,232,249,.28)', borderRadius: 22, padding: 22, display: 'flex', flexDirection: 'column', minHeight: 270, boxShadow: '0 12px 32px rgba(0,0,0,.18)' }}>
                <div aria-hidden="true" style={{ width: 88, height: 88, display: 'grid', placeItems: 'center', overflow: 'hidden', borderRadius: 18, background: '#fff', padding: 5, marginBottom: 16, boxShadow: '0 0 22px rgba(34,211,238,.18)' }}><img src={app.logo} alt={'Logo ' + app.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 14 }} /></div>
                <h2 style={{ fontSize: 21, fontWeight: 850, margin: '0 0 5px' }}>{app.name}</h2>
                <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: 13, marginBottom: 10 }}>{app.subtitle}</div>
                <p style={{ color: '#cbd5e1', lineHeight: 1.55, fontSize: 14, flexGrow: 1 }}>{app.description}</p>
                <a href={app.href} style={{ display: 'block', textAlign: 'center', background: '#06b6d4', color: '#062b45', fontWeight: 850, borderRadius: 12, padding: '12px 10px', textDecoration: 'none' }}>{app.action} →</a>
              </article>
            ))}
          </section>
          <section aria-labelledby="rs-friends-title" style={{ marginTop: 28, padding: '24px 18px', borderRadius: 24, background: 'linear-gradient(135deg,rgba(6,182,212,.18),rgba(251,191,36,.10))', border: '1px solid rgba(251,191,36,.45)' }}>
            <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 20px' }}>
              <div style={{ color: '#fbbf24', fontWeight: 900, letterSpacing: 2, fontSize: 12 }}>RIVERSPEND FRIENDS</div>
              <h2 id="rs-friends-title" style={{ fontSize: 'clamp(24px,5vw,34px)', margin: '8px 0', fontWeight: 900 }}>Condividi, invita, colleziona premi</h2>
              <p style={{ color: '#dbeafe', lineHeight: 1.6, margin: 0 }}>Invita amici a scoprire RiverSpend. Stiamo preparando un portafoglio personale per raccogliere codici premio, bonus e Gift Card.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,190px),1fr))', gap: 12 }}>
              {[
                { icon: '🎟️', title: 'I miei codici RS Lottery', body: 'Codici univoci associati al profilo, quando la campagna sarà attiva e regolamentata.' },
                { icon: '🛍️', title: 'I miei bonus RiverSpend', body: 'Un riepilogo dei bonus shopping assegnati secondo le condizioni delle promozioni.' },
                { icon: '🎁', title: 'Le mie Gift Card', body: 'Uno spazio per visualizzare Gift Card RiverSpend e gli eventuali premi Park disponibili.' },
                { icon: '📢', title: 'Credito RS Spons', body: 'Credito promozionale per dare più visibilità agli annunci, se assegnato e attivato.' }
              ].map((item) => (
                <article key={item.title} style={{ background: 'rgba(3,15,30,.55)', border: '1px solid rgba(103,232,249,.22)', borderRadius: 16, padding: 16 }}>
                  <div aria-hidden="true" style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                  <h3 style={{ fontSize: 16, margin: '0 0 8px', color: '#fbbf24' }}>{item.title}</h3>
                  <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.55, margin: 0 }}>{item.body}</p>
                </article>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button type="button" onClick={async () => {
                const shareData = { title: 'RiverSpend Friends', text: 'Scopri RiverSpend e le future iniziative per la community!', url: window.location.origin + '/app' };
                try {
                  if (navigator.share) await navigator.share(shareData);
                  else if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(shareData.url);
                    window.alert('Link copiato! Ora puoi condividerlo con i tuoi amici.');
                  } else window.prompt('Copia questo link per condividerlo:', shareData.url);
                } catch (error) {
                  if (error && error.name !== 'AbortError') window.alert('Puoi condividere questo link: ' + shareData.url);
                }
              }} style={{ border: 0, background: '#fbbf24', color: '#062b45', fontWeight: 900, borderRadius: 999, padding: '13px 22px', cursor: 'pointer', fontSize: 15 }}>
                ↗ Condividi e invita un amico
              </button>
              <p style={{ color: '#fcd34d', fontSize: 12, lineHeight: 1.5, maxWidth: 680, margin: '12px auto 0' }}>Nota: il portafoglio premi è una presentazione del servizio in preparazione. Bonus, codici e Gift Card non sono ancora attivi; saranno assegnati solo dopo l’attivazione del sistema e la pubblicazione delle condizioni ufficiali.</p>
            </div>
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
