// In-memory idempotency primitive for isolated tests/prototypes only.
// Production requires durable, transactional coordination across instances.
import {createHash} from "node:crypto";
export function createIdempotencyStore({ttlMs=300000,maxEntries=1000}={}){
 if(!Number.isInteger(ttlMs)||ttlMs<1||!Number.isInteger(maxEntries)||maxEntries<1)throw new Error("invalid-idempotency-config");
 const entries=new Map();
 function prune(now){for(const [k,v] of entries)if(v.expiresAt<=now)entries.delete(k);while(entries.size>maxEntries){const oldest=entries.keys().next().value;entries.delete(oldest);}}
 return Object.freeze({async execute({tenantId,requestId,payload},operation){
  if(typeof tenantId!=="string"||!tenantId||typeof requestId!=="string"||!requestId||typeof operation!=="function")return{status:400,error:"invalid-idempotency-request"};
  const digest=createHash("sha256").update(JSON.stringify(payload)).digest("hex"),key=tenantId+"\\0"+requestId,now=Date.now();prune(now);
  const existing=entries.get(key);
  if(existing){if(existing.digest!==digest)return{status:409,error:"idempotency-conflict"};return existing.promise;}
  if(entries.size>=maxEntries)return{status:503,error:"idempotency-capacity"};
  const promise=Promise.resolve().then(operation).catch(e=>{entries.delete(key);throw e;});
  entries.set(key,{digest,promise,expiresAt:now+ttlMs});return promise;
 },size:()=>entries.size});
}
