// Minimal mockable RiverSSAI ↔ River API gateway facade.
// No HTTP listener, durable storage, or real identity provider is included.
const MAX_TASK=8000, MAX_MODEL=120, MAX_OUTPUT=16000, DEFAULT_TIMEOUT_MS=10000;
const ALLOWED_FIELDS=new Set(["requestId","task","model","maxOutputTokens"]);
const genericDenied=()=>({status:403,error:"request-denied"});
function validId(v){return typeof v==="string"&&v.length>=1&&v.length<=128&&!/[\u0000-\u001f\u007f]/.test(v);}
export function createIntegrationFacade({verifyIdentity,keyManager,provider,audit=()=>{},maxOutputTokens=2048,timeoutMs=DEFAULT_TIMEOUT_MS,quotaStore=null}={}){
 if(quotaStore!==null&&typeof quotaStore.consume!=="function")throw new Error("integration-dependencies-required");\n if(typeof verifyIdentity!=="function"||!keyManager||typeof keyManager.validate!=="function"||!provider||typeof provider.generate!=="function"||typeof audit!=="function"||!Number.isInteger(maxOutputTokens)||maxOutputTokens<1||!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>60000)throw new Error("integration-dependencies-required");
 return Object.freeze({async invoke({authorization,body}={}){
  let identity;
  try{identity=await verifyIdentity(authorization);}catch{return genericDenied();}
  if(!identity||!validId(identity.tenantId)||!validId(identity.actorId))return genericDenied();
  if(!body||typeof body!=="object"||Array.isArray(body)||Object.keys(body).some(k=>!ALLOWED_FIELDS.has(k)))return{status:400,error:"invalid-request"};
  const {requestId,task,model,maxOutputTokens:limit}=body;
  if(!validId(requestId)||typeof task!=="string"||!task.trim()||task.length>MAX_TASK||typeof model!=="string"||!model.trim()||model.length>MAX_MODEL||!Number.isInteger(limit)||limit<1||limit>maxOutputTokens)return{status:400,error:"invalid-request"};
  const key=typeof authorization?.apiKey==="string"?authorization.apiKey:null;
  if(!key)return genericDenied();
  let check;
  try{check=keyManager.validate({key,tenantId:identity.tenantId,scope:"inference"});}catch{return genericDenied();}
  if(!check?.allowed)return genericDenied();\n  if(quotaStore){let quota;try{quota=quotaStore.consume({tenantId:identity.tenantId});}catch{return genericDenied();}if(!quota?.allowed)return{status:429,error:"quota-exceeded",retryAfterMs:Number.isFinite(quota.retryAfterMs)?quota.retryAfterMs:undefined};}
  let outcome="error",durationStart=Date.now();
  try{
   const controller=new AbortController();
   let timer;
   const timeout=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error("provider-timeout"));},timeoutMs);});
   let result;
   try{result=await Promise.race([provider.generate(task,{model:model.trim(),numPredict:limit,signal:controller.signal}),timeout]);}finally{clearTimeout(timer);}
   const output=result?.response??result?.output;
   if(typeof output!=="string"||output.length>MAX_OUTPUT)return{status:502,error:"provider-response-invalid"};
   outcome="success";
   return{status:200,requestId,statusText:"completed",provider:result.provider??provider.name??"adapter",model:result.model??model,output,executionEnabled:false};
  }catch{return{status:502,error:"provider-failure"};}
  finally{
   try{audit({requestId,tenantId:identity.tenantId,actorId:identity.actorId,keyId:check.keyId??null,scope:"inference",outcome,durationMs:Math.max(0,Date.now()-durationStart)});}catch{/* audit sink errors must not leak */ }
  }
 }});
}
