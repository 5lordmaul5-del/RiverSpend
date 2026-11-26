// RC-135: bounded, private file-backed API-key record store (prototype only).
import {constants as fsConstants} from "node:fs";
import {mkdir,open,rename,unlink,lstat} from "node:fs/promises";
import path from "node:path";
import {randomUUID} from "node:crypto";
import {createApiKey,verifyApiKey,revokeApiKey,validateApiKeyRecord,snapshotApiKeyOptions} from "./api-key-core.mjs";

const INIT={schema:1,keys:[]};
const MAX_BYTES=1024*1024;
const MAX_KEYS=5000;
const KEY_ID=/^[a-f0-9]{32}$/;
const KEY_PREFIX=/^rs_test_([a-f0-9]{32})\./;

async function assertDirectoryComponents(dir){
  const absolute=path.resolve(dir),root=path.parse(absolute).root;let current=root;
  for(const part of absolute.slice(root.length).split(path.sep).filter(Boolean)){
    current=path.join(current,part);const st=await lstat(current);
    if(!st.isDirectory()||st.isSymbolicLink())throw new Error("api_key_store_directory_component_invalid");
  }
}
async function assertPrivateDirectory(dir){
  const st=await lstat(dir);
  if(!st.isDirectory()||st.isSymbolicLink())throw new Error("api_key_store_directory_invalid");
  if(typeof process.getuid==="function"&&st.uid!==process.getuid())throw new Error("api_key_store_directory_owner_mismatch");
  if((st.mode&0o077)!==0)throw new Error("api_key_store_directory_permissions_unsafe");
}
function validateSnapshot(s,maxKeys){
  if(!s||s.schema!==1||!Array.isArray(s.keys))throw new Error("api_key_store_invalid_schema");
  if(s.keys.length>maxKeys)throw new Error("api_key_store_capacity_exceeded");
  if(s.keys.some(k=>!validateApiKeyRecord(k)))throw new Error("api_key_store_invalid_record");
  if(new Set(s.keys.map(k=>k.id)).size!==s.keys.length)throw new Error("api_key_store_duplicate_id");
}
async function readBounded(handle,limit){
  const chunks=[];let total=0;const buffer=Buffer.allocUnsafe(64*1024);
  while(total<=limit){
    const length=Math.min(buffer.length,limit-total+1);
    const {bytesRead}=await handle.read(buffer,0,length,null);
    if(bytesRead===0)break;total+=bytesRead;if(total>limit)throw new Error("api_key_store_file_too_large");
    chunks.push(Buffer.from(buffer.subarray(0,bytesRead)));
  }
  return Buffer.concat(chunks,total);
}
async function readSnapshot(file,maxKeys){
  const dir=path.dirname(file);await assertDirectoryComponents(dir);await assertPrivateDirectory(dir);
  let handle;
  try{
    if(typeof fsConstants.O_NOFOLLOW!=="number"||typeof fsConstants.O_NONBLOCK!=="number")throw new Error("api_key_store_safe_open_unavailable");
    handle=await open(file,fsConstants.O_RDONLY|fsConstants.O_NOFOLLOW|fsConstants.O_NONBLOCK);
    const st=await handle.stat();
    if(!st.isFile())throw new Error("api_key_store_file_not_regular");
    if(typeof process.getuid==="function"&&st.uid!==process.getuid())throw new Error("api_key_store_file_owner_mismatch");
    if((st.mode&0o077)!==0)throw new Error("api_key_store_file_permissions_unsafe");
    if(st.size>MAX_BYTES)throw new Error("api_key_store_file_too_large");
    const raw=await readBounded(handle,MAX_BYTES);const snapshot=JSON.parse(raw.toString("utf8"));validateSnapshot(snapshot,maxKeys);return snapshot;
  }catch(e){
    if(e.code==="ENOENT"){await assertDirectoryComponents(dir);await assertPrivateDirectory(dir);return structuredClone(INIT);}
    if(e.code==="ELOOP")throw new Error("api_key_store_file_symlink_rejected");
    throw e;
  }finally{if(handle)await handle.close().catch(()=>{});}
}
async function syncDirectory(dir){const h=await open(dir,"r");try{await h.sync();}finally{await h.close();}}
async function unlinkOwnedLock(lock,identity){
  if(!identity)return false;
  try{const st=await lstat(lock);if(!st.isFile()||st.dev!==identity.dev||st.ino!==identity.ino)return false;await unlink(lock);return true;}
  catch(e){if(e.code==="ENOENT")return false;throw e;}
}
async function acquireLock(lock,timeoutMs){
  const start=Date.now();let handle,identity;
  while(!handle){
    try{handle=await open(lock,"wx",0o600);identity=await handle.stat();await handle.writeFile(JSON.stringify({pid:process.pid,createdAt:new Date().toISOString()}));await handle.sync();}
    catch(e){
      if(handle){await unlinkOwnedLock(lock,identity).catch(()=>{});await handle.close().catch(()=>{});handle=null;identity=null;}
      if(e.code!=="EEXIST")throw e;
      if(Date.now()-start>timeoutMs)throw new Error("api_key_store_lock_timeout");
      await new Promise(r=>setTimeout(r,25));
    }
  }
  return {handle,identity};
}
async function transact(file,mutator,{maxKeys,lockTimeoutMs,syncDirectoryFn}){
  const dir=path.dirname(file);await mkdir(dir,{recursive:true,mode:0o700});await assertDirectoryComponents(dir);await assertPrivateDirectory(dir);
  const lock=file+".lock";const acquired=await acquireLock(lock,lockTimeoutMs);let temp;
  try{
    const snapshot=await readSnapshot(file,maxKeys);const result=await mutator(snapshot);validateSnapshot(snapshot,maxKeys);
    const raw=Buffer.from(JSON.stringify(snapshot,null,2));if(raw.byteLength>MAX_BYTES)throw new Error("api_key_store_file_too_large");
    temp=file+".tmp-"+process.pid+"-"+randomUUID();const t=await open(temp,"wx",0o600);try{await t.writeFile(raw);await t.sync();}finally{await t.close();}
    await rename(temp,file);temp=null;
    try{await syncDirectoryFn(dir);}catch(cause){const error=new Error("api_key_store_commit_durability_uncertain",{cause});error.code="api_key_store_commit_durability_uncertain";error.commitApplied=true;throw error;}
    return result;
  }finally{
    if(temp)await unlink(temp).catch(()=>{});
    try{await unlinkOwnedLock(lock,acquired.identity);}finally{await acquired.handle.close();}
  }
}
function safeMetadata(record){
  return {id:record.id,ownerId:record.ownerId,scopes:[...record.scopes],status:record.status,createdAt:record.createdAt,expiresAt:record.expiresAt};
}

