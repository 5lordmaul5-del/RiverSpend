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
  const [insights, setInsights] = useState(null);
  const [insightsError, setInsightsError] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPermissions, setNewPermissions] = useState({ marketplace:false, users:false, analytics:true, logistics:false, security:false, finance:false });
  const [inviteCode, setInviteCode] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  async function loadInsights() {
    setInsightsError("");
    const { data, error } = await supabase.rpc("rs_admin_insights");
    if (error) {
      setInsightsError(error.message || "Dati Insights non ancora disponibili.");
      return;
    }
    setInsights(data || null);
  }


  useEffect(() => {
    let alive = true;

    async function loadCollaborators() {
      const { data } = await supabase.from("rs_collaborators")
        .select("id,full_name,email,status,permissions,invite_expires_at")
        .order("created_at", { ascending: false });
      setCollaborators(data || []);
    }

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
      await loadInsights();\n      await loadCollaborators();
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

  async function createCollaborator() {
    setActionMessage("");
    setInviteCode("");
    if (!newEmail.trim()) return setActionMessage("Inserisci l'email.");
    const code = crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();
    const { error } = await supabase.from("rs_collaborators").upsert({
      email: newEmail.trim().toLowerCase(),
      full_name: newName.trim() || null,
      status: "invited",
      invite_code: code,
      invite_expires_at: new Date(Date.now() + 72*60*60*1000).toISOString(),
      permissions: newPermissions
    }, { onConflict: "email" });
    if (error) return setActionMessage(error.message);
    setInviteCode(code);
    setActionMessage("Collaboratore creato. Invia il codice alla persona scelta.");
    setNewName(""); setNewEmail("");
    await loadCollaborators();
  }

  async function savePermissions(id, next) {
    const { error } = await supabase.from("rs_collaborators")
      .update({ permissions: next, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) setActionMessage(error.message);
    else { setActionMessage("Permessi aggiornati."); await loadCollaborators(); }
  }

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

          <h2 style={{ marginTop: 30 }}>📊 RS Insights · Andamento clienti</h2>
          <p style={{ color: "#63818a", marginTop: 0 }}>
            Dati aggregati degli ultimi 30 giorni: cosa cercano, guardano, desiderano, aggiungono alla Rete e acquistano.
          </p>

          {insightsError ? (
            <section style={{ ...panel, borderLeft: "5px solid #d99a00", marginBottom: 16 }}>
              <b>RS Insights in attesa di dati</b>
              <div style={{ color: "#718a91", marginTop: 6 }}>{insightsError}</div>
            </section>
          ) : (
            <>
              <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(135px,1fr))", gap: 12, marginBottom: 16 }}>
                {[
                  ["👀", "Visualizzazioni", insights?.totals?.views],
                  ["🔎", "Ricerche", insights?.totals?.searches],
                  ["❤️", "Desideri", insights?.totals?.wishlist],
                  ["🕸️", "Nella Rete", insights?.totals?.net_add],
                  ["🛒", "Acquisti", insights?.totals?.purchases],
                ].map(([icon, title, metric]) => (
                  <article key={title} style={panel}>
                    <div style={{ fontSize: 22 }}>{icon}</div>
                    <b style={{ display: "block", marginTop: 6 }}>{title}</b>
                    <div style={{ fontSize: 25, fontWeight: 700, marginTop: 6, color: "#087f9e" }}>
                      {metric ?? "—"}
                    </div>
                  </article>
                ))}
              </section>

              <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
                <article style={panel}>
                  <b>🔥 Categorie più richieste</b>
                  <p style={{ color: "#718a91", fontSize: 13 }}>Visualizzazioni, ricerche e azioni aggregate.</p>
                  {(insights?.top_categories || []).length ? (
                    insights.top_categories.map((row, index) => (
                      <div key={row.category} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: "1px solid #edf3f5" }}>
                        <span><b>{index + 1}.</b> {row.category}</span>
                        <b>{row.events}</b>
                      </div>
                    ))
                  ) : <div style={{ color: "#8aa0a6" }}>Nessun dato ancora.</div>}
                </article>

                <article style={panel}>
                  <b>🔎 Ricerche più frequenti</b>
                  <p style={{ color: "#718a91", fontSize: 13 }}>Termini cercati dagli utenti.</p>
                  {(insights?.top_searches || []).length ? (
                    insights.top_searches.map((row, index) => (
                      <div key={row.term} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: "1px solid #edf3f5" }}>
                        <span><b>{index + 1}.</b> {row.term}</span>
                        <b>{row.searches}</b>
                      </div>
                    ))
                  ) : <div style={{ color: "#8aa0a6" }}>Nessuna ricerca registrata ancora.</div>}
                </article>
              </section>
            </>
          )}

          <h2 style={{ marginTop: 26 }}>👷 Collaboratori · Ruoli e permessi</h2>
          <section style={{ ...panel, marginBottom: 16 }}>
            <p style={{ color:"#63818a", marginTop:0 }}>Crea un collaboratore, genera un codice personale e scegli cosa può vedere.</p>
            <div style={{ display:"grid", gap:10 }}>
              <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nome collaboratore" style={{padding:12,borderRadius:10,border:"1px solid #d7e5e9"}} />
              <input value={newEmail} onChange={e=>setNewEmail(e.target.value)} placeholder="Email dell'account RiverSpend" type="email" style={{padding:12,borderRadius:10,border:"1px solid #d7e5e9"}} />
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:8}}>
                <label><input type="checkbox" checked={newPermissions.marketplace} onChange={e=>setNewPermissions(p=>({...p,marketplace:e.target.checked}))}/> 🛒 Marketplace</label>
                <label><input type="checkbox" checked={newPermissions.users} onChange={e=>setNewPermissions(p=>({...p,users:e.target.checked}))}/> 👥 Utenti</label>
                <label><input type="checkbox" checked={newPermissions.analytics} onChange={e=>setNewPermissions(p=>({...p,analytics:e.target.checked}))}/> 📊 Grafici / Insights</label>
                <label><input type="checkbox" checked={newPermissions.logistics} onChange={e=>setNewPermissions(p=>({...p,logistics:e.target.checked}))}/> 📦 Logistica</label>
                <label><input type="checkbox" checked={newPermissions.security} onChange={e=>setNewPermissions(p=>({...p,security:e.target.checked}))}/> 🛡️ Sicurezza</label>
                <label><input type="checkbox" checked={newPermissions.finance} onChange={e=>setNewPermissions(p=>({...p,finance:e.target.checked}))}/> 💰 Finanza</label>
              </div>
              <button onClick={createCollaborator} style={{padding:12,border:0,borderRadius:10,background:"#087f9e",color:"white",fontWeight:700}}>+ Crea collaboratore e genera codice</button>
              {inviteCode && <div style={{padding:14,borderRadius:10,background:"#eefaf5"}}><b>🔐 Codice da inviare:</b><div style={{fontSize:25,letterSpacing:3,fontWeight:800,marginTop:6}}>{inviteCode}</div><small>Valido 72 ore.</small></div>}
              {actionMessage && <div style={{color:"#63818a"}}>{actionMessage}</div>}
            </div>
          </section>
          <section style={{display:"grid",gap:10,marginBottom:24}}>
            {collaborators.map(c => (
              <article key={c.id} style={panel}>
                <b>{c.full_name || "Collaboratore"}</b>
                <div style={{color:"#63818a",fontSize:13}}>{c.email} · {c.status}</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:8,marginTop:12}}>
                  <label><input type="checkbox" checked={!!c.permissions?.marketplace} onChange={e=>savePermissions(c.id,{...c.permissions,marketplace:e.target.checked})}/> 🛒 Marketplace</label>
                  <label><input type="checkbox" checked={!!c.permissions?.users} onChange={e=>savePermissions(c.id,{...c.permissions,users:e.target.checked})}/> 👥 Utenti</label>
                  <label><input type="checkbox" checked={!!c.permissions?.analytics} onChange={e=>savePermissions(c.id,{...c.permissions,analytics:e.target.checked})}/> 📊 Analytics</label>
                  <label><input type="checkbox" checked={!!c.permissions?.logistics} onChange={e=>savePermissions(c.id,{...c.permissions,logistics:e.target.checked})}/> 📦 Logistica</label>
                  <label><input type="checkbox" checked={!!c.permissions?.security} onChange={e=>savePermissions(c.id,{...c.permissions,security:e.target.checked})}/> 🛡️ Sicurezza</label>
                  <label><input type="checkbox" checked={!!c.permissions?.finance} onChange={e=>savePermissions(c.id,{...c.permissions,finance:e.target.checked})}/> 💰 Finanza</label>
                </div>
              </article>
            ))}
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
