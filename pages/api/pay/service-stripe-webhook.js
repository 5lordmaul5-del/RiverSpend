import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
export const config={api:{bodyParser:false}};
async function raw(req){const chunks=[];for await(const c of req)chunks.push(Buffer.from(c));return Buffer.concat(chunks);}
export default async function handler(req,res){
 res.setHeader("Cache-Control","no-store, max-age=0");if(req.method!=="POST"){res.setHeader("Allow","POST");return res.status(405).end();}
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,secret=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_SECRET_KEY,key=process.env.RIVERPAY_STRIPE_SECRET_KEY,wh=process.env.RIVERPAY_STRIPE_SERVICE_WEBHOOK_SECRET;
 if(process.env.RIVERPAY_STRIPE_TEST_MODE!=="true"||!key?.startsWith("sk_test_")||!wh||!url||!secret)return res.status(503).json({error:"Webhook servizi test non configurato."});
 const sig=req.headers["stripe-signature"];if(!sig)return res.status(400).json({error:"Firma mancante."});
 let event;try{event=new Stripe(key).webhooks.constructEvent(await raw(req),sig,wh);}catch{return res.status(400).json({error:"Firma webhook non valida."});}
 if(event.livemode===true)return res.status(403).json({error:"Evento live rifiutato."});
 if(event.type!=="checkout.session.completed")return res.status(200).json({received:true,ignored:true});
 const session=event.data.object;if(session.payment_status!=="paid")return res.status(200).json({received:true,ignored:true});
 const intentId=session.metadata?.riverpay_service_intent_id,userId=session.metadata?.user_id;
 if(session.mode!=="payment"||session.metadata?.test_only!=="true"||!intentId||!userId)return res.status(400).json({error:"Metadati test non validi."});
 try{
 const db=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:intent,error:ie}=await db.from("riverpay_service_intents").select("id,user_id,item_code,service_code,status,amount_minor,currency,provider,provider_payment_id,metadata").eq("id",intentId).maybeSingle();if(ie)throw ie;
 if(!intent||intent.user_id!==userId||intent.provider!=="stripe"||intent.provider_payment_id!==session.id)return res.status(409).json({error:"Intenzione non corrispondente."});
 if(String(session.currency||"").toUpperCase()!==intent.currency||Number(session.amount_total)!==Number(intent.amount_minor))return res.status(409).json({error:"Importo o valuta non corrispondenti."});
 const {data:prior,error:pe}=await db.from("riverpay_events").select("id,processed_at").eq("provider","stripe").eq("provider_event_id",event.id).maybeSingle();if(pe)throw pe;if(prior?.processed_at)return res.status(200).json({received:true,duplicate:true});
 if(!prior){const {error:ins}=await db.from("riverpay_events").insert({provider:"stripe",provider_event_id:event.id,event_type:event.type,payload:{service_intent_id:intent.id,checkout_session_id:session.id,amount_total:session.amount_total,currency:session.currency}});if(ins&&ins.code!=="23505")throw ins;}
 if(intent.status!=="paid"){
 const {data:updated,error:ue}=await db.from("riverpay_service_intents").update({status:"paid",metadata:{...(intent.metadata||{}),test_only:true,paid_event_id:event.id,payment_intent:session.payment_intent||null}}).eq("id",intent.id).eq("status","pending").select("id").maybeSingle();if(ue)throw ue;
 if(!updated){const {data:check,error:ce}=await db.from("riverpay_service_intents").select("status,provider_payment_id").eq("id",intent.id).maybeSingle();if(ce)throw ce;if(!check||check.status!=="paid"||check.provider_payment_id!==session.id)throw new Error("State not confirmed");}
 }
 const {error:ent}=await db.from("riverpay_service_entitlements").upsert({user_id:intent.user_id,service_code:intent.service_code,item_code:intent.item_code,service_intent_id:intent.id,status:"active",metadata:{test_only:true,provider:"stripe",session_id:session.id}},{onConflict:"service_intent_id"});if(ent)throw ent;
 const {error:mark}=await db.from("riverpay_events").update({processed_at:new Date().toISOString()}).eq("provider","stripe").eq("provider_event_id",event.id);if(mark)throw mark;
 return res.status(200).json({received:true,testOnly:true,entitlementActivated:true});
 }catch{return res.status(500).json({error:"Errore nel confermare il pagamento di test."});}
}
