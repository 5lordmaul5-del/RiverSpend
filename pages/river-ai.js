import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import { supabase } from "../lib/supabase";

const STORAGE_KEY = "riverspend-river-ai-chat-v1";

export default function RiverAI() {
  const [access, setAccess] = useState("checking");
  const [token, setToken] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginSent, setLoginSent] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installMessage, setInstallMessage] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("nova");
  const [teamSize, setTeamSize] = useState(4);
  const endRef = useRef(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/river-ai-sw.js", { scope: "/" }).catch(() => {});
    const onInstall = (event) => { event.preventDefault(); setInstallPrompt(event); };
    const onInstalled = () => { setInstallPrompt(null); setInstallMessage("River SSAI 1.0 è stata installata sul dispositivo."); };
    window.addEventListener("beforeinstallprompt", onInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onInstall); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  async function installApp() {
    if (!installPrompt) {
      setInstallMessage("Apri il menu ⋮ di Chrome e scegli “Installa app” oppure “Aggiungi a schermata Home”.");
      return;
    }
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallMessage(choice?.outcome === "accepted" ? "Installazione avviata." : "Installazione non completata. Puoi riprovare.");
    setInstallPrompt(null);
  }

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved)) setMessages(saved.slice(-40));
    } catch {}
    let alive = true;
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!alive) return;
      if (!session?.access_token) { setAccess("login"); return; }
      const { data: role, error: roleError } = await supabase
        .from("rs_admin_roles").select("role").eq("user_id", session.user.id).maybeSingle();
      if (!alive) return;
      if (roleError || role?.role !== "admin") { setAccess("denied"); return; }
      setToken(session.access_token);
      setAccess("ready");
    }
    check();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => check());
    return () => { alive = false; subscription?.unsubscribe(); };
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40))); } catch {}
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function requestLogin(event) {
    event?.preventDefault();
    const cleanEmail = loginEmail.trim();
    if (!cleanEmail || loginBusy) return;
    setLoginBusy(true);
    setError("");
    setLoginSent(false);
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: { emailRedirectTo: window.location.origin + "/river-ai" }
      });
      if (authError) throw authError;
      setLoginSent(true);
    } catch (err) {
      setError(err.message || "Non riesco a inviare il link di accesso.");
    } finally {
      setLoginBusy(false);
    }
  }

  async function send(event) {
    event?.preventDefault();
    const text = input.trim();
    if (!text || busy || access !== "ready") return;
    const next = [...messages, { role: "user", content: text }].slice(-16);
    setMessages(next);
    setInput("");
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/river-ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messages: next, agent: selectedAgent, teamSize })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "River AI non disponibile.");
      setMessages((current) => [...current, { role: "assistant", content: data.answer }].slice(-40));
    } catch (err) {
      setError(err.message || "Errore di connessione.");
    } finally {
      setBusy(false);
    }
  }

  function newChat() {
    if (!window.confirm("Vuoi iniziare una nuova conversazione? La cronologia salvata su questo dispositivo verrà cancellata.")) return;
    setMessages([]);
    setError("");
  }

  return (
    <>
    <Head><title>River SSAI 1.0 · CEO Edition</title><meta name="theme-color" content="#073b4c"/><meta name="apple-mobile-web-app-capable" content="yes"/><meta name="apple-mobile-web-app-title" content="River SSAI"/><link rel="manifest" href="/river-ai.webmanifest"/><link rel="icon" href="/icons/river-ssai.svg" type="image/svg+xml"/><link rel="apple-touch-icon" href="/icons/river-ssai.svg"/></Head>
    <main style={{ minHeight:"100vh", background:"linear-gradient(180deg,#e9fbfc,#f7fcfd)", color:"#12343b", padding:"18px 12px 28px", fontFamily:"Arial,sans-serif" }}>
      <section style={{ maxWidth:850, minHeight:"calc(100vh - 46px)", margin:"0 auto", display:"flex", flexDirection:"column", background:"#fff", border:"1px solid #c8e8e9", borderRadius:22, overflow:"hidden", boxShadow:"0 12px 36px rgba(5,65,78,.10)" }}>
        <header style={{ padding:"18px 20px", background:"linear-gradient(120deg,#073b4c,#087f89)", color:"#fff", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:46,height:46,borderRadius:16,display:"grid",placeItems:"center",background:"rgba(255,255,255,.16)",fontSize:25 }}>🌊</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:21,fontWeight:800 }}>River SSAI 1.0</div>
            <div style={{ fontSize:12,opacity:.85 }}>CEO Edition · Area privata RiverSpend</div>
          </div>
          <button onClick={installApp} style={{ border:"1px solid #f5d77a",borderRadius:11,padding:"9px 11px",background:"#f5d77a",color:"#12343b",fontWeight:800 }}>Installa app</button>
          <button onClick={newChat} disabled={access!=="ready" || busy} style={{ border:"1px solid #ffffff66",borderRadius:11,padding:"9px 11px",background:"transparent",color:"#fff",fontWeight:700 }}>Nuova chat</button>
        </header>

        {installMessage && <div role="status" style={{padding:"10px 18px",background:"#fff8df",color:"#72510a",fontSize:13}}>{installMessage}</div>}
        {access === "checking" ? <div style={{padding:24}}>Verifica accesso amministratore…</div> :
         access === "login" ? <div style={{padding:24}}>
          <h2 style={{marginTop:0,color:"#075766"}}>Accesso amministratore</h2>
          <p>Inserisci l'indirizzo email del tuo account RiverSpend. Ti invieremo un link sicuro per entrare. Solo gli account con ruolo amministratore potranno usare River AI.</p>
          <form onSubmit={requestLogin} style={{display:"grid",gap:10,maxWidth:460}}>
            <input type="email" required autoComplete="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} placeholder="La tua email RiverSpend" style={{width:"100%",boxSizing:"border-box",border:"1px solid #c7dfe1",borderRadius:12,padding:13,fontSize:16,color:"#173b42"}} />
            <button type="submit" disabled={loginBusy || !loginEmail.trim()} style={{border:0,borderRadius:12,padding:13,background:loginBusy?"#a9c8ca":"#087f89",color:"#fff",fontWeight:800}}>{loginBusy?"Invio in corso…":"Invia link di accesso"}</button>
          </form>
          {loginSent && <p role="status" style={{marginTop:14,padding:12,borderRadius:12,background:"#effaf5",color:"#166534"}}>Link inviato. Apri l'email sullo stesso dispositivo e completa l'accesso; poi River AI si aprirà automaticamente.</p>}
          <p style={{fontSize:12,color:"#63818a",marginTop:16}}>L'accesso è gestito da Supabase. Non inserire qui password o chiavi API.</p>
         </div> :
         access === "denied" ? <div style={{padding:24}}><h2>Accesso non autorizzato</h2><p>Questa assistente è riservata all'amministratore RiverSpend.</p></div> :
         <>
          <div style={{padding:"12px 18px",background:"#f0fbfa",borderBottom:"1px solid #dceeee",fontSize:12,lineHeight:1.5,color:"#42636a"}}>
            Scegli il collaboratore specializzato. Gli agenti condividono la regia di Nova e la memoria privata. La Squadra Ultra consulta tre specialisti in parallelo e Nova integra i risultati. Le azioni esterne restano protette da approvazione.
          </div>
          <div style={{padding:"12px 18px",borderBottom:"1px solid #e3eeee",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <label htmlFor="river-agent" style={{fontWeight:800,color:"#075766"}}>Agente operativo</label>
            <select id="river-agent" value={selectedAgent} onChange={e=>setSelectedAgent(e.target.value)} style={{flex:1,minWidth:190,border:"1px solid #c7dfe1",borderRadius:11,padding:10,background:"#fff",color:"#173b42",fontSize:14}}>
              <option value="nova">🌊 Nova · Coordinatrice</option>
              <option value="team">⚡ Squadra Ultra · gruppo coordinato</option>
              <option value="tech">💻 River Tech · Programmazione</option>
              <option value="design">🎨 River Design · Immagini e video</option>
              <option value="robotics">🤖 River Robotics · Droidi e 3D</option>
              <option value="science">🧪 River Science · Calcoli e ricerca</option>
              <option value="memory">🧠 River Memory · Archivio e conoscenza</option>
              <option value="control">🛡️ River Control · Verifiche e sicurezza</option>
            </select>
            {selectedAgent === "team" && <select aria-label="Numero di agenti" value={teamSize} onChange={e=>setTeamSize(Number(e.target.value))} style={{border:"1px solid #c7dfe1",borderRadius:11,padding:10,background:"#fff",color:"#173b42",fontSize:14}}>
              <option value={2}>2 agenti + Nova</option>
              <option value={4}>4 agenti + Nova</option>
              <option value={8}>8 agenti + Nova</option>
            </select>}
          </div>
          <div style={{flex:1,padding:18,overflowY:"auto",minHeight:300}}>
            {messages.length === 0 && <div style={{maxWidth:560,margin:"32px auto",textAlign:"center"}}>
              <div style={{fontSize:42}}>🌊</div><h2 style={{margin:"10px 0 6px",color:"#075766"}}>Ciao, sono River AI.</h2>
              <p style={{lineHeight:1.6,color:"#56737a"}}>Sono la tua assistente privata per RiverSpend. Possiamo ragionare sul progetto, organizzare il lavoro e affrontare un problema alla volta.</p>
              <div style={{display:"inline-block",padding:"10px 14px",borderRadius:14,background:"#effafa",color:"#27616a",fontSize:13}}>Da dove vuoi cominciare?</div>
            </div>}
            {messages.map((message,index)=><div key={index} style={{display:"flex",justifyContent:message.role==="user"?"flex-end":"flex-start",margin:"12px 0"}}>
              <div style={{maxWidth:"88%",padding:"12px 14px",borderRadius:16,background:message.role==="user"?"#087f89":"#f0f5f6",color:message.role==="user"?"#fff":"#193c43",whiteSpace:"pre-wrap",lineHeight:1.55,overflowWrap:"anywhere"}}>{message.content}</div>
            </div>)}
            {busy && <div style={{color:"#54757b",fontSize:13,padding:8}}>River AI sta pensando…</div>}
            <div ref={endRef}/>
          </div>
          {error && <div role="alert" style={{margin:"0 16px 10px",padding:12,borderRadius:12,background:"#fff3f0",color:"#9a3412",fontSize:13}}>{error}</div>}
          <form onSubmit={send} style={{display:"flex",gap:8,padding:14,borderTop:"1px solid #dceeee",background:"#fbfefe"}}>
            <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Scrivi a River AI…" rows={2} maxLength={4000} disabled={busy} style={{flex:1,minWidth:0,resize:"vertical",border:"1px solid #c7dfe1",borderRadius:14,padding:12,fontSize:16,outlineColor:"#0e9aa4",color:"#173b42"}}/>
            <button type="submit" disabled={busy || !input.trim()} style={{alignSelf:"stretch",border:0,borderRadius:14,padding:"0 18px",background:busy||!input.trim()?"#a9c8ca":"#087f89",color:"#fff",fontWeight:800}}>Invia</button>
          </form>
         </>}
      </section>
    </main>
    </>
  );
}
