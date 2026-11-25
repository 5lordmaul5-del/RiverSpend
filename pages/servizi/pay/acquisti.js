import {useState} from "react";
import {supabase} from "../../../lib/supabase";
const ITEMS=[["signals-monthly","RiverSignals · mensile"],["signals-lifetime","RiverSignals · accesso lifetime"],["streaming-monthly","RiverStreaming · mensile"],["zen-monthly","Karma Zen · mensile"],["fidelity-monthly","RiverFidelity · mensile"]];
export default function ServiceCheckout(){
 const [item,setItem]=useState(ITEMS[0][0]),[busy,setBusy]=useState(false),[msg,setMsg]=useState("");
 async function buy(){setBusy(true);setMsg("");try{
 const {data:{session},error}=await supabase.auth.getSession();if(error||!session?.access_token)throw new Error("Accedi prima al tuo account.");
 const requestKey=crypto.randomUUID().replace(/-/g,"");
 const a=await fetch("/api/pay/service-intent",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+session.access_token},body:JSON.stringify({itemCode:item,requestKey})});
 const j=await a.json();if(!a.ok)throw new Error(j.error||"Intento non creato.");
 if(j.paymentCanProceed===false)throw new Error(j.message||"Intento preparato, checkout non ancora disponibile.");
 const b=await fetch("/api/pay/service-stripe-session",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+session.access_token},body:JSON.stringify({intentId:j.intent.id})});const k=await b.json();if(!b.ok||!k.url)throw new Error(k.error||"Checkout non disponibile.");
 window.location.assign(k.url);
 }catch(e){setMsg(e.message||"Errore");}finally{setBusy(false);}}
 return <main className="min-h-screen bg-slate-50 p-4 text-slate-900"><div className="mx-auto max-w-xl rounded-3xl border bg-white p-6"><h1 className="text-2xl font-black">RiverPay · Servizi</h1><p className="mt-2 text-slate-600">Checkout provider in modalità test. Nessun pagamento reale.</p><label className="mt-5 block font-bold">Servizio<select value={item} onChange={e=>setItem(e.target.value)} className="mt-2 w-full rounded-xl border p-3">{ITEMS.map(x=><option key={x[0]} value={x[0]}>{x[1]}</option>)}</select></label><button disabled={busy} onClick={buy} className="mt-5 w-full rounded-xl bg-teal-700 p-3 font-bold text-white disabled:opacity-50">{busy?"Preparazione…":"Continua al checkout test"}</button>{msg&&<p className="mt-4 rounded-xl bg-amber-50 p-3 text-amber-900">{msg}</p>}<p className="mt-4 text-xs text-slate-500">Checkout test Stripe, attivazione solo dopo webhook verificato. Richiede prezzi e segreti test configurati sul server e migrazioni applicate.</p></div></main>;
}
