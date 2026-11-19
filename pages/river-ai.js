import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import { supabase } from "../lib/supabase";

const STORAGE_KEY = "riverspend-river-ai-chat-v1";

export default function RiverAI() {
  const [access, setAccess] = useState("checking");
  const [token, setToken] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);
  const [activeChatId, setActiveChatId] = useState("");
  const [storageKey, setStorageKey] = useState("");
  const [input, setInput] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const [thinkingMode, setThinkingMode] = useState("standard");
  const [showTools, setShowTools] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginSent, setLoginSent] = useState(false);
  const [loginCooldownUntil, setLoginCooldownUntil] = useState(0);
  const [searchChats, setSearchChats] = useState("");
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installMessage, setInstallMessage] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("nova");
  const [teamSize, setTeamSize] = useState(4);
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
    try { const until = Number(sessionStorage.getItem("river-ai-login-cooldown") || 0); if (until > Date.now()) setLoginCooldownUntil(until); } catch {}
  }, []);

  useEffect(() => {
    if (!loginCooldownUntil) return;
    const timer = window.setTimeout(() => setLoginCooldownUntil(0), Math.max(0, loginCooldownUntil - Date.now()));
    return () => window.clearTimeout(timer);
  }, [loginCooldownUntil]);

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
        const key = `${STORAGE_KEY}:${session.user.id}`;
        let parsed = null;
        try { parsed = JSON.parse(localStorage.getItem(key) || "null"); } catch {}
        let chats = [];
        if (Array.isArray(parsed)) {
          const legacyMessages = parsed.filter((item) => item && ["user", "assistant"].includes(item.role) && typeof item.content === "string").slice(-40);
          if (legacyMessages.length) chats = [{ id: "legacy-" + session.user.id, title: "Conversazione precedente", updatedAt: Date.now(), messages: legacyMessages }];
        } else if (parsed && Array.isArray(parsed.chats)) {
          chats = parsed.chats
            .filter((chat) => chat && typeof chat.id === "string" && Array.isArray(chat.messages))
            .slice(-30)
            .map((chat) => ({ ...chat, messages: chat.messages.slice(-40) }));
        }
        if (!chats.some((chat) => !chat.archived)) chats.push({ id: "chat-" + Date.now(), title: "Nuova conversazione", updatedAt: Date.now(), messages: [], archived: false });
        const requestedActive = parsed && typeof parsed.activeChatId === "string" ? chats.find((chat) => chat.id === parsed.activeChatId && !chat.archived) : null;
        const activeId = requestedActive?.id || chats.find((chat) => !chat.archived).id;
        const activeChat = chats.find((chat) => chat.id === activeId) || chats[0];
        setChatSessions(chats);
        setActiveChatId(activeChat.id);
        setMessages(activeChat.messages || []);
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
    if (storageKey && activeChatId) {
      const updatedChats = (chatSessions.length ? chatSessions : [{ id: activeChatId, title: "Nuova conversazione", messages: [] }])
        .map((chat) => {
          if (chat.id !== activeChatId) return chat;
          const firstUserMessage = messages.find((message) => message.role === "user");
          const title = chat.title === "Nuova conversazione" && firstUserMessage
            ? firstUserMessage.content.replace(/\\s+/g, " ").slice(0, 44)
            : chat.title;
          return { ...chat, title, messages: messages.slice(-40), updatedAt: Date.now() };
        });
      setChatSessions(updatedChats);
      try { localStorage.setItem(storageKey, JSON.stringify({ version: 2, activeChatId, chats: updatedChats })); } catch {}
    }
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy, storageKey, activeChatId]);

  async function requestLogin(event) {
    event?.preventDefault();
    const cleanEmail = loginEmail.trim();
    if (!cleanEmail || loginBusy) return;
    const storedCooldown = Number(sessionStorage.getItem("river-ai-login-cooldown") || 0);
    if (storedCooldown > Date.now()) { setLoginCooldownUntil(storedCooldown); setError("Attendi ancora " + Math.ceil((storedCooldown - Date.now()) / 1000) + " secondi prima di richiedere un altro link."); return; }
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
      const until = Date.now() + 60000;
      setLoginCooldownUntil(until);
      try { sessionStorage.setItem("river-ai-login-cooldown", String(until)); } catch {}
    } catch (err) {
      const message = String(err?.message || "");
      if (/429|rate limit|too many requests/i.test(message)) {
        const until = Date.now() + 60000;
        setLoginCooldownUntil(until);
        try { sessionStorage.setItem("river-ai-login-cooldown", String(until)); } catch {}
        setError("Supabase sta limitando temporaneamente gli invii email (429). Attendi almeno 60 secondi prima di riprovare. Se il problema continua, serve configurare un SMTP dedicato.");
      } else setError(message || "Non riesco a inviare il link di accesso.");
    } finally {
      setLoginBusy(false);
    }
  }

  async function send(event) {
    event?.preventDefault();
    const text = input.trim();
    if ((!text && !attachedFile) || busy || sendLock.current || access !== "ready") return;
    sendLock.current = true;
    const composed = attachedFile ? `${text || "Analizza il documento allegato."}\n\n[Documento: ${attachedFile.name}]\n${attachedFile.text.slice(0, 8000)}` : text;
    const next = [...messages, { role: "user", content: composed }].slice(-16);
    setMessages(next);
    setInput("");
    setBusy(true);
    setError("");
    try {
      const requestBody = JSON.stringify({ messages: next, agent: selectedAgent, teamSize, thinkingMode });
      const sendWithToken = (accessToken) => fetch("/api/river-ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: requestBody
      });
      let response = await sendWithToken(token);
      if (response.status === 401) {
        const { data: refreshed } = await supabase.auth.refreshSession();
        const refreshedToken = refreshed?.session?.access_token;
        if (refreshedToken) {
          setToken(refreshedToken);
          response = await sendWithToken(refreshedToken);
        }
      }
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const failure = new Error(data.error || "River AI non disponibile.");
        failure.status = response.status;
        throw failure;
      }
      setMessages((current) => [...current, { role: "assistant", content: data.answer }].slice(-40));
      setAttachedFile(null);
    } catch (err) {
      setMessages((current) => {
        const last = current[current.length - 1];
        return last?.role === "user" && last.content === composed ? current.slice(0, -1) : current;
      });
      setInput(text);
      setError(err.message || "Errore di connessione.");
    } finally {
      sendLock.current = false;
      setBusy(false);
    }
  }

  function downloadChat() {
    const transcript = messages.map((m) => `${m.role === "user" ? "Tu" : "RiverSSAI"}:\n${m.content}`).join("\n\n");
    const blob = new Blob([transcript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `river-ssai-chat-${new Date().toISOString().slice(0,10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function newChat() {
    if (busy) return;
    const nextId = "chat-" + Date.now();
    const updated = chatSessions.map((chat) => chat.id === activeChatId
      ? { ...chat, messages: messages.slice(-40), updatedAt: Date.now() }
      : chat);
    const nextChats = [...updated, { id: nextId, title: "Nuova conversazione", updatedAt: Date.now(), messages: [], archived: false }].slice(-30);
    setChatSessions(nextChats);
    setActiveChatId(nextId);
    setMessages([]);
    setInput("");
    setAttachedFile(null);
    setError("");
  }

  function saveChatList(nextChats, nextActiveId = activeChatId) {
    setChatSessions(nextChats);
    if (nextActiveId) setActiveChatId(nextActiveId);
    try { if (storageKey) localStorage.setItem(storageKey, JSON.stringify({ version: 2, activeChatId: nextActiveId, chats: nextChats })); } catch {}
  }

  function archiveCurrentChat() {
    if (!activeChatId || busy) return;
    const updated = chatSessions.map((chat) => chat.id === activeChatId ? { ...chat, messages: messages.slice(-40), archived: true, updatedAt: Date.now() } : chat);
    const remaining = updated.filter((chat) => !chat.archived);
    const next = remaining[remaining.length - 1] || { id: "chat-" + Date.now(), title: "Nuova conversazione", updatedAt: Date.now(), messages: [], archived: false };
    const nextChats = remaining.length ? updated : [...updated, next];
    saveChatList(nextChats, next.id); setMessages(next.messages || []); setShowChatMenu(false); setShowArchived(false);
  }

  function restoreCurrentChat() {
    if (!activeChatId || busy) return;
    const updated = chatSessions.map((chat) => chat.id === activeChatId ? { ...chat, archived: false, updatedAt: Date.now() } : chat);
    saveChatList(updated, activeChatId); setShowArchived(false); setShowChatMenu(false);
  }

  function togglePinCurrentChat() {
    if (!activeChatId || busy) return;
    const updated = chatSessions.map((chat) => chat.id === activeChatId ? { ...chat, pinned: !chat.pinned, updatedAt: Date.now() } : chat);
    saveChatList(updated, activeChatId);
  }

  function deleteCurrentChat() {
    if (!activeChatId || busy) return;
    if (!window.confirm("Vuoi eliminare definitivamente questa conversazione da questo dispositivo?")) return;
    const remaining = chatSessions.filter((chat) => chat.id !== activeChatId);
    const next = remaining.filter((chat) => !chat.archived).slice(-1)[0] || { id: "chat-" + Date.now(), title: "Nuova conversazione", updatedAt: Date.now(), messages: [], archived: false };
    const nextChats = remaining.length ? remaining : [next];
    saveChatList(nextChats, next.id); setMessages(next.messages || []); setShowChatMenu(false);
  }

  async function shareCurrentChat() {
    const transcript = messages.map((m) => `${m.role === "user" ? "Tu" : "Nova"}:\n${m.content}`).join("\n\n");
    if (!transcript) { setError("Questa conversazione è vuota."); return; }
    try {
      if (navigator.share) await navigator.share({ title: "Conversazione RiverSSAI", text: transcript });
      else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(transcript); setInstallMessage("Conversazione copiata: ora puoi condividerla."); }
      else downloadChat();
    } catch (err) { if (err?.name !== "AbortError") setError("Condivisione non disponibile su questo dispositivo."); }
  }

  function toggleMicrophone() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setError("La dettatura vocale non è supportata. Puoi usare il microfono della tastiera Android."); return; }
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const recognition = new SpeechRecognition(); recognition.lang = "it-IT"; recognition.interimResults = true; recognition.continuous = false;
    recognition.onresult = (event) => { const spoken = Array.from(event.results).map((r) => r[0]?.transcript || "").join(""); setInput((old) => (old ? old + " " : "") + spoken); };
    recognition.onerror = () => { setIsListening(false); setError("Problema di ricezione audio. Controlla il permesso del microfono."); };
    recognition.onend = () => setIsListening(false); recognitionRef.current = recognition;
    try { recognition.start(); setIsListening(true); setError(""); } catch { setIsListening(false); setError("Impossibile avviare il microfono."); }
  }

  const visibleChats = chatSessions
    .filter((chat) => showArchived ? !!chat.archived : !chat.archived || chat.id === activeChatId)
    .filter((chat) => !searchChats.trim() || (chat.title || "").toLowerCase().includes(searchChats.trim().toLowerCase()) || (chat.messages || []).some((message) => (message.content || "").toLowerCase().includes(searchChats.trim().toLowerCase())))
    .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || (b.updatedAt || 0) - (a.updatedAt || 0));

  function openChat(chatId) {
    if (busy || !chatId || chatId === activeChatId) return;
    const updated = chatSessions.map((chat) => chat.id === activeChatId
      ? { ...chat, messages: messages.slice(-40), updatedAt: Date.now() }
      : chat);
    const selected = updated.find((chat) => chat.id === chatId);
    if (!selected) return;
    setChatSessions(updated);
    setActiveChatId(chatId);
    setMessages(selected.messages || []);
    setInput("");
    setAttachedFile(null);
    setError("");
  }

  return (
    <>
    <Head><title>RiverSSAI 10.0 · Pure Power</title><meta name="description" content="RiverSSAI 10.0: Nova, i tre comandanti River e il registro dei 90 ruoli specialistici."/><meta name="theme-color" content="#06172b"/><meta name="apple-mobile-web-app-capable" content="yes"/><meta name="apple-mobile-web-app-title" content="RiverSSAI 10.0"/><link rel="manifest" href="/river-ai.webmanifest"/><link rel="icon" href="/icons/river-ssai-app.svg" type="image/svg+xml"/><link rel="apple-touch-icon" href="/icons/river-ssai-180.png"/></Head>
    <main style={{ minHeight:"100vh", background:"linear-gradient(180deg,#e9fbfc,#f7fcfd)", color:"#12343b", padding:"18px 12px 28px", fontFamily:"Arial,sans-serif" }}>
      <section style={{ maxWidth:850, minHeight:"calc(100vh - 46px)", margin:"0 auto", display:"flex", flexDirection:"column", background:"#fff", border:"1px solid #c8e8e9", borderRadius:22, overflow:"hidden", boxShadow:"0 12px 36px rgba(5,65,78,.10)" }}>
        <header className="river-ai-header" style={{ padding:"18px 20px", background:"linear-gradient(120deg,#073b4c,#087f89)", color:"#fff", display:"flex", alignItems:"center", gap:12 }}>
          <img src="/icons/river-ssai-app.svg" alt="Nova RiverSSAI" width="52" height="52" style={{width:52,height:52,borderRadius:16,background:"#071a2d",border:"1px solid #20c9ef",objectFit:"cover"}}/>
          <div className="river-ai-brand" style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:21,fontWeight:800 }}>RiverSSAI 10.0</div>
            <div style={{ fontSize:12,opacity:.85 }}>CEO Edition · Area privata RiverSpend</div>
          </div>
          <button onClick={installApp} style={{ border:"1px solid #f5d77a",borderRadius:11,padding:"9px 11px",background:"#f5d77a",color:"#12343b",fontWeight:800 }}>Installa app</button>
          <a href="/area-51" style={{ border:"1px solid #d9b65c",borderRadius:11,padding:"9px 11px",background:"rgba(217,182,92,.12)",color:"#f5d77a",fontWeight:800,textDecoration:"none",fontSize:13 }}>◈ Area 51</a>
          {access === "ready" && <><input aria-label="Cerca conversazioni" value={searchChats} onChange={(event) => setSearchChats(event.target.value)} placeholder="Cerca chat" style={{maxWidth:130,minWidth:85,border:"1px solid #ffffff66",borderRadius:10,padding:"8px 7px",background:"#075766",color:"#fff",fontSize:12}}/><select aria-label="Conversazioni salvate" value={visibleChats.some((chat) => chat.id === activeChatId) ? activeChatId : ""} onChange={(event) => openChat(event.target.value)} disabled={busy} style={{maxWidth:150,minWidth:90,border:"1px solid #ffffff66",borderRadius:10,padding:"8px 7px",background:"#075766",color:"#fff",fontWeight:700}}>
            {visibleChats.map((chat) => <option key={chat.id} value={chat.id}>{chat.pinned ? "📌 " : ""}{chat.title || "Conversazione"}</option>)}
          </select><button type="button" onClick={() => setShowArchived((v) => !v)} style={{border:"1px solid #ffffff66",borderRadius:10,padding:"8px 9px",background:"transparent",color:"#fff",fontWeight:700}}>{showArchived ? "Attive" : "Archivio"}</button><button type="button" aria-label="Menu conversazione" onClick={() => setShowChatMenu((v) => !v)} style={{border:"1px solid #ffffff66",borderRadius:10,padding:"8px 12px",background:"transparent",color:"#fff",fontSize:18}}>⋯</button></>}
          <button onClick={newChat} disabled={access!=="ready" || busy} style={{ border:"1px solid #ffffff66",borderRadius:11,padding:"9px 11px",background:"transparent",color:"#fff",fontWeight:700 }}>＋ Nuova chat</button>
        </header>
        <section aria-label="Nova e i tre comandanti River" style={{background:"#06172b",color:"#fff",padding:"12px 14px 16px"}}>
          <img src="/images/river-ssai-10-team.svg" alt="Nova al centro, i comandanti River A1B2, A2C4 e B2D5 e i 90 ruoli specialistici registrati" style={{display:"block",width:"100%",maxHeight:360,objectFit:"contain",borderRadius:14}}/>
          <div style={{textAlign:"center",fontWeight:800,letterSpacing:1,color:"#55e6ff",fontSize:13,marginTop:8}}>NOVA · RIVER A1B2 · RIVER A2C4 · RIVER B2D5</div>
          <div style={{textAlign:"center",fontSize:12,color:"#d7e9f5",marginTop:4}}>Una regia. Tre unità speciali. 90 ruoli registrati · fino a 4 attivi per richiesta.</div>
        </section>

        {installMessage && <div role="status" style={{padding:"10px 18px",background:"#fff8df",color:"#72510a",fontSize:13}}>{installMessage}</div>}
        {showChatMenu && access === "ready" && <div style={{display:"flex",gap:8,flexWrap:"wrap",padding:"10px 14px",background:"#edf8f8",borderBottom:"1px solid #dceeee"}}><button type="button" onClick={shareCurrentChat} style={{border:"1px solid #b9dadd",borderRadius:10,padding:"8px 12px",background:"#fff",color:"#075766",fontWeight:700}}>Condividi</button><button type="button" onClick={() => chatSessions.find((chat) => chat.id === activeChatId)?.archived ? restoreCurrentChat() : archiveCurrentChat()} disabled={busy || !messages.length} style={{border:"1px solid #b9dadd",borderRadius:10,padding:"8px 12px",background:"#fff",color:"#075766",fontWeight:700}}>{chatSessions.find((chat) => chat.id === activeChatId)?.archived ? "Ripristina" : "Archivia"}</button><button type="button" onClick={togglePinCurrentChat} disabled={busy} style={{border:"1px solid #b9dadd",borderRadius:10,padding:"8px 12px",background:"#fff",color:"#075766",fontWeight:700}}>{chatSessions.find((chat) => chat.id === activeChatId)?.pinned ? "Rimuovi fissaggio" : "Fissa chat"}</button><button type="button" onClick={deleteCurrentChat} disabled={busy} style={{border:"1px solid #f0c7c2",borderRadius:10,padding:"8px 12px",background:"#fff",color:"#a12d20",fontWeight:700}}>Elimina</button><button type="button" onClick={() => setShowChatMenu(false)} style={{border:"1px solid #b9dadd",borderRadius:10,padding:"8px 12px",background:"#fff",color:"#075766"}}>Chiudi</button></div>}
        {access === "checking" ? <div style={{padding:24}}>Verifica accesso amministratore…</div> :
         access === "login" ? <div style={{padding:24}}>
          <h2 style={{marginTop:0,color:"#075766"}}>Accesso amministratore</h2>
          <p>Inserisci l'indirizzo email del tuo account RiverSpend. Ti invieremo un link sicuro per entrare. Solo il proprietario autorizzato potrà usare RiverSSAI NUPM.</p>
          <form onSubmit={requestLogin} style={{display:"grid",gap:10,maxWidth:460}}>
            <input type="email" required autoComplete="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} placeholder="La tua email RiverSpend" style={{width:"100%",boxSizing:"border-box",border:"1px solid #c7dfe1",borderRadius:12,padding:13,fontSize:16,color:"#173b42"}} />
            <button type="submit" disabled={loginBusy || !loginEmail.trim() || loginCooldownUntil > Date.now()} style={{border:0,borderRadius:12,padding:13,background:loginBusy || loginCooldownUntil > Date.now()?"#a9c8ca":"#087f89",color:"#fff",fontWeight:800}}>{loginBusy?"Invio in corso…":loginCooldownUntil > Date.now()?"Attendi prima di reinviare":"Invia link di accesso"}</button>
          </form>
          {loginSent && <p role="status" style={{marginTop:14,padding:12,borderRadius:12,background:"#effaf5",color:"#166534"}}>Richiesta accettata dal servizio email. Controlla anche Spam e Promozioni: questo non garantisce la consegna del messaggio. Apri il link sullo stesso dispositivo.</p>}
          <p style={{fontSize:12,color:"#63818a",marginTop:16}}>L'accesso è gestito da Supabase. Non inserire qui password o chiavi API.</p>
         </div> :
         access === "denied" ? <div style={{padding:24}}><h2>Accesso non autorizzato</h2><p>Questa assistente è riservata esclusivamente al proprietario RiverSpend.</p></div> :
         access === "error" ? <div role="alert" style={{padding:24}}><h2>Verifica temporaneamente non disponibile</h2><p>Non posso confermare i permessi in questo momento. Riprova tra poco.</p></div> :
         <>
          <div style={{padding:"12px 18px",background:"#f0fbfa",borderBottom:"1px solid #dceeee",fontSize:12,lineHeight:1.5,color:"#42636a"}}>
            Scegli il collaboratore specializzato. Il registro RiverSSAI contiene 90 ruoli e 10 squadre; in questa versione la Squadra Ultra attiva fino a 4 specialisti per richiesta, così da contenere i limiti tecnici del servizio AI. Nova integra i rapporti e segnala i limiti. Le azioni esterne restano protette da approvazione.
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
              <option value="business">🏢 River Business · Strategia e gestione</option>
              <option value="finance">💰 River Finance · Budget e finanza</option>
              <option value="markets">📊 River Markets · Mercati e token</option>
              <option value="payments">💳 River Payments · Pagamenti e protezione</option>
              <option value="data">📈 River Data · Dati e analisi</option>
              <option value="ai">🧠 River AI Lab · Modelli e apprendimento</option>
              <option value="cloud">☁️ River Cloud · Infrastruttura cloud</option>
              <option value="cyber">🔐 River Cyber · Difesa informatica</option>
              <option value="quality">🧪 River Quality · Test e qualità</option>
              <option value="product">📦 River Product · Prodotto e roadmap</option>
              <option value="marketing">📣 River Marketing · Comunicazione</option>
              <option value="sales">🤝 River Sales · Vendite e partnership</option>
              <option value="support">💬 River Support · Assistenza clienti</option>
              <option value="legal">⚖️ River Legal · Norme e conformità</option>
              <option value="logistics">🚚 River Logistics · Spedizioni e consegne</option>
              <option value="supply">🏭 River Supply · Fornitori e scorte</option>
              <option value="automation">⚙️ River Automation · Processi automatici</option>
              <option value="research">🔬 River Research · Ricerca e fonti</option>
              <option value="content">✍️ River Content · Testi e contenuti</option>
              <option value="localization">🌍 River Localization · Lingue e mercati</option>
              <option value="accessibility">♿ River Access · Accessibilità</option>
              <option value="sustainability">🌱 River Ecology · Sostenibilità</option>
              <option value="operations">🧭 River Operations · Organizzazione</option>
              <option value="documentation">📚 River Docs · Documentazione</option>
            </select>
            {selectedAgent === "team" && <select aria-label="Numero di agenti" value={teamSize} onChange={e=>setTeamSize(Number(e.target.value))} style={{border:"1px solid #c7dfe1",borderRadius:11,padding:10,background:"#fff",color:"#173b42",fontSize:14}}>
              <option value={2}>2 agenti + Nova</option>
              <option value={4}>4 agenti + Nova</option>
            </select>}
          </div>
          <div style={{flex:1,padding:18,overflowY:"auto",minHeight:300}}>
            {messages.length === 0 && <div style={{maxWidth:560,margin:"32px auto",textAlign:"center"}}>
              <img src="/icons/river-ssai-192.png" alt="" width="104" height="104" style={{display:"block",margin:"0 auto 12px"}}/><h2 style={{margin:"10px 0 6px",color:"#075766"}}>Ciao, sono Nova.</h2>
              <p style={{lineHeight:1.6,color:"#56737a"}}>Sono Nova, coordinatrice di RiverSSAI 10.0. Posso coinvolgere gli specialisti più adatti, organizzare il lavoro e aiutarti a verificare ogni passaggio del progetto RiverSpend.</p>
              <div style={{display:"inline-block",padding:"10px 14px",borderRadius:14,background:"#effafa",color:"#27616a",fontSize:13}}>Da dove vuoi cominciare?</div>
            </div>}
            {messages.map((message,index)=><div key={index} style={{display:"flex",justifyContent:message.role==="user"?"flex-end":"flex-start",margin:"12px 0"}}>
              <div style={{maxWidth:"88%",padding:"12px 14px",borderRadius:16,background:message.role==="user"?"#087f89":"#f0f5f6",color:message.role==="user"?"#fff":"#193c43",whiteSpace:"pre-wrap",lineHeight:1.55,overflowWrap:"anywhere"}}>{message.content.split(/(\*\*[^*]+\*\*)/g).map((part, partIndex) => part.startsWith("**") && part.endsWith("**") ? <strong key={partIndex}>{part.slice(2, -2)}</strong> : <span key={partIndex}>{part}</span>)}</div>
            </div>)}
            {busy && <div style={{color:"#54757b",fontSize:13,padding:8}}>River AI sta pensando…</div>}
            <div ref={endRef}/>
          </div>
          {error && <div role="alert" style={{margin:"0 16px 10px",padding:12,borderRadius:12,background:"#fff3f0",color:"#9a3412",fontSize:13}}>{error}</div>}
          <div style={{display:"flex",gap:8,flexWrap:"wrap",padding:"10px 14px",borderTop:"1px solid #dceeee",background:"#f5fbfb"}}>
            <button type="button" onClick={()=>setShowTools(v=>!v)} style={{border:"1px solid #b9dadd",borderRadius:10,padding:"8px 11px",background:"#fff",color:"#075766",fontWeight:700}}>＋ Strumenti</button>
            <button type="button" onClick={shareCurrentChat} disabled={!messages.length} style={{border:"1px solid #b9dadd",borderRadius:10,padding:"8px 11px",background:"#fff",color:"#075766",fontWeight:700}}>Condividi</button>
            <select aria-label="Modalità di risposta" value={thinkingMode} onChange={e=>setThinkingMode(e.target.value)} style={{border:"1px solid #b9dadd",borderRadius:10,padding:"8px 10px",background:"#fff",color:"#075766"}}><option value="standard">Risposta rapida</option><option value="deep">Pensa intensamente</option></select>
            <button type="button" onClick={downloadChat} disabled={!messages.length} style={{border:"1px solid #b9dadd",borderRadius:10,padding:"8px 11px",background:"#fff",color:"#075766",fontWeight:700}}>Scarica chat</button>
          </div>
          {showTools && <div style={{padding:"12px 14px",background:"#fff",borderTop:"1px solid #e3eeee",display:"grid",gap:9}}>
            <label style={{fontWeight:700,color:"#075766"}}>Allega un documento (TXT, MD, CSV o JSON, massimo 1 MB)
              <input type="file" accept=".txt,.md,.csv,.json,text/plain,text/markdown,text/csv,application/json" onChange={async e=>{const file=e.target.files?.[0]; if(!file)return; if(file.size>1024*1024){setError("Il file supera il limite di 1 MB.");e.target.value="";return;} try{const text=await file.text();setAttachedFile({name:file.name,text});setInput(v=>v ? v : `Analizza il documento allegato: ${file.name}`);setError("");}catch{setError("Non riesco a leggere questo file.");}}} style={{display:"block",marginTop:7,maxWidth:"100%"}} />
            </label>
            {attachedFile && <div style={{fontSize:13,color:"#17616a"}}>Allegato pronto: {attachedFile.name} <button type="button" onClick={()=>setAttachedFile(null)} style={{marginLeft:8,color:"#9a3412"}}>Rimuovi</button></div>}
            <div style={{fontSize:13,color:"#76531a",background:"#fff8df",padding:10,borderRadius:9}}>Generazione diretta di immagini e video: non ancora collegata a un servizio dedicato. Non ti mostreremo un falso pulsante di generazione.</div>
          </div>}
          <form onSubmit={send} style={{display:"flex",gap:8,padding:14,borderTop:"1px solid #dceeee",background:"#fbfefe"}}>
            <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Scrivi a River AI…" rows={2} maxLength={4000} disabled={busy} style={{flex:1,minWidth:0,resize:"vertical",border:"1px solid #c7dfe1",borderRadius:14,padding:12,fontSize:16,outlineColor:"#0e9aa4",color:"#173b42"}}/>
            <button type="button" aria-label="Microfono" onClick={toggleMicrophone} disabled={busy} style={{alignSelf:"stretch",border:"1px solid #b9dadd",borderRadius:14,padding:"0 13px",background:isListening?"#fee2e2":"#fff",color:isListening?"#b91c1c":"#075766",fontSize:20}}>{isListening ? "■" : "🎙"}</button>
            <button type="submit" aria-label="Invia messaggio" disabled={busy || (!input.trim() && !attachedFile)} style={{alignSelf:"stretch",border:0,borderRadius:14,padding:"0 18px",background:busy||(!input.trim() && !attachedFile)?"#a9c8ca":"#087f89",color:"#fff",fontWeight:800,fontSize:20}}>➤</button>
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
