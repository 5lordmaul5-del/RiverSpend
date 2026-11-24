import { createClient } from "@supabase/supabase-js";
const db=()=>createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
export default async function handler(req,res){
 res.setHeader("Cache-Control","no-store");
 if(!["GET","POST"].includes(req.method)){res.setHeader("Allow","GET, POST");return res.status(405).json({error:"Metodo non consentito"});}
 const token=(req.headers.authorization||"").startsWith("Bearer ")?req.headers.authorization.slice(7):"";
 if(!token)return res.status(401).json({error:"Sessione richiesta"});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,secret=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_SECRET_KEY;
 if(!url||!key||!secret)return res.status(503).json({error:"Configurazione server incompleta"});
 const auth=createClient(url,key);const {data,error}=await auth.auth.getUser(token);if(error||!data.user)return res.status(401).json({error:"Sessione non valida"});
 const d=db();const {data:role}=await d.from("rs_admin_roles").select("role").eq("user_id",data.user.id).maybeSingle();if(role?.role!=="admin")return res.status(403).json({error:"Solo amministratore"});
 if(req.method==="GET"){const {data:runs,error:e}=await d.from("rs_pay_sandbox_runs").select("*").order("created_at",{ascending:false}).limit(25);if(e)return res.status(500).json({error:"Registro non disponibile"});return res.status(200).json({runs});}
 const b=req.body||{};const subtotal=Number(b.itemSubtotal),shipping=Number(b.shipping||0),sp=Number(b.sellerPercent),rp=Number(b.riverPercent),resP=Number(b.reservePercent);
 if(![subtotal,shipping,sp,rp,resP].every(Number.isFinite)||subtotal<=0||shipping<0||sp<0||rp<0||resP<0||Math.abs(sp+rp+resP-100)>0.001)return res.status(400).json({error:"Inserisci valori validi e percentuali che sommano 100."});
 const seller=Number((subtotal*sp/100).toFixed(2)),river=Number((subtotal*rp/100).toFixed(2)),reserve=Number((subtotal*resP/100).toFixed(2)),gross=Number((subtotal+shipping).toFixed(2));
 const {data:run,error:e}=await d.from("rs_pay_sandbox_runs").insert({created_by:data.user.id,item_subtotal:subtotal,shipping_total:shipping,seller_percent:sp,river_percent:rp,reserve_percent:resP,seller_amount:seller,river_amount:river,reserve_amount:reserve,gross_amount:gross,currency:"EUR",label:"SIMULAZIONE TEST - nessun pagamento"}).select().single();
 if(e)return res.status(500).json({error:"Simulazione non salvata"});
 return res.status(201).json({run,testOnly:true,message:"TEST ONLY: nessun pagamento o ordine reale modificato."});
}