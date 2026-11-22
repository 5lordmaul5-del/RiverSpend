import { useEffect, useState } from "react";

const modules = [
  { id: "compass", title: "Bussola & punti cardinali", tag: "ORIENTAMENTO", icon: "🧭", art: "from-emerald-950 via-[#536b42] to-slate-950", desc: "Nord, Sud, Est, Ovest e direzione in gradi." },
  { id: "gps", title: "GPS & posizione", tag: "LOCALIZZAZIONE", icon: "🛰️", art: "from-slate-950 via-blue-950 to-emerald-950", desc: "Coordinate e posizione solo quando scegli di condividerle." },
  { id: "maps", title: "Carte topografiche", tag: "CARTOGRAFIA", icon: "🗺️", art: "from-[#526b3d] via-[#9a9b63] to-[#263b2a]", desc: "Esplora il territorio, rilievi e mappe di base." },
  { id: "recon", title: "Ricognizione civile", tag: "OSSERVAZIONE", icon: "🔭", art: "from-[#263b2a] via-[#69764a] to-[#111c16]", desc: "Annotazioni e segnalazioni ambientali geolocalizzate." },
  { id: "nbcr", title: "Allerta NBCR", tag: "SICUREZZA CIVILE", icon: "☢️", art: "from-red-950 via-[#5a2020] to-slate-950", desc: "Nucleare, biologico, chimico e radiologico: segnalazioni e indicazioni di sicurezza." },
  { id: "alerts", title: "Centro allarmi", tag: "EMERGENZE", icon: "🚨", art: "from-[#450b0b] via-red-800 to-[#160b0b]", desc: "Contatti, checklist e avvisi con stato di verifica." },
  { id: "enigma", title: "ENIGMA", tag: "MESSAGGI CIFRATI", icon: "🔐", art: "from-stone-950 via-[#66502b] to-[#1b1710]", desc: "Apri il comparto ENIGMA già presente in Signals." },
  { id: "morse", title: "Codice Morse", tag: "SEGNALI", icon: "〰️", art: "from-slate-950 via-slate-700 to-black", desc: "Conversione testo, punti, linee e segnale audio." },
  { id: "nato", title: "Alfabeto NATO", tag: "FONETICA", icon: "🔠", art: "from-[#233b2a] via-[#65724b] to-[#151e17]", desc: "Alfabeto fonetico internazionale e pronuncia." },
  { id: "radio", title: "Walkie-talkie", tag: "COMUNICAZIONE", icon: "📻", art: "from-[#17251c] via-[#4c5b43] to-[#101510]", desc: "Push-to-talk per messaggi vocali; radio live da integrare." }
];

function CompassRose({ degrees }) {
  return <div className="relative mx-auto grid h-44 w-44 place-items-center rounded-full border-[7px] border-[#d4b34f] bg-[radial-gradient(circle,#e5e7d4_0%,#879477_54%,#263b2a_56%,#17231a_100%)] shadow-[0_0_0_5px_#111827,0_0_24px_#d4b34f66]">
    {["N","E","S","O"].map((p,i)=><span key={p} className="absolute text-sm font-black text-slate-950" style={{top:i===0?"8px":i===2?"auto":"50%",bottom:i===2?"8px":"auto",left:i===3?"8px":i===1?"auto":"50%",right:i===1?"8px":"auto",transform:"translate(-50%,-50%)"}}>{p}</span>)}
    <div className="absolute h-[118px] w-[3px] rounded-full bg-slate-900" style={{transform:"rotate("+degrees+"deg)"}} />
    <div className="absolute h-0 w-0 border-x-[9px] border-x-transparent border-b-[52px] border-b-red-600" style={{transform:"rotate("+degrees+"deg) translateY(-25px)"}} />
    <div className="z-10 h-4 w-4 rounded-full border-2 border-amber-200 bg-slate-900" />
  </div>;
}

