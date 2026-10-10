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
  const [activePanel, setActivePanel] = useState("");
  const [panelRows, setPanelRows] = useState([]);
  const [panelLoading, setPanelLoading] = useState(false);
  const [panelError, setPanelError] = useState("");
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaBody, setIdeaBody] = useState("");
  const [ideaAudience, setIdeaAudience] = useState("all");
  const [ideaRecipients, setIdeaRecipients] = useState([]);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDescription, setMeetingDescription] = useState("");
  const [meetingStart, setMeetingStart] = useState("");
  const [meetingEnd, setMeetingEnd] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [meetingParticipants, setMeetingParticipants] = useState([]);
  const [secretSubject, setSecretSubject] = useState("");
  const [secretBody, setSecretBody] = useState("");
  const [secretRecipients, setSecretRecipients] = useState([]);

  async function loadInsights() {
    setInsightsError("");
    const { data, error } = await supabase.rpc("rs_admin_insights");
    if (error) {
      setInsightsError(error.message || "Dati Insights non ancora disponibili.");
      return;
    }
    setInsights(data || null);
  }


  async function loadCollaborators() {
    const { data, error } = await supabase.from("rs_collaborators")
      .select("id,full_name,email,status,permissions,invite_expires_at,user_id")
      .order("created_at", { ascending: false });
    if (error) {
      setActionMessage(error.message || "Impossibile caricare i collaboratori.");
      return;
    }
    setCollaborators(data || []);
  }

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
      await loadInsights();
      await loadCollaborators();
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

  async function openPanel(name) {
    setActivePanel(name);
    setPanelRows([]);
    setPanelError("");
    setPanelLoading(true);

    const configs = {
      "Incassi": { table: "orders", select: "id,total,currency,status,payment_status,created_at", order: "created_at", filter: ["payment_status", "paid"] },
      "Spese": { table: "rs_treasury_movements", select: "id,description,gross_amount,currency,status,created_at", order: "created_at" },
      "Ordini visibili": { table: "orders", select: "id,status,payment_status,total,currency,created_at", order: "created_at" },
      "Resi": { table: "orders", select: "id,status,payment_status,total,currency,created_at", order: "created_at", filter: ["status", "refunded"] },
      "Iscritti": { table: "profiles", select: "id,display_name,seller_type,created_at", order: "created_at" },
      "Venditori": { table: "profiles", select: "id,display_name,seller_type,created_at", order: "created_at" },
      "Aziende": { table: "profiles", select: "id,display_name,seller_type,created_at", order: "created_at", filter: ["seller_type", "Azienda"] },
      "Prodotti pubblicati": { table: "products", select: "id,name,price,status,created_at", order: "created_at", filter: ["status", "published"] },
      "Marketplace": { table: "products", select: "id,name,price,status,created_at", order: "created_at" },
      "Utenti": { table: "profiles", select: "id,display_name,seller_type,created_at", order: "created_at" },
      "Collaboratori": { table: "rs_collaborators", select: "id,full_name,email,status,permissions,created_at", order: "created_at" },
      "Statistiche": { table: "rs_ecosystem_events", select: "id,module,event_type,created_at", order: "created_at" },
      "Sicurezza": { table: "rs_admin_roles", select: "user_id,role,created_at", order: "created_at" },
      "RiverSpend Meet": { table: "rs_meetings", select: "id,title,description,starts_at,ends_at,meeting_url,participant_user_ids,created_at", order: "starts_at" },
      "Riunioni / Video call": { table: "rs_meetings", select: "id,title,description,starts_at,ends_at,meeting_url,participant_user_ids,created_at", order: "starts_at" },
      "Aggiungi idee": { table: "rs_collaborator_ideas", select: "id,title,body,audience,recipient_user_ids,created_at", order: "created_at" },
      "Messaggi segreti": { table: "rs_secret_messages", select: "id,subject,body,recipient_user_ids,created_at", order: "created_at" }
    };

    const config = configs[name];
    if (!config) {
      setPanelLoading(false);
      return;
    }

    try {
      let request = supabase.from(config.table).select(config.select).order(config.order, { ascending: false }).limit(50);
      if (config.filter) request = request.eq(config.filter[0], config.filter[1]);
      if (name === "Resi") request = request.or("status.eq.refunded,payment_status.eq.refunded");
      if (name === "Venditori") request = request.eq("seller_type", "Privato");
      const { data, error } = await request;
      if (error) {
        setPanelError(error.message || "Impossibile caricare i dati della sezione.");
      } else {
        setPanelRows(data || []);
      }
    } catch (err) {
      setPanelError(err?.message || "Errore durante il caricamento della sezione.");
    } finally {
      setPanelLoading(false);
    }
  }

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

  async function addIdea() {
    if (!ideaTitle.trim() || !ideaBody.trim()) return setActionMessage("Inserisci titolo e testo dell'idea.");
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("rs_collaborator_ideas").insert({
      title: ideaTitle.trim(), body: ideaBody.trim(), audience: ideaAudience,
      recipient_user_ids: ideaRecipients, created_by: user?.id || null
    });
    if (error) return setActionMessage(error.message);
    setIdeaTitle(""); setIdeaBody(""); setIdeaRecipients([]);
    setActionMessage("Idea inviata.");
  }

  async function scheduleMeeting() {
    if (!meetingTitle || !meetingStart || !meetingEnd) return setActionMessage("Inserisci titolo, orari di inizio e fine.");
    if (new Date(meetingEnd) <= new Date(meetingStart)) return setActionMessage("La fine della riunione deve essere successiva all’inizio.");
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("rs_meetings").insert({
      title: meetingTitle.trim(), description: meetingDescription.trim() || null,
      starts_at: new Date(meetingStart).toISOString(), ends_at: new Date(meetingEnd).toISOString(),
      meeting_url: meetingUrl.trim() || null, participant_user_ids: meetingParticipants,
      created_by: user?.id || null
    });
    if (error) return setActionMessage(error.message);
    setMeetingTitle(""); setMeetingDescription(""); setMeetingStart(""); setMeetingEnd(""); setMeetingUrl(""); setMeetingParticipants([]);
    setActionMessage("Riunione programmata.");
  }

  async function sendSecretMessage() {
    if (!secretBody.trim() || !secretRecipients.length) return setActionMessage("Scrivi il messaggio e seleziona almeno un destinatario.");
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("rs_secret_messages").insert({
      subject: secretSubject.trim() || null, body: secretBody.trim(), recipient_user_ids: secretRecipients,
      sender_user_id: user?.id || null
    });
    if (error) return setActionMessage(error.message);
    setSecretSubject(""); setSecretBody(""); setSecretRecipients([]);
    setActionMessage("Messaggio segreto inviato solo ai destinatari selezionati.");
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
        position: "relative",
        zIndex: 1,
        pointerEvents: "auto",
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
                title === "Prodotti pubblicati" ? value("products") :
                title === "Ordini visibili" ? value("orders") : "—";
              return (
                <button key={title} onClick={() => openPanel(title)}
                  style={{...panel, textAlign:"left", border:"1px solid #dcecef", cursor:"pointer", background:"#fff", position:"relative", zIndex:2, pointerEvents:"auto", touchAction:"manipulation"}}>
                  <div style={{fontSize:24}}>{icon}</div>
                  <b style={{display:"block", marginTop:8}}>{title}</b>
                  <div style={{fontSize:25,fontWeight:700,margin:"8px 0",color:"#087f9e"}}>{metric}</div>
                  <small style={{color:"#718a91",lineHeight:1.4}}>{note}</small>
                  <div style={{marginTop:10,color:"#08a7cf",fontWeight:700}}>Apri report →</div>
                </button>
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

          {activePanel && (
            <section style={{...panel, marginTop:22, borderLeft:"5px solid #08a7cf"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
                <div>
                  <h2 style={{margin:"0 0 5px"}}>📊 Report: {activePanel}</h2>
                  <div style={{color:"#63818a"}}>Sezione interattiva RSPC.</div>
                </div>
                <button onClick={()=>setActivePanel("")} style={{padding:"8px 12px",border:0,borderRadius:9,cursor:"pointer",position:"relative",zIndex:3,touchAction:"manipulation"}}>Chiudi</button>
              </div>
              <div style={{marginTop:16}}>
                {panelLoading ? (
                  <div style={{padding:14,background:"#f3fbfd",borderRadius:10}}>Caricamento dati reali…</div>
                ) : panelError ? (
                  <div role="alert" style={{padding:14,background:"#fff5e8",borderRadius:10,color:"#8a4b08"}}>Non è stato possibile caricare questa sezione: {panelError}</div>
                ) : panelRows.length ? (
                  <div style={{display:"grid",gap:10}}>
                    {panelRows.map((row, index) => (
                      <article key={row.id || row.user_id || index} style={{padding:14,border:"1px solid #e0edf0",borderRadius:12,background:"#fbfeff"}}>
                        <b>{row.title || row.name || row.full_name || row.display_name || row.description || row.email || row.subject || row.module || row.role || row.id || row.user_id || "Elemento"}</b>
                        <div style={{display:"grid",gap:4,marginTop:7,color:"#526d74",fontSize:13}}>
                          {Object.entries(row).filter(([key, val]) => !["id","title","name","full_name","display_name","description","email","subject","module","role","permissions","recipient_user_ids","participant_user_ids"].includes(key) && val !== null && val !== "").map(([key,val]) => (
                            <div key={key}><b>{key.replaceAll("_"," ")}:</b> {typeof val === "object" ? JSON.stringify(val) : String(val)}</div>
                          ))}
                          {row.body && <div style={{whiteSpace:"pre-wrap",marginTop:4}}>{row.body}</div>}
                          {row.description && row.title && <div style={{whiteSpace:"pre-wrap",marginTop:4}}>{row.description}</div>}
                          {row.meeting_url && <a href={row.meeting_url} target="_blank" rel="noreferrer" style={{color:"#087f9e",fontWeight:700,marginTop:6}}>Apri link della riunione ↗</a>}
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div style={{padding:14,background:"#f3fbfd",borderRadius:10,color:"#63818a"}}>Nessun elemento da mostrare in questa sezione per ora.</div>
                )}
                <p style={{color:"#718a91",fontSize:13,marginBottom:0,marginTop:12}}>Dati caricati dal database RiverSpend in base ai permessi dell’account. Le videochiamate si aprono tramite il link inserito nella riunione; questa schermata non avvia da sola una chiamata.</p>
              </div>
            </section>
          )}

          <section style={{...panel,marginTop:24,marginBottom:18,textAlign:"center",background:"linear-gradient(135deg,#ffffff,#eefbfe)"}}>
            <div style={{fontSize:28,fontWeight:800,color:"#12343b"}}>🌊 RiverSpend</div>
            <div style={{fontSize:18,fontWeight:800,color:"#087f9e",letterSpacing:2,marginTop:3}}>MEET</div>
            <div style={{color:"#63818a",marginTop:6}}>Video conference privata dell'ecosistema RiverSpend</div>
            <button onClick={()=>openPanel("RiverSpend Meet")} style={{marginTop:12,padding:"11px 18px",border:0,borderRadius:10,background:"#087f9e",color:"#fff",fontWeight:700,cursor:"pointer",position:"relative",zIndex:3,pointerEvents:"auto",touchAction:"manipulation"}}>🎥 Apri RiverSpend Meet</button>
          </section>

          <h2 style={{ marginTop: 30 }}>💡 Idee · Riunioni · Messaggi riservati</h2>
          <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12}}>
            <article style={panel}>
              <button onClick={()=>openPanel("Aggiungi idee")} style={{width:"100%",padding:12,border:0,borderRadius:10,background:"#087f9e",color:"white",fontWeight:700,cursor:"pointer",position:"relative",zIndex:3,touchAction:"manipulation"}}>💡 Aggiungi idee</button>
              <input value={ideaTitle} onChange={e=>setIdeaTitle(e.target.value)} placeholder="Titolo idea" style={{marginTop:10,width:"100%",boxSizing:"border-box",padding:11,borderRadius:9,border:"1px solid #d7e5e9"}} />
              <textarea value={ideaBody} onChange={e=>setIdeaBody(e.target.value)} placeholder="Scrivi l'idea..." rows={4} style={{marginTop:8,width:"100%",boxSizing:"border-box",padding:11,borderRadius:9,border:"1px solid #d7e5e9"}} />
              <select value={ideaAudience} onChange={e=>setIdeaAudience(e.target.value)} style={{marginTop:8,width:"100%",padding:11,borderRadius:9}}>
                <option value="all">Tutti i collaboratori</option><option value="collaborators">Solo collaboratori</option><option value="ceo">Solo CEO</option><option value="selected">Solo selezionati</option>
              </select>
              {ideaAudience==="selected" && <div style={{marginTop:8}}>{collaborators.filter(c=>c.user_id).map(c=><label key={c.id} style={{display:"block"}}><input type="checkbox" checked={ideaRecipients.includes(c.user_id)} onChange={e=>setIdeaRecipients(p=>e.target.checked?[...p,c.user_id]:p.filter(x=>x!==c.user_id))}/>{c.full_name||c.email}</label>)}</div>}
              <button onClick={addIdea} style={{marginTop:9,padding:10,border:0,borderRadius:9}}>Invia idea</button>
            </article>

            <article style={panel}>
              <button onClick={()=>openPanel("Riunioni / Video call")} style={{width:"100%",padding:12,border:0,borderRadius:10,background:"#168454",color:"white",fontWeight:700,cursor:"pointer",position:"relative",zIndex:3,touchAction:"manipulation"}}>🎥 Riunione / Video call</button>
              <input value={meetingTitle} onChange={e=>setMeetingTitle(e.target.value)} placeholder="Titolo riunione" style={{marginTop:10,width:"100%",boxSizing:"border-box",padding:11,borderRadius:9,border:"1px solid #d7e5e9"}} />
              <input type="datetime-local" value={meetingStart} onChange={e=>setMeetingStart(e.target.value)} style={{marginTop:8,width:"100%",padding:10}} />
              <input type="datetime-local" value={meetingEnd} onChange={e=>setMeetingEnd(e.target.value)} style={{marginTop:8,width:"100%",padding:10}} />
              <input value={meetingUrl} onChange={e=>setMeetingUrl(e.target.value)} placeholder="Link video call (es. Meet/Zoom)" style={{marginTop:8,width:"100%",boxSizing:"border-box",padding:11,borderRadius:9,border:"1px solid #d7e5e9"}} />
              <textarea value={meetingDescription} onChange={e=>setMeetingDescription(e.target.value)} placeholder="Agenda / note" rows={2} style={{marginTop:8,width:"100%",boxSizing:"border-box",padding:11,borderRadius:9,border:"1px solid #d7e5e9"}} />
              <div style={{marginTop:8}}><b>Partecipanti</b>{collaborators.filter(c=>c.user_id).map(c=><label key={c.id} style={{display:"block"}}><input type="checkbox" checked={meetingParticipants.includes(c.user_id)} onChange={e=>setMeetingParticipants(p=>e.target.checked?[...p,c.user_id]:p.filter(x=>x!==c.user_id))}/>{c.full_name||c.email}</label>)}</div>
              <button onClick={scheduleMeeting} style={{marginTop:9,padding:10,border:0,borderRadius:9}}>Programma riunione</button>
            </article>

            <article style={panel}>
              <button onClick={()=>openPanel("Messaggi segreti")} style={{width:"100%",padding:12,border:0,borderRadius:10,background:"#6b3f8f",color:"white",fontWeight:700,cursor:"pointer",position:"relative",zIndex:3,touchAction:"manipulation"}}>🔐 Messaggio segreto</button>
              <input value={secretSubject} onChange={e=>setSecretSubject(e.target.value)} placeholder="Oggetto" style={{marginTop:10,width:"100%",boxSizing:"border-box",padding:11,borderRadius:9,border:"1px solid #d7e5e9"}} />
              <textarea value={secretBody} onChange={e=>setSecretBody(e.target.value)} placeholder="Messaggio riservato..." rows={4} style={{marginTop:8,width:"100%",boxSizing:"border-box",padding:11,borderRadius:9,border:"1px solid #d7e5e9"}} />
              <div style={{marginTop:8}}><b>Chi può leggerlo?</b>{collaborators.filter(c=>c.user_id).map(c=><label key={c.id} style={{display:"block"}}><input type="checkbox" checked={secretRecipients.includes(c.user_id)} onChange={e=>setSecretRecipients(p=>e.target.checked?[...p,c.user_id]:p.filter(x=>x!==c.user_id))}/>{c.full_name||c.email}</label>)}</div>
              <button onClick={sendSecretMessage} style={{marginTop:9,padding:10,border:0,borderRadius:9}}>Invia messaggio segreto</button>
            </article>
          </section>
          {actionMessage && <div style={{...panel,marginTop:12,color:"#63818a"}}>{actionMessage}</div>}

          <h2 style={{ marginTop: 26 }}>Gestione ecosistema</h2>
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: 12,
            }}
          >
            {[
              ["🛒 Marketplace", "Prodotti · Vetrine · Categorie · Spons · Ordini", "Marketplace"],
              ["👥 Utenti", "Privati · Aziende · Acquirenti · Venditori", "Utenti"],
              ["👷 Collaboratori", "Elenco · Ruoli · Permessi · Attività", "Collaboratori"],
              ["📊 Statistiche", "Iscrizioni · Crescita · Vendite · Rimborsi", "Statistiche"],
              ["🛡️ Sicurezza", "Accesso admin · Ruoli · Registro attività", "Sicurezza"],
            ].map(([title, detail, panelName]) => (
              <article key={title} style={{...panel,border:"1px solid #dcecef"}}>
                <b>{title}</b>
                <p style={{ color: "#63818a", lineHeight: 1.5 }}>{detail}</p>
                <button onClick={() => openPanel(panelName)} style={{padding:"8px 10px",border:0,borderRadius:8,background:"#e8f8fc",color:"#087f9e",fontWeight:700,cursor:"pointer"}}>Apri sezione →</button>
              </article>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
