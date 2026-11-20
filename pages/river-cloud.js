import Head from "next/head";

const modules = [
  { icon: "🗄️", name: "RiverDB", detail: "Database PostgreSQL portabile, con schema documentati, accessi controllati e possibilità di esportazione.", state: "Fondazione da completare" },
  { icon: "📦", name: "RiverStorage", detail: "Archivio file compatibile S3 per immagini, documenti e contenuti delle applicazioni.", state: "Da realizzare" },
  { icon: "🛡️", name: "RiverSecurity", detail: "Identità e permessi, isolamento dei segreti, protezione API, registri e controlli di sicurezza.", state: "Requisiti definiti" },
  { icon: "💾", name: "RiverBackup", detail: "Copie indipendenti, esportazioni verificabili e procedure di ripristino testate.", state: "Piano da implementare" },
  { icon: "🔄", name: "RiverSync", detail: "Collegamento progressivo e controllato con Shop, Signals, Money e Pay.", state: "Da realizzare" },
  { icon: "🧠", name: "RiverSSAI", detail: "Livello di coordinamento intelligente: analisi e automazioni solo tramite API autorizzate.", state: "Integrazione da verificare" }
];

export default function RiverCloud() {
  return (
    <>
      <Head>
        <title>RiverCloud · Infrastruttura RiverSpend</title>
        <meta name="description" content="RiverCloud: il progetto di infrastruttura autonoma, portabile e protetta dell'ecosistema RiverSpend." />
        <meta name="theme-color" content="#071b35" />
        <link rel="icon" href="/icons/river-cloud.svg" type="image/svg+xml" />
      </Head>
      <main style={{ minHeight: "100vh", background: "radial-gradient(circle at 80% 0%,#164e78 0,#071b35 48%,#050d1b 100%)", color: "#f8fafc", padding: "24px 16px 56px", fontFamily: "Arial,sans-serif" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <a href="/app" style={{ color: "#67e8f9", textDecoration: "none", fontWeight: 700 }}>← Tutte le app RiverSpend</a>
          <header style={{ textAlign: "center", padding: "38px 0 30px" }}>
            <img src="/icons/river-cloud.svg" alt="RiverCloud" width="104" height="104" style={{ display: "block", margin: "0 auto 18px" }} />
            <div style={{ color: "#fbbf24", fontSize: 12, letterSpacing: 4, fontWeight: 900 }}>RIVERSPEND INFRASTRUCTURE</div>
            <h1 style={{ fontSize: "clamp(38px,7vw,64px)", margin: "12px 0", fontWeight: 900 }}>RiverCloud</h1>
            <p style={{ color: "#cbd5e1", fontSize: 18, lineHeight: 1.65, maxWidth: 760, margin: "0 auto" }}>La fortezza digitale dell'ecosistema RiverSpend: dati portabili, servizi coordinati, sicurezza e continuità operativa.</p>
          </header>

          <section style={{ border: "1px solid rgba(251,191,36,.55)", background: "rgba(120,80,10,.18)", borderRadius: 18, padding: 18, marginBottom: 26 }}>
            <div style={{ color: "#fbbf24", fontWeight: 900, marginBottom: 7 }}>STATO REALE DEL PROGETTO</div>
            <p style={{ margin: 0, color: "#e2e8f0", lineHeight: 1.6 }}>Questa è la prima pagina ufficiale di RiverCloud. Architettura e componenti sono organizzati qui, ma i server autonomi, il database self-hosted, lo storage e i backup indipendenti non sono ancora stati installati e collaudati. Questa pagina non simula servizi attivi e non dichiara completate funzioni che devono ancora essere costruite.</p>
          </section>

          <h2 style={{ fontSize: 25, margin: "0 0 14px" }}>I componenti della fortezza</h2>
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: 14 }}>
            {modules.map((m) => (
              <article key={m.name} style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(103,232,249,.22)", borderRadius: 18, padding: 19 }}>
                <div style={{ fontSize: 29 }}>{m.icon}</div>
                <h3 style={{ fontSize: 20, margin: "9px 0 7px" }}>{m.name}</h3>
                <p style={{ color: "#cbd5e1", lineHeight: 1.55, fontSize: 14, minHeight: 66 }}>{m.detail}</p>
                <div style={{ color: "#fbbf24", fontSize: 12, fontWeight: 800 }}>{m.state}</div>
              </article>
            ))}
          </section>

          <section style={{ marginTop: 28, padding: 22, borderRadius: 18, background: "rgba(8,145,178,.13)", border: "1px solid rgba(103,232,249,.3)" }}>
            <h2 style={{ margin: "0 0 12px", fontSize: 23 }}>Le sette protezioni RiverCloud</h2>
            <ol style={{ color: "#dbeafe", lineHeight: 1.8, paddingLeft: 22, margin: 0 }}>
              <li>Separazione degli ambienti e dei privilegi amministrativi.</li>
              <li>Autenticazione, autorizzazioni minime e policy sui dati.</li>
              <li>Segreti e credenziali isolati dal codice e dai client.</li>
              <li>API protette con controlli, limiti di traffico e registrazione degli eventi.</li>
              <li>Cifratura dei dati in transito e protezione dei dati archiviati.</li>
              <li>Backup indipendenti, esportabili e verificati.</li>
              <li>Ripristino di emergenza provato con test periodici.</li>
            </ol>
          </section>

          <section style={{ marginTop: 26, padding: 22, borderRadius: 18, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.12)" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 23 }}>Ordine di costruzione</h2>
            <p style={{ color: "#cbd5e1", lineHeight: 1.65, margin: 0 }}>1. Inventario e messa in sicurezza dei servizi e dei dati esistenti. 2. Repository e procedure di backup indipendenti. 3. Ambiente di deploy autonomo. 4. RiverDB e RiverStorage. 5. API, identità e collegamenti progressivi alle app. 6. Prove di ripristino e passaggio controllato, senza interrompere il sito pubblico.</p>
          </section>

          <footer style={{ textAlign: "center", color: "#94a3b8", fontSize: 12, marginTop: 30 }}>RiverCloud · RiverSpend · Fondazione infrastrutturale</footer>
        </div>
      </main>
    </>
  );
}
