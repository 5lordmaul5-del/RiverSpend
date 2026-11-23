import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { supabase } from "../../lib/supabase";

const STORE = "riverspend-umpsd-cases-v1";
const MODULES = [
  ["IntelDesk OSINT", "Analisi di fonti pubbliche, attribuzione, riscontri e livelli di confidenza."],
  ["Investigation Workspace", "Fascicoli, cronologie, evidenze, note e catena di custodia."],
  ["CyberShield", "Triage difensivo, phishing, incident response e piani di contenimento."],
  ["Fraud & Financial Integrity", "Segnalazioni, anomalie, indicatori di frode e prevenzione."],
  ["PrivacyVault", "Classificazione, minimizzazione e redazione dei dati sensibili."],
  ["Critical Infrastructure", "Valutazione dei rischi e continuità operativa."],
  ["Defense Research & Robotics", "Ricerca protettiva, robotica di soccorso e supporto logistico."],
  ["StrategicSim", "Scenari non operativi, gestione crisi ed esercitazioni."],
  ["Evidence Ledger", "Registro locale delle attività e tracciabilità delle evidenze."],
  ["Secure Code Review", "Revisione difensiva di codice e piani di correzione."]
];
const STATUSES = ["Aperto", "In analisi", "In revisione", "Chiuso"];

function stamp() { return new Date().toISOString(); }
function makeId() { return "UM-" + Date.now().toString(36).toUpperCase(); }

