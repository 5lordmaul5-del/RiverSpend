// RC-14: external audit sink contract prototype. No network calls are performed.
import { createHmac, createHash, timingSafeEqual, randomBytes } from "node:crypto";
const ALLOWED = new Set(["job_created","job_transition","approval_created","approval_used","auth_denied","auth_granted","policy_denied","system_event"]);
const SENSITIVE_KEYS = /password|secret|token|authorization|cookie|private.?key|credential|api.?key/i;
const HASH = /^[a-f0-9]{64}$/i;
const MAX_BODY = 64 * 1024;
const ENVELOPE_KEYS=["schema","sinkId","actor","occurredAt","type","data","previousHash","hash"];

function snapshotObject(value,allowed,exact=true){
 try{
  if(!value||typeof value!=="object"||Array.isArray(value)||(Object.getPrototypeOf(value)!==Object.prototype&&Object.getPrototypeOf(value)!==null)||Object.getOwnPropertySymbols(value).length)return null;
  const keys=Reflect.ownKeys(value);
  if(keys.some(k=>typeof k!=="string"||!allowed.includes(k))||(exact&&keys.length!==allowed.length))return null;
  const out=Object.create(null);
  for(const key of keys){const d=Object.getOwnPropertyDescriptor(value,key);if(!d||!d.enumerable||!Object.hasOwn(d,"value"))return null;out[key]=d.value;}
  return out;
 }catch{return null;}
}
export function redact(value, depth=0, active=new WeakSet()) {
 if(depth>8)return "[depth-limit]";
 if(value===null||typeof value==="boolean")return value;
 if(typeof value==="string")return value.length>4000?value.slice(0,4000)+"[truncated]":value;
 if(typeof value==="number"){if(!Number.isFinite(value))throw new Error("audit_data_number_invalid");return value;}
 if(Array.isArray(value)){
  if(value.length>100||Object.getOwnPropertySymbols(value).length||active.has(value))throw new Error("audit_data_array_invalid");
  const keys=Reflect.ownKeys(value);if(keys.length!==value.length+1||!keys.includes("length"))throw new Error("audit_data_array_invalid");
  const out=[];active.add(value);
  try{for(let i=0;i<value.length;i++){const d=Object.getOwnPropertyDescriptor(value,String(i));if(!d||!d.enumerable||!Object.hasOwn(d,"value"))throw new Error("audit_data_array_invalid");out.push(redact(d.value,depth+1,active));}}finally{active.delete(value);}
  return out;
 }
 if(value&&typeof value==="object"){
  const proto=Object.getPrototypeOf(value);if((proto!==Object.prototype&&proto!==null)||Object.getOwnPropertySymbols(value).length||active.has(value))throw new Error("audit_data_object_invalid");
  const keys=Reflect.ownKeys(value);if(keys.length>100||keys.some(k=>typeof k!=="string"))throw new Error("audit_data_object_capacity_exceeded");
  const out=Object.create(null);active.add(value);
  try{for(const key of keys){const d=Object.getOwnPropertyDescriptor(value,key);if(!d||!d.enumerable||!Object.hasOwn(d,"value"))throw new Error("audit_data_accessor_rejected");out[key]=SENSITIVE_KEYS.test(key)?"[redacted]":redact(d.value,depth+1,active);}}finally{active.delete(value);}
  return out;
 }
 return "[unsupported]";
}
function validContext({sinkId,actor,occurredAt,previousHash}) {
 if(typeof sinkId!=="string"||!sinkId.trim()||sinkId.length>128) return false;
 if(typeof actor!=="string"||!actor.trim()||actor.length>256) return false;
 if(typeof occurredAt!=="string"||!Number.isFinite(Date.parse(occurredAt))||new Date(occurredAt).toISOString()!==occurredAt) return false;
 return previousHash===null||typeof previousHash==="string"&&HASH.test(previousHash);
}
function payloadOf(envelope) {
 return {schema:"rivercloud.audit.v1",sinkId:envelope.sinkId,actor:envelope.actor,occurredAt:envelope.occurredAt,type:envelope.type,data:envelope.data,previousHash:envelope.previousHash};
}
export function createAuditEnvelope(event,{sinkId,actor,occurredAt=new Date().toISOString(),previousHash=null}={}) {
 const safeEvent=snapshotObject(event,["type","data"],false);
 if(!safeEvent||!ALLOWED.has(safeEvent.type))throw new Error("unsupported_event_type");
 const context={sinkId,actor,occurredAt,previousHash};if(!validContext(context))throw new Error("invalid_context");
 if(safeEvent.data!==undefined&&safeEvent.data!==null&&(typeof safeEvent.data!=="object"||Array.isArray(safeEvent.data)))throw new Error("audit_data_must_be_object");
 const payload={schema:"rivercloud.audit.v1",sinkId,actor,occurredAt,type:safeEvent.type,data:redact(safeEvent.data??{}),previousHash};
 const canonical=JSON.stringify(payload);return {...payload,hash:createHash("sha256").update(canonical).digest("hex")};
}
export function verifyAuditEnvelope(envelope) {
 const safe=snapshotObject(envelope,ENVELOPE_KEYS);
 if(!safe||safe.schema!=="rivercloud.audit.v1"||!ALLOWED.has(safe.type))return {valid:false,reason:"invalid_envelope"};
 if(!validContext(safe)||!safe.data||typeof safe.data!=="object"||Array.isArray(safe.data)||!HASH.test(safe.hash??""))return {valid:false,reason:"invalid_envelope_fields"};
 let redacted;try{redacted=redact(safe.data);}catch{return {valid:false,reason:"data_invalid"};}
 if(JSON.stringify(redacted)!==JSON.stringify(safe.data))return {valid:false,reason:"data_not_redacted"};
 const expected=createHash("sha256").update(JSON.stringify(payloadOf(safe))).digest(),actual=Buffer.from(safe.hash,"hex");
 return actual.length===expected.length&&timingSafeEqual(actual,expected)?{valid:true}:{valid:false,reason:"hash_mismatch"};
}
function validEndpoint(endpoint) {
 if(typeof endpoint!=="string")return false;
 try{const u=new URL(endpoint);return u.protocol==="https:"&&!!u.hostname&&!u.username&&!u.password&&!u.hash&&!u.search&&u.href===endpoint;}catch{return false;}
}
export function buildSignedDelivery(envelope,{endpoint,secret,now=Date.now()}={}) {
 if(!validEndpoint(endpoint))throw new Error("https_endpoint_required");
 const verified=verifyAuditEnvelope(envelope);if(!verified.valid)throw new Error("invalid_audit_envelope");
 if(typeof secret!=="string"||secret.length<32)throw new Error("signing_secret_too_short");
 if(!Number.isSafeInteger(now)||now<0)throw new Error("invalid_delivery_timestamp");
 const timestamp=String(now),nonce=randomBytes(16).toString("hex"),body=JSON.stringify(envelope);
 if(Buffer.byteLength(body)>MAX_BODY)throw new Error("audit_envelope_too_large");
 const signature=createHmac("sha256",secret).update(timestamp+"."+nonce+"."+body).digest("hex");
 return {method:"POST",endpoint,headers:{"content-type":"application/json","x-rivercloud-audit-timestamp":timestamp,"x-rivercloud-audit-nonce":nonce,"x-rivercloud-audit-signature":"sha256="+signature},body};
}
export async function verifySignedDelivery(delivery,{secret,now=Date.now(),maxSkewMs=300000,consumeReplay}={}) {
 if(!delivery||typeof delivery!=="object"||Array.isArray(delivery)||Object.keys(delivery).length!==4||["method","endpoint","headers","body"].some(k=>!Object.hasOwn(delivery,k))||Object.keys(delivery).some(k=>!["method","endpoint","headers","body"].includes(k))||delivery.method!=="POST"||!validEndpoint(delivery.endpoint)||typeof delivery.body!=="string"||Buffer.byteLength(delivery.body)>MAX_BODY)return {valid:false,reason:"invalid_delivery"};
 if(typeof secret!=="string"||secret.length<32||!Number.isSafeInteger(now)||now<0||!Number.isSafeInteger(maxSkewMs)||maxSkewMs<1000||maxSkewMs>600000||typeof consumeReplay!=="function")return {valid:false,reason:"invalid_verifier_config"};
 const headers=delivery.headers;if(!headers||typeof headers!=="object"||Array.isArray(headers)||(Object.getPrototypeOf(headers)!==Object.prototype&&Object.getPrototypeOf(headers)!==null))return {valid:false,reason:"invalid_headers"};
 if(!Object.hasOwn(headers,"content-type")||headers["content-type"]!=="application/json")return {valid:false,reason:"invalid_content_type"};
 const headerKeys=Object.keys(headers);if(headerKeys.some(k=>!["content-type","x-rivercloud-audit-timestamp","x-rivercloud-audit-nonce","x-rivercloud-audit-signature"].includes(k)))return {valid:false,reason:"unexpected_headers"};
 if(headerKeys.length!==4||["content-type","x-rivercloud-audit-timestamp","x-rivercloud-audit-nonce","x-rivercloud-audit-signature"].some(k=>!Object.hasOwn(headers,k)))return {valid:false,reason:"invalid_headers"};
 const timestamp=headers["x-rivercloud-audit-timestamp"],nonce=headers["x-rivercloud-audit-nonce"],signature=headers["x-rivercloud-audit-signature"];
 if(typeof timestamp!=="string"||!/^\d{1,16}$/.test(timestamp)||String(Number(timestamp))!==timestamp||!Number.isSafeInteger(Number(timestamp))||Math.abs(now-Number(timestamp))>maxSkewMs)return {valid:false,reason:"timestamp_out_of_window"};
 if(typeof nonce!=="string"||!/^[a-f0-9]{32}$/.test(nonce))return {valid:false,reason:"invalid_nonce"};
 if(typeof signature!=="string"||!/^sha256=[a-f0-9]{64}$/.test(signature))return {valid:false,reason:"invalid_signature"};
 let envelope;try{envelope=JSON.parse(delivery.body);}catch{return {valid:false,reason:"invalid_body"};}
 if(JSON.stringify(envelope)!==delivery.body)return {valid:false,reason:"noncanonical_body"};
 const envelopeCheck=verifyAuditEnvelope(envelope);if(!envelopeCheck.valid)return envelopeCheck;
 const expected=createHmac("sha256",secret).update(timestamp+"."+nonce+"."+delivery.body).digest(),actual=Buffer.from(signature.slice(7),"hex");
 if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return {valid:false,reason:"signature_mismatch"};
 try{const accepted=await consumeReplay({nonce,timestamp:Number(timestamp),sinkId:envelope.sinkId,envelopeHash:envelope.hash});if(accepted!==true)return {valid:false,reason:"replay_rejected"};}catch{return {valid:false,reason:"replay_store_error"};}
 return {valid:true,envelopeHash:envelope.hash};
}
