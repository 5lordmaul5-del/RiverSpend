import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import { supabase } from "../lib/supabase";

const STORAGE_KEY = "riverspend-river-ai-chat-v1";

export default function RiverAI() {
  const [access, setAccess] = useState("checking");
  const [token, setToken] = useState("");
  const [messages, setMessages] = useState([]);
  const [storageKey, setStorageKey] = useState("");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginSent, setLoginSent] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installMessage, setInstallMessage] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("team");
  const [agents, setAgents] = useState([{ id: "nova", name: "Nova", role: "Coordinatrice centrale", squad: "Core & Prodotto" }]);
  const [teamSize, setTeamSize] = useState(30);
  const [menuNotice, setMenuNotice] = useState("");
  const [menuOpen, setMenuOpen] = useState(true);
  const endRef = useRef(null);
  const sendLock = useRef(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/river-ai/sw.js", { scope: "/river-ai" }).catch(() => {});
    const onInstall = (event) => { event.preventDefault(); setInstallPrompt(event); };
    const onInstalled = () => { setInstallPrompt(null); setInstallMessage("RiverSSAI 10.0 è stata installata sul dispositivo."); };
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
    let alive = true;
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!alive) return;
      if (!session?.access_token) {
        setToken("");
        setStorageKey("");
        setMessages([]);
        setAccess("login");
        return;
      }
      try {
        const response = await fetch("/api/area-51/access", {
          method: "GET",
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        if (!alive) return;
        if (response.status === 403 || response.status === 401) {
          setToken("");
          setStorageKey("");
          setMessages([]);
          setAccess("denied");
          return;
        }
        if (!response.ok) throw new Error("Verifica dei permessi non disponibile.");
        try {
          const registryResponse = await fetch("/api/river-ai/agents", {
            method: "GET",
            headers: { Authorization: `Bearer ${session.access_token}` }
          });
          if (registryResponse.ok) {
            const registryData = await registryResponse.json();
            if (Array.isArray(registryData.agents) && registryData.agents.length) setAgents(registryData.agents);
          }
        } catch {}
        const key = `${STORAGE_KEY}:${session.user.id}`;
        let saved = [];
        try {
          const parsed = JSON.parse(localStorage.getItem(key) || "[]");
          if (Array.isArray(parsed)) saved = parsed.slice(-40);
        } catch {}
        setMessages(saved);
        setStorageKey(key);
        setToken(session.access_token);
        setAccess("ready");
      } catch {
        if (alive) setAccess("error");
      }
    }
    check();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => check());
    return () => { alive = false; subscription?.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (storageKey) {
      try { localStorage.setItem(storageKey, JSON.stringify(messages.slice(-40))); } catch {}
    }
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy, storageKey]);

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
    if (!text || busy || sendLock.current || access !== "ready") return;
    sendLock.current = true;
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
      sendLock.current = false;
      setBusy(false);
    }
  }

  function newChat() {
    // Evita i dialoghi nativi di conferma, che possono non comparire nelle PWA installate.
    setMessages([]);
    setInput("");
    setError("");
    setSelectedAgent("team");
    setTeamSize(30);
  }

  const navButtonStyle = { textAlign:"left",padding:"11px",borderRadius:10,border:"1px solid #1b526c",background:"#0c2a40",color:"#f2fbff",fontWeight:700,fontSize:13,cursor:"pointer" };
  const navDisabledStyle = { textAlign:"left",display:"flex",justifyContent:"space-between",gap:6,padding:"10px 11px",borderRadius:10,border:"1px solid #243d52",background:"#102438",color:"#9eb3c5",fontSize:13,opacity:.8 };
  const smallActionStyle = {border:"1px solid #b9d8dd",background:"#fff",color:"#17545e",borderRadius:9,padding:"7px 9px",fontSize:12,fontWeight:700};
  const smallDisabledStyle = {border:"1px solid #d7e2e4",background:"#f2f6f6",color:"#7a9094",borderRadius:9,padding:"7px 9px",fontSize:11};
  function shareChat() {
    if (!messages.length) { setMenuNotice("La chat è vuota: non c’è nulla da condividere."); return; }
    const transcript = messages.map((item) => (item.role === "user" ? "Tu" : "Nova") + ": " + item.content).join("\n\n");
    const payload = { title: "Conversazione RiverSSAI 10.0", text: transcript };
    if (navigator.share) navigator.share(payload).then(() => setMenuNotice("Condivisione avviata.")).catch(() => {});
    else if (navigator.clipboard?.writeText) navigator.clipboard.writeText(transcript).then(() => setMenuNotice("Conversazione copiata negli appunti.")).catch(() => setMenuNotice("Condivisione non disponibile su questo dispositivo."));
    else setMenuNotice("Condivisione non supportata dal browser.");
  }

  function archiveChat() {
    if (!messages.length) { setMenuNotice("La chat è vuota."); return; }
    try {
      const key = "riverssai-archive-v1";
      const saved = JSON.parse(localStorage.getItem(key) || "[]");
      saved.unshift({ id: Date.now(), title: (messages.find((item) => item.role === "user")?.content || "Chat RiverSSAI").slice(0, 72), messages, archivedAt: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(saved.slice(0, 100)));
      setMessages([]); setInput(""); setMenuNotice("Chat archiviata su questo dispositivo.");
    } catch { setMenuNotice("Non è stato possibile archiviare la chat."); }
  }

  function pinChat() {
    if (!messages.length) { setMenuNotice("Scrivi almeno un messaggio prima di fissare la chat."); return; }
    try {
      const key = "riverssai-pinned-v1";
      const saved = JSON.parse(localStorage.getItem(key) || "[]");
      saved.unshift({ id: Date.now(), title: (messages.find((item) => item.role === "user")?.content || "Chat RiverSSAI").slice(0, 72), messages, pinnedAt: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(saved.slice(0, 30)));
      setMenuNotice("Chat fissata su questo dispositivo.");
    } catch { setMenuNotice("Non è stato possibile fissare la chat."); }
  }

  function deleteChat() {
    setMessages([]); setInput(""); setError(""); setMenuNotice("Conversazione corrente eliminata da questo dispositivo.");
  }

  return (
    <>
    <Head><title>RiverSSAI 10.0 · Pure Power</title><meta name="description" content="RiverSSAI 10.0: Nova coordina il registro di 89 specialisti in 10 squadre."/><meta name="apple-mobile-web-app-capable" content="yes"/><meta name="apple-mobile-web-app-title" content="RiverSSAI 10.0"/><meta name="theme-color" content="#06172b"/><link rel="manifest" href="/river-ai.webmanifest"/><link rel="icon" href="/icons/river-ssai-10.svg" type="image/svg+xml"/><link rel="apple-touch-icon" href="/icons/river-ssai-192.png"/></Head>
    <main style={{ minHeight:"100vh", background:"linear-gradient(180deg,#e9fbfc,#f7fcfd)", color:"#12343b", padding:"18px 12px 28px", fontFamily:"Arial,sans-serif", display:"flex", alignItems:"flex-start", justifyContent:"center", gap:12, flexWrap:"wrap" }}>
      {access === "ready" && <aside aria-label="Menu RiverSSAI" style={{width:230,flex:"0 0 230px",background:"#07182b",color:"#e8f4ff",borderRadius:18,padding:14,boxSizing:"border-box",boxShadow:"0 12px 30px rgba(5,30,50,.16)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}><strong style={{fontSize:15}}>RiverSSAI</strong><button onClick={()=>setMenuOpen(!menuOpen)} aria-label="Apri o chiudi menu" style={{background:"transparent",border:"1px solid #416079",color:"#fff",borderRadius:8,padding:"4px 8px"}}>{menuOpen?"Nascondi":"Menu"}</button></div>
        {menuOpen && <nav style={{display:"grid",gap:7}}>
          <button onClick={newChat} style={navButtonStyle}>＋ Nuova chat</button>
          <button disabled style={navDisabledStyle}>▧ Immagini <small>In preparazione</small></button>
          <button disabled style={navDisabledStyle}>▶ Video <small>In preparazione</small></button>
          <button disabled style={navDisabledStyle}>▣ Progetti <small>In preparazione</small></button>
          <button disabled style={navDisabledStyle}>⌕ Esplora <small>In preparazione</small></button>
          <button disabled style={navDisabledStyle}>⚙ Personalizza <small>In preparazione</small></button>
          <a href="/river-ai/piani" style={{display:"block",padding:"10px 11px",borderRadius:10,background:"#123b54",color:"#9fe8ff",textDecoration:"none",fontSize:13,fontWeight:700}}>€ Piani e costi</a>
        </nav>}
        <div style={{marginTop:16,paddingTop:12,borderTop:"1px solid #28465e",fontSize:11,lineHeight:1.5,color:"#a8bfd2"}}>Nova + 89 specialisti registrati · 10 squadre</div>
      </aside>
      <section style={{ maxWidth:980, minHeight:"calc(100vh - 46px)", margin:"0", display:"flex", flexDirection:"column", background:"#fff", border:"1px solid #c8e8e9", borderRadius:22, overflow:"hidden", boxShadow:"0 12px 36px rgba(5,65,78,.10)",flex:"1 1 640px",minWidth:0 }}>
        <header className="river-ai-header" style={{ padding:"18px 20px", background:"linear-gradient(120deg,#073b4c,#087f89)", color:"#fff", display:"flex", alignItems:"center", gap:12 }}>
          <img src="/icons/river-ssai-10.svg" alt="Nova RiverSSAI" width="52" height="52" style={{width:52,height:52,borderRadius:16,background:"#071a2d",border:"1px solid #20c9ef",objectFit:"cover"}}/>
          <div className="river-ai-brand" style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:21,fontWeight:800 }}>RiverSSAI 10.0</div>
            <div style={{ fontSize:12,opacity:.85 }}>Pure Power · Area privata RiverSpend</div>
          </div>
          <button onClick={installApp} style={{ border:"1px solid #f5d77a",borderRadius:11,padding:"9px 11px",background:"#f5d77a",color:"#12343b",fontWeight:800 }}>Installa app</button>
          <a href="/area-51" style={{ border:"1px solid #d9b65c",borderRadius:11,padding:"9px 11px",background:"rgba(217,182,92,.12)",color:"#f5d77a",fontWeight:800,textDecoration:"none",fontSize:13 }}>◈ Area 51</a>
          <button onClick={newChat} disabled={access!=="ready" || busy} style={{ border:"1px solid #ffffff66",borderRadius:11,padding:"9px 11px",background:"transparent",color:"#fff",fontWeight:700 }}>Nuova chat</button>
        </header>
        <section aria-label="Nova e i tre comandanti River" style={{background:"#06172b",color:"#fff",padding:"12px 14px 16px"}}>
          <img src="/images/river-ssai-10-team.svg" alt="Nova al centro, i comandanti River A1B2, A2C4 e B2D5 e gli 89 specialisti del registro" style={{display:"block",width:"100%",maxHeight:360,objectFit:"contain",borderRadius:14}}/>
          <div style={{textAlign:"center",fontWeight:800,letterSpacing:1,color:"#55e6ff",fontSize:13,marginTop:8}}>NOVA · RIVER A1B2 · RIVER A2C4 · RIVER B2D5</div>
          <div style={{textAlign:"center",fontSize:12,color:"#d7e9f5",marginTop:4}}>Una regia. Tre unità speciali. 89 specialisti registrati.</div>
        </section>

        {installMessage && <div role="status" style={{padding:"10px 18px",background:"#fff8df",color:"#72510a",fontSize:13}}>{installMessage}</div>}
        {access === "checking" ? <div style={{padding:24}}>Verifica accesso amministratore…</div> :
         access === "login" ? <div style={{padding:24}}>
          <h2 style={{marginTop:0,color:"#075766"}}>Accesso amministratore</h2>
          <p>Inserisci l'indirizzo email del tuo account RiverSpend. Ti invieremo un link sicuro per entrare. Solo il proprietario autorizzato potrà usare RiverSSAI NUPM.</p>
          <form onSubmit={requestLogin} style={{display:"grid",gap:10,maxWidth:460}}>
            <input type="email" required autoComplete="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} placeholder="La tua email RiverSpend" style={{width:"100%",boxSizing:"border-box",border:"1px solid #c7dfe1",borderRadius:12,padding:13,fontSize:16,color:"#173b42"}} />
            <button type="submit" disabled={loginBusy || !loginEmail.trim()} style={{border:0,borderRadius:12,padding:13,background:loginBusy?"#a9c8ca":"#087f89",color:"#fff",fontWeight:800}}>{loginBusy?"Invio in corso…":"Invia link di accesso"}</button>
          </form>
          {loginSent && <p role="status" style={{marginTop:14,padding:12,borderRadius:12,background:"#effaf5",color:"#166534"}}>Link inviato. Apri l'email sullo stesso dispositivo e completa l'accesso; poi River AI si aprirà automaticamente.</p>}
          <p style={{fontSize:12,color:"#63818a",marginTop:16}}>L'accesso è gestito da Supabase. Non inserire qui password o chiavi API.</p>
         </div> :
         access === "denied" ? <div style={{padding:24}}><h2>Accesso non autorizzato</h2><p>Questa assistente è riservata esclusivamente al proprietario RiverSpend.</p></div> :
         access === "error" ? <div role="alert" style={{padding:24}}><h2>Verifica temporaneamente non disponibile</h2><p>Non posso confermare i permessi in questo momento. Riprova tra poco.</p></div> :
         <>
          <div style={{display:"flex",gap:7,flexWrap:"wrap",padding:"10px 16px",borderBottom:"1px solid #e3eeee",background:"#fbfefe"}}>
            <button onClick={shareChat} style={smallActionStyle}>Condividi</button>
            <button onClick={pinChat} style={smallActionStyle}>Fissa</button>
            <button onClick={archiveChat} style={smallActionStyle}>Archivia</button>
            <button onClick={deleteChat} style={smallActionStyle}>Elimina chat</button>
            <button disabled style={smallDisabledStyle}>Carica file · in preparazione</button>
            <button disabled style={smallDisabledStyle}>Aggiungi al progetto · in preparazione</button>
          </div>
          {menuNotice && <div role="status" style={{padding:"8px 16px",background:"#fff8df",color:"#72510a",fontSize:12}}>{menuNotice}</div>}
          <div style={{padding:"12px 18px",background:"#f0fbfa",borderBottom:"1px solid #dceeee",fontSize:12,lineHeight:1.5,color:"#42636a"}}>
            Scegli il collaboratore specializzato. Il registro comprende 89 specialisti coordinati da Nova in 10 squadre. Con Squadra Ultra, Nova seleziona fino a 30 specialisti dal registro e li integra in un’unica elaborazione AI. I ruoli sono competenze coordinate, non modelli autonomi né richieste separate al provider. Le azioni esterne restano protette da approvazione.
          </div>
          <div style={{padding:"12px 18px",borderBottom:"1px solid #e3eeee",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <label htmlFor="river-agent" style={{fontWeight:800,color:"#075766"}}>Agente operativo</label>
            <select id="river-agent" value={selectedAgent} onChange={e=>setSelectedAgent(e.target.value)} style={{flex:1,minWidth:190,border:"1px solid #c7dfe1",borderRadius:11,padding:10,background:"#fff",color:"#173b42",fontSize:14}}>
              <option value="team">⚡ Squadra Ultra · Nova coordina fino a 30 specialisti</option>
              {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name} · {agent.role}</option>)}
            </select>
            {selectedAgent === "team" && <select aria-label="Numero di agenti" value={teamSize} onChange={e=>setTeamSize(Number(e.target.value))} style={{border:"1px solid #c7dfe1",borderRadius:11,padding:10,background:"#fff",color:"#173b42",fontSize:14}}>
              <option value={2}>2 agenti + Nova</option>
              <option value={4}>4 agenti + Nova</option>
              <option value={8}>8 agenti + Nova</option>
              <option value={10}>10 specialisti + Nova</option>
              <option value={20}>20 specialisti + Nova</option>
              <option value={30}>30 specialisti + Nova</option>
            </select>}
          </div>
          <div style={{flex:1,padding:18,overflowY:"auto",minHeight:300}}>
            {messages.length === 0 && <div style={{maxWidth:560,margin:"32px auto",textAlign:"center"}}>
              <img src="/icons/river-ssai-10.svg" alt="" width="104" height="104" style={{display:"block",margin:"0 auto 12px"}}/><h2 style={{margin:"10px 0 6px",color:"#075766"}}>Ciao, sono Nova.</h2>
              <p style={{lineHeight:1.6,color:"#56737a"}}>Sono Nova, coordinatrice di RiverSSAI 10.0. Posso coinvolgere gli specialisti più adatti, organizzare il lavoro e aiutarti a verificare ogni passaggio del progetto RiverSpend.</p>
              <div style={{display:"inline-block",padding:"10px 14px",borderRadius:14,background:"#effafa",color:"#27616a",fontSize:13}}>Da dove vuoi cominciare?</div>
            </div>}
            {messages.map((message,index)=><div key={index} style={{display:"flex",justifyContent:message.role==="user"?"flex-end":"flex-start",margin:"12px 0"}}>
              <div style={{maxWidth:"88%",padding:"12px 14px",borderRadius:16,background:message.role==="user"?"#087f89":"#f0f5f6",color:message.role==="user"?"#fff":"#193c43",whiteSpace:"pre-wrap",lineHeight:1.55,overflowWrap:"anywhere"}}>{message.content.split(/(\*\*[^*]+\*\*)/g).map((part, partIndex) => part.startsWith("**") && part.endsWith("**") ? <strong key={partIndex}>{part.slice(2, -2)}</strong> : <span key={partIndex}>{part}</span>)}</div>
            </div>)}
            {busy && <div style={{color:"#54757b",fontSize:13,padding:8}}>Nova e gli specialisti stanno elaborando…</div>}
            <div ref={endRef}/>
          </div>
          {error && <div role="alert" style={{margin:"0 16px 10px",padding:12,borderRadius:12,background:"#fff3f0",color:"#9a3412",fontSize:13}}>{error}</div>}
          <form onSubmit={send} style={{display:"flex",gap:8,padding:14,borderTop:"1px solid #dceeee",background:"#fbfefe"}}>
            <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Scrivi a RiverSSAI…" rows={2} maxLength={2000} disabled={busy} style={{flex:1,minWidth:0,resize:"vertical",border:"1px solid #c7dfe1",borderRadius:14,padding:12,fontSize:16,outlineColor:"#0e9aa4",color:"#173b42"}}/>
            <button type="submit" disabled={busy || !input.trim()} style={{alignSelf:"stretch",border:0,borderRadius:14,padding:"0 18px",background:busy||!input.trim()?"#a9c8ca":"#087f89",color:"#fff",fontWeight:800}}>Invia</button>
          </form>
         </>}
      </section>
    </main>

    <style jsx global>{`
      @media (max-width: 600px) {
        .river-ai-header {
          flex-wrap: wrap;
          align-items: center;
          gap: 8px !important;
          padding: 14px !important;
        }
        .river-ai-header .river-ai-brand {
          flex: 1 1 calc(100% - 58px) !important;
          min-width: 0;
        }
        .river-ai-header > button,
        .river-ai-header > a {
          flex: 1 1 0;
          min-width: 0;
          max-width: 100%;
          box-sizing: border-box;
          padding: 8px 6px !important;
          font-size: 12px !important;
          line-height: 1.25;
          text-align: center;
          overflow-wrap: anywhere;
        }
      }
    `}</style>
    </>
  );
}
