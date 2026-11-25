// RC-12 prototype: recover stale lock files and hash-chain event records.
// Local prototype only. No authentication or deployment execution.
import {open,readFile,rename,unlink,mkdir,stat} from "node:fs/promises";
import path from "node:path";
import {createHash,randomUUID} from "node:crypto";

export function hashEvent(event,previousHash="0".repeat(64)){
 const payload={...event,previousHash};
 return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}
export function appendChain(events,event){
 const previousHash=events.length?events.at(-1).hash:"0".repeat(64);
 const entry={...event,previousHash};
 entry.hash=hashEvent(entry,previousHash);
 events.push(entry);return entry;
}
export function verifyChain(events){
 let prev="0".repeat(64);
 for(const e of events){if(e.previousHash!==prev)return false;const {hash,...body}=e;const expected=createHash("sha256").update(JSON.stringify(body)).digest("hex");if(hash!==expected)return false;prev=hash;}
 return true;
}
function pidAlive(pid){if(!Number.isSafeInteger(pid)||pid<=0)return false;try{process.kill(pid,0);return true;}catch(e){return e.code==="EPERM";}}
export async function recoverStaleLock(lockPath,{minAgeMs=60000}={}){
 let info;try{info=await stat(lockPath);}catch(e){if(e.code==="ENOENT")return false;throw e;}
 if(Date.now()-info.mtimeMs<minAgeMs)return false;
 let record;try{record=JSON.parse(await readFile(lockPath,"utf8"));}catch{return false;}
 if(pidAlive(record.pid))return false;
 // Quarantine via unique rename: never blindly unlink a lock that changed.
 const quarantine=lockPath+".stale-"+randomUUID();
 try{await rename(lockPath,quarantine);}catch(e){if(e.code==="ENOENT")return false;throw e;}
 await unlink(quarantine).catch(()=>{});return true;
}
export async function acquireLock(lockPath,{timeoutMs=3000,recoveryAgeMs=60000}={}){
 await mkdir(path.dirname(lockPath),{recursive:true,mode:0o700});
 const start=Date.now();
 while(Date.now()-start<=timeoutMs){
  try{const h=await open(lockPath,"wx",0o600);const record={pid:process.pid,nonce:randomUUID(),createdAt:new Date().toISOString()};await h.writeFile(JSON.stringify(record));await h.sync();return {handle:h,record};}
  catch(e){if(e.code!=="EEXIST")throw e;await recoverStaleLock(lockPath,{minAgeMs:recoveryAgeMs});await new Promise(r=>setTimeout(r,25));}
 }
 throw new Error("state_lock_timeout");
}
