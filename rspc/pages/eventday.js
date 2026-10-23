import {useEffect,useState} from "react";
import {supabase} from "../lib/supabase";
export default function EventDay(){
 const [session,setSession]=useState(null),[ok,setOk]=useState(false),[events,setEvents]=useState([]),[msg,setMsg]=useState("");
 useEffect(()=>{supabase.auth.getSession().then(({data})=>{setSession(data.session);if(data.session)check(data.session.user.id)});},[]);
 async function check(id){const {data}=await supabase.from("rs_admin_roles").select("role").eq("user_id",id).maybeSingle();setOk(data?.role==="admin");if(data?.role==="admin")load()}
 async function load(){const {data,error}=await supabase.from("rs_eventday_events").select("*").order("starts_at",{ascending:false});if(error)setMsg(error.message);else setEvents(data||[])}
 return <main style={{padding:24,fontFamily:"Arial,sans-serif",maxWidth:1000,margin:"auto"}}><h1>RiverSpend · EventDay</h1><p>Calendario CEO per promozioni, Super Sconti, Super Saldi ed eventi.</p><a href="/">Torna a RSPC</a>{!session?<p>Accedi prima a RSPC.</p>:!ok?<p>Area riservata CEO.</p>:<><button onClick={load}>Aggiorna</button><p>{msg}</p><h2>Eventi registrati</h2>{events.map(e=><article key={e.id} style={{padding:12,borderBottom:"1px solid #ddd"}}><b>{e.title}</b><p>{e.event_type} · {new Date(e.starts_at).toLocaleString("it-IT")} · {e.status}</p></article>)}</>}</main>;
}
