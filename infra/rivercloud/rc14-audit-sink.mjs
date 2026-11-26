// RC-14: external audit sink contract prototype. No network calls are performed.
import { createHmac, createHash, timingSafeEqual, randomBytes } from "node:crypto";
const ALLOWED = new Set(["job_created","job_transition","approval_created","approval_used","auth_denied","auth_granted","policy_denied","system_event"]);
const SENSITIVE_KEYS = /password|secret|token|authorization|cookie|private.?key|credential|api.?key/i;
const HASH = /^[a-f0-9]{64}$/i;
const MAX_BODY = 64 * 1024;
export function redact(value, depth=0) {
 if(depth>8) return "[depth-limit]";
 if(Array.isArray(value)) return value.slice(0,100).map(v=>redact(v,depth+1));
 if(value && typeof value === "object") { const out=Object.create(null); for(const [k,v] of Object.entries(value).slice(0,100)) out[k]=SENSITIVE_KEYS.test(k)?"[redacted]":redact(v,depth+1); return out; }
 if(typeof value === "string") return value.length>4000?value.slice(0,4000)+"[truncated]":value;
 if(typeof value === "number" || typeof value === "boolean" || value===null) return value;
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
 if(!event||typeof event!=="object"||Array.isArray(event)||!ALLOWED.has(event.type)) throw new Error("unsupported_event_type");
 const context={sinkId,actor,occurredAt,previousHash};
 if(!validContext(context)) throw new Error("invalid_context");
 if(event.data!==undefined&&event.data!==null&&(typeof event.data!=="object"||Array.isArray(event.data))) throw new Error("audit_data_must_be_object");
 const payload={schema:"rivercloud.audit.v1",sinkId,actor,occurredAt,type:event.type,data:redact(event.data??{}),previousHash};
 const canonical=JSON.stringify(payload);
 return {...payload,hash:createHash("sha256").update(canonical).digest("hex")};
}
export function verifyAuditEnvelope(envelope) {
 if(!envelope||typeof envelope!=="object"||Array.isArray(envelope)||!["schema","sinkId","actor","occurredAt","type","data","previousHash","hash"].every(k=>Object.hasOwn(envelope,k))||Object.keys(envelope).some(k=>!["schema","sinkId","actor","occurredAt","type","data","previousHash","hash"].includes(k))||envelope.schema!=="rivercloud.audit.v1"||!ALLOWED.has(envelope.type)) return {valid:false,reason:"invalid_envelope"};
 if(!validContext(envelope)||!envelope.data||typeof envelope.data!=="object"||Array.isArray(envelope.data)||!HASH.test(envelope.hash??"")) return {valid:false,reason:"invalid_envelope_fields"};
 if(JSON.stringify(redact(envelope.data))!==JSON.stringify(envelope.data)) return {valid:false,reason:"data_not_redacted"};
 const expected=createHash("sha256").update(JSON.stringify(payloadOf(envelope))).digest();
 const actual=Buffer.from(envelope.hash,"hex");
 return actual.length===expected.length&&timingSafeEqual(actual,expected)?{valid:true}:{valid:false,reason:"hash_mismatch"};
}
function validEndpoint(endpoint) {
 try { const u=new URL(endpoint); return u.protocol==="https:"&&!!u.hostname&&!u.username&&!u.password&&!u.hash&&!u.search; }
 catch { return false; }
}
export function buildSignedDelivery(envelope,{endpoint,secret,now=Date.now()}={}) {
 if(!validEndpoint(endpoint)) throw new Error("https_endpoint_required");
 const verified=verifyAuditEnvelope(envelope);
 if(!verified.valid) throw new Error("invalid_audit_envelope");
 if(typeof secret!=="string"||secret.length<32) throw new Error("signing_secret_too_short");
 if(!Number.isSafeInteger(now)||now<0) throw new Error("invalid_delivery_timestamp");
 const timestamp=String(now),nonce=randomBytes(16).toString("hex"),body=JSON.stringify(envelope);
 if(Buffer.byteLength(body)>MAX_BODY) throw new Error("audit_envelope_too_large");
 const signature=createHmac("sha256",secret).update(timestamp+"."+nonce+"."+body).digest("hex");
 return {method:"POST",endpoint,headers:{"content-type":"application/json","x-rivercloud-audit-timestamp":timestamp,"x-rivercloud-audit-nonce":nonce,"x-rivercloud-audit-signature":"sha256="+signature},body};
}
export async function verifySignedDelivery(delivery,{secret,now=Date.now(),maxSkewMs=300000,consumeReplay}={}) {
 if(!delivery||typeof delivery!=="object"||delivery.method!=="POST"||!validEndpoint(delivery.endpoint)||typeof delivery.body!=="string"||Buffer.byteLength(delivery.body)>MAX_BODY) return {valid:false,reason:"invalid_delivery"};
 if(typeof secret!=="string"||secret.length<32||!Number.isSafeInteger(now)||!Number.isSafeInteger(maxSkewMs)||maxSkewMs<1000||maxSkewMs>600000||typeof consumeReplay!=="function") return {valid:false,reason:"invalid_verifier_config"};
 if(typeof delivery.endpoint!=="string"||typeof delivery.body!=="string")return {valid:false,reason:"invalid_delivery"};const headers=delivery.headers;if(!headers||typeof headers!=="object"||Array.isArray(headers))return {valid:false,reason:"invalid_headers"};if(!Object.hasOwn(headers,"x-rivercloud-audit-timestamp")||!Object.hasOwn(headers,"x-rivercloud-audit-nonce")||!Object.hasOwn(headers,"x-rivercloud-audit-signature"))return {valid:false,reason:"invalid_headers"};if(!Object.hasOwn(headers,"content-type")||headers["content-type"]!=="application/json")return {valid:false,reason:"invalid_content_type"};const headerKeys=Object.keys(headers);if(headerKeys.length!==4||headerKeys.some(k=>!["content-type","x-rivercloud-audit-timestamp","x-rivercloud-audit-nonce","x-rivercloud-audit-signature"].includes(k)))return {valid:false,reason:"unexpected_headers"};const timestamp=headers["x-rivercloud-audit-timestamp"],nonce=headers["x-rivercloud-audit-nonce"],signature=headers["x-rivercloud-audit-signature"];
 if(typeof timestamp!=="string"||!/^\d{1,16}$/.test(timestamp)||Math.abs(now-Number(timestamp))>maxSkewMs) return {valid:false,reason:"timestamp_out_of_window"};
 if(typeof nonce!=="string"||! /^[a-f0-9]{32}$/i.test(nonce)) return {valid:false,reason:"invalid_nonce"};
 if(typeof signature!=="string"||!/^sha256=[a-f0-9]{64}$/i.test(signature)) return {valid:false,reason:"invalid_signature"};
 let envelope;try{envelope=JSON.parse(delivery.body);}catch{return {valid:false,reason:"invalid_body"};}if(JSON.stringify(envelope)!==delivery.body)return {valid:false,reason:"noncanonical_body"};
 const envelopeCheck=verifyAuditEnvelope(envelope);if(!envelopeCheck.valid)return envelopeCheck;
 const expected=createHmac("sha256",secret).update(timestamp+"."+nonce+"."+delivery.body).digest();
 const actual=Buffer.from(signature.slice(7),"hex");
 if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return {valid:false,reason:"signature_mismatch"};
 try {
  const accepted=await consumeReplay({nonce,timestamp:Number(timestamp),sinkId:envelope.sinkId,envelopeHash:envelope.hash});
  if(accepted!==true)return {valid:false,reason:"replay_rejected"};
 } catch { return {valid:false,reason:"replay_store_error"}; }
 return {valid:true,envelopeHash:envelope.hash};
}
