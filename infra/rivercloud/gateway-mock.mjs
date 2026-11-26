// Mock gateway contract: scoped API keys, bounded bodies and idempotent mock writes only.
import { createHash } from "node:crypto";
import { verifyApiKey } from "./api-key-core.mjs";

export const MOCK_GATEWAY_ROUTES = Object.freeze([
  { method:"GET", path:"/api/v1/rivercloud/jobs", service:"RiverCloud", scope:"cloud:jobs:read" },
  { method:"POST", path:"/api/v1/rivercloud/plan", service:"RiverCloud", scope:"cloud:plan" },
  { method:"GET", path:"/api/v1/agents/registry", service:"RiverSSAI", scope:"registry:read" },
  { method:"POST", path:"/api/v1/agents/invoke", service:"RiverSSAI", scope:"ai:invoke" },
  { method:"GET", path:"/api/v1/signals", service:"Signals", scope:"signals:read" },
  { method:"POST", path:"/api/v1/signals/send", service:"Signals", scope:"signals:send" },
  { method:"GET", path:"/api/v1/shop/catalog", service:"Shop", scope:"shop:catalog:read" },
  { method:"POST", path:"/api/v1/shop/catalog", service:"Shop", scope:"shop:catalog:write" },
  { method:"POST", path:"/api/v1/shop/checkout/mock", service:"Shop", scope:"shop:checkout:mock" }
]);
const ROUTE_MAP = new Map(MOCK_GATEWAY_ROUTES.map(r=>[r.method+" "+r.path,r]));
const MAX_BODY_BYTES = 8192;
const REQUEST_ID = /^[A-Za-z0-9._:-]{1,128}$/;
const IDEMPOTENCY_KEY = /^[A-Za-z0-9._:-]{16,128}$/;

function canonical(value) {
  if (value===null || typeof value==="string" || typeof value==="boolean") return JSON.stringify(value);
  if (typeof value==="number") {
    if (!Number.isFinite(value)) throw new Error("json_number_invalid");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return "["+value.map(canonical).join(",")+"]";
  if (value && typeof value==="object") {
    const proto=Object.getPrototypeOf(value);
    if (proto!==Object.prototype && proto!==null) throw new Error("json_object_invalid");
    const keys=Object.keys(value).sort();
    return "{"+keys.map(k=>JSON.stringify(k)+":"+canonical(value[k])).join(",")+"}";
  }
  throw new Error("json_value_invalid");
}
function digestBody(body) {
  return createHash("sha256").update(canonical(body)).digest("hex");
}
function plainObject(body) {
  return !!body && typeof body==="object" && !Array.isArray(body) &&
    (Object.getPrototypeOf(body)===Object.prototype || Object.getPrototypeOf(body)===null);
}

export function createMockGateway({maxIdempotencyEntries=10000}={}) {
  if (!Number.isSafeInteger(maxIdempotencyEntries) || maxIdempotencyEntries<1 || maxIdempotencyEntries>100000) throw new Error("invalid_idempotency_capacity");
  const idempotency=new Map();
  return Object.freeze({
    handle({key,record,method,path,requestId,idempotencyKey,body,now=Date.now()}={}) {
      if (typeof method!=="string" || typeof path!=="string") return {status:400,error:"invalid_route"};
      const route=ROUTE_MAP.get(method.toUpperCase()+" "+path);
      if (!route) return {status:404,error:"route_not_found"};
      if (typeof requestId!=="string" || !REQUEST_ID.test(requestId)) return {status:400,error:"request_id_required"};
      const auth=verifyApiKey(key,record,{now,requiredScope:route.scope});
      if (!auth.valid) return {status:auth.reason==="scope_denied"?403:401,error:auth.reason};
      if (route.method==="GET") return {status:200,response:{status:"mock",service:route.service,requestId}};
      if (!plainObject(body)) return {status:400,error:"json_object_body_required"};
      let serialized;
      try { serialized=canonical(body); } catch { return {status:400,error:"body_invalid"}; }
      if (Buffer.byteLength(serialized)>MAX_BODY_BYTES) return {status:413,error:"body_too_large"};
      if (typeof idempotencyKey!=="string" || !IDEMPOTENCY_KEY.test(idempotencyKey)) return {status:400,error:"idempotency_key_required"};
      const digest=createHash("sha256").update(serialized).digest("hex");
      const id=auth.keyId+":"+route.path+":"+idempotencyKey;
      const existing=idempotency.get(id);
      if (existing) return existing.digest===digest ? {status:202,duplicate:true,response:existing.response} : {status:409,error:"idempotency_conflict"};
      if (idempotency.size>=maxIdempotencyEntries) return {status:503,error:"idempotency_capacity_exceeded"};
      const response={status:"accepted_mock",service:route.service,requestId,payloadDigest:digest,idempotencyKey};
      idempotency.set(id,{digest,response});
      return {status:202,duplicate:false,response};
    },
    getIdempotencyCount(){return idempotency.size;}
  });
}
