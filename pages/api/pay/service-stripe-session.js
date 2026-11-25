import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
export default async function handler(req,res){
 res.setHeader("Cache-Control","no-store, max-age=0");
 if(req.method!=="POST"){res.setHeader("Allow","POST");return res.status(405).end();}
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,pub=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,secret=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_SECRET_KEY,key=process.env.RIVERPAY_STRIPE_SECRET_KEY;
 if(process.env.RIVERPAY_STRIPE_TEST_MODE!=="true"||!key?.startsWith("sk_test_"))return res.status(503).json({error:"Checkout test non configurato."});
 if(!url||!pub||!secret)return res.status(503).json({error:"Server non configurato."});
 const authHeader=req.headers.authorization||"",token=authHeader.startsWith("Bearer ")?authHeader.slice(7):"";if(!token)return res.status(401).json({error:"Sessione richiesta."});
 const {intentId}=req.body||{};if(typeof intentId!=="string")return res.status(400).json({error:"intentId non valido."});
 try{
 const auth=createClient(url,pub,{auth:{persistSession:false,autoRefreshToken:false}}),{data,error}=await auth.auth.getUser(token);if(error||!data?.user)return res.status(401).json({error:"Sessione non valida."});
 const db=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}}),uid=data.user.id;
 const {data:intent,error:ie}=await db.from("riverpay_service_intents").select("id,user_id,item_code,service_code,amount_minor,currency,status,provider_payment_id,metadata").eq("id",intentId).maybeSingle();if(ie)throw ie;if(!intent)return res.status(404).json({error:"Intenzione non trovata."});if(intent.user_id!==uid)return res.status(403).json({error:"Accesso negato."});if(intent.status!=="pending")return res.status(409).json({error:"Intenzione non pagabile."});
 const stripe=new Stripe(key);
 if(intent.provider_payment_id){const prev=await stripe.checkout.sessions.retrieve(intent.provider_payment_id);if(prev.status==="open"&&prev.url)return res.status(200).json({url:prev.url,sessionId:prev.id,reused:true,testOnly:true});if(prev.status!=="expired")return res.status(409).json({error:"Sessione esistente: verifica lo stato prima di riprovare."});}
 const site=process.env.NEXT_PUBLIC_SITE_URL||"https://www.riverspend.com";
 const session=await stripe.checkout.sessions.create({mode:"payment",payment_method_types:["card"],customer_email:data.user.email||undefined,line_items:[{quantity:1,price_data:{currency:String(intent.currency).toLowerCase(),unit_amount:Number(intent.amount_minor),product_data:{name:"RiverSpend "+intent.service_code+" "+intent.item_code}}}],metadata:{riverpay_service_intent_id:intent.id,user_id:uid,item_code:intent.item_code,service_code:intent.service_code,test_only:"true"},success_url:site+"/servizi/pay/return?status=processing",cancel_url:site+"/servizi/pay/return?status=cancelled"}, {idempotencyKey:"riverpay-service-session:"+intent.id});
 const {error:up}=await db.from("riverpay_service_intents").update({provider:"stripe",provider_payment_id:session.id,metadata:{...(intent.metadata||{}),test_only:true,checkout_session_id:session.id}}).eq("id",intent.id).eq("status","pending");if(up)throw up;
 return res.status(200).json({url:session.url,sessionId:session.id,reused:false,testOnly:true});
 }catch{return res.status(500).json({error:"Checkout servizio test non riuscito."});}
}