export default function SignalsArea51({ open, onClose, onOpenFieldTools, onOpenEnigma }) {
  const [section, setSection] = useState("home");
  const [heading, setHeading] = useState(null);
  const [coords, setCoords] = useState(null);
  const [gpsError, setGpsError] = useState("");
  const [reportType, setReportType] = useState("Sospetto evento NBCR");
  const [reportText, setReportText] = useState("");
  const [reportStatus, setReportStatus] = useState("");
  const [alarmConfirmed, setAlarmConfirmed] = useState(false);

  useEffect(() => {
    if (!open) { setSection("home"); setReportStatus(""); }
  }, [open]);

  useEffect(() => {
    if (!open || section !== "compass" || typeof window === "undefined") return;
    const handler = event => {
      const value = event.webkitCompassHeading ?? (event.alpha == null ? null : (360 - event.alpha) % 360);
      if (value != null && Number.isFinite(value)) setHeading(Math.round(value));
    };
    window.addEventListener("deviceorientationabsolute", handler, true);
    window.addEventListener("deviceorientation", handler, true);
    return () => {
      window.removeEventListener("deviceorientationabsolute", handler, true);
      window.removeEventListener("deviceorientation", handler, true);
    };
  }, [open, section]);

  if (!open) return null;
  const active = modules.find(item => item.id === section);
  const requestGps = () => {
    setGpsError("");
    if (!navigator.geolocation) { setGpsError("GPS non disponibile in questo browser."); return; }
    navigator.geolocation.getCurrentPosition(
      p => setCoords({ lat: p.coords.latitude, lon: p.coords.longitude, accuracy: Math.round(p.coords.accuracy) }),
      e => setGpsError(e.message || "Posizione non disponibile."),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 }
    );
  };
  const submitReport = e => {
    e.preventDefault();
    setReportStatus("Segnalazione preparata solo su questo dispositivo. Non è stata inviata alle autorità né verificata.");
  };
  const openFieldTab = tab => { onClose?.(); onOpenFieldTools?.(tab); };

  return <div className="fixed inset-0 z-[115] overflow-y-auto bg-[#080d0a]/95 p-2 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="area51-title">
    <div className="mx-auto max-w-5xl overflow-hidden rounded-[26px] border-[5px] border-[#d4b34f] bg-[#18241b] shadow-[0_0_0_4px_#111827,0_0_35px_#dc262655]">
      <header className="relative overflow-hidden border-b-4 border-dashed border-[#d4b34f] bg-[linear-gradient(115deg,#17251b,#43553a,#18241b)] p-4 text-white sm:p-6">
        <div className="absolute right-4 top-4 flex items-center gap-2"><span className="h-3 w-3 animate-pulse rounded-full bg-red-500 shadow-[0_0_14px_#ef4444]"/><span className="h-3 w-3 animate-pulse rounded-full bg-red-500 shadow-[0_0_14px_#ef4444] [animation-delay:300ms]"/><span className="h-3 w-3 animate-pulse rounded-full bg-red-500 shadow-[0_0_14px_#ef4444] [animation-delay:600ms]"/></div>
        <div className="text-[10px] font-black uppercase tracking-[.35em] text-amber-200">RiverSignals · Special Operations Hub</div>
        <h2 id="area51-title" className="mt-2 text-3xl font-black tracking-[.12em] text-[#f4d36d] sm:text-4xl">AREA51 <span className="text-white">· TOP SECRET</span></h2>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-emerald-50/80">Centro strumenti speciali, orientamento, comunicazioni e sicurezza civile.</p>
        <div className="mt-4 inline-flex items-center gap-2 border border-amber-300/60 bg-black/30 px-3 py-1.5 text-[10px] font-bold tracking-widest text-amber-100">⚠ ACCESSO RISERVATO · RIVERSIGNALS</div>
        <button type="button" onClick={onClose} aria-label="Chiudi Area51" className="absolute bottom-4 right-4 rounded-full border border-white/40 bg-black/30 px-4 py-2 text-sm font-bold text-white">Chiudi ×</button>
      </header>
      <div className="border-b border-amber-300/30 bg-[#111a13] px-3 py-2 text-[10px] font-bold tracking-widest text-amber-200">SELEZIONA UN COMPARTO · {modules.length} STRUMENTI</div>
      {section === "home" ? <div className="grid grid-cols-1 gap-3 bg-[linear-gradient(135deg,#1b2a1e,#111812)] p-3 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
        {modules.map(item => <button key={item.id} type="button" onClick={() => {
          if (item.id === "morse" || item.id === "nato" || item.id === "radio") { openFieldTab(item.id === "radio" ? "ptt" : item.id); return; }
          if (item.id === "enigma") { onClose?.(); onOpenEnigma?.(); return; }
          setSection(item.id);
        }} className="group overflow-hidden rounded-2xl border-2 border-[#d4b34f]/80 bg-[#111812] text-left shadow-[0_5px_0_#080d0a] transition hover:-translate-y-0.5 hover:border-amber-200">
          <div className={"relative flex h-28 items-center justify-between overflow-hidden bg-gradient-to-br "+item.art+" px-4"}>
            <div className="absolute inset-0 opacity-20" style={{backgroundImage:"repeating-linear-gradient(135deg,transparent 0 12px,#d4b34f 12px 14px)"}}/>
            <span className="relative text-6xl drop-shadow-[0_5px_4px_#000]">{item.icon}</span><span className="relative max-w-[58%] text-right text-[10px] font-black tracking-[.18em] text-amber-100">{item.tag}</span>
            {item.id === "alerts" || item.id === "nbcr" ? <span className="absolute right-3 top-3 h-3 w-3 animate-pulse rounded-full bg-red-500 shadow-[0_0_16px_5px_#ef444466]"/> : null}
          </div>
          <div className="border-t border-amber-300/30 bg-[#202d22] p-3"><h3 className="text-sm font-black text-[#f4d36d]">{item.title}</h3><p className="mt-1 text-xs leading-relaxed text-emerald-50/70">{item.desc}</p><div className="mt-3 flex items-center justify-between text-[9px] font-black tracking-widest text-amber-200"><span>APRІ COMPARTO</span><span>↗</span></div></div>
        </button>)}
      </div> : <div className="min-h-[430px] bg-[#18241b] p-4 text-white sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3"><div><div className="text-[10px] font-black tracking-[.3em] text-amber-300">{active?.tag || "AREA51"}</div><h3 className="mt-1 text-xl font-black text-[#f4d36d]">{active?.title || "Centro operativo"}</h3></div><button type="button" onClick={() => setSection("home")} className="rounded-lg border border-amber-300/60 px-3 py-2 text-xs font-bold text-amber-100">← Tutti i comparti</button></div>
        {section === "compass" && <div className="grid gap-5 sm:grid-cols-2 sm:items-center"><div className="rounded-2xl border border-amber-300/40 bg-[#101810] p-5"><CompassRose degrees={heading || 0}/><div className="mt-4 text-center text-2xl font-black text-amber-200">{heading == null ? "—°" : heading+"°"} <span className="text-sm">direzione</span></div><p className="mt-2 text-center text-xs text-emerald-50/70">La bussola dipende dai sensori e dai permessi del telefono. Se non supportata, usa i punti cardinali come riferimento.</p></div><div className="rounded-2xl border border-amber-300/30 bg-[#263b2a] p-4"><h4 className="font-bold text-amber-200">Punti cardinali</h4><div className="mt-3 grid grid-cols-2 gap-2">{[["N","Nord"],["E","Est"],["S","Sud"],["O","Ovest"]].map(([a,b])=><div key={a} className="rounded-lg border border-white/15 bg-black/20 p-3"><b className="text-2xl text-amber-200">{a}</b><div className="text-xs">{b}</div></div>)}</div></div></div>}
        {section === "gps" && <div className="rounded-2xl border border-amber-300/30 bg-[#101810] p-5"><p className="text-sm text-emerald-50/80">La posizione viene letta soltanto dopo aver premuto il pulsante e concesso il permesso del browser.</p><button type="button" onClick={requestGps} className="mt-4 rounded-xl border-2 border-amber-300 bg-[#d4b34f] px-4 py-3 text-sm font-black text-slate-950">📍 Rileva la mia posizione</button>{gpsError && <p role="alert" className="mt-3 text-sm text-red-300">{gpsError}</p>}{coords && <div className="mt-4 rounded-xl bg-[#263b2a] p-4 text-sm"><div>Latitudine: <b>{coords.lat.toFixed(6)}</b></div><div>Longitudine: <b>{coords.lon.toFixed(6)}</b></div><div>Precisione stimata: ±{coords.accuracy} m</div><a className="mt-3 inline-block underline text-amber-200" href={"https://www.openstreetmap.org/?mlat="+coords.lat+"&mlon="+coords.lon+"#map=15/"+coords.lat+"/"+coords.lon} target="_blank" rel="noreferrer">Apri la mappa</a><p className="mt-2 text-[10px] text-emerald-50/60">Le coordinate restano in questa schermata: non vengono inviate automaticamente.</p></div>}</div>}
        {section === "maps" && <div className="rounded-2xl border border-amber-300/30 bg-[#101810] p-4"><div className="text-5xl">⛰️ 🗺️</div><p className="mt-3 text-sm text-emerald-50/80">Apri una cartografia libera per consultare territorio, strade e sentieri. Le mappe possono richiedere connessione e non sostituiscono carte ufficiali o dispositivi di navigazione dedicati.</p><a href="https://www.openstreetmap.org/" target="_blank" rel="noreferrer" className="mt-4 inline-block rounded-xl bg-[#d4b34f] px-4 py-3 text-sm font-black text-slate-950">Apri OpenStreetMap ↗</a></div>}
        {section === "recon" && <div className="rounded-2xl border border-amber-300/30 bg-[#101810] p-4"><h4 className="font-bold text-amber-200">Taccuino di osservazione</h4><textarea value={reportText} onChange={e=>setReportText(e.target.value)} rows={5} placeholder="Annota condizioni ambientali, ostacoli o informazioni utili alla sicurezza…" className="mt-3 w-full rounded-xl border border-amber-300/30 bg-[#263b2a] p-3 text-sm text-white placeholder:text-emerald-100/50"/><p className="mt-2 text-[10px] text-emerald-50/60">Le note restano temporanee in questa schermata; non sono condivise.</p></div>}
        {section === "nbcr" && <div className="space-y-4"><div className="rounded-xl border-2 border-red-500 bg-red-950/40 p-4"><div className="flex items-center gap-3"><span className="text-4xl">☢️</span><div><b className="text-red-200">ATTENZIONE · NBCR</b><p className="text-xs text-red-100/80">Nucleare · Biologico · Chimico · Radiologico</p></div></div><p className="mt-3 text-xs leading-relaxed text-white/80">In caso di pericolo immediato, allontanati dalla zona solo se è sicuro farlo, evita di toccare sostanze o oggetti sospetti, segui le autorità e chiama il 112. Non avvicinarti per fotografare o verificare.</p></div><form onSubmit={submitReport} className="rounded-xl border border-amber-300/30 bg-[#101810] p-4"><label className="block text-xs font-bold text-amber-200">Tipo di segnalazione</label><select value={reportType} onChange={e=>setReportType(e.target.value)} className="mt-2 w-full rounded-lg bg-[#263b2a] p-3 text-sm text-white"><option>Sospetto evento NBCR</option><option>Odore o nube sospetta</option><option>Oggetto o materiale sospetto</option><option>Avviso ricevuto da autorità</option></select><label className="mt-3 block text-xs font-bold text-amber-200">Descrizione (senza avvicinarti)</label><textarea value={reportText} onChange={e=>setReportText(e.target.value)} rows={3} className="mt-2 w-full rounded-lg bg-[#263b2a] p-3 text-sm text-white" placeholder="Descrivi soltanto ciò che hai osservato da una posizione sicura."/><label className="mt-3 flex items-start gap-2 text-xs text-emerald-50/80"><input type="checkbox" checked={alarmConfirmed} onChange={e=>setAlarmConfirmed(e.target.checked)} className="mt-0.5"/> Ho capito che questa segnalazione non è un allarme ufficiale e non sostituisce il 112.</label><button disabled={!alarmConfirmed || !reportText.trim()} className="mt-4 rounded-lg bg-red-700 px-4 py-3 text-sm font-black text-white disabled:opacity-40">Prepara segnalazione</button>{reportStatus && <p role="status" className="mt-3 rounded-lg bg-amber-100 p-3 text-xs text-amber-950">{reportStatus}</p>}</form></div>}
        {section === "alerts" && <div className="rounded-xl border-2 border-red-500 bg-red-950/30 p-5"><div className="flex items-center gap-3"><span className="h-4 w-4 animate-pulse rounded-full bg-red-500 shadow-[0_0_20px_6px_#ef444477]"/><h4 className="text-lg font-black text-red-200">CENTRO ALLARMI CIVILI</h4></div><p className="mt-3 text-sm text-white/80">Questa sezione non riceve ancora feed ufficiali in tempo reale. Non mostraremo falsi allarmi: per emergenze chiama il numero unico europeo.</p><a href="tel:112" className="mt-4 inline-block rounded-xl bg-red-700 px-5 py-3 text-sm font-black text-white">CHIAMA 112</a><p className="mt-3 text-[10px] text-red-100/70">Le segnalazioni degli utenti dovranno essere verificate prima di diventare avvisi pubblici.</p></div>}
      </div>}
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t-4 border-dashed border-[#d4b34f] bg-[#101810] px-4 py-3 text-[9px] font-bold tracking-widest text-emerald-50/60"><span>RIVERSPEND · RIVERSIGNALS</span><span>AREA51 · CIVIL SAFETY & FIELD TOOLS</span></footer>
    </div>
  </div>;
}
