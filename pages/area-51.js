import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { supabase } from "../lib/supabase";

const divisions = [
  { code: "BLACK PROJECTS", icon: "◈", title: "RS Black Projects", desc: "Progetti sperimentali, requisiti, fattibilità e gestione riservata.", focus: "Valutare idee riservate e trasformarle in progetti con obiettivi, risorse, rischi e tappe verificabili.", steps: ["Scheda progetto e obiettivo", "Studio di fattibilità e risorse", "Registro rischi e decisioni"] },
  { code: "ADVANCED ROBOTICS", icon: "🤖", title: "RS Advanced Robotics", desc: "Droidi, robotica, esoscheletri, sensori e sistemi di controllo.", focus: "Progettare sistemi robotici sicuri, dalla meccanica ai sensori, con test e limiti operativi documentati.", steps: ["Concept del robot o droide", "Componenti, sensori e controllo", "Piano di test e sicurezza"] },
  { code: "AEROSPACE", icon: "✈", title: "RS Aerospace", desc: "Aerodinamica, propulsione, volo sperimentale e simulazioni.", focus: "Studiare sistemi aerospaziali attraverso ricerca documentale, modelli teorici e simulazioni non operative.", steps: ["Domanda scientifica e requisiti", "Modello teorico e simulazione", "Analisi dei risultati e vincoli"] },
  { code: "QUANTUM LAB", icon: "⚛", title: "RS Quantum Lab", desc: "Ricerca scientifica, matematica, fisica e calcolo avanzato.", focus: "Esplorare fisica, matematica, algoritmi e informatica quantistica con fonti e risultati riproducibili.", steps: ["Quesito e basi teoriche", "Modello matematico o algoritmo", "Esperimento simulato e verifica"] },
  { code: "INTELLIGENCE", icon: "⌁", title: "RS Intelligence", desc: "Analisi strategiche, scenari, dati e valutazione dei rischi.", focus: "Organizzare informazioni lecite e fonti verificabili per produrre analisi, scenari e valutazioni dei rischi.", steps: ["Raccolta di fonti pubbliche e autorizzate", "Verifica, confronto e qualità dei dati", "Rapporto con scenari e incertezze"] },
  { code: "PROTOTYPE", icon: "⚙", title: "RS Prototype", desc: "Progettazione, documentazione, test e verifica dei prototipi.", focus: "Portare un progetto dalla specifica al prototipo documentato, con prove, revisioni e criteri di accettazione.", steps: ["Disegno e specifiche", "Piano di realizzazione e test", "Risultati, revisioni e versione"] }
];

