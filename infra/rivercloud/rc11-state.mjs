// RC-11 hardened transactional single-file state prototype. No deployment execution.
import {mkdir,readFile,writeFile,rename,open,unlink,stat} from "node:fs/promises";
import path from "node:path";
import {randomUUID} from "node:crypto";
const init={schema:1,jobs:[],approvals:[],events:[]};
function validateState(s){if(!s||s.schema!==1||!Array.isArray(s.jobs)||!Array.isArray(s.approvals)||!Array.isArray(s.events))throw new Error("invalid_state_schema");}
export async function readState(file){try{const s=JSON.parse(await readFile(file,"utf8"));validateState(s);return s;}catch(e){if(e.code==="ENOENT")return structuredClone(init);throw e;}}
export async function transactState(file,mutator,{lockTimeoutMs=3000}={}){
 if(!Number.isSafeInteger(lockTimeoutMs)||lockTimeoutMs<100||lockTimeoutMs>10000)throw new Error("invalid_lock_timeout");
 const dir=path.dirname(file);await mkdir(dir,{recursive:true,mode:0o700});const lock=file+".lock";let handle;
 const start=Date.now();while(!handle){try{handle=await open(lock,"wx",0o600);await handle.writeFile(JSON.stringify({pid:process.pid,createdAt:new Date().toISOString()}));await handle.sync();}catch(e){if(handle){await handle.close().catch(()=>{});handle=null;}if(e.code!=="EEXIST")throw e;if(Date.now()-start>lockTimeoutMs)throw new Error("state_lock_timeout");await new Promise(r=>setTimeout(r,25));}}
 let temp;
 try{
  const state=await readState(file);validateState(state);const result=await mutator(state);
  temp=file+".tmp-"+process.pid+"-"+randomUUID();const t=await open(temp,"wx",0o600);
  try{await t.writeFile(JSON.stringify(state,null,2));await t.sync();}finally{await t.close();}
  await rename(temp,file);temp=null;
  // Sync directory entry after rename (best-effort on platforms that support it).
  try{const d=await open(dir,"r");try{await d.sync();}finally{await d.close();}}catch{}
  return result;
 }finally{if(temp)await unlink(temp).catch(()=>{});await handle.close();await unlink(lock).catch(()=>{});}
}
export async function addJob(file,job){if(!job||typeof job.id!=="string"||!job.id)throw new Error("invalid_job");return transactState(file,state=>{if(state.jobs.some(j=>j.id===job.id))throw new Error("job_exists");state.jobs.push({...job,state:"pending"});state.events.push({event:"job_created",jobId:job.id,at:new Date().toISOString()});return job.id;});}
export async function setJobState(file,id,to,allowed){return transactState(file,state=>{const job=state.jobs.find(j=>j.id===id);if(!job)throw new Error("job_not_found");if(typeof allowed!=="function"||!allowed(job.state,to))throw new Error("transition_not_allowed");const from=job.state;job.state=to;job.updatedAt=new Date().toISOString();state.events.push({event:"job_state_changed",jobId:id,from,to,at:new Date().toISOString()});return job;});}
export async function storeApproval(file,record){if(!record||typeof record.tokenId!=="string"||!record.tokenId||typeof record.jobId!=="string"||!Number.isFinite(record.expiresAt))throw new Error("invalid_approval");return transactState(file,state=>{if(state.approvals.some(a=>a.tokenId===record.tokenId))throw new Error("approval_exists");state.approvals.push({...record,used:false});state.events.push({event:"approval_issued",jobId:record.jobId,at:new Date().toISOString()});return record.tokenId;});}
export async function consumeStoredApproval(file,tokenId,bindingVerifier){if(typeof bindingVerifier!=="function")throw new Error("invalid_binding_verifier");return transactState(file,state=>{const a=state.approvals.find(x=>x.tokenId===tokenId);if(!a||a.used)throw new Error("approval_missing_or_used");if(a.expiresAt<Date.now())throw new Error("approval_expired");if(!bindingVerifier(a))throw new Error("approval_binding_mismatch");a.used=true;state.events.push({event:"approval_consumed",jobId:a.jobId,at:new Date().toISOString()});return a.jobId;});}
