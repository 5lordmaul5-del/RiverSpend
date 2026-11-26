import { createClient } from "@supabase/supabase-js";
const CURRENCIES=new Set(["EUR","USD","GBP"]);
function minorUnits(value){const n=Number(value);return Number.isSafeInteger(n)&&n>0&&n<=100000000? n:null;}
export default async function handler(req,res){
 res.setHeader("Cache-Control","no-store, max-age=0");
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL, pub=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, secret=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_SECRET_KEY;
 if(!url||!pub||!secret)return res.status(503).json({error:"Configurazione server non disponibile."});
 const h=req.headers.authorization||"",token=h.startsWith("Bearer ")?h.slice(7):"";if(!token)return res.status(401).json({error:"Sessione richiesta."});
 try{
 const auth=createClient(url,pub,{auth:{persistSession:false,autoRefreshToken:false}});const {data,error}=await auth.auth.getUser(token);if(error||!data?.user)return res.status(401).json({error:"Sessione non valida."});
 const db=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}}),userId=data.user.id;
 if(req.method==="GET"){
 const {data:goals,error:gerr}=await db.from("riverpay_piggybank_goals").select("id,goal_name,target_minor,currency,status,created_at").eq("user_id",userId).order("created_at",{ascending:false});
 if(gerr)throw gerr;
 const ids=(goals||[]).map(g=>g.id);let contributions=[];
 if(ids.length){const {data:c,error:cerr}=await db.from("riverpay_piggybank_contributions").select("goal_id,amount_minor,currency,status").in("goal_id",ids).eq("user_id",userId);if(cerr)throw cerr;contributions=c||[];}
 const result=(goals||[]).map(g=>({...g,saved_minor:contributions.filter(c=>c.goal_id===g.id&&c.status==="confirmed").reduce((s,c)=>s+Number(c.amount_minor),0)}));
 return res.status(200).json({goals:result,notice:"I progressi conteggiano solo contributi confermati da un flusso di pagamento verificato."});
 }
 if(req.method==="POST"){
 const {goalName,targetMinor,currency="EUR"}=req.body||{};
 const target=minorUnits(targetMinor),cur=String(currency).toUpperCase(),name=String(goalName||"").trim().slice(0,100);
 if(!name||!target||!CURRENCIES.has(cur))return res.status(400).json({error:"Nome, obiettivo e valuta non validi."});
 const {data:goal,error:insertError}=await db.from("riverpay_piggybank_goals").insert({user_id:userId,goal_name:name,target_minor:target,currency:cur}).select("id,goal_name,target_minor,currency,status,created_at").single();
 if(insertError)throw insertError;return res.status(201).json({goal,saved_minor:0,realPaymentEnabled:false,message:"Obiettivo PiggyBank creato. Nessun denaro è stato trasferito o accantonato."});
 }
 res.setHeader("Allow","GET, POST");return res.status(405).end();
 }catch{return res.status(500).json({error:"Errore PiggyBank."});}
}