export default function Area51() {
  const [status, setStatus] = useState("checking");
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function verify(session) {
    if (!session?.access_token) { setStatus("login"); return; }
    setStatus("checking");
    try {
      const response = await fetch("/api/area-51/access", { headers: { Authorization: "Bearer " + session.access_token } });
      const data = await response.json();
      if (response.ok && data.allowed) setStatus("allowed");
      else if (response.status === 403) setStatus("denied");
      else { setStatus("login"); setError(data.error || "Verifica non riuscita. Accedi di nuovo."); }
    } catch {
      setStatus("login");
      setError("Connessione non disponibile. Riprova.");
    }
  }

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => { if (alive) verify(data?.session); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { if (alive) verify(session); });
    return () => { alive = false; listener?.subscription?.unsubscribe(); };
  }, []);

  async function sendLogin(event) {
    event.preventDefault();
    if (!email.trim() || busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin + "/area-51" }
      });
      if (authError) throw authError;
      setNotice("Link di accesso inviato. Aprilo su questo dispositivo per continuare.");
    } catch (err) { setError(err.message || "Invio del link non riuscito."); }
    finally { setBusy(false); }
  }

  return <>
    <Head><title>RiverSpend Area 51 · Accesso riservato</title><meta name="robots" content="noindex,nofollow"/><meta name="theme-color" content="#06111e"/></Head>
    <main style={{minHeight:"100vh",background:"radial-gradient(ellipse at 50% 0%,#123b55 0%,#071522 48%,#03080e 100%)",color:"#e8f4fa",fontFamily:"Arial,sans-serif",padding:"24px 16px 50px",boxSizing:"border-box",border:"16px solid transparent",borderImage:"repeating-linear-gradient(135deg,#ffd400 0 18px,#111 18px 36px) 16"}}>
      <div style={{maxWidth:1050,margin:"0 auto"}}>
        <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:34}}>
          <Link href="/river-ai" style={{color:"#8de7ee",textDecoration:"none",fontWeight:700}}>← RiverSSAI NUPM</Link>
          <span style={{fontSize:11,letterSpacing:3,color:"#d8b65d"}}>RIVERSPEND · RESTRICTED ACCESS</span>
        </nav>
        <div role="img" aria-label="Area 51 Warning Restricted Area, No Trespassing" style={{maxWidth:900,margin:"0 auto 24px",border:"5px solid #111",boxShadow:"0 0 24px rgba(255,210,0,.22)"}}>
          <img src="/area-51-warning.svg" alt="AREA 51 — WARNING — RESTRICTED AREA — NO TRESPASSING" style={{display:"block",width:"100%",height:"auto"}} />
        </div>
        <header style={{textAlign:"center",padding:"30px 12px 36px"}}>
          <div style={{fontSize:46,marginBottom:10}}>◈</div>
          <div style={{fontSize:12,letterSpacing:5,color:"#d9b65c",fontWeight:800}}>TOP SECRET · OWNER ACCESS</div>
          <h1 style={{fontSize:"clamp(34px,7vw,62px)",letterSpacing:2,margin:"14px 0 8px",fontWeight:900}}>AREA 51</h1>
          <p style={{fontSize:17,color:"#9fdce5",margin:0}}>RIVERSPEND RESEARCH & DEVELOPMENT</p>
          <p style={{maxWidth:680,margin:"18px auto 0",lineHeight:1.7,color:"#b5c7d2"}}>Laboratorio privato per ricerca, progettazione, simulazione e sviluppo di prototipi. Le divisioni sono predisposte come struttura del progetto; gli strumenti operativi verranno attivati e verificati progressivamente.</p>
        </header>

        {status === "checking" && <section style={panel}>Verifica in corso dell'autorizzazione del proprietario…</section>}
        {status === "login" && <section style={{...panel,maxWidth:520,margin:"0 auto"}}>
          <h2 style={{marginTop:0}}>Identificazione proprietario</h2>
          <p style={{color:"#b5c7d2",lineHeight:1.6}}>Accedi con il tuo account RiverSpend. L'autorizzazione viene verificata dal server: conoscere l'indirizzo email non è sufficiente per entrare.</p>
          <form onSubmit={sendLogin} style={{display:"grid",gap:12}}>
            <input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email del tuo account RiverSpend" style={field}/>
            <button disabled={busy} style={button}>{busy?"Invio…":"Invia link di accesso sicuro"}</button>
          </form>
          {notice && <p role="status" style={{color:"#9ee6bc"}}>{notice}</p>}
          {error && <p role="alert" style={{color:"#ffb3a7"}}>{error}</p>}
        </section>}
        {status === "denied" && <section style={{...panel,maxWidth:520,margin:"0 auto",textAlign:"center"}}>
          <h2>Accesso non autorizzato</h2><p style={{color:"#b5c7d2"}}>Area 51 è riservata esclusivamente all'account proprietario RiverSpend.</p>
        </section>}
        {status === "allowed" && <>
          <div style={{display:"flex",justifyContent:"center",marginBottom:22}}><span style={{border:"1px solid #477d6c",background:"#102d2a",color:"#9ee6bc",borderRadius:30,padding:"8px 16px",fontSize:12,letterSpacing:1}}>✓ PROPRIETARIO AUTORIZZATO</span></div>
          <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:14}}>
            {divisions.map(item=><button key={item.code} type="button" onClick={()=>setSelectedDivision(selectedDivision===item.code?null:item.code)} aria-expanded={selectedDivision===item.code} style={{textAlign:"left",background:selectedDivision===item.code?"linear-gradient(145deg,#183b50,#102638)":"linear-gradient(145deg,#102638,#0a1723)",border:selectedDivision===item.code?"1px solid #d9b65c":"1px solid #24465a",borderRadius:18,padding:22,minHeight:190,cursor:"pointer",color:"inherit"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:28,color:"#e4c36d"}}>{item.icon}</span><span style={{fontSize:9,letterSpacing:1.5,color:"#80a6b8"}}>MODULO DI RICERCA</span></div>
              <h2 style={{fontSize:19,margin:"14px 0 8px",color:"#f1d58a"}}>{item.title}</h2>
              <p style={{fontSize:14,lineHeight:1.6,color:"#b5c7d2",margin:"0 0 14px"}}>{item.desc}</p>
              <span style={{fontSize:12,fontWeight:800,color:"#8de7ee"}}>{selectedDivision===item.code?"CHIUDI SCHEDA ↑":"APRI DIVISIONE →"}</span>
            </button>)}
          </section>
          {selectedDivision && divisions.filter(item=>item.code===selectedDivision).map(item=><section key={item.code} style={{...panel,marginTop:18,borderColor:"#8b743d"}}>
            <div style={{fontSize:11,letterSpacing:2,color:"#d9b65c",fontWeight:800}}>DOSSIER DIVISIONE · {item.code}</div>
            <h2 style={{fontSize:25,color:"#f1d58a",margin:"10px 0"}}>{item.icon} {item.title}</h2>
            <p style={{lineHeight:1.7,color:"#d1e0e8"}}>{item.focus}</p>
            <h3 style={{fontSize:14,color:"#8de7ee",letterSpacing:1}}>PRIME AREE DI LAVORO</h3>
            <ol style={{paddingLeft:22,lineHeight:2,color:"#c4d3dc"}}>{item.steps.map(step=><li key={step}>{step}</li>)}</ol>
            <p style={{fontSize:12,color:"#8ba5b4",marginBottom:0}}>Stato: struttura progettuale. Gli strumenti di ricerca, archiviazione e simulazione saranno attivati in fasi successive.</p>
          </section>)}
          <p style={{textAlign:"center",fontSize:12,color:"#7995a6",marginTop:26}}>Le schede descrivono l'ambito e le prime attività. Non sono ancora strumenti operativi né archiviano dossier.</p>
        </>}
        <footer style={{textAlign:"center",marginTop:42,fontSize:11,color:"#678296"}}>RIVERSPEND AREA 51 · ACCESSO RISERVATO · {new Date().getFullYear()}</footer>
      </div>
    </main>
  </>;
}

const panel = {background:"rgba(12,31,46,.92)",border:"1px solid #28485a",borderRadius:18,padding:24,boxSizing:"border-box"};
const field = {width:"100%",boxSizing:"border-box",padding:13,borderRadius:11,border:"1px solid #456477",background:"#071522",color:"#fff",fontSize:16};
const button = {border:0,borderRadius:11,padding:14,background:"linear-gradient(90deg,#c69a3c,#f1d58a)",color:"#14202a",fontWeight:900,fontSize:14,cursor:"pointer"};
