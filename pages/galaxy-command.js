import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const panel = { background: "#10283e", border: "1px solid rgba(139,190,218,.2)", borderRadius: 14, padding: 18 };
const metric = { ...panel, minHeight: 112 };
const money = (minor, currency) => new Intl.NumberFormat("it-IT", { style: "currency", currency: currency || "EUR" }).format((Number(minor) || 0) / 100);

export default function GalaxyCommand() {
  const [status, setStatus] = useState("checking");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  async function load(session) {
    if (!session?.access_token) { setStatus("login"); return; }
    setRefreshing(true);
    try {
      const response = await fetch("/api/river-space-galaxy/admin", { headers: { Authorization: "Bearer " + session.access_token } });
      const body = await response.json();
      if (response.status === 403) { setStatus("denied"); setError(body.error || "Accesso negato."); }
      else if (!response.ok) { setStatus("setup"); setError(body.error || "Servizio non disponibile."); }
      else { setData(body); setStatus("ready"); setError(""); }
    } catch { setStatus("setup"); setError("Connessione al backend non disponibile."); }
    finally { setRefreshing(false); }
  }

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data: sessionData }) => { if (alive) load(sessionData?.session); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { if (alive) load(session); });
    return () => { alive = false; listener?.subscription?.unsubscribe(); };
  }, []);

  return <>
    <Head><title>Galaxy Command · RiverSpend</title><meta name="robots" content="noindex,nofollow"/><meta name="theme-color" content="#071629"/></Head>
    <main style={{minHeight:"100vh",background:"#071629",color:"#edf6fb",fontFamily:"Inter,system-ui,sans-serif",padding:"22px clamp(14px,4vw,48px) 50px"}}>
      <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap",maxWidth:1200,margin:"0 auto 28px"}}>
        <Link href="/river-space-galaxy-games" style={{color:"#f0c76a",textDecoration:"none",fontWeight:800}}>← Universo Galaxy</Link>
        <span style={{fontSize:10,letterSpacing:2,color:"#a8c0d1"}}>RIVERSPEND · OWNER COMMAND</span>
      </header>
      <div style={{maxWidth:1200,margin:"auto"}}>
        <div style={{border:"3px solid #111",outline:"3px solid #e5bd50",padding:"22px",background:"linear-gradient(120deg,#182f40,#091725)",marginBottom:22}}>
          <div style={{color:"#f0c76a",fontSize:10,letterSpacing:3,fontWeight:900}}>CEO / OWNER ONLY</div>
          <h1 style={{fontSize:"clamp(30px,5vw,48px)",margin:"9px 0"}}>GALAXY COMMAND CENTER</h1>
          <p style={{color:"#a9c0d0",lineHeight:1.6,margin:0}}>Controllo amministrativo dell'universo: giocatori, acquisti, pagamenti, mondi e creature. Le metriche arrivano dal database reale quando lo schema e gli eventi di gioco saranno collegati.</p>
        </div>
        {status === "checking" && <section style={panel}>Verifica autorizzazione proprietario…</section>}
        {status === "login" && <section style={panel}><h2>Accesso RiverSpend richiesto</h2><p>Accedi con il tuo account RiverSpend autorizzato come proprietario.</p><Link href="/area-51" style={{color:"#f0c76a"}}>Apri accesso Area 51 →</Link></section>}
        {status === "denied" && <section style={panel}><h2>Accesso non autorizzato</h2><p>{error}</p></section>}
        {status === "setup" && <section style={{...panel,borderColor:"#8d6530"}}><h2>Collegamento dati da completare</h2><p>{error}</p><p style={{color:"#f0d38a"}}>Migrazione richiesta: supabase/migrations/20261122120000_riverspace_galaxy_core.sql</p><p>Finché non viene applicata, non mostriamo numeri inventati.</p></section>}
        {status === "ready" && data && <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:15}}><h2 style={{margin:0}}>Quadro generale</h2><button onClick={()=>supabase.auth.getSession().then(({data:s})=>load(s.session))} disabled={refreshing} style={{background:"#e8c46d",color:"#10243a",border:0,borderRadius:8,padding:"10px 14px",fontWeight:900}}>{refreshing?"Aggiorno…":"↻ Aggiorna dati"}</button></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",gap:12,marginBottom:24}}>
            {[["Giocatori registrati",data.metrics.players],["Giocatori attivi",data.metrics.activePlayers],["Acquisti totali",data.metrics.purchases],["Pagamenti confermati",data.metrics.paidPurchases],["Ordini in attesa",data.metrics.pendingPurchases]].map(([label,value])=><section key={label} style={metric}><small style={{color:"#9db7c8"}}>{label}</small><div style={{fontSize:34,fontWeight:900,color:"#f0ce7d",marginTop:10}}>{value}</div></section>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:14,marginBottom:24}}>
            <section style={panel}><h3>Incassi confermati</h3>{Object.keys(data.metrics.paidTotalsMinor).length ? Object.entries(data.metrics.paidTotalsMinor).map(([currency,total])=><p key={currency} style={{fontSize:24,color:"#a5e4c1",fontWeight:900}}>{money(total,currency)}</p>) : <p style={{color:"#9db7c8"}}>Nessun pagamento registrato.</p>}<small style={{color:"#829caf"}}>Solo transazioni reali con stato paid; crediti virtuali esclusi.</small></section>
            <section style={panel}><h3>Stato integrazioni</h3><p>RiverSSAI 10.0: <b style={{color:"#f0ce7d"}}>{data.integration.riverSSAI}</b></p><p>Pagamenti: <b>{data.integration.payments}</b></p><p>Eventi giocatori: <b>{data.integration.telemetry}</b></p><small style={{color:"#829caf"}}>Indicatori espliciti: non dichiarano attive integrazioni non ancora collaudate.</small></section>
          </div>
          <section style={{...panel,marginBottom:18}}><h3>Mondi registrati</h3><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:10}}>{data.worlds.map(world=><div key={world.id} style={{padding:12,borderRadius:9,background:"#0a1d2d"}}><b>{world.name}</b><div style={{color:"#9db7c8",fontSize:11,marginTop:5}}>{world.biome} · {world.access_state}</div></div>)}</div></section>
          <section style={{...panel,marginBottom:18}}><h3>Creature e fazioni ({data.creatures.length})</h3><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:8}}>{data.creatures.map(creature=><div key={creature.id} style={{background:"#0a1d2d",padding:10,borderRadius:8}}><b>{creature.name}</b><div style={{fontSize:10,color:"#9db7c8"}}>{creature.faction} · {creature.rarity}</div></div>)}</div></section>
          <section style={panel}><h3>Acquisti recenti</h3>{data.recentPurchases.length ? <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr>{["Data","ID giocatore","Articolo","Q.tà","Totale","Pagamento","Consegna"].map(x=><th key={x} style={{textAlign:"left",padding:9,borderBottom:"1px solid #34536a"}}>{x}</th>)}</tr></thead><tbody>{data.recentPurchases.map(p=><tr key={p.id}>{[new Date(p.created_at).toLocaleString("it-IT"),p.player_id.slice(0,8),p.catalog_item_id,p.quantity,p.total_minor===null?"—":money(p.total_minor,p.currency),p.payment_status,p.fulfillment_status].map((x,i)=><td key={i} style={{padding:9,borderBottom:"1px solid #203b50",whiteSpace:"nowrap"}}>{x}</td>)}</tr>)}</tbody></table></div> : <p style={{color:"#9db7c8"}}>Nessun acquisto registrato.</p>}</section>
        </>}
        <footer style={{marginTop:28,color:"#718da2",fontSize:10}}>RIVERSPACEGALAXYGAMES · OWNER CONTROL · DATI NON DISPONIBILI FINCHÉ IL BACKEND NON È COLLEGATO</footer>
      </div>
    </main>
  </>;
}
