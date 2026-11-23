import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import { supabase } from "../../lib/supabase";

const DB_NAME = "riverssai-creative-v1";
const STORE = "media";

function openVault() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function vaultAll() {
  const db = await openVault();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, "readonly").objectStore(STORE).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}
async function vaultPut(item) {
  const db = await openVault();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, "readwrite").objectStore(STORE).put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
async function vaultDelete(id) {
  const db = await openVault();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, "readwrite").objectStore(STORE).delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
function makeId() {
  return globalThis.crypto?.randomUUID?.() || `media-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function CreativeStudio() {
  const [access, setAccess] = useState("checking");
  const [token, setToken] = useState("");
  const [imageConfigured, setImageConfigured] = useState(false);
  const [media, setMedia] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("River Motion");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [duration, setDuration] = useState(3);
  const [tab, setTab] = useState("image");
  const canvasRef = useRef(null);
  const urlsRef = useRef([]);

  useEffect(() => {
    let alive = true;
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!alive) return;
      if (!session?.access_token) { setAccess("login"); return; }
      try {
        const response = await fetch("/api/area-51/access", { headers: { Authorization: `Bearer ${session.access_token}` } });
        if (response.status === 401 || response.status === 403) { setAccess("denied"); return; }
        if (!response.ok) throw new Error("Verifica non disponibile");
        const capabilityResponse = await fetch("/api/river-ai/creative/image?capabilities=1", { headers: { Authorization: `Bearer ${session.access_token}` } });
        const capabilityData = capabilityResponse.ok ? await capabilityResponse.json() : { configured: false };
        const items = await vaultAll();
        if (alive) { setToken(session.access_token); setImageConfigured(Boolean(capabilityData.configured)); setMedia(items.sort((a,b) => b.createdAt - a.createdAt)); setAccess("ready"); }
      } catch { if (alive) setAccess("error"); }
    }
    check();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => check());
    return () => { alive = false; subscription?.unsubscribe(); urlsRef.current.forEach(URL.revokeObjectURL); };
  }, []);

  async function addFiles(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setBusy(true); setStatus("Importazione dei file nel Media Vault…");
    try {
      for (const file of files) {
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) continue;
        const item = { id: makeId(), name: file.name, type: file.type, size: file.size, blob: file, createdAt: Date.now() };
        await vaultPut(item);
      }
      const items = await vaultAll();
      setMedia(items.sort((a,b) => b.createdAt - a.createdAt));
      setStatus("File salvati nel Media Vault di questo dispositivo.");
    } catch { setStatus("Spazio o permessi del browser insufficienti. I file non sono stati salvati."); }
    finally { setBusy(false); event.target.value = ""; }
  }

  function downloadItem(item) {
    const url = URL.createObjectURL(item.blob);
    const a = document.createElement("a"); a.href = url; a.download = item.name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  async function removeItem(id) {
    if (!window.confirm("Eliminare questo file dal Media Vault di questo dispositivo?")) return;
    await vaultDelete(id);
    setMedia((items) => items.filter((item) => item.id !== id));
    setStatus("File eliminato dal vault locale.");
  }

  async function exportMotion() {
    const images = media.filter((item) => item.type.startsWith("image/"));
    if (!images.length) { setStatus("Importa almeno un'immagine per creare il video."); return; }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!canvas.captureStream || typeof MediaRecorder === "undefined") {
      setStatus("Questo browser non supporta l'esportazione video. Prova con Chrome aggiornato su un dispositivo compatibile."); return;
    }
    setBusy(true); setStatus("Motion Lab sta preparando il video sul dispositivo…");
    const stream = canvas.captureStream(24);
    let recorder;
    const chunks = [];
    try {
      const mime = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find((type) => MediaRecorder.isTypeSupported(type));
      recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      recorder.ondataavailable = (event) => { if (event.data?.size) chunks.push(event.data); };
      const finished = new Promise((resolve, reject) => {
        recorder.onstop = () => resolve();
        recorder.onerror = () => reject(new Error("Esportazione video non riuscita."));
      });
      recorder.start();
      for (const item of images.slice(0, 12).reverse()) {
        const url = URL.createObjectURL(item.blob);
        const img = new Image();
        await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = url; });
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const w = img.width * scale, h = img.height * scale;
        const start = performance.now();
        while (performance.now() - start < duration * 1000) {
          ctx.fillStyle = "#06172b"; ctx.fillRect(0, 0, canvas.width, canvas.height);
          const t = Math.min(1, (performance.now() - start) / (duration * 1000));
          const zoom = 1 + t * 0.045;
          ctx.save(); ctx.translate(canvas.width / 2, canvas.height / 2); ctx.scale(zoom, zoom);
          ctx.drawImage(img, -w / 2, -h / 2, w, h); ctx.restore();
          await new Promise((resolve) => requestAnimationFrame(resolve));
        }
        URL.revokeObjectURL(url);
      }
      recorder.stop(); await finished;
      const blob = new Blob(chunks, { type: recorder.mimeType || "video/webm" });
      const item = { id: makeId(), name: `${(title || "river-motion").trim().replace(/[^a-z0-9-_ ]/gi, "").replace(/\s+/g, "-")}.webm`, type: blob.type, size: blob.size, blob, createdAt: Date.now() };
      await vaultPut(item);
      setMedia((items) => [item, ...items]);
      setStatus("Video creato e salvato nel Media Vault. È un montaggio animato locale, non una generazione AI video.");
    } catch (error) {
      if (recorder && recorder.state !== "inactive") recorder.stop();
      setStatus(error.message || "Non è stato possibile creare il video.");
    } finally { stream.getTracks().forEach((track) => track.stop()); setBusy(false); }
  }

  async function generateImage() {
    if (!prompt.trim() || busy || !imageConfigured) return;
    setBusy(true); setStatus("Nova sta inviando la richiesta al motore immagini locale…");
    try {
      const started = await fetch("/api/river-ai/creative/image", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt: prompt.trim() })
      });
      const job = await started.json();
      if (!started.ok) throw new Error(job.error || "Il motore immagini non ha accettato la richiesta.");
      let result = null;
      for (let attempt = 0; attempt < 90; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const check = await fetch(`/api/river-ai/creative/image?prompt_id=${encodeURIComponent(job.prompt_id)}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await check.json();
        if (!check.ok) throw new Error(data.error || "Errore durante la generazione.");
        if (data.status === "completed") { result = data; break; }
        setStatus(`Image Engine sta elaborando… controllo ${attempt + 1}/90`);
      }
      if (!result?.image_url) throw new Error("Generazione ancora in corso o scaduto il tempo di attesa. Puoi riprovare tra poco.");
      const imageResponse = await fetch(result.image_url, { headers: { Authorization: `Bearer ${token}` } });
      if (!imageResponse.ok) throw new Error("Immagine creata ma non recuperabile dal runtime.");
      const blob = await imageResponse.blob();
      const item = { id: makeId(), name: result.filename || "RiverSSAI-generated.png", type: blob.type || "image/png", size: blob.size, blob, createdAt: Date.now() };
      await vaultPut(item);
      setMedia((items) => [item, ...items]);
      setStatus("Immagine generata dal runtime ComfyUI e salvata nel Media Vault locale.");
      setTab("vault");
    } catch (error) { setStatus(error.message || "Generazione non riuscita."); }
    finally { setBusy(false); }
  }

  async function prepareImageBrief() {
    if (!prompt.trim()) { setStatus("Scrivi prima una descrizione dell'immagine."); return; }
    await navigator.clipboard?.writeText(`RiverSSAI Image Engine brief\n\n${prompt.trim()}\n\nFormato: definire in base all'uso. Qualità: alta. Verificare diritti e contenuti.`).catch(() => {});
    setStatus("Brief creativo preparato. Il motore generativo AI non è ancora collegato: nessuna immagine è stata generata.");
  }

  const card = { background:"#fff", border:"1px solid #d4e8e8", borderRadius:16, padding:16, boxShadow:"0 6px 20px rgba(4,55,65,.05)" };
  const button = { border:0, borderRadius:11, padding:"11px 14px", background:"#087f89", color:"#fff", fontWeight:800, cursor:"pointer" };

  return <>
    <Head><title>RiverSSAI Creative Studio 1.0</title><meta name="description" content="Nova Core, Image Engine, Video Engine, Motion Lab e Media Vault."/></Head>
    <main style={{minHeight:"100vh",background:"linear-gradient(150deg,#e9fbfc,#f8fcfd)",color:"#14383e",fontFamily:"Arial,sans-serif",padding:16}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <header style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap",marginBottom:18}}>
          <a href="/river-ai" style={{color:"#087f89",fontWeight:800,textDecoration:"none"}}>← RiverSSAI</a>
          <div style={{flex:1}}><div style={{fontSize:12,color:"#9a7727",fontWeight:800,letterSpacing:2}}>RIVERSSAI · CREATIVE DIVISION</div><h1 style={{margin:"4px 0",fontSize:28}}>Creative Studio 1.0</h1><div style={{color:"#58767b",fontSize:13}}>Nova Core · Image Engine · Video Engine · Motion Lab · Media Vault</div></div>
          <span style={{background:"#fff4d7",color:"#76520b",padding:"8px 11px",borderRadius:20,fontSize:12,fontWeight:800}}>Fondazione · modalità locale</span>
        </header>
        {access==="checking" ? <div style={card}>Verifica accesso proprietario…</div> :
         access==="login" ? <div style={card}><h2>Accesso richiesto</h2><p>Accedi prima a RiverSSAI, poi apri il Creative Studio.</p><a href="/river-ai">Vai a RiverSSAI</a></div> :
         access==="denied" ? <div style={card}><h2>Accesso non autorizzato</h2><p>Il Creative Studio è riservato all'area proprietario RiverSpend.</p></div> :
         access==="error" ? <div style={card}><h2>Verifica non disponibile</h2><p>Riprova quando il servizio di autenticazione è raggiungibile.</p></div> :
         <>
          <section style={{...card,background:"linear-gradient(120deg,#08263c,#087f89)",color:"#fff",marginBottom:14}}>
            <div style={{fontSize:12,letterSpacing:2,color:"#8deaff",fontWeight:800}}>NOVA CORE · REGIA CREATIVA</div>
            <h2 style={{margin:"8px 0"}}>Dall'idea al contenuto, con passaggi verificabili.</h2>
            <p style={{maxWidth:760,lineHeight:1.55,color:"#e1f6f8",fontSize:14}}>Nova organizza il brief, prepara i materiali, coordina il flusso immagini e video e archivia i risultati. I modelli generativi esterni o locali verranno attivati solo quando il relativo motore sarà realmente installato e configurato.</p>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{["Image Engine · pronto per provider","Video Engine · provider da collegare","Motion Lab · esportazione locale","Media Vault · archivio dispositivo"].map(x=><span key={x} style={{padding:"7px 10px",borderRadius:9,background:"#ffffff18",fontSize:12}}>{x}</span>)}</div>
          </section>
          <nav style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>{[["image","Image Engine"],["video","Video Engine"],["motion","Motion Lab"],["vault","Media Vault"]].map(([id,label])=><button key={id} onClick={()=>setTab(id)} style={{...button,background:tab===id?"#087f89":"#dceff0",color:tab===id?"#fff":"#24565d"}}>{label}</button>)}</nav>
          {tab==="image" && <section style={card}><h2>🎨 Image Engine</h2><p style={{color:"#58767b",fontSize:14}}>Scrivi il concept, definisci stile e destinazione. In questa prima versione Nova prepara il brief; il generatore AI non è ancora collegato.</p><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={5} placeholder="Descrivi l'immagine: soggetto, ambiente, stile, luce, formato…" style={{width:"100%",boxSizing:"border-box",padding:13,border:"1px solid #c9dfe0",borderRadius:12,fontSize:15}}/><div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:10}}><button style={button} disabled={busy} onClick={prepareImageBrief}>Prepara brief creativo</button>{imageConfigured && <button style={{...button,background:"#9b7627"}} disabled={busy || !prompt.trim()} onClick={generateImage}>Genera immagine con motore locale</button>}<label style={{...button,background:"#dceff0",color:"#24565d"}}>Importa immagini<input type="file" accept="image/*" multiple onChange={addFiles} style={{display:"none"}}/></label></div></section>}
          {tab==="video" && <section style={card}><h2>🎬 Video Engine</h2><p style={{color:"#58767b",fontSize:14}}>Area predisposta per modelli text-to-video e image-to-video (ad esempio modelli open-weight compatibili). Richiede un runtime con GPU adeguata o un provider configurato: al momento non è collegato e non consuma API.</p><ul style={{lineHeight:1.8}}><li>Text-to-video: motore da integrare</li><li>Image-to-video: motore da integrare</li><li>Controllo durata, formato e risoluzione: da collegare al runtime</li><li>Salvataggio risultati: Media Vault locale già disponibile</li></ul><label style={{...button,display:"inline-block",background:"#dceff0",color:"#24565d"}}>Importa clip video<input type="file" accept="video/*" multiple onChange={addFiles} style={{display:"none"}}/></label></section>}
          {tab==="motion" && <section style={card}><h2>✨ Motion Lab</h2><p style={{color:"#58767b",fontSize:14}}>Crea un video slideshow animato dalle immagini presenti nel vault, con movimento panoramico/zoom leggero. L'elaborazione avviene nel browser e non usa un servizio AI.</p><label style={{display:"block",fontWeight:700,margin:"12px 0 6px"}}>Nome progetto</label><input value={title} onChange={e=>setTitle(e.target.value)} style={{width:"100%",maxWidth:420,padding:11,border:"1px solid #c9dfe0",borderRadius:10}}/><label style={{display:"block",fontWeight:700,margin:"12px 0 6px"}}>Secondi per immagine: {duration}</label><input type="range" min="2" max="6" value={duration} onChange={e=>setDuration(Number(e.target.value))}/><div style={{marginTop:12}}><button style={button} disabled={busy} onClick={exportMotion}>{busy?"Elaborazione…":"Crea video animato (WEBM)"}</button></div><canvas ref={canvasRef} width="1280" height="720" style={{display:"none"}}/></section>}
          {tab==="vault" && <section style={card}><h2>🗂️ Media Vault</h2><p style={{color:"#58767b",fontSize:13}}>Archivio locale IndexedDB: i file restano su questo browser/dispositivo. Non è ancora un archivio cloud condiviso.</p><label style={{...button,display:"inline-block",background:"#dceff0",color:"#24565d"}}>Aggiungi foto o video<input type="file" accept="image/*,video/*" multiple onChange={addFiles} style={{display:"none"}}/></label><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:12,marginTop:16}}>{media.map(item=><article key={item.id} style={{border:"1px solid #dceaea",borderRadius:12,padding:10,minWidth:0}}>{item.type.startsWith("image/")?<img src={URL.createObjectURL(item.blob)} alt={item.name} style={{width:"100%",height:125,objectFit:"cover",borderRadius:8}}/>:<div style={{height:125,display:"grid",placeItems:"center",background:"#eaf5f5",borderRadius:8,fontSize:36}}>▶</div>}<div style={{fontWeight:700,fontSize:13,marginTop:8,overflowWrap:"anywhere"}}>{item.name}</div><div style={{fontSize:11,color:"#668187",margin:"4px 0 8px"}}>{(item.size/1024/1024).toFixed(2)} MB · {item.type}</div><div style={{display:"flex",gap:6}}><button onClick={()=>downloadItem(item)} style={{...button,padding:"7px 9px",fontSize:12}}>Scarica</button><button onClick={()=>removeItem(item.id)} style={{...button,padding:"7px 9px",fontSize:12,background:"#f8e9e7",color:"#9b3428"}}>Elimina</button></div></article>)}</div>{media.length===0&&<p style={{color:"#718b90"}}>Il vault è vuoto. Importa immagini o video per iniziare.</p>}</section>}
          {status&&<div role="status" style={{...card,marginTop:12,background:"#f2fbf8",color:"#24604f",fontSize:13}}>{status}</div>}
          <footer style={{fontSize:11,color:"#718b90",padding:"16px 4px"}}>Creative Studio 1.0 · Dati media locali al dispositivo · Nessun provider AI esterno attivato in questa versione.</footer>
         </>}
      </div>
    </main>
  </>;
}
