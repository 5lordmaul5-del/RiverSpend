// RC-14: external audit sink contract prototype. No network calls are performed.
import { createHmac, createHash } from "node:crypto";
const ALLOWED = new Set(["job_created","job_transition","approval_created","approval_used","auth_denied","auth_granted","policy_denied","system_event"]);
const SENSITIVE_KEYS = /password|secret|token|authorization|cookie|private.?key|credential|api.?key/i;
export function redact(value, depth=0) {
 if(depth>8) return "[depth-limit]";
 if(Array.isArray(value)) return value.slice(0,100).map(v=>redact(v,depth+1));
 if(value && typeof value === "object") { const out={}; for(const [k,v] of Object.entries(value).slice(0,100)) out[k]=SENSITIVE_KEYS.test(k)?"[redacted]":redact(v,depth+1); return out; }
 if(typeof value === "string") return value.length>4000?value.slice(0,4000)+"[truncated]":value;
 if(typeof value === "number" || typeof value === "boolean" || value===null) return value;
 return "[unsupported]";
}
export function createAuditEnvelope(event,{sinkId,actor,occurredAt=new Date().toISOString(),previousHash=null}={}) {
 if(!event || typeof event!="object" || !ALLOWED.has(event.type)) throw new Error("unsupported_event_type");
 if(typeof sinkId!=="string" || !sinkId || typeof actor!=="string" || !actor) throw new Error("missing_context");
 const payload={schema:"rivercloud.audit.v1",sinkId,actor,occurredAt,type:event.type,data:redact(event.data??{}),previousHash};
 const canonical=JSON.stringify(payload); return {...payload,hash:createHash("sha256").update(canonical).digest("hex")};
}
export function buildSignedDelivery(envelope,{endpoint,secret,now=Date.now()}={}) {
 if(typeof endpoint!=="string" || !endpoint.startsWith("https://")) throw new Error("https_endpoint_required");
 if(typeof secret!=="string" || secret.length<32) throw new Error("signing_secret_too_short");
 const timestamp=String(now); const body=JSON.stringify(envelope); const signature=createHmac("sha256",secret).update(timestamp+"."+body).digest("hex");
 return {method:"POST",endpoint,headers:{"content-type":"application/json","x-rivercloud-audit-timestamp":timestamp,"x-rivercloud-audit-signature":"sha256="+signature},body};
}
