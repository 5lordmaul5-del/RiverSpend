// RC-11 hardened transactional single-file state prototype. No deployment execution.
import {constants as fsConstants} from "node:fs";
import {mkdir,rename,open,unlink,lstat} from "node:fs/promises";
import path from "node:path";
import {randomUUID} from "node:crypto";
const init={schema:1,jobs:[],approvals:[],events:[]};
const MAX_STATE_BYTES=8*1024*1024;
const MAX_STATE_JOBS=5000;
const MAX_STATE_APPROVALS=5000;
const MAX_STATE_EVENTS=10000;
const MAX_STATE_AUDIT_RECORDS=10000;
const MAX_STATE_LIFECYCLE_JOBS=5000;
const MAX_STATE_APPROVAL_EVENTS=10000;

async function assertPrivateDirectory(dir){
 const stat=await lstat(dir);
 if(!stat.isDirectory()||stat.isSymbolicLink())throw new Error("state_directory_not_regular");
 if(typeof process.getuid==="function"&&stat.uid!==process.getuid())throw new Error("state_directory_owner_mismatch");
 if((stat.mode&0o077)!==0)throw new Error("state_directory_permissions_unsafe");
}
async function syncDirectoryHandle(dir){const d=await open(dir,"r");try{await d.sync();}finally{await d.close();}}
function validateState(s){
 if(!s||s.schema!==1||!Array.isArray(s.jobs)||!Array.isArray(s.approvals)||!Array.isArray(s.events))throw new Error("invalid_state_schema");
 for(const collection of [s.jobs,s.approvals,s.events])if(collection.some(item=>!item||typeof item!=="object"||Array.isArray(item)))throw new Error("invalid_state_record");
 if(s.jobs.length>MAX_STATE_JOBS||s.approvals.length>MAX_STATE_APPROVALS||s.events.length>MAX_STATE_EVENTS)throw new Error("state_collection_capacity_exceeded");
 for(const [name,limit] of [["auditLogRecords",MAX_STATE_AUDIT_RECORDS],["lifecycleJobs",MAX_STATE_LIFECYCLE_JOBS],["approvalEvents",MAX_STATE_APPROVAL_EVENTS]])if(Array.isArray(s[name])&&s[name].length>limit)throw new Error("state_extension_capacity_exceeded");
}
async function readBounded(handle,limit){
 const chunks=[];let total=0;const buffer=Buffer.allocUnsafe(64*1024);
 while(total<=limit){
  const length=Math.min(buffer.length,limit-total+1);
  const {bytesRead}=await handle.read(buffer,0,length,null);
  if(bytesRead===0)break;
  total+=bytesRead;
  if(total>limit)throw new Error("state_file_too_large");
  chunks.push(Buffer.from(buffer.subarray(0,bytesRead)));
 }
 return Buffer.concat(chunks,total);
}
async function unlinkOwnedLock(lock,identity){
 if(!identity)return false;
 try{
  const current=await lstat(lock);
  if(!current.isFile()||current.dev!==identity.dev||current.ino!==identity.ino)return false;
  await unlink(lock);return true;
 }catch(e){if(e.code==="ENOENT")return false;throw e;}
}
export async function readState(file){
 let handle;
 try{
  if(typeof fsConstants.O_NOFOLLOW!=="number"||typeof fsConstants.O_NONBLOCK!=="number")throw new Error("state_file_safe_open_unavailable");
  handle=await open(file,fsConstants.O_RDONLY|fsConstants.O_NOFOLLOW|fsConstants.O_NONBLOCK);
  const stat=await handle.stat();
  if(!stat.isFile())throw new Error("state_file_not_regular");
  if(typeof process.getuid==="function"&&stat.uid!==process.getuid())throw new Error("state_file_owner_mismatch");
  if((stat.mode&0o077)!==0)throw new Error("state_file_permissions_unsafe");
  await assertPrivateDirectory(path.dirname(file));
  if(stat.size>MAX_STATE_BYTES)throw new Error("state_file_too_large");
  const raw=await readBounded(handle,MAX_STATE_BYTES);
  const s=JSON.parse(raw.toString("utf8"));
  validateState(s);
  return s;
 }catch(e){
  if(e.code==="ENOENT")return structuredClone(init);
  if(e.code==="ELOOP")throw new Error("state_file_symlink_rejected");
  throw e;
 }finally{if(handle)await handle.close().catch(()=>{});}
}
export async function transactState(file,mutator,{lockTimeoutMs=3000,syncDirectory=syncDirectoryHandle}={}){
 if(!Number.isSafeInteger(lockTimeoutMs)||lockTimeoutMs<100||lockTimeoutMs>10000)throw new Error("invalid_lock_timeout");if(typeof syncDirectory!=="function")throw new Error("invalid_directory_sync");
 const dir=path.dirname(file);await mkdir(dir,{recursive:true,mode:0o700});await assertPrivateDirectory(dir);const lock=file+".lock";let handle,lockStat;
 const start=Date.now();while(!handle){try{handle=await open(lock,"wx",0o600);lockStat=await handle.stat();await handle.writeFile(JSON.stringify({pid:process.pid,createdAt:new Date().toISOString()}));await handle.sync();}catch(e){if(handle){await unlinkOwnedLock(lock,lockStat).catch(()=>{});await handle.close().catch(()=>{});handle=null;lockStat=null;}if(e.code!=="EEXIST")throw e;if(Date.now()-start>lockTimeoutMs)throw new Error("state_lock_timeout");await new Promise(r=>setTimeout(r,25));}}
 let temp;
 try{
  const state=await readState(file);validateState(state);const result=await mutator(state);
  // Validate the post-mutation snapshot before it can be persisted.
  validateState(state);
  const serialized=Buffer.from(JSON.stringify(state,null,2));
  if(serialized.byteLength>MAX_STATE_BYTES)throw new Error("state_file_too_large");
  temp=file+".tmp-"+process.pid+"-"+randomUUID();const t=await open(temp,"wx",0o600);try{await t.writeFile(serialized);await t.sync();}finally{await t.close();}
  await rename(temp,file);temp=null;try{await syncDirectory(dir);}catch(cause){const error=new Error("state_commit_durability_uncertain",{cause});error.code="state_commit_durability_uncertain";error.commitApplied=true;throw error;}return result;
 }finally{if(temp)await unlink(temp).catch(()=>{});try{await unlinkOwnedLock(lock,lockStat);}finally{await handle.close();}}
}
export async function addJob(file,job){if(!job||typeof job.id!=="string"||!job.id)throw new Error("invalid_job");return transactState(file,state=>{if(state.jobs.some(j=>j.id===job.id))throw new Error("job_exists");state.jobs.push({...job,state:"pending"});state.events.push({event:"job_created",jobId:job.id,at:new Date().toISOString()});return job.id;});}
export async function setJobState(file,id,to,allowed){return transactState(file,state=>{const job=state.jobs.find(j=>j.id===id);if(!job)throw new Error("job_not_found");if(typeof allowed!=="function"||!allowed(job.state,to))throw new Error("transition_not_allowed");const from=job.state;job.state=to;job.updatedAt=new Date().toISOString();state.events.push({event:"job_state_changed",jobId:id,from,to,at:new Date().toISOString()});return job;});}
export async function storeApproval(file,record){if(!record||typeof record.tokenId!=="string"||!record.tokenId||typeof record.jobId!=="string"||!Number.isFinite(record.expiresAt))throw new Error("invalid_approval");return transactState(file,state=>{if(state.approvals.some(a=>a.tokenId===record.tokenId))throw new Error("approval_exists");state.approvals.push({...record,used:false});state.events.push({event:"approval_issued",jobId:record.jobId,at:new Date().toISOString()});return record.tokenId;});}
export async function consumeStoredApproval(file,tokenId,bindingVerifier){if(typeof bindingVerifier!=="function")throw new Error("invalid_binding_verifier");return transactState(file,state=>{const a=state.approvals.find(x=>x.tokenId===tokenId);if(!a||a.used)throw new Error("approval_missing_or_used");if(a.expiresAt<Date.now())throw new Error("approval_expired");if(!bindingVerifier(a))throw new Error("approval_binding_mismatch");a.used=true;state.events.push({event:"approval_consumed",jobId:a.jobId,at:new Date().toISOString()});return a.jobId;});}

