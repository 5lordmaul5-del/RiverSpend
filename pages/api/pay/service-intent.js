import { createClient } from "@supabase/supabase-js";
const CATALOG={
 "signals-lifetime":{service_code:"signals",env:"RIVERPAY_PRICE_SIGNALS_LIFETIME_MINOR"},
 "signals-monthly":{service_code:"signals",env:"RIVERPAY_PRICE_SIGNALS_MONTHLY_MINOR"},
 "streaming-monthly":{service_code:"streaming",env:"RIVERPAY_PRICE_STREAMING_MONTHLY_MINOR"},
 "zen-monthly":{service_code:"zen",env:"RIVERPAY_PRICE_ZEN_MONTHLY_MINOR"},
 "fidelity-monthly":{service_code:"fidelity",env:"RIVERPAY_PRICE_FIDELITY_MONTHLY_MINOR"}
};
export default async function handler(req,res){
 res.setHeader("Cache-Control","no-store, max-age=0");
 if(req.method!=="POST"){res.setHeader("Allow","POST");return res.status(405).end();}
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,pub=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,secret=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_SECRET_KEY;
 if(!url||!pub||!secret)return res.status(503).json({error:"Configurazione server non disponibile."});
 const h=req.headers.authorization||"",token=h.startsWith("Bearer ")?h.slice(7):"";if(!token)return res.status(401).json({error:"Sessione richiesta."});
 const {itemCode}=req.body||{},item=CATALOG[String(itemCode||"")];if(!item)return res.status(400).json({error:"Servizio non valido."});
 const configured=Number(process.env[item.env]);if(!Number.isSafeInteger(configured)||configured<=0)return res.status(503).json({error:"Prezzo non configurato: servizio non acquistabile."});
 try{
 const auth=createClient(url,pub,{auth:{persistSession:false,autoRefreshToken:false}});const {data,error}=await auth.auth.getUser(token);if(error||!data?.user)return res.status(401).json({error:"Sessione non valida."});
 const db=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}}),userId=data.user.id;
 const idem="riverpay-service:"+userId+":"+String(itemCode);
 const {data:existing,error:lookup}=await db.from("riverpay_service_intents").select("id,status,amount_minor,currency,item_code,created_at").eq("idempotency_key",idem).maybeSingle();if(lookup)throw lookup;
 if(existing)return res.status(200).json({intent:existing,mode:"preparation_only",paymentCanProceed:false});
 const {data:intent,error:insert}=await db.from("riverpay_service_intents").insert({user_id:userId,service_code:item.service_code,item_code:String(itemCode),amount_minor:configured,currency:"EUR",status:"pending",idempotency_key:idem,metadata:{mode:"preparation_only",payment_provider_required:true}}).select("id,status,amount_minor,currency,item_code,created_at").single();
 if(insert)throw insert;return res.status(201).json({intent,mode:"preparation_only",paymentCanProceed:false,livePaymentsEnabled:false,message:"Intenzione registrata. Il pagamento e l'attivazione del servizio non sono ancora abilitati."});
 }catch{return res.status(500).json({error:"Impossibile creare l'intenzione di pagamento."});}
}
