export default function RSControlCenter() {
  const sezioni = [
    { icona: "💰", titolo: "Finanza", voci: "Incassi · Spese · Commissioni · Rimborsi" },
    { icona: "🛒", titolo: "Marketplace", voci: "Ordini · Vendite · Prodotti · Vetrine" },
    { icona: "↩️", titolo: "Resi e assistenza", voci: "Resi · Contestazioni · Assistenza" },
    { icona: "👥", titolo: "Utenti", voci: "Iscritti · Privati · Aziende · Venditori" },
    { icona: "👷", titolo: "Collaboratori", voci: "Team · Ruoli · Permessi · Attività" },
    { icona: "📊", titolo: "Statistiche", voci: "Iscrizioni · Vendite · Crescita · Report" },
  ];

  return (
    <main style={{
      minHeight: "100vh",
      background: "#f3fbfd",
      color: "#12343b",
      fontFamily: "Arial, sans-serif",
      padding: "20px",
    }}>
      <header style={{
        background: "white",
        borderRadius: "18px",
        padding: "18px",
        marginBottom: "24px",
        boxShadow: "0 4px 14px rgba(0,80,100,.08)",
      }}>
        <div style={{ color: "#08a7cf", fontSize: "25px", fontWeight: "bold" }}>
          RiverSpend
        </div>
        <div style={{ color: "#63818a", marginTop: "5px" }}>
          RS Control Center
        </div>
      </header>

      <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>
        Centro di controllo
      </h1>
      <p style={{ color: "#63818a", lineHeight: 1.5 }}>
        La tua centrale di gestione dell’ecosistema RiverSpend.
      </p>

      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "12px",
        margin: "22px 0",
      }}>
        {[
          ["💰", "Incassi"],
          ["🛒", "Ordini"],
          ["👥", "Iscritti"],
          ["↩️", "Resi"],
        ].map(([icona, titolo]) => (
          <div key={titolo} style={{
            background: "white",
            borderRadius: "15px",
            padding: "18px 12px",
            boxShadow: "0 4px 14px rgba(0,80,100,.07)",
          }}>
            <div style={{ fontSize: "25px" }}>{icona}</div>
            <strong style={{ display: "block", marginTop: "8px" }}>{titolo}</strong>
            <div style={{ color: "#63818a", fontSize: "20px", marginTop: "5px" }}>—</div>
            <small style={{ color: "#8aa0a6" }}>Dati da collegare</small>
          </div>
        ))}
      </section>

      <section style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "14px",
      }}>
        {sezioni.map((sezione) => (
          <article key={sezione.titolo} style={{
            background: "white",
            borderRadius: "16px",
            padding: "18px",
            boxShadow: "0 4px 14px rgba(0,80,100,.07)",
          }}>
            <h2 style={{ fontSize: "19px", margin: "0 0 10px" }}>
              {sezione.icona} {sezione.titolo}
            </h2>
            <p style={{ color: "#63818a", margin: 0, lineHeight: 1.6 }}>
              {sezione.voci}
            </p>
          </article>
        ))}
      </section>

      <p style={{
        marginTop: "24px",
        color: "#63818a",
        fontSize: "13px",
        textAlign: "center",
      }}>
        RS Control Center · Area amministrativa RiverSpend
      </p>
    </main>
  );
}
