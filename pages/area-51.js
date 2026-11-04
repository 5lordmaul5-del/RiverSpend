import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { supabase } from "../lib/supabase";

const divisions = [
  { code: "BLACK PROJECTS", icon: "◈", title: "RS Black Projects", desc: "Progetti sperimentali, requisiti, fattibilità e gestione riservata." },
  { code: "ADVANCED ROBOTICS", icon: "🤖", title: "RS Advanced Robotics", desc: "Droidi, robotica, esoscheletri, sensori e sistemi di controllo." },
  { code: "AEROSPACE", icon: "✈", title: "RS Aerospace", desc: "Aerodinamica, propulsione, volo sperimentale e simulazioni." },
  { code: "QUANTUM LAB", icon: "⚛", title: "RS Quantum Lab", desc: "Ricerca scientifica, matematica, fisica e calcolo avanzato." },
  { code: "INTELLIGENCE", icon: "⌁", title: "RS Intelligence", desc: "Analisi strategiche, scenari, dati e valutazione dei rischi." },
  { code: "PROTOTYPE", icon: "⚙", title: "RS Prototype", desc: "Progettazione, documentazione, test e verifica dei prototipi." }
];

export default function Area51() {
  const [status, setStatus] = useState("checking");
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
    <main style={{minHeight:"100vh",background:"radial-gradient(ellipse at 50% 0%,#123b55 0%,#071522 48%,#03080e 100%)",color:"#e8f4fa",fontFamily:"Arial,sans-serif",padding:"24px 16px 50px"}}>
      <div style={{maxWidth:1050,margin:"0 auto"}}>
        <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:34}}>
          <Link href="/river-ai" style={{color:"#8de7ee",textDecoration:"none",fontWeight:700}}>← RiverSSAI NUPM</Link>
          <span style={{fontSize:11,letterSpacing:3,color:"#d8b65d"}}>RIVERSPEND · RESTRICTED ACCESS</span>
        </nav>
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
            {divisions.map(item=><article key={item.code} style={{background:"linear-gradient(145deg,#102638,#0a1723)",border:"1px solid #24465a",borderRadius:18,padding:22,minHeight:170}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:28,color:"#e4c36d"}}>{item.icon}</span><span style={{fontSize:9,letterSpacing:1.5,color:"#80a6b8"}}>IN PREPARAZIONE</span></div>
              <h2 style={{fontSize:19,margin:"14px 0 8px",color:"#f1d58a"}}>{item.title}</h2>
              <p style={{fontSize:14,lineHeight:1.6,color:"#b5c7d2",margin:0}}>{item.desc}</p>
            </article>)}
          </section>
          <p style={{textAlign:"center",fontSize:12,color:"#7995a6",marginTop:26}}>Area privata in fase iniziale. Nessuna divisione dichiara strumenti o laboratori già operativi.</p>
        </>}
        <footer style={{textAlign:"center",marginTop:42,fontSize:11,color:"#678296"}}>RIVERSPEND AREA 51 · ACCESSO RISERVATO · {new Date().getFullYear()}</footer>
      </div>
    </main>
  </>;
}

const panel = {background:"rgba(12,31,46,.92)",border:"1px solid #28485a",borderRadius:18,padding:24,boxSizing:"border-box"};
const field = {width:"100%",boxSizing:"border-box",padding:13,borderRadius:11,border:"1px solid #456477",background:"#071522",color:"#fff",fontSize:16};
const button = {border:0,borderRadius:11,padding:14,background:"linear-gradient(90deg,#c69a3c,#f1d58a)",color:"#14202a",fontWeight:900,fontSize:14,cursor:"pointer"};
