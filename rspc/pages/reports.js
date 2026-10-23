'use client';

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const DAY = 24 * 60 * 60 * 1000;
const money = value => "€ " + Number(value || 0).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtTime = value => new Date(value).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export default function Reports() {
  const [session, setSession] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [siteEvents, setSiteEvents] = useState([]);
  const [mediaEvents, setMediaEvents] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!session || !authorized) return;
    setLoading(true);
    setError("");
    const since = new Date(Date.now() - 7 * DAY).toISOString();
    const [site, media, orderResult] = await Promise.all([
      supabase.from("rs_site_analytics_events").select("id,session_id,event_type,page_path,duration_seconds,device_type,created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(10000),
      supabase.from("rs_media_analytics_events").select("id,module,event_type,content_id,session_id,duration_seconds,created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(10000),
      supabase.from("orders").select("id,total,platform_commission_total,payment_status,created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(3000)
    ]);
    const errors = [site.error, media.error, orderResult.error].filter(Boolean).map(e => e.message);
    setError(errors.join(" · "));
    setSiteEvents(site.data || []);
    setMediaEvents(media.data || []);
    setOrders(orderResult.data || []);
    setUpdatedAt(new Date());
    setLoading(false);
  }, [session, authorized]);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session || null);
      if (data.session?.user?.id) {
        supabase.from("rs_admin_roles").select("role").eq("user_id", data.session.user.id).maybeSingle()
          .then(({ data: roleData }) => { if (active) setAuthorized(roleData?.role === "admin"); });
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null);
      if (!nextSession) setAuthorized(false);
      else supabase.from("rs_admin_roles").select("role").eq("user_id", nextSession.user.id).maybeSingle()
        .then(({ data }) => setAuthorized(data?.role === "admin"));
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => { if (session && authorized) load(); }, [session, authorized, load]);
  useEffect(() => {
    if (!session || !authorized) return;
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, [session, authorized, load]);

  const now = Date.now();
  const dayAgo = now - DAY;
  const site24 = siteEvents.filter(e => new Date(e.created_at).getTime() >= dayAgo);
  const media24 = mediaEvents.filter(e => new Date(e.created_at).getTime() >= dayAgo);
  const paid = orders.filter(o => o.payment_status === "paid");
  const paid24 = paid.filter(o => new Date(o.created_at).getTime() >= dayAgo);
  const activeSessions = new Set(site24.filter(e => new Date(e.created_at).getTime() >= now - 5 * 60 * 1000).map(e => e.session_id)).size;
  const uniqueVisitors24 = new Set(site24.filter(e => e.event_type === "page_view").map(e => e.session_id)).size;
  const dwellRows = site24.filter(e => ["page_heartbeat", "page_exit", "visibility_hidden"].includes(e.event_type));
  const dwellBySession = new Map();
  dwellRows.forEach(e => {
    const key = e.session_id + "|" + e.page_path;
    dwellBySession.set(key, (dwellBySession.get(key) || 0) + Number(e.duration_seconds || 0));
  });
  const dwellValues = [...dwellBySession.values()].filter(v => v > 0 && v <= 86400);
  const avgDwell = dwellValues.length ? Math.round(dwellValues.reduce((a, b) => a + b, 0) / dwellValues.length) : 0;
  const hourly = Array.from({ length: 168 }, (_, i) => {
    const start = new Date(now - (167 - i) * 60 * 60 * 1000);
    start.setMinutes(0, 0, 0);
    const key = start.toISOString().slice(0, 13);
    const count = siteEvents.filter(e => e.event_type === "page_view" && String(e.created_at).slice(0, 13) === key).length;
    return { key, label: start.toLocaleDateString("it-IT", { weekday: "short", day: "2-digit" }) + " " + String(start.getHours()).padStart(2, "0") + ":00", count, hour: start.getHours() };
  });
  const maxHourly = Math.max(1, ...hourly.map(x => x.count));
  const peak = hourly.reduce((best, row) => row.count > best.count ? row : best, { count: 0, label: "Nessun dato" });
  const watchRows = media24.filter(e => e.event_type === "play_heartbeat");
  const watchSeconds = watchRows.reduce((sum, e) => sum + Number(e.duration_seconds || 0), 0);
  const mediaCompletions = media24.filter(e => e.event_type === "play_complete").length;
  const mediaStarts = media24.filter(e => e.event_type === "play_start").length;
  const deviceCounts = site24.filter(e => e.event_type === "page_view").reduce((acc, e) => { acc[e.device_type || "unknown"] = (acc[e.device_type || "unknown"] || 0) + 1; return acc; }, {});
  const topPages = Object.entries(site24.filter(e => e.event_type === "page_view").reduce((acc, e) => { acc[e.page_path] = (acc[e.page_path] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const daily = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now - (6 - i) * DAY);
    const key = date.toISOString().slice(0, 10);
    const rows = paid.filter(o => String(o.created_at).slice(0, 10) === key);
    return { key, label: date.toLocaleDateString("it-IT", { weekday: "short" }), amount: rows.reduce((s, o) => s + Number(o.total || 0), 0) };
  });
  const maxDaily = Math.max(1, ...daily.map(d => d.amount));

  if (!session) return <main style={page}><h1>RiverSpend · Report</h1><p>Accedi a RSPC per visualizzare i report CEO.</p><a href="/">Torna a RSPC</a></main>;
  if (!authorized) return <main style={page}><h1>Report riservati al CEO</h1><p>Verifica dei permessi in corso o accesso non autorizzato.</p><a href="/">Torna a RSPC</a></main>;

  return <main style={page}>
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <div><div style={{ color: "#168b87", fontWeight: 800 }}>RiverSpend · RSPC</div><h1 style={{ margin: "6px 0" }}>📊 Report e pubblico</h1><p style={{ margin: 0 }}>Statistiche pseudonime, aggiornate ogni 30 secondi mentre la pagina è aperta.</p></div>
      <div><button style={button} onClick={load} disabled={loading}>{loading ? "Aggiornamento…" : "↻ Aggiorna"}</button> <a href="/" style={button}>RSPC</a></div>
    </header>
    <p style={{ color: "#587174", fontSize: 12 }}>Ultimo aggiornamento: {updatedAt ? updatedAt.toLocaleTimeString("it-IT") : "in caricamento"}</p>
    {error && <div style={{ ...card, borderColor: "#d99", color: "#8a2525" }}>Attenzione: {error}. I report possono essere parziali finché la lettura della tabella indicata non è disponibile.</div>}
    <h2>Pubblico del sito · ultime 24 ore</h2>
    <section style={grid}>
      <Metric title="Sessioni con visite" value={uniqueVisitors24} note="ID di sessione pseudonimi, non persone certe"/>
      <Metric title="Sessioni attive negli ultimi 5 min" value={activeSessions}/>
      <Metric title="Permanenza media per pagina" value={avgDwell ? duration(avgDwell) : "—"} note={dwellValues.length + " sessioni/pagina con tempo registrato"}/>
      <Metric title="Visualizzazioni pagina" value={site24.filter(e => e.event_type === "page_view").length}/>
    </section>
    <section style={card}>
      <h2>Picchi di pubblico · ultime 24 ore</h2>
      <p>Il massimo è calcolato sulle visualizzazioni pagina registrate per ora. L'assenza di dati non significa traffico zero se il consenso statistiche non è stato dato.</p>
      <div style={chartRow}>{hourly.slice(-24).map(h => <div key={h.key} title={h.label + ": " + h.count + " visualizzazioni"} style={barCol}><small>{h.count || ""}</small><div style={{ ...bar, height: Math.max(3, h.count / Math.max(1, ...hourly.slice(-24).map(x => x.count)) * 125) }}/><small>{String(h.hour).padStart(2, "0")}</small></div>)}</div>
      <p><b>Picco più alto nel periodo di 7 giorni:</b> {peak.count ? peak.label + " · " + peak.count + " visualizzazioni" : "nessun dato ancora registrato"}.</p>
    </section>
    <section style={grid}>
      <div style={card}><h2>📄 Pagine più visitate</h2>{topPages.length ? topPages.map(([path, count]) => <div style={row} key={path}><span>{path}</span><b>{count}</b></div>) : <p>Nessuna visita registrata con consenso.</p>}</div>
      <div style={card}><h2>📱 Dispositivi</h2>{Object.entries(deviceCounts).length ? Object.entries(deviceCounts).map(([device, count]) => <div style={row} key={device}><span>{({ mobile: "Telefono", tablet: "Tablet", desktop: "Computer", unknown: "Sconosciuto" })[device] || device}</span><b>{count}</b></div>) : <p>Nessun dato disponibile.</p>}</div>
    </section>
    <h2>Player · ultime 24 ore</h2>
    <section style={grid}>
      <Metric title="Avvii video/audio" value={mediaStarts}/>
      <Metric title="Completamenti registrati" value={mediaCompletions}/>
      <Metric title="Tempo riprodotto registrato" value={duration(watchSeconds)} note="somma dei segmenti heartbeat"/>
      <Metric title="Eventi player ricevuti" value={media24.length}/>
    </section>
    <section style={card}><h2>Player per servizio</h2>{["stream", "broadcast", "radio"].map(module => {
      const rows = media24.filter(e => e.module === module);
      const starts = rows.filter(e => e.event_type === "play_start").length;
      const seconds = rows.filter(e => e.event_type === "play_heartbeat").reduce((sum, e) => sum + Number(e.duration_seconds || 0), 0);
      const completes = rows.filter(e => e.event_type === "play_complete").length;
      return <div key={module} style={row}><span><b>{{ stream: "RSStream", broadcast: "RSBroadcast", radio: "RSRadio" }[module]}</b><small style={{ display: "block", color: "#617b80" }}>{starts} avvii · {completes} completamenti</small></span><b>{duration(seconds)}</b></div>;
    })}<p style={{ fontSize: 12 }}>I player HTML video/audio sono rilevati automaticamente. I player esterni in iframe o app proprietarie richiedono un'integrazione specifica.</p></section>
    <h2>Andamento economico · ultimi 7 giorni</h2>
    <section style={card}><div style={chartRow}>{daily.map(d => <div key={d.key} title={d.key + ": " + money(d.amount)} style={barCol}><small>{Math.round(d.amount)}€</small><div style={{ ...bar, height: Math.max(3, d.amount / maxDaily * 125) }}/><small>{d.label}</small></div>)}</div><p>Ordini con stato pagamento confermato come pagato. Questo valore non è un saldo bancario né un utile netto.</p></section>
    <section style={card}><h2>Attendibilità e limiti</h2><ul><li>Le statistiche vengono raccolte solo dopo il consenso alla categoria “Statistiche” nelle preferenze cookie.</li><li>Le sessioni sono identificatori casuali temporanei, non un conteggio certo di persone uniche.</li><li>La permanenza è stimata usando segmenti attivi; schede lasciate aperte in background non vengono conteggiate come tempo attivo.</li><li>I picchi mostrano soltanto gli eventi ricevuti e conservati negli ultimi 7 giorni caricati.</li><li>Le statistiche non sono retroattive: iniziano quando il tracciamento è distribuito e il visitatore ha consentito le statistiche.</li></ul></section>
  </main>;
}

function duration(seconds) {
  const s = Math.max(0, Math.round(Number(seconds) || 0));
  if (s < 60) return s + " s";
  const m = Math.floor(s / 60), rem = s % 60;
  if (m < 60) return m + " min " + rem + " s";
  return Math.floor(m / 60) + " h " + (m % 60) + " min";
}
function Metric({ title, value, note }) { return <article style={card}><small style={{ color: "#59747a" }}>{title}</small><h2 style={{ fontSize: 28, margin: "10px 0", color: "#087f9e" }}>{value}</h2>{note && <small style={{ color: "#7b9094" }}>{note}</small>}</article>; }
const page = { maxWidth: 1150, margin: "0 auto", padding: 20, fontFamily: "Arial,sans-serif", color: "#183c40" };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, margin: "14px 0" };
const card = { background: "#fff", border: "1px solid #dcecef", borderRadius: 14, padding: 18, marginBottom: 14 };
const button = { display: "inline-block", padding: "10px 14px", borderRadius: 8, border: "1px solid #168b87", background: "#168b87", color: "#fff", fontWeight: 700, textDecoration: "none", cursor: "pointer" };
const chartRow = { display: "flex", alignItems: "end", gap: 4, height: 190, overflowX: "auto", paddingTop: 12 };
const barCol = { flex: "1 0 22px", minWidth: 22, height: "100%", display: "flex", flexDirection: "column", justifyContent: "end", alignItems: "center", gap: 4, fontSize: 10 };
const bar = { width: "65%", minWidth: 5, borderRadius: "5px 5px 0 0", background: "linear-gradient(180deg,#29b6b0,#177d86)" };
const row = { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", padding: "10px 0", borderBottom: "1px solid #edf3f5" };
