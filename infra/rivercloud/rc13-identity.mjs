// RC-13: strict identity-claim validation prototype. Claims are NOT trusted until a real authentication provider verifies them.
const ROLES=new Set(["owner","admin","operator","auditor","viewer"]);
const PERMISSIONS=new Set(["manage_users","manage_projects","approve_jobs","read_audit","read_status","read_jobs"]);
const MAX_TOKEN_LIFETIME_MS=12*60*60*1000,MAX_SUBJECT_LENGTH=256,MAX_ISSUER_LENGTH=2048,MAX_CLAIMS_BYTES=16384,MAX_CLAIMS_NODES=512,MAX_CLAIMS_DEPTH=16;
const REQUIRED=["issuer","subject","audience","issuedAt","expiresAt","roles"];
const PROTECTED_KEYS=new Set(["__proto__","constructor","prototype"]);

function snapshotJson(value,state,depth=0){
 if(depth>MAX_CLAIMS_DEPTH||++state.nodes>MAX_CLAIMS_NODES)throw new Error("claims_capacity_exceeded");
 if(value===null||typeof value==="boolean")return value;
 if(typeof value==="string"){if(value.length>MAX_CLAIMS_BYTES)throw new Error("claims_string_limit");return value;}
 if(typeof value==="number"){if(!Number.isFinite(value))throw new Error("claims_number_invalid");return value;}
 if(Array.isArray(value)){
  if(value.length>128||Object.getOwnPropertySymbols(value).length)throw new Error("claims_array_invalid");
  const keys=Reflect.ownKeys(value);
  if(keys.length!==value.length+1||!keys.includes("length"))throw new Error("claims_array_invalid");
  const out=[];
  for(let i=0;i<value.length;i++){
   const descriptor=Object.getOwnPropertyDescriptor(value,String(i));
   if(!descriptor||!descriptor.enumerable||!Object.hasOwn(descriptor,"value"))throw new Error("claims_array_invalid");
   out.push(snapshotJson(descriptor.value,state,depth+1));
  }
  return out;
 }
 if(value&&typeof value==="object"){
  const proto=Object.getPrototypeOf(value);
  if(proto!==Object.prototype&&proto!==null)throw new Error("claims_object_invalid");
  if(Object.getOwnPropertySymbols(value).length)throw new Error("claims_object_invalid");
  const keys=Reflect.ownKeys(value);
  if(keys.length>64||keys.some(k=>typeof k!=="string"||PROTECTED_KEYS.has(k)))throw new Error("claims_object_invalid");
  const out=Object.create(null);
  for(const key of keys){
   const descriptor=Object.getOwnPropertyDescriptor(value,key);
   if(!descriptor||!descriptor.enumerable||!Object.hasOwn(descriptor,"value"))throw new Error("claims_object_invalid");
   out[key]=snapshotJson(descriptor.value,state,depth+1);
  }
  return out;
 }
 throw new Error("claims_value_invalid");
}
function snapshotClaims(claims){
 try{
  const safe=snapshotJson(claims,{nodes:0});
  if(!safe||typeof safe!=="object"||Array.isArray(safe))return null;
  if(Buffer.byteLength(JSON.stringify(safe))>MAX_CLAIMS_BYTES)return null;
  return safe;
 }catch{return null;}
}
function audienceMatches(audience,expected){
 if(typeof expected!=="string"||!expected.trim())return false;
 if(typeof audience==="string")return audience===expected;
 if(Array.isArray(audience)&&audience.length>0&&audience.length<=20)return audience.every(v=>typeof v==="string"&&v.length>0)&&audience.includes(expected);
 return false;
}
export function validateIdentityClaims(claims,{now=Date.now(),verifyIssuer=()=>false,expectedIssuer,expectedAudience}={}){
 const safe=snapshotClaims(claims);
 if(!safe)return {ok:false,reason:"invalid_claims"};
 for(const key of REQUIRED)if(!Object.hasOwn(safe,key))return {ok:false,reason:"missing_claim"};
 if(typeof safe.issuer!=="string"||!safe.issuer.trim()||safe.issuer.length>MAX_ISSUER_LENGTH||typeof safe.subject!=="string"||!safe.subject.trim()||safe.subject.length>MAX_SUBJECT_LENGTH)return {ok:false,reason:"invalid_subject"};
 if(typeof expectedIssuer!=="string"||!expectedIssuer.trim()||safe.issuer!==expectedIssuer||!audienceMatches(safe.audience,expectedAudience))return {ok:false,reason:"issuer_or_audience_mismatch"};
 if(!Number.isSafeInteger(now)||!Number.isSafeInteger(safe.issuedAt)||!Number.isSafeInteger(safe.expiresAt)||safe.expiresAt<=now||safe.issuedAt>now+60_000||safe.expiresAt<=safe.issuedAt||safe.expiresAt-safe.issuedAt>MAX_TOKEN_LIFETIME_MS)return {ok:false,reason:"invalid_time_window"};
 if(!Array.isArray(safe.roles)||safe.roles.length===0||safe.roles.length>10||safe.roles.some(role=>typeof role!=="string"||!ROLES.has(role)))return {ok:false,reason:"invalid_roles"};
 if(typeof verifyIssuer!=="function")return {ok:false,reason:"signature_not_verified"};
 let verified=false;try{verified=verifyIssuer(safe)===true;}catch{verified=false;}
 if(!verified)return {ok:false,reason:"signature_not_verified"};
 return {ok:true,actor:{issuer:safe.issuer,subject:safe.subject,audience:safe.audience,roles:[...new Set(safe.roles)]}};
}
export function hasRole(actor,role){return Boolean(actor&&Array.isArray(actor.roles)&&ROLES.has(role)&&actor.roles.includes(role));}
export const RC13_ROLE_POLICY=Object.freeze({owner:["*"],admin:["manage_users","manage_projects","approve_jobs","read_audit","read_status","read_jobs"],operator:["manage_projects","approve_jobs","read_status","read_jobs"],auditor:["read_audit","read_status"],viewer:["read_status"]});
export function hasPermission(actor,permission){if(typeof permission!=="string"||!PERMISSIONS.has(permission)||!actor||!Array.isArray(actor.roles))return false;return actor.roles.some(role=>ROLES.has(role)&&(RC13_ROLE_POLICY[role].includes("*")||RC13_ROLE_POLICY[role].includes(permission)));}
