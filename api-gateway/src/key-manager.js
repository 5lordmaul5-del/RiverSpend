import {createHash,randomBytes,randomUUID,timingSafeEqual} from "node:crypto";
const ALLOWED_SCOPES=Object.freeze(["api.read","api.write","inference","scheduler.read","scheduler.write","rivercloud.read","signals.read","shop.read","shop.write","admin"]);
const MAX_KEYS=1000,MAX_AUDIT=5000,MAX_SCOPES=20,MAX_TENANT=128,MAX_CREATED_BY=128;
const MAX_QUOTA=100000,MAX_RATE=10000,MAX_WINDOW=86400000;
const hashKey=key=>createHash("sha256").update(key).digest();
function safeRecord(r){return{keyId:r.keyId,tenantId:r.tenantId,scopes:[...r.scopes],createdAt:r.createdAt,createdBy:r.createdBy,expiresAt:r.expiresAt,quota:r.quota,quotaUsed:r.quotaUsed,quotaRemaining:Math.max(0,r.quota-r.quotaUsed),rateLimit:r.rateLimit,windowMs:r.windowMs,windowStart:r.windowStart,windowCount:r.windowCount,lastUsedAt:r.lastUsedAt,revoked:r.revoked,revokedAt:r.revokedAt,revokedBy:r.revokedBy};}
function validateTenant(tenantId){if(typeof tenantId!=="string"||!tenantId.trim()||tenantId.length>MAX_TENANT)throw new Error("invalid-tenant");return tenantId.trim();}
function validateScopes(scopes){if(!Array.isArray(scopes)||!scopes.length||scopes.length>MAX_SCOPES)throw new Error("invalid-scopes");const unique=[...new Set(scopes)];if(unique.length!==scopes.length||unique.some(s=>typeof s!=="string"||!ALLOWED_SCOPES.includes(s)))throw new Error("invalid-scopes");return unique;}
function validateLimit(value,min,max,name){if(!Number.isInteger(value)||value<min||value>max)throw new Error("invalid-"+name);return value;}
export class APIKeyManager{
 #records=new Map();#audit=[];
 constructor({maxKeys=MAX_KEYS,maxAudit=MAX_AUDIT}={}){if(!Number.isInteger(maxKeys)||maxKeys<1||maxKeys>MAX_KEYS||!Number.isInteger(maxAudit)||maxAudit<1||maxAudit>MAX_AUDIT)throw new Error("invalid-manager-limits");this.maxKeys=maxKeys;this.maxAudit=maxAudit;}
 #event(action,{keyId=null,tenantId=null,reason=null,details=null,now=Date.now()}={}){const event={id:randomUUID(),action,keyId,tenantId,reason,timestamp:new Date(now).toISOString(),details};this.#audit.push(event);if(this.#audit.length>this.maxAudit)this.#audit.shift();}
 #prune(now){for(const [id,r] of this.#records){if(r.revoked||(r.expiresAt!==null&&now>=r.expiresAt))this.#records.delete(id);}}
 #findHash(candidate){let found=null;for(const r of this.#records.values()){const equal=r.hash.length===candidate.length&&timingSafeEqual(r.hash,candidate);if(equal)found=r;}return found;}
 createKey({tenantId,scopes,quota=1000,rateLimit=100,windowMs=60000,expiresAt=null,createdBy="local-owner",now=Date.now()}={}){
  const tenant=validateTenant(tenantId),scopeList=validateScopes(scopes);validateLimit(quota,1,MAX_QUOTA,"quota");validateLimit(rateLimit,1,MAX_RATE,"rate-limit");validateLimit(windowMs,1000,MAX_WINDOW,"window-ms");
  if(!Number.isSafeInteger(now)||now<0)throw new Error("invalid-now");
  if(expiresAt!==null&&(!Number.isSafeInteger(expiresAt)||expiresAt<=now))throw new Error("invalid-expiry");
  if(typeof createdBy!=="string"||!createdBy.trim()||createdBy.length>MAX_CREATED_BY)throw new Error("invalid-created-by");
  this.#prune(now);if(this.#records.size>=this.maxKeys)throw new Error("key-store-full");
  const key="rs_api_"+randomBytes(32).toString("base64url"),keyId=randomUUID(),hash=hashKey(key);
  const record={keyId,tenantId:tenant,scopes:scopeList,createdAt:new Date(now).toISOString(),createdBy:createdBy.trim(),expiresAt,quota,quotaUsed:0,rateLimit,windowMs,windowStart:now,windowCount:0,lastUsedAt:null,revoked:false,revokedAt:null,revokedBy:null,hash};
  this.#records.set(keyId,record);this.#event("key-created",{keyId,tenantId:tenant,details:{scopes:scopeList,quota,rateLimit,windowMs,expiresAt},now});
  return{keyId,key,record:safeRecord(record)};
 }
 validate({key,tenantId,scope,now=Date.now()}={}){
  if(typeof key!=="string"||!key.startsWith("rs_api_")||key.length>100)return{allowed:false,reason:"unauthorized"};
  let tenant;try{tenant=validateTenant(tenantId);}catch{return{allowed:false,reason:"invalid-tenant"};}
  if(typeof scope!=="string"||!ALLOWED_SCOPES.includes(scope))return{allowed:false,reason:"invalid-scope"};
  if(!Number.isSafeInteger(now)||now<0)return{allowed:false,reason:"invalid-now"};
  const record=this.#findHash(hashKey(key));
  if(!record){this.#event("key-denied",{tenantId:tenant,reason:"unauthorized",now});return{allowed:false,reason:"unauthorized"};}
  const deny=reason=>{this.#event("key-denied",{keyId:record.keyId,tenantId:tenant,reason,now});return{allowed:false,reason};};
  if(record.tenantId!==tenant)return deny("tenant-mismatch");
  if(record.revoked)return deny("revoked");
  if(record.expiresAt!==null&&now>=record.expiresAt)return deny("expired");
  if(!record.scopes.includes(scope))return deny("scope-denied");
  if(now<record.windowStart)return deny("clock-rollback");
  if(now-record.windowStart>=record.windowMs){record.windowStart=now;record.windowCount=0;}
  if(record.quotaUsed>=record.quota)return deny("quota-exceeded");
  if(record.windowCount>=record.rateLimit)return deny("rate-limited");
  record.windowCount++;record.quotaUsed++;record.lastUsedAt=new Date(now).toISOString();
  this.#event("key-used",{keyId:record.keyId,tenantId:tenant,details:{scope,quotaRemaining:record.quota-record.quotaUsed,rateRemaining:record.rateLimit-record.windowCount},now});
  return{allowed:true,keyId:record.keyId,tenantId:record.tenantId,scope,scopes:[...record.scopes],quotaRemaining:record.quota-record.quotaUsed,rateRemaining:record.rateLimit-record.windowCount};
 }
 revoke(keyId,{tenantId,revokedBy="local-owner",now=Date.now()}={}){
  const tenant=validateTenant(tenantId),record=this.#records.get(keyId);if(!record||record.tenantId!==tenant)throw new Error("key-not-found");
  if(typeof revokedBy!=="string"||!revokedBy.trim()||revokedBy.length>MAX_CREATED_BY)throw new Error("invalid-revoked-by");
  if(record.revoked)return safeRecord(record);record.revoked=true;record.revokedAt=new Date(now).toISOString();record.revokedBy=revokedBy.trim();this.#event("key-revoked",{keyId,tenantId:tenant,now});return safeRecord(record);
 }
 rotate(keyId,{tenantId,rotatedBy="local-owner",now=Date.now()}={}){
  const tenant=validateTenant(tenantId),old=this.#records.get(keyId);if(!old||old.tenantId!==tenant)throw new Error("key-not-found");if(old.revoked||old.expiresAt!==null&&now>=old.expiresAt)throw new Error("key-not-rotatable");
  const next=this.createKey({tenantId:tenant,scopes:old.scopes,quota:old.quota,rateLimit:old.rateLimit,windowMs:old.windowMs,expiresAt:old.expiresAt,createdBy:rotatedBy,now});
  old.revoked=true;old.revokedAt=new Date(now).toISOString();old.revokedBy=rotatedBy;this.#event("key-rotated",{keyId:old.keyId,tenantId:tenant,details:{newKeyId:next.keyId},now});return next;
 }
 listKeys(tenantId){const tenant=validateTenant(tenantId);return[...this.#records.values()].filter(r=>r.tenantId===tenant).map(safeRecord);}
 auditEvents({tenantId,limit=100}={}){const tenant=validateTenant(tenantId);validateLimit(limit,1,500,"audit-limit");return this.#audit.filter(e=>e.tenantId===tenant).slice(-limit).map(e=>({...e,details:e.details===null?null:structuredClone(e.details)}));}
 get stats(){return{keyCount:this.#records.size,auditCount:this.#audit.length,maxKeys:this.maxKeys,maxAudit:this.maxAudit,storage:"memory-only"};}
}
export {ALLOWED_SCOPES};