export default function UMPSDWorkspace() {
  const [access, setAccess] = useState("checking");
  const [cases, setCases] = useState([]);
  const [storageKey, setStorageKey] = useState("");
  const [analysisText, setAnalysisText] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [active, setActive] = useState("");
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("CyberShield");
  const [scope, setScope] = useState("");
  const [note, setNote] = useState("");
  const [evidence, setEvidence] = useState("");
  const [filter, setFilter] = useState("Tutti");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) { if (alive) setAccess("login"); return; }
        const r = await fetch("/api/area-51/access", { headers: { Authorization: "Bearer " + session.access_token } });
        if (!alive) return;
        if (r.status === 401 || r.status === 403) { setAccess("denied"); return; }
        if (!r.ok) { setAccess("error"); return; }
        const userStore = `${STORE}:${session.user.id}`;
        setStorageKey(userStore);
        setAccess("ready");
        try {
          const parsed = JSON.parse(localStorage.getItem(userStore) || "[]");
          if (Array.isArray(parsed)) setCases(parsed);
        } catch {}
      } catch { if (alive) setAccess("error"); }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (access === "ready" && storageKey) {
      try { localStorage.setItem(storageKey, JSON.stringify(cases)); }
      catch { setNotice("Memoria locale piena: esporta i fascicoli per conservarne una copia."); }
    }
  }, [cases, access]);

  const selected = cases.find(c => c.id === active) || null;
  const visible = useMemo(() => filter === "Tutti" ? cases : cases.filter(c => c.status === filter), [cases, filter]);

  function logEvent(item, action, detail) {
    return { at: stamp(), action, detail, actor: "Proprietario autenticato" };
  }
  function createCase(e) {
    e.preventDefault();
    if (!title.trim() || !scope.trim()) return;
    const item = {
      id: makeId(), title: title.trim(), kind, scope: scope.trim(), status: "Aperto",
      createdAt: stamp(), updatedAt: stamp(), notes: [], evidence: [],
      audit: [{ at: stamp(), action: "Fascicolo creato", detail: "Apertura e definizione ambito", actor: "Proprietario autenticato" }]
    };
    setCases(prev => [item, ...prev]);
    setActive(item.id); setTitle(""); setScope(""); setNotice("Fascicolo creato in memoria locale su questo dispositivo.");
  }
  function updateCase(patch, action, detail) {
    if (!selected) return;
    setCases(prev => prev.map(c => c.id !== selected.id ? c : {
      ...c, ...patch, updatedAt: stamp(), audit: [...(c.audit || []), logEvent(c, action, detail)]
    }));
  }
  function addNote(e) {
    e.preventDefault();
    if (!note.trim() || !selected) return;
    updateCase({ notes: [...selected.notes, { at: stamp(), text: note.trim() }] }, "Nota aggiunta", "Nota inserita nel fascicolo");
    setNote("");
  }
  function addEvidence(e) {
    e.preventDefault();
    if (!evidence.trim() || !selected) return;
    updateCase({ evidence: [...selected.evidence, { id: makeId(), at: stamp(), description: evidence.trim(), status: "Da verificare" }] }, "Evidenza registrata", "Descrizione evidenza aggiunta; nessun file caricato");
    setEvidence("");
  }
  function exportAll() {
    const blob = new Blob([JSON.stringify({ exportedAt: stamp(), product: "RiverSSAI UMPSD 20.0", cases }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "riverssai-umpsd-backup.json"; a.click();
    URL.revokeObjectURL(url);
  }

  function analyzeCase(e) {
    e.preventDefault();
    const source = analysisText.trim();
    if (!source) return;
    const lines = source.split(/(?<=[.!?])\\s+|\\n+/).map(x => x.trim()).filter(Boolean);
    const factHints = /\\b(alle\\s+ore|in\\s+data|ricevut[oa]|registrat[oa]|documentat[oa]|log|timestamp|screenshot|email|messaggio|transazione|confermato|verificato)\\b/i;
    const hypothesisHints = /\\b(probabilmente|forse|potrebbe|sospetto|presunto|sembra|ipotizzo|possibile)\\b/i;
    const facts = lines.filter(x => factHints.test(x) && !hypothesisHints.test(x));
    const hypotheses = lines.filter(x => hypothesisHints.test(x));
    const other = lines.filter(x => !facts.includes(x) && !hypotheses.includes(x));
    const checks = [
      "Confermare data, ora e fuso orario di ogni elemento.",
      "Verificare la fonte originale e conservarne una copia integra.",
      "Cercare riscontri indipendenti prima di attribuire responsabilità.",
      "Registrare gli elementi contrari e le spiegazioni alternative.",
      "Limitare i dati personali raccolti a quelli strettamente necessari."
    ];
    setAnalysisResult({ facts, hypotheses, other, checks, createdAt: stamp() });
  }
  function addAnalysisToNotes() {
    if (!selected || !analysisResult) return;
    const report = [
      "SCHEDA DI ANALISI PRELIMINARE",
      "FATTI DA VERIFICARE:", ...(analysisResult.facts.length ? analysisResult.facts : ["Nessun fatto individuato automaticamente."]),
      "IPOTESI:", ...(analysisResult.hypotheses.length ? analysisResult.hypotheses : ["Nessuna ipotesi esplicita individuata."]),
      "ALTRI ELEMENTI:", ...(analysisResult.other.length ? analysisResult.other : ["Nessun altro elemento."]),
      "VERIFICHE CONSIGLIATE:", ...analysisResult.checks
    ].join("\\n");
    updateCase({ notes: [...selected.notes, { at: stamp(), text: report }] }, "Scheda analisi aggiunta", "Analisi preliminare locale; revisione umana necessaria");
    setNotice("Scheda aggiunta alle note. Le classificazioni automatiche sono indicative e vanno verificate.");
  }

  const card = { background: "#fff", border: "1px solid #d6e8e9", borderRadius: 14, padding: 14 };
  const button = { border: 0, borderRadius: 10, padding: "10px 13px", background: "#087f89", color: "#fff", fontWeight: 700, cursor: "pointer" };
  const input = { width: "100%", boxSizing: "border-box", padding: 11, border: "1px solid #c6dadd", borderRadius: 10, fontSize: 14, color: "#173b42", background: "#fff" };

  return <>
    <Head><title>RiverSSAI UMPSD 20.0 · Security Workspace</title><meta name="robots" content="noindex,nofollow"/></Head>
    <main style={{minHeight:"100vh",background:"linear-gradient(180deg,#e9f9fa,#f7fbfc)",color:"#14363d",fontFamily:"Arial,sans-serif",padding:16}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <header style={{...card,background:"linear-gradient(120deg,#082f43,#075e68)",color:"#fff",display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:230}}><div style={{fontSize:12,letterSpacing:2,color:"#f4d477",fontWeight:800}}>RIVERSPEND · PRIVATE DIVISION</div><h1 style={{margin:"6px 0",fontSize:25}}>UMPSD 20.0</h1><div style={{fontSize:13}}>UltraMegaPowerSelDefence · Intelligence & Security Workspace</div></div>
          <a href="/river-ai" style={{color:"#ffe39a",fontWeight:700}}>← Torna a RiverSSAI</a>
          <button onClick={exportAll} style={{...button,background:"#e7c86c",color:"#18343a"}} disabled={access!=="ready"}>Esporta backup JSON</button>
        </header>

        {access === "checking" ? <p style={card}>Verifica autorizzazione proprietario…</p> :
         access === "login" ? <section style={{...card,marginTop:14}}><h2>Accesso richiesto</h2><p>Accedi prima a RiverSSAI, poi apri questo spazio privato.</p><a href="/river-ai">Apri RiverSSAI</a></section> :
         access === "denied" ? <section style={{...card,marginTop:14}}><h2>Accesso non autorizzato</h2><p>UMPSD è riservato all'account proprietario autorizzato.</p></section> :
         access === "error" ? <section style={{...card,marginTop:14}}><h2>Verifica non disponibile</h2><p>Non posso confermare i permessi. Riprova più tardi.</p></section> :
         <>
          <section style={{...card,marginTop:14,background:"#fff8e5",borderColor:"#ead79d",fontSize:13,lineHeight:1.55}}>
            <b>Stato del workspace: prototipo operativo locale.</b> Fascicoli, note, descrizioni delle evidenze e registro attività vengono salvati nel browser di questo dispositivo. Non sono ancora sincronizzati con un database cloud, non caricano file e non interrogano fonti esterne. Non inserire password, segreti, dati altamente sensibili o informazioni personali non necessarie.
          </section>
          {notice && <p role="status" style={{color:"#12634d",fontSize:13}}>{notice}</p>}
          <h2 style={{fontSize:19,margin:"22px 0 10px"}}>Divisioni UMPSD</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:10}}>
            {MODULES.map(([name,desc])=><article key={name} style={card}><b>{name}</b><p style={{fontSize:12,lineHeight:1.45,color:"#557078",marginBottom:0}}>{desc}</p></article>)}
          </div>
          <h2 style={{fontSize:19,margin:"22px 0 10px"}}>Fascicoli investigativi e incidenti</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12,alignItems:"start"}}>
            <section style={card}>
              <h3 style={{marginTop:0}}>Apri nuovo fascicolo</h3>
              <form onSubmit={createCase} style={{display:"grid",gap:9}}>
                <input aria-label="Titolo" style={input} placeholder="Titolo del caso o incidente" value={title} onChange={e=>setTitle(e.target.value)} required maxLength={100}/>
                <select style={input} value={kind} onChange={e=>setKind(e.target.value)}>{MODULES.map(([name])=><option key={name}>{name}</option>)}</select>
                <textarea style={{...input,minHeight:90}} placeholder="Scopo, autorizzazione e ambito consentito (obbligatorio)" value={scope} onChange={e=>setScope(e.target.value)} required maxLength={1200}/>
                <button style={button} type="submit">Crea fascicolo</button>
              </form>
              <p style={{fontSize:11,color:"#687f84"}}>Usa solo attività legittime e autorizzate. La creazione registra lo scopo dichiarato, non verifica autonomamente l'autorizzazione.</p>
            </section>
            <section style={card}>
              <div style={{display:"flex",justifyContent:"space-between",gap:8,alignItems:"center"}}><h3 style={{margin:0}}>Elenco fascicoli ({cases.length})</h3><select aria-label="Filtra stato" value={filter} onChange={e=>setFilter(e.target.value)} style={{...input,width:"auto"}}><option>Tutti</option>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
              <div style={{display:"grid",gap:8,marginTop:12}}>
                {visible.length===0 ? <p style={{fontSize:13,color:"#688087"}}>Nessun fascicolo presente.</p> : visible.map(c=><button key={c.id} onClick={()=>setActive(c.id)} style={{textAlign:"left",padding:11,borderRadius:10,border:active===c.id?"2px solid #07838d":"1px solid #d6e8e9",background:active===c.id?"#effafa":"#fff",color:"#173b42",cursor:"pointer"}}><b>{c.title}</b><div style={{fontSize:11,color:"#5c777d",marginTop:4}}>{c.id} · {c.kind} · {c.status}</div></button>)}
              </div>
            </section>
          </div>
          {selected && <section style={{...card,marginTop:12}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:10,flexWrap:"wrap",alignItems:"center"}}><div><div style={{fontSize:11,color:"#678087"}}>{selected.id} · {selected.kind}</div><h3 style={{margin:"4px 0"}}>{selected.title}</h3></div><select aria-label="Stato fascicolo" value={selected.status} onChange={e=>updateCase({status:e.target.value},"Stato modificato",e.target.value)} style={{...input,width:"auto"}}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
            <p style={{fontSize:13,lineHeight:1.5}}><b>Ambito dichiarato:</b> {selected.scope}</p>
            <section style={{...card,background:"#f3fbfc",margin:"12px 0"}}>
              <h4 style={{margin:"0 0 8px"}}>Analisi preliminare locale</h4>
              <p style={{fontSize:12,color:"#557078",lineHeight:1.5}}>Incolla una descrizione non sensibile. Il sistema individua parole-indizio per organizzare il testo in categorie: non verifica la veridicità, non identifica persone e non formula attribuzioni.</p>
              <form onSubmit={analyzeCase} style={{display:"grid",gap:8}}>
                <textarea value={analysisText} onChange={e=>{setAnalysisText(e.target.value);setAnalysisResult(null);}} maxLength={6000} style={{...input,minHeight:110}} placeholder="Descrivi l'evento distinguendo ciò che hai osservato da ciò che ritieni possa essere accaduto…"/>
                <button style={button} type="submit" disabled={!analysisText.trim()}>Organizza il testo</button>
              </form>
              {analysisResult && <div style={{marginTop:12,display:"grid",gap:8}}>
                {[["Fatti/elementi documentali da verificare",analysisResult.facts],["Ipotesi esplicite",analysisResult.hypotheses],["Altri elementi",analysisResult.other]].map(([label,items])=><div key={label} style={{background:"#fff",border:"1px solid #d6e8e9",borderRadius:10,padding:10}}><b style={{fontSize:13}}>{label}</b>{items.length ? <ul style={{fontSize:12,lineHeight:1.5,paddingLeft:18}}>{items.map((x,i)=><li key={i}>{x}</li>)}</ul> : <p style={{fontSize:12,color:"#71878b"}}>Nessun elemento individuato automaticamente.</p>}</div>)}
                <div style={{background:"#fff",border:"1px solid #d6e8e9",borderRadius:10,padding:10}}><b style={{fontSize:13}}>Verifiche consigliate</b><ul style={{fontSize:12,lineHeight:1.5,paddingLeft:18}}>{analysisResult.checks.map((x,i)=><li key={i}>{x}</li>)}</ul></div>
                <button type="button" style={button} onClick={addAnalysisToNotes}>Aggiungi scheda alle note del fascicolo</button>
                <small style={{color:"#71878b"}}>Risultato euristico, non prova e non parere investigativo o legale.</small>
              </div>}
            </section>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:12}}>
              <form onSubmit={addNote} style={{display:"grid",gap:8}}><b>Note di analisi</b><textarea style={{...input,minHeight:75}} value={note} onChange={e=>setNote(e.target.value)} placeholder="Fatti verificati, ipotesi, dubbi…"/><button style={button}>Aggiungi nota</button></form>
              <form onSubmit={addEvidence} style={{display:"grid",gap:8}}><b>Registro evidenze</b><textarea style={{...input,minHeight:75}} value={evidence} onChange={e=>setEvidence(e.target.value)} placeholder="Descrizione e provenienza (non caricare dati riservati)…"/><button style={button}>Registra evidenza</button></form>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12,marginTop:14}}>
              <div><b>Note ({selected.notes.length})</b>{selected.notes.map((n,i)=><p key={i} style={{fontSize:12,borderBottom:"1px solid #e6eeee",paddingBottom:7}}>{new Date(n.at).toLocaleString("it-IT")}<br/>{n.text}</p>)}</div>
              <div><b>Evidenze descritte ({selected.evidence.length})</b>{selected.evidence.map(ev=><p key={ev.id} style={{fontSize:12,borderBottom:"1px solid #e6eeee",paddingBottom:7}}>{ev.id} · {ev.status}<br/>{ev.description}</p>)}</div>
              <div><b>Registro attività ({selected.audit.length})</b>{selected.audit.slice().reverse().map((a,i)=><p key={i} style={{fontSize:12,borderBottom:"1px solid #e6eeee",paddingBottom:7}}>{new Date(a.at).toLocaleString("it-IT")}<br/><b>{a.action}</b> · {a.detail}</p>)}</div>
            </div>
          </section>}
         </>}
        <footer style={{textAlign:"center",fontSize:11,color:"#71878b",padding:"20px 8px"}}>RiverSSAI UMPSD 20.0 · Accesso riservato · Prototipo locale, non certificato</footer>
      </div>
    </main>
  </>;
}
