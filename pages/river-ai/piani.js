import Head from "next/head";
import { RIVERSSAI_PUBLIC_PLANS, RIVERSSAI_COMMERCE_STATUS } from "../../lib/riverSSAI/publicPlans.mjs";

const accents = {
  bronze: { edge: "#b87945", glow: "rgba(184,121,69,.13)" },
  silver: { edge: "#aeb9c5", glow: "rgba(174,185,197,.16)" },
  gold: { edge: "#d6aa37", glow: "rgba(214,170,55,.14)" },
  platinum: { edge: "#b8c8dc", glow: "rgba(184,200,220,.16)" },
  free: { edge: "#35c9dd", glow: "rgba(53,201,221,.14)" },
};

const money = (value) => new Intl.NumberFormat("it-IT", {
  style: "currency", currency: "EUR", minimumFractionDigits: 2,
}).format(value);

export default function RiverSSAIPlans() {
  return (
    <>
      <Head>
        <title>Piani RiverSSAI 10.0 | RiverSpend</title>
        <meta name="description" content="Scopri i piani mensili Bronzo, Argento, Oro e Platinum di RiverSSAI 10.0." />
        <meta name="robots" content="index,follow" />
      </Head>
      <main style={{ minHeight: "100vh", padding: "34px 18px 60px", color: "#eef6ff", background: "radial-gradient(circle at 50% 0%, #16456b 0, #07182b 48%, #040d19 100%)", fontFamily: "Arial,sans-serif" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <a href="/river-ai" style={{ color: "#9eddf5", textDecoration: "none", fontSize: 14 }}>← RiverSSAI 10.0</a>
          <header style={{ textAlign: "center", padding: "38px 0 28px" }}>
            <img src="/icons/river-ssai-10.svg" alt="" width="76" height="76" style={{ borderRadius: 22, boxShadow: "0 8px 30px rgba(0,0,0,.3)" }} />
            <p style={{ color: "#73d7f5", letterSpacing: 3, fontSize: 12, fontWeight: 800, margin: "20px 0 8px" }}>RIVERSPEND · INTELLIGENZA ARTIFICIALE</p>
            <h1 style={{ fontSize: "clamp(30px,5vw,48px)", margin: "0 0 12px" }}>RiverSSAI 10.0</h1>
            <p style={{ color: "#c0d3e5", fontSize: 17, maxWidth: 650, lineHeight: 1.6, margin: "0 auto" }}>Scegli il livello di assistenza intelligente più adatto alle tue esigenze.</p>
          </header>

          <div role="status" style={{ border: "1px solid #d6aa37", background: "rgba(214,170,55,.10)", borderRadius: 14, padding: "14px 16px", margin: "0 auto 26px", maxWidth: 760, textAlign: "center", color: "#ffe7a3", lineHeight: 1.5 }}>
            <strong>Anteprima commerciale — pagamenti non attivi.</strong><br />
            I prezzi sono stati definiti. {RIVERSSAI_COMMERCE_STATUS.checkoutEnabled ? "Gli abbonamenti sono disponibili." : "Attivazione degli abbonamenti, registrazione commerciale e checkout in seguito ai collaudi e a una decisione esplicita del proprietario."}
          </div>

          <section aria-label="Piani mensili RiverSSAI" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(225px,1fr))", gap: 16 }}>
            {RIVERSSAI_PUBLIC_PLANS.map((plan) => {
              const color = accents[plan.id];
              return (
                <article key={plan.id} style={{ display: "flex", flexDirection: "column", border: "1px solid " + color.edge, borderRadius: 20, padding: 22, background: "linear-gradient(160deg," + color.glow + ",rgba(10,27,47,.92) 55%)", boxShadow: "0 12px 34px rgba(0,0,0,.18)" }}>
                  <div style={{ color: color.edge, fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase" }}>RiverSSAI · {plan.id}</div>
                  <h2 style={{ fontSize: 25, margin: "12px 0 5px" }}>{plan.name}</h2>
                  <p style={{ color: "#aebfd0", margin: "0 0 22px", minHeight: 36 }}>{plan.audience}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                    <strong style={{ fontSize: 35 }}>{plan.priceEur === 0 ? "Gratis" : money(plan.priceEur)}</strong>
                    {plan.priceEur > 0 && <span style={{ color: "#aebfd0" }}>/ mese</span>}
                  </div>
                  <p style={{ color: "#d0deeb", lineHeight: 1.55, minHeight: 72 }}>{plan.description}</p>
                  <div style={{ marginTop: "auto", borderTop: "1px solid rgba(210,230,245,.15)", paddingTop: 16, color: "#ffe7a3", fontSize: 13, fontWeight: 700 }}>Disponibilità in preparazione</div>
                </article>
              );
            })}
          </section>

          <section style={{ maxWidth: 980, margin: "30px auto 0", padding: 22, border: "1px solid rgba(137,181,214,.25)", borderRadius: 18, background: "rgba(8,25,43,.7)", lineHeight: 1.65 }}>
            <h2 style={{marginTop:0,fontSize:22}}>Cosa potrà fare River con ciascun piano</h2>
            <p style={{color:"#c0d3e5"}}>Questa è la struttura funzionale prevista per il catalogo pubblico. Le quote numeriche, i limiti d’uso e l’attivazione effettiva delle singole funzioni saranno definiti e collaudati prima di aprire gli abbonamenti.</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:12}}>
              <article style={{padding:15,border:"1px solid rgba(53,201,221,.35)",borderRadius:14}}><h3 style={{marginTop:0,color:"#6ee7f9"}}>Free · 0 €</h3><ul style={{paddingLeft:18,color:"#d0deeb"}}><li>Conversazioni essenziali con Nova</li><li>Spiegazioni e domande quotidiane</li><li>Aiuto di base per testi e idee</li></ul></article>
              <article style={{padding:15,border:"1px solid rgba(184,121,69,.4)",borderRadius:14}}><h3 style={{marginTop:0,color:"#d6a477"}}>Bronzo · 2,99 €/mese</h3><ul style={{paddingLeft:18,color:"#d0deeb"}}><li>Tutto ciò che offre Free</li><li>Supporto per scrittura e organizzazione</li><li>Attività quotidiane più articolate</li></ul></article>
              <article style={{padding:15,border:"1px solid rgba(174,185,197,.4)",borderRadius:14}}><h3 style={{marginTop:0,color:"#c7d1dc"}}>Argento · 5,99 €/mese</h3><ul style={{paddingLeft:18,color:"#d0deeb"}}><li>Tutto ciò che offre Bronzo</li><li>Analisi e pianificazione strutturate</li><li>Accesso ampliato agli strumenti compatibili</li></ul></article>
              <article style={{padding:15,border:"1px solid rgba(214,170,55,.4)",borderRadius:14}}><h3 style={{marginTop:0,color:"#f1cf72"}}>Oro · 12,99 €/mese</h3><ul style={{paddingLeft:18,color:"#d0deeb"}}><li>Tutto ciò che offre Argento</li><li>Supporto specialistico per ambiti diversi</li><li>Workflow più complessi e capacità superiori</li></ul></article>
              <article style={{padding:15,border:"1px solid rgba(184,200,220,.45)",borderRadius:14}}><h3 style={{marginTop:0,color:"#d6e5f7"}}>Platinum · 24,99 €/mese</h3><ul style={{paddingLeft:18,color:"#d0deeb"}}><li>Tutto ciò che offre Oro</li><li>Massimo livello pubblico previsto</li><li>Priorità e capacità d’uso superiori</li></ul></article>
            </div>
            <p style={{fontSize:12,color:"#ffe7a3",marginBottom:0}}>Nota: questa matrice descrive le funzionalità previste, non un servizio già attivo. Immagini, video, caricamento file, progetti, limiti quantitativi e accesso specialistico saranno abilitati solo dopo implementazione e collaudo. La versione Owner resta separata dai piani clienti.</p>
          </section>

          <section style={{ maxWidth: 820, margin: "30px auto 0", padding: 22, border: "1px solid rgba(137,181,214,.25)", borderRadius: 18, background: "rgba(8,25,43,.7)", lineHeight: 1.65 }}>
            <h2 style={{ marginTop: 0, fontSize: 20 }}>Un ambiente separato per il proprietario</h2>
            <p style={{ color: "#c0d3e5", marginBottom: 0 }}>I quattro piani sono destinati al pubblico. L'edizione Owner e i relativi privilegi amministrativi restano separati e non sono acquistabili né assegnabili tramite questa pagina.</p>
          </section>

          <footer style={{ textAlign: "center", color: "#8299ad", fontSize: 12, marginTop: 30 }}>
            RiverSpend · RiverSSAI 10.0 · Catalogo in anteprima
          </footer>
        </div>
      </main>
    </>
  );
}
