import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { supabase } from "../../lib/supabase";

const STORE = "riverspend-powertron-command-center-v1";
const STATUS = ["Pianificato", "In coda", "In revisione", "Completato", "Annullato"];
const stamp = () => new Date().toISOString();
const makeId = () => "PT-" + Date.now().toString(36).toUpperCase();

export default function PowerTronCommandCenter() {
  const [access, setAccess] = useState("checking");
  const [userKey, setUserKey] = useState("");
  const [registry, setRegistry] = useState(null);
  const [registryError, setRegistryError] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("01");
  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskGoal, setTaskGoal] = useState("");
  const [taskDivision, setTaskDivision] = useState("01");
  const [taskRoles, setTaskRoles] = useState(3);
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("Tutti");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!alive) return;
        if (!session?.access_token) { setAccess("login"); return; }
        const r = await fetch("/api/area-51/access", { headers: { Authorization: "Bearer " + session.access_token } });
        if (!alive) return;
        if (r.status === 401 || r.status === 403) { setAccess("denied"); return; }
        if (!r.ok) { setAccess("error"); return; }
        const key = STORE + ":" + session.user.id;
        setUserKey(key);
        try {
          const saved = JSON.parse(localStorage.getItem(key) || "[]");
          if (Array.isArray(saved)) setTasks(saved.slice(0, 100));
        } catch {}
        setAccess("ready");
      } catch { if (alive) setAccess("error"); }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (access !== "ready") return;
    let alive = true;
    fetch("/river-ssai/powertron-registry.json")
      .then(r => { if (!r.ok) throw new Error("Registro PowerTron non disponibile."); return r.json(); })
      .then(data => { if (alive) { setRegistry(data); setRegistryError(""); } })
      .catch(err => { if (alive) setRegistryError(err.message || "Errore nel caricamento del registro."); });
    return () => { alive = false; };
  }, [access]);

  useEffect(() => {
    if (access === "ready" && userKey) {
      try { localStorage.setItem(userKey, JSON.stringify(tasks.slice(0, 100))); }
      catch { setNotice("Spazio locale insufficiente: esporta il registro attività."); }
    }
  }, [tasks, access, userKey]);

  const divisions = registry?.divisions || [];
  const selected = divisions.find(d => d.id === selectedDivision) || divisions[0] || null;
  const filtered = useMemo(() => divisions.filter(d => (d.name + " " + d.scope + " " + d.id).toLowerCase().includes(search.toLowerCase())), [divisions, search]);
  const visibleTasks = filter === "Tutti" ? tasks : tasks.filter(t => t.status === filter);
  const planned = tasks.filter(t => t.status === "Pianificato" || t.status === "In coda").length;
  const completed = tasks.filter(t => t.status === "Completato").length;

  function createTask(e) {
    e.preventDefault();
    if (!taskTitle.trim() || !taskGoal.trim()) return;
    const division = divisions.find(d => d.id === taskDivision);
    const item = {
      id: makeId(), title: taskTitle.trim(), goal: taskGoal.trim(),
      divisionId: taskDivision, divisionName: division?.name || "Divisione non specificata",
      requestedRoleSlots: Number(taskRoles), status: "Pianificato",
      createdAt: stamp(), updatedAt: stamp(),
      execution: "non-avviata",
      note: "Piano locale: nessun modello AI o agente è stato avviato."
    };
    setTasks(prev => [item, ...prev].slice(0, 100));
    setTaskTitle(""); setTaskGoal(""); setNotice("Piano registrato localmente. Non è stata avviata un'esecuzione AI.");
  }

  function updateTask(id, status) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status, updatedAt: stamp() } : t));
  }

  function exportTasks() {
    const blob = new Blob([JSON.stringify({ exportedAt: stamp(), product: "PowerTron Command Center", tasks }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "powertron-command-center-backup.json"; a.click();
    URL.revokeObjectURL(url);
  }

  const card = { background: "#fff", border: "1px solid #d7e7ed", borderRadius: 16, padding: 15, boxShadow: "0 5px 18px rgba(7,48,69,.045)" };
  const button = { border: 0, borderRadius: 11, padding: "11px 14px", background: "#087f89", color: "#fff", fontWeight: 800, cursor: "pointer" };
  const field = { width: "100%", boxSizing: "border-box", border: "1px solid #c8dce3", borderRadius: 11, padding: 11, color: "#123746", background: "#fff", fontSize: 14 };

  return <>
    <Head><title>PowerTron Command Center · RiverSSAI SuperAI</title><meta name="description" content="Centro di comando privato PowerTron per il catalogo delle divisioni AI e la pianificazione dei compiti."/><meta name="robots" content="noindex,nofollow"/></Head>
    <main style={{ minHeight: "100vh", padding: 14, color: "#173846", fontFamily: "Arial,sans-serif", background: "radial-gradient(circle at 50% -10%,#d9f4f2 0,#edf7fa 42%,#f7fafc 100%)" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <header style={{ ...card, color: "#fff", border: "1px solid #1b6375", background: "linear-gradient(125deg,#061d32,#07576a 58%,#087e86)", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", padding: 20 }}>
          <div style={{ width: 58, height: 58, borderRadius: 17, display: "grid", placeItems: "center", background: "linear-gradient(145deg,#f4dc91,#bd8b35)", color: "#102c3a", fontSize: 27, fontWeight: 900 }}>P</div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ color: "#f2d98c", fontSize: 11, letterSpacing: 2, fontWeight: 900 }}>RIVERSSAI SUPERAI · NOVA CORE</div>
            <h1 style={{ margin: "5px 0", fontSize: 27 }}>POWERTRON COMMAND CENTER</h1>
            <div style={{ color: "#d4edf0", fontSize: 13 }}>Centro di coordinamento · catalogo specialistico PowerTron</div>
          </div>
          <a href="/river-ai" style={{ color: "#ffe6a5", fontWeight: 800, textDecoration: "none" }}>← RiverSSAI</a>
          <a href="/river-ai/umpsd" style={{ color: "#b9f4f6", fontWeight: 800, textDecoration: "none" }}>UMPSD 20.0</a>
          <button onClick={exportTasks} disabled={access !== "ready"} style={{ ...button, background: "#e8cb78", color: "#203846" }}>Esporta registro</button>
        </header>

        {access === "ready" && <div role="status" style={{ ...card, marginTop: 10, borderColor: "#c9a24e", background: "#fff9e8", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>♛</span>
          <div><b style={{ color: "#8a6422", letterSpacing: 1 }}>ORACOLO · OWNER</b><div style={{ color: "#617983", fontSize: 12 }}>Identità amministrativa verificata dal backend per questo account.</div></div>
        </div>}

        {access === "checking" ? <section style={{ ...card, marginTop: 14 }}>Verifica autorizzazione del proprietario…</section> :
         access === "login" ? <section style={{ ...card, marginTop: 14 }}><h2>Accesso richiesto</h2><p>Accedi prima a RiverSSAI per aprire il centro di comando privato.</p><a href="/river-ai">Apri RiverSSAI</a></section> :
         access === "denied" ? <section style={{ ...card, marginTop: 14 }}><h2>Accesso non autorizzato</h2><p>PowerTron è riservato all'account proprietario autorizzato.</p></section> :
         access === "error" ? <section style={{ ...card, marginTop: 14 }}><h2>Verifica non disponibile</h2><p>Non posso confermare i permessi. Riprova più tardi.</p></section> :
         <>
          <section style={{ ...card, marginTop: 14, padding: 0, overflow: "hidden", background: "#061d32", borderColor: "#b58d3f" }}>
            <img src="/river-ssai/powertron-neurocore.svg" alt="PowerTron NeuroCore: nucleo centrale e divisioni specialistiche" style={{ display: "block", width: "100%", height: "auto" }}/>
            <div style={{ padding: "12px 16px", color: "#d5f5f7", fontSize: 12, lineHeight: 1.5 }}>
              <b style={{ color: "#f2d98c" }}>NEUROCORE · CENTRO DI COMANDO</b> — visualizzazione architetturale della fortezza digitale. I nodi rappresentano divisioni e profili specialistici, non agenti autonomi già in esecuzione.
            </div>
          </section>

          <section style={{ ...card, marginTop: 14 }}>
            <div style={{ color: "#b08331", fontSize: 11, fontWeight: 900, letterSpacing: 1.5 }}>AGENT NETWORK · PROFILI SPECIALISTICI</div>
            <h2 style={{ margin: "5px 0 6px" }}>La squadra di PowerTron</h2>
            <p style={{ color: "#617983", fontSize: 12, lineHeight: 1.5, marginTop: 0 }}>Sei nodi di coordinamento mostrati come profili logici iniziali. Le divisioni del catalogo possono essere ampliate e collegate a worker reali in una fase successiva.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(185px,1fr))", gap: 9 }}>
              {[
                ["NOVA CORE","Coordinamento, priorità e controllo dei compiti","#eaf7fa"],
                ["INTELDESK","Ricerca OSINT da fonti pubbliche e autorizzate","#edf5ff"],
                ["SHIELDOPS","Rilevamento e risposta difensiva agli incidenti","#e9f8f1"],
                ["FRAUDLAB","Analisi di anomalie e indicatori antifrode","#fff6e5"],
                ["PRIVACYVAULT","Minimizzazione, accessi e protezione dei dati","#f2efff"],
                ["EVIDENCE LEDGER","Fonti, verifiche, cronologia e tracciabilità","#f4f7f8"]
              ].map(([name,desc,tint]) => <article key={name} style={{ padding: 13, borderRadius: 13, border: "1px solid #dce9ed", background: tint }}>
                <div style={{ width: 34, height: 34, borderRadius: 11, display: "grid", placeItems: "center", background: "#082b40", color: "#f2d98c", fontWeight: 900, marginBottom: 8 }}>{name.slice(0,1)}</div>
                <b style={{ fontSize: 12, color: "#173846" }}>{name}</b>
                <p style={{ fontSize: 11, lineHeight: 1.45, color: "#617983", marginBottom: 0 }}>{desc}</p>
                <div style={{ marginTop: 9, fontSize: 10, fontWeight: 800, color: "#946f2c" }}>PROFILO LOGICO · NON ATTIVO</div>
              </article>)}
            </div>
          </section>

          <section style={{ ...card, marginTop: 14, borderColor: "#b9dce1" }}>
            <div style={{ color: "#b08331", fontSize: 11, fontWeight: 900, letterSpacing: 1.5 }}>INTELLIGENCE STACK · I QUATTRO LIVELLI</div>
            <h2 style={{ margin: "5px 0 7px" }}>AI · ML · Deep Learning · LLM</h2>
            <p style={{ color: "#617983", fontSize: 12, lineHeight: 1.55, marginTop: 0 }}>Questi livelli non sono quattro motori in competizione: sono aree collegate. AI è il campo più ampio; ML, Deep Learning e gli LLM sono approcci più specifici che PowerTron potrà combinare secondo il compito.</p>
            <div style={{ display: "grid", gap: 9 }}>
              {[
                ["01","AI — Intelligenza Artificiale","Il livello più ampio: pianificazione, regole, ricerca, ragionamento e decisioni assistite. È il coordinamento generale di PowerTron.","#e8f5f7"],
                ["02","ML — Machine Learning","Modelli che apprendono schemi dai dati per classificare, stimare rischi e individuare anomalie. Richiedono dati adeguati e valutazioni periodiche.","#edf5ff"],
                ["03","Deep Learning","Reti neurali con molti strati, adatte a pattern complessi in immagini, audio, video e testo. Sono una famiglia di tecniche all'interno del ML.","#f2efff"],
                ["04","LLM — Large Language Models","Modelli linguistici basati sul Deep Learning, usati per dialogo, sintesi, estrazione, pianificazione assistita e generazione di testo e codice.","#fff6e5"]
              ].map(([n,title,desc,tint]) => <article key={n} style={{ display: "grid", gridTemplateColumns: "42px minmax(0,1fr)", gap: 11, padding: 12, borderRadius: 12, border: "1px solid #dce9ed", background: tint }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, display: "grid", placeItems: "center", background: "#082b40", color: "#f2d98c", fontWeight: 900 }}>{n}</div>
                <div><b style={{ color: "#173846", fontSize: 13 }}>{title}</b><p style={{ color: "#617983", fontSize: 11, lineHeight: 1.5, margin: "5px 0 0" }}>{desc}</p></div>
              </article>)}
            </div>
            <div style={{ marginTop: 11, padding: 12, borderRadius: 11, background: "#f4f9fa", color: "#526e78", fontSize: 11, lineHeight: 1.55 }}>
              <b>Come li userà PowerTron:</b> Nova seleziona l'approccio in base all'incarico: logica AI per coordinare, ML per previsioni e anomalie quando esistono dati validi, Deep Learning per media e segnali complessi, LLM per comprendere e produrre linguaggio. La disponibilità effettiva dipenderà dai modelli e dai servizi collegati.
            </div>
          </section>

          <section style={{ ...card, marginTop: 14, borderColor: "#e4d39a", background: "#fff9e8", fontSize: 13, lineHeight: 1.55 }}>
            <b>Trasparenza operativa:</b> questa prima versione è un Command Center di catalogo e pianificazione locale. Mostra divisioni e ruoli previsti, consente di creare e gestire piani di lavoro ed esportarli. Non avvia ancora agenti AI, non esegue compiti in background e non è collegato a una coda cloud o a provider AI. I piani sono salvati solo in questo browser.
          </section>
          {notice && <p role="status" style={{ color: "#17624f", fontSize: 13 }}>{notice}</p>}
          {registryError && <p role="alert" style={{ ...card, color: "#9b341d" }}>{registryError}</p>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10, marginTop: 14 }}>
            {[
              ["Divisioni AI", registry?.capacity?.divisions ?? "—", "Catalogo specialistico"],
              ["Ruoli logici", registry?.capacity?.totalLogicalRoleSlots?.toLocaleString("it-IT") ?? "—", "100 per divisione"],
              ["Piani aperti", planned, "Pianificati o in coda"],
              ["Completati", completed, "Registrati localmente"]
            ].map(([label,value,desc]) => <div key={label} style={{ ...card, padding: 14 }}><div style={{ color: "#5b7781", fontSize: 12, fontWeight: 700 }}>{label}</div><div style={{ fontSize: 28, fontWeight: 900, color: "#075d6d", margin: "5px 0" }}>{value}</div><div style={{ color: "#71858d", fontSize: 11 }}>{desc}</div></div>)}
          </div>

          <section style={{ ...card, marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <div><div style={{ color: "#b08331", fontSize: 11, fontWeight: 900, letterSpacing: 1.5 }}>DIVISION DIRECTORY</div><h2 style={{ margin: "5px 0" }}>Le divisioni PowerTron</h2></div>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca divisione o competenza…" aria-label="Cerca divisione" style={{ ...field, maxWidth: 330 }}/>
            </div>
            {registry && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(235px,1fr))", gap: 9, marginTop: 14 }}>
              {filtered.map(d => <button key={d.id} onClick={() => { setSelectedDivision(d.id); setTaskDivision(d.id); }} style={{ textAlign: "left", padding: 12, borderRadius: 12, border: selectedDivision === d.id ? "2px solid #07828b" : "1px solid #dce9ed", background: selectedDivision === d.id ? "#edfbfa" : "#fff", color: "#173846", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><b style={{ fontSize: 13 }}>{d.id} · {d.name}</b><span style={{ color: "#a17a2d", fontSize: 11, whiteSpace: "nowrap" }}>100 ruoli</span></div>
                <div style={{ color: "#617983", fontSize: 11, lineHeight: 1.45, marginTop: 6 }}>{d.scope}</div>
              </button>)}
            </div>}
          </section>

          {selected && <section style={{ ...card, marginTop: 14, borderColor: "#b9dce1", background: "linear-gradient(135deg,#fff,#f1fbfa)" }}>
            <div style={{ color: "#a47b2e", fontSize: 11, fontWeight: 900, letterSpacing: 1.5 }}>DIVISION SELECTED · {selected.id}</div>
            <h2 style={{ margin: "5px 0" }}>{selected.name}</h2>
            <p style={{ color: "#58727c", margin: "4px 0 12px", lineHeight: 1.5 }}>{selected.scope}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <span style={{ padding: "7px 10px", borderRadius: 9, background: "#e5f4f4", color: "#17616a", fontSize: 12, fontWeight: 800 }}>100 profili logici previsti</span>
              <span style={{ padding: "7px 10px", borderRadius: 9, background: "#f8f0dc", color: "#805e1e", fontSize: 12, fontWeight: 800 }}>Attivazione on-demand · non eseguita</span>
              <span style={{ padding: "7px 10px", borderRadius: 9, background: "#edf1f5", color: "#536978", fontSize: 12 }}>Stato: {selected.status}</span>
            </div>
          </section>}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 12, marginTop: 14, alignItems: "start" }}>
            <section style={card}>
              <div style={{ color: "#b08331", fontSize: 11, fontWeight: 900, letterSpacing: 1.5 }}>NOVA TASK PLANNER</div>
              <h2 style={{ margin: "5px 0 12px" }}>Prepara un incarico</h2>
              <form onSubmit={createTask} style={{ display: "grid", gap: 9 }}>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Titolo<input required maxLength={100} value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Es. Analisi sicurezza del progetto" style={{ ...field, marginTop: 5 }}/></label>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Obiettivo e perimetro autorizzato<textarea required maxLength={1600} value={taskGoal} onChange={e => setTaskGoal(e.target.value)} placeholder="Descrivi il risultato richiesto, i dati consentiti e i limiti…" rows={4} style={{ ...field, marginTop: 5, resize: "vertical" }}/></label>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Divisione<select value={taskDivision} onChange={e => { setTaskDivision(e.target.value); setSelectedDivision(e.target.value); }} style={{ ...field, marginTop: 5 }}>{divisions.map(d => <option key={d.id} value={d.id}>{d.id} · {d.name}</option>)}</select></label>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Profili logici da valutare<select value={taskRoles} onChange={e => setTaskRoles(Number(e.target.value))} style={{ ...field, marginTop: 5 }}>{[1,2,3,5,8,10].map(n => <option key={n} value={n}>{n} profili</option>)}</select></label>
                <button type="submit" style={button} disabled={!registry}>Registra piano di lavoro</button>
              </form>
              <p style={{ color: "#758991", fontSize: 11, lineHeight: 1.5, marginBottom: 0 }}>La quantità indica profili da coinvolgere in una futura esecuzione. Non equivale ad agenti avviati.</p>
            </section>

            <section style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <div><div style={{ color: "#b08331", fontSize: 11, fontWeight: 900, letterSpacing: 1.5 }}>TASK BOARD</div><h2 style={{ margin: "5px 0" }}>Registro incarichi ({tasks.length})</h2></div>
                <select aria-label="Filtra incarichi" value={filter} onChange={e => setFilter(e.target.value)} style={{ ...field, width: "auto" }}><option>Tutti</option>{STATUS.map(s => <option key={s}>{s}</option>)}</select>
              </div>
              <div style={{ display: "grid", gap: 9, marginTop: 12 }}>
                {visibleTasks.length === 0 ? <p style={{ color: "#71858d", fontSize: 13 }}>Nessun incarico registrato. Crea il primo piano con Nova Task Planner.</p> : visibleTasks.map(t => <article key={t.id} style={{ border: "1px solid #dce9ed", borderRadius: 12, padding: 12, background: "#fbfefe" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "start" }}><b style={{ fontSize: 13 }}>{t.title}</b><span style={{ fontSize: 10, color: "#a17a2d", whiteSpace: "nowrap" }}>{t.id}</span></div>
                  <div style={{ color: "#5d7680", fontSize: 11, margin: "5px 0" }}>{t.divisionId} · {t.divisionName} · {t.requestedRoleSlots} profili pianificati</div>
                  <p style={{ fontSize: 12, lineHeight: 1.45, margin: "7px 0", whiteSpace: "pre-wrap" }}>{t.goal}</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <select aria-label={"Stato " + t.id} value={t.status} onChange={e => updateTask(t.id, e.target.value)} style={{ ...field, width: "auto", padding: 7, fontSize: 11 }}>{STATUS.map(s => <option key={s}>{s}</option>)}</select>
                    <span style={{ color: "#9b5a36", fontSize: 10 }}>Solo registro locale · nessun agente avviato</span>
                  </div>
                </article>)}
              </div>
            </section>
          </div>
          <section style={{ ...card, marginTop: 14 }}>
            <h2 style={{ margin: "0 0 8px" }}>Regole di comando PowerTron</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 9 }}>
              {[
                ["01 · Un solo coordinatore","Nova organizza il piano e raccoglie i risultati."],
                ["02 · Lavoro delimitato","Niente creazione ricorsiva o incontrollata di agenti."],
                ["03 · Permessi minimi","Gli strumenti saranno in sola lettura per impostazione iniziale."],
                ["04 · Approvazione umana","Azioni esterne, pubblicazioni, pagamenti e modifiche richiedono conferma."],
                ["05 · Verifica indipendente","Risultati, fonti, incertezze e contraddizioni devono essere controllati."],
                ["06 · Limiti trasparenti","Concorrenza, quote, costi e agenti realmente attivi saranno distinti dai ruoli catalogati."]
              ].map(([h,p]) => <div key={h} style={{ padding: 11, borderRadius: 11, background: "#f4f9fa" }}><b style={{ fontSize: 12 }}>{h}</b><p style={{ color: "#627b84", fontSize: 11, lineHeight: 1.45, marginBottom: 0 }}>{p}</p></div>)}
            </div>
          </section>
         </>}
        <footer style={{ textAlign: "center", color: "#71858d", fontSize: 11, padding: 20 }}>PowerTron Command Center · RiverSSAI SuperAI 20.0 · Prototipo privato locale · Non esegue ancora agenti AI</footer>
      </div>
    </main>
  </>;
}
