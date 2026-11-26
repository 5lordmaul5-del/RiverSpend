import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (req.method !== "GET") { res.setHeader("Allow", "GET"); return res.status(405).end(); }
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if(!url||!publicKey||!serviceKey)return res.status(503).json({error:"Configurazione server non completa."});
  const authHeader=req.headers.authorization||"",token=authHeader.startsWith("Bearer ")?authHeader.slice(7):"";
  if(!token)return res.status(401).json({error:"Sessione richiesta."});
  try{
    const auth=createClient(url,publicKey,{auth:{persistSession:false,autoRefreshToken:false}});
    const {data,error}=await auth.auth.getUser(token);
    if(error||!data?.user)return res.status(401).json({error:"Sessione non valida."});
    const db=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
    const {data:role,error:roleError}=await db.from("rs_admin_roles").select("role").eq("user_id",data.user.id).maybeSingle();
    if(roleError||role?.role!=="admin")return res.status(403).json({error:"Accesso admin richiesto."});
    const [tx,events]=await Promise.all([
      db.from("riverpay_transactions").select("id,order_id,provider,provider_payment_id,status,currency,amount_minor,fee_minor,created_at,updated_at").order("created_at",{ascending:false}).limit(50),
      db.from("riverpay_events").select("id,provider,provider_event_id,transaction_id,event_type,processed_at,received_at").order("received_at",{ascending:false}).limit(50)
    ]);
    if(tx.error)throw tx.error;if(events.error)throw events.error;
    return res.status(200).json({ok:true,testOnly:true,transactions:tx.data||[],events:events.data||[]});
  }catch{return res.status(500).json({error:"Impossibile caricare il monitor RiverPay."});}
}
