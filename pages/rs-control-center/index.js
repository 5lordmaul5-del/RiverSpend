import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const cards = [
  ["💰", "Incassi", "Dati pagamenti da collegare"],
  ["💸", "Spese", "Registro spese da configurare"],
  ["🛒", "Ordini visibili", "Conteggio consentito dalle policy"],
  ["↩️", "Resi", "Gestione resi da configurare"],
  ["👥", "Iscritti", "Conteggio amministrativo da collegare"],
  ["🏪", "Venditori", "Dati venditori da collegare"],
  ["🏢", "Aziende", "Dati aziende da collegare"],
  ["📦", "Prodotti pubblicati", "Conteggio dal database"],
];

export default function RSControlCenter() {
  const [status, setStatus] = useState("Verifica accesso…");
  const [email, setEmail] = useState("");
  const [metrics, setMetrics] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!alive) return;

      if (!session) {
        setStatus("login");
        return;
      }

      setEmail(session.user.email || "");

      const { data: role, error: roleError } = await supabase
        .from("rs_admin_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!alive) return;

      if (roleError || role?.role !== "admin") {
        setStatus("denied");
        setError(
          roleError?.message ||
            "Questo account non ha il ruolo amministratore."
        );
        return;
      }

      setStatus("admin");

      const results = await Promise.all([
        supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("status", "published"),
        supabase.from("orders").select("id", { count: "exact", head: true }),
      ]);

      if (!alive) return;

      setMetrics({
        products: results[0].error ? null : results[0].count,
        orders: results[1].error ? null : results[1].count,
      });
    }

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => load());

    return () => {
      alive = false;
      subscription?.unsubscribe();
    };
  }, []);

  const panel = {
    background: "white",
    borderRadius: 16,
    padding: 18,
    boxShadow: "0 4px 14px rgba(0,80,100,.07)",
  };

  const value = (key) =>
    metrics[key] === null || metrics[key] === undefined
      ? "—"
      : metrics[key];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3fbfd",
        color: "#12343b",
        fontFamily: "Arial,sans-serif",
        padding: 20,
      }}
    >
      <header style={{ ...panel, marginBottom: 22 }}>
        <div style={{ color: "#08a7cf", fontSize: 25, fontWeight: 700 }}>
          RiverSpend
        </div>
        <div style={{ color: "#63818a", marginTop: 5 }}>
          🎛️ RiverSpend Panel Control · RSPC
        </div>
      </header>

      {status === "login" ? (
        <section style={panel}>
          <h1>Accesso richiesto</h1>
          <p>
            Accedi a RiverSpend con l’account amministratore{" "}
            <b>mauriziolella@yahoo.it</b>, poi riapri questo pannello.
          </p>
        </section>
      ) : status === "denied" ? (
        <section style={panel}>
          <h1>Accesso non autorizzato</h1>
          <p>{error}</p>
        </section>
      ) : status !== "admin" ? (
        <section style={panel}>{status}</section>
      ) : (
        <>
          <h1 style={{ fontSize: 27, marginBottom: 6 }}>
            RiverSpend Panel Control
          </h1>
          <p style={{ color: "#63818a", marginTop: 0 }}>
            RSPC · Area amministrativa · Accesso verificato per {email}
          </p>

          <div
            style={{
              ...panel,
              borderLeft: "5px solid #16a36a",
              margin: "18px 0",
            }}
          >
            <b style={{ color: "#168454" }}>✓ Amministratore verificato</b>
            <div style={{ color: "#63818a", fontSize: 13, marginTop: 5 }}>
              I valori mostrati provengono dal database. “—” indica dati non
              accessibili o non ancora collegati, non zero.
            </div>
          </div>

          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))",
              gap: 12,
            }}
          >
            {cards.map(([icon, title, note]) => {
              const metric =
                title === "Prodotti pubblicati"
                  ? value("products")
                  : title === "Ordini visibili"
                    ? value("orders")
                    : "—";

              return (
                <article key={title} style={panel}>
                  <div style={{ fontSize: 24 }}>{icon}</div>
                  <b style={{ display: "block", marginTop: 8 }}>{title}</b>
                  <div
                    style={{
                      fontSize: 25,
                      fontWeight: 700,
                      margin: "8px 0",
                      color: "#087f9e",
                    }}
                  >
                    {metric}
                  </div>
                  <small style={{ color: "#718a91", lineHeight: 1.4 }}>
                    {note}
                  </small>
                </article>
              );
            })}
          </section>

          <h2 style={{ marginTop: 26 }}>Gestione ecosistema</h2>
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: 12,
            }}
          >
            {[
              ["🛒 Marketplace", "Prodotti · Vetrine · Categorie · ADS · Ordini"],
              ["👥 Utenti", "Privati · Aziende · Acquirenti · Venditori"],
              ["👷 Collaboratori", "Elenco · Ruoli · Permessi · Attività"],
              ["📊 Statistiche", "Iscrizioni · Crescita · Vendite · Rimborsi"],
              ["🛡️ Sicurezza", "Accesso admin · Ruoli · Registro attività"],
            ].map(([title, detail]) => (
              <article key={title} style={panel}>
                <b>{title}</b>
                <p style={{ color: "#63818a", lineHeight: 1.5 }}>{detail}</p>
                <small style={{ color: "#8aa0a6" }}>
                  Collegamento dati in corso
                </small>
              </article>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
