// API-RC-136: planning-only RiverSSAI mock orchestrator; no agent process is launched.
import {createHash} from "node:crypto";
import {verifyApiKey} from "./api-key-core.mjs";
import {validateAgentRegistry} from "./agent-registry-core.mjs";

const REQUEST_ID=/^[A-Za-z0-9._:-]{1,128}$/;
const IDEMPOTENCY=/^[A-Za-z0-9._:-]{16,128}$/;
const MAX_INPUT_BYTES=8192;
function plainObject(value){return !!value&&typeof value==="object"&&!Array.isArray(value)&&(Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null);}
function canonical(value){
  if(value===null||typeof value==="string"||typeof value==="boolean")return JSON.stringify(value);
  if(typeof value==="number"){if(!Number.isFinite(value))throw new Error("input_number_invalid");return JSON.stringify(value);}
  if(Array.isArray(value))return "["+value.map(canonical).join(",")+"]";
  if(plainObject(value)){const keys=Object.keys(value).sort();if(keys.some(k=>["__proto__","constructor","prototype"].includes(k)))throw new Error("input_key_invalid");return "{"+keys.map(k=>JSON.stringify(k)+":"+canonical(value[k])).join(",")+"}";}
  throw new Error("input_value_invalid");
}
function inputMatchesSchema(input,schema){
  if(!plainObject(input)||!plainObject(schema)||schema.type!=="object"||schema.additionalProperties!==false||!plainObject(schema.properties)||!Array.isArray(schema.required))return false;
  const keys=Object.keys(input),allowed=Object.keys(schema.properties);
  if(keys.some(k=>!allowed.includes(k))||schema.required.some(k=>!Object.hasOwn(input,k)))return false;
  for(const key of keys){
    const type=schema.properties[key]?.type,value=input[key];
    if(type==="string"&&typeof value!=="string")return false;
    if(type==="number"&&(typeof value!=="number"||!Number.isFinite(value)))return false;
    if(type==="integer"&&(typeof value!=="number"||!Number.isSafeInteger(value)))return false;
    if(type==="boolean"&&typeof value!=="boolean")return false;
    if(type==="array"&&!Array.isArray(value))return false;
    if(type==="object"&&!plainObject(value))return false;
  }
  return true;
}
function digestInput(input){return createHash("sha256").update("river-ssai-input-v1\0").update(canonical(input)).digest("hex");}

export function createRiverSSAIOrchestrator({definitions=[],maxIdempotencyEntries=5000,approvalVerifier=()=>false}={}){
  const validation=validateAgentRegistry(definitions);
  if(!validation.valid)throw new Error("registry_invalid:"+validation.reason);
  if(!Number.isSafeInteger(maxIdempotencyEntries)||maxIdempotencyEntries<1||maxIdempotencyEntries>100000||typeof approvalVerifier!=="function")throw new Error("orchestrator_options_invalid");
  const registry=new Map(definitions.map(d=>[d.id,d]));
  const idempotency=new Map();
  return Object.freeze({
    async planInvoke({key,record,agentId,version,input,requestId,idempotencyKey,approvalToken,now=Date.now()}={}){
      if(typeof requestId!=="string"||!REQUEST_ID.test(requestId))return {status:400,error:"request_id_required"};
      if(typeof idempotencyKey!=="string"||!IDEMPOTENCY.test(idempotencyKey))return {status:400,error:"idempotency_key_required"};
      const auth=verifyApiKey(key,record,{now,requiredScope:"ai:invoke"});
      if(!auth.valid)return {status:auth.reason==="scope_denied"?403:401,error:auth.reason};
      if(typeof agentId!=="string"||typeof version!=="string")return {status:400,error:"agent_reference_invalid"};
      const definition=registry.get(agentId);
      if(!definition||definition.version!==version)return {status:404,error:"agent_not_found"};
      if(definition.status!=="active")return {status:409,error:"agent_not_active"};
      if(!inputMatchesSchema(input,definition.inputSchema))return {status:400,error:"input_schema_invalid"};
      let serialized;try{serialized=canonical(input);}catch{return {status:400,error:"input_invalid"};}
      if(Buffer.byteLength(serialized)>MAX_INPUT_BYTES)return {status:413,error:"input_too_large"};
      const inputDigest=digestInput(input);
      const idempotencyId=auth.keyId+":"+agentId+":"+version+":"+idempotencyKey;
      const existing=idempotency.get(idempotencyId);
      if(existing)return existing.inputDigest===inputDigest?{status:202,duplicate:true,plan:existing.plan}:{status:409,error:"idempotency_conflict"};
      if(idempotency.size>=maxIdempotencyEntries)return {status:503,error:"idempotency_capacity_exceeded"};
      let approvalVerified=false;
      if(definition.requiresApproval){
        if(typeof approvalToken!=="string"||approvalToken.length<16||approvalToken.length>256)return {status:403,error:"approval_required"};
        const binding={keyId:auth.keyId,ownerId:auth.ownerId,agentId,version,inputDigest,requestId,idempotencyKey};
        try{approvalVerified=await approvalVerifier({token:approvalToken,binding})===true;}catch{approvalVerified=false;}
        if(!approvalVerified)return {status:403,error:"approval_not_verified"};
      }
      const plan=Object.freeze({status:"accepted_mock",requestId,agentId,version,inputDigest,riskClass:definition.riskClass,requiresApproval:definition.requiresApproval,approvalVerified,maxRunSeconds:definition.maxRunSeconds,maxConcurrency:definition.maxConcurrency,executionEnabled:false});
      idempotency.set(idempotencyId,{inputDigest,plan});
      return {status:202,duplicate:false,plan};
    },
    getIdempotencyCount(){return idempotency.size;},
    getDefinitionCount(){return registry.size;}
  });
}