export function createApiKeyStore(file,options){
  const config=snapshotApiKeyOptions(options,["maxKeys","lockTimeoutMs","syncDirectoryFn"],{maxKeys:MAX_KEYS,lockTimeoutMs:3000,syncDirectoryFn:syncDirectory});
  if(typeof file!=="string"||!file||!config)throw new Error("api_key_store_path_required");
  const {maxKeys,lockTimeoutMs,syncDirectoryFn}=config;
  if(!Number.isSafeInteger(maxKeys)||maxKeys<1||maxKeys>MAX_KEYS||!Number.isSafeInteger(lockTimeoutMs)||lockTimeoutMs<100||lockTimeoutMs>10000||typeof syncDirectoryFn!=="function")throw new Error("api_key_store_options_invalid");
  return Object.freeze({
    async create(request){
      const data=snapshotApiKeyOptions(request,["ownerId","scopes","now","ttlMs"],{now:Date.now()});
      if(!data)throw new Error("invalid_api_key_request");
      const generated=createApiKey(data);await transact(file,s=>{if(s.keys.length>=maxKeys)throw new Error("api_key_store_capacity_exceeded");if(s.keys.some(k=>k.id===generated.record.id))throw new Error("api_key_store_duplicate_id");s.keys.push(generated.record);return true;},{maxKeys,lockTimeoutMs,syncDirectoryFn});return generated.key;
    },
    async resolveRecord(key,options){
      const data=snapshotApiKeyOptions(options,["now"],{now:Date.now()});
      if(!data)return {valid:false,reason:"invalid_options"};
      const {now}=data;
      const match=KEY_PREFIX.exec(typeof key==="string"?key:"");if(!match)return {valid:false,reason:"key_id_mismatch"};
      const snapshot=await readSnapshot(file,maxKeys);const record=snapshot.keys.find(k=>k.id===match[1]);if(!record)return {valid:false,reason:"invalid_record"};
      const auth=verifyApiKey(key,record,{now});return auth.valid?{valid:true,record:structuredClone(record)}:auth;
    },
    async verify(key,options){
      const data=snapshotApiKeyOptions(options,["now","requiredScope"],{now:Date.now()});
      if(!data)return {valid:false,reason:"invalid_options"};
      const {now,requiredScope}=data;
      const match=KEY_PREFIX.exec(typeof key==="string"?key:"");if(!match)return {valid:false,reason:"key_id_mismatch"};
      const snapshot=await readSnapshot(file,maxKeys);const record=snapshot.keys.find(k=>k.id===match[1]);if(!record)return {valid:false,reason:"invalid_record"};return verifyApiKey(key,record,{now,requiredScope});
    },
    async revoke(id){
      if(typeof id!=="string"||!KEY_ID.test(id))throw new Error("api_key_store_id_invalid");
      return transact(file,s=>{const index=s.keys.findIndex(k=>k.id===id);if(index<0)throw new Error("api_key_store_key_not_found");if(s.keys[index].status==="revoked")return false;s.keys[index]=revokeApiKey(s.keys[index]);return true;},{maxKeys,lockTimeoutMs,syncDirectoryFn});
    },
    async list(ownerId){
      if(typeof ownerId!=="string"||ownerId.length<1||ownerId.length>128)throw new Error("api_key_store_owner_invalid");
      const snapshot=await readSnapshot(file,maxKeys);return snapshot.keys.filter(k=>k.ownerId===ownerId).map(safeMetadata);
    },
    async count(){return (await readSnapshot(file,maxKeys)).keys.length;}
  });
}
