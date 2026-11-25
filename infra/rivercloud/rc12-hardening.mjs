// RC-12: hash-chain helper and fail-closed lock handling.
// Automatic stale-lock reclamation is disabled because PID/rename checks can race or be confused by PID reuse.
import {open,mkdir,stat} from "node:fs/promises";
import path from "node:path";
import {createHash,randomUUID} from "node:crypto";
export function hashEvent(event,previousHash="0".repeat(64)){const payload={...event,previousHash};return createHash("sha256").update(JSON.stringify(payload)).digest("hex");}
export function appendChain(events,event){const previousHash=events.length?events.at(-1).hash:"0".repeat(64);const entry={...event,previousHash};entry.hash=hashEvent(entry,previousHash);events.push(entry);return entry;}
export function verifyChain(events){let prev="0".repeat(64);for(const e of events){if(e.previousHash!==prev)return false;const {hash,...body}=e;const expected=createHash("sha256").update(JSON.stringify(body)).digest("hex");if(hash!==expected)return false;prev=hash;}return true;}
export async function recoverStaleLock(lockPath){try{await stat(lockPath);return false;}catch(e){if(e.code==="ENOENT")return false;throw e;}}
export async function acquireLock(lockPath,{timeoutMs=3000}={}){if(!Number.isSafeInteger(timeoutMs)||timeoutMs<100||timeoutMs>10000)throw new Error("invalid_lock_timeout");await mkdir(path.dirname(lockPath),{recursive:true,mode:0o700});const start=Date.now();while(Date.now()-start<=timeoutMs){try{const h=await open(lockPath,"wx",0o600);const record={pid:process.pid,nonce:randomUUID(),createdAt:new Date().toISOString()};await h.writeFile(JSON.stringify(record));await h.sync();return{handle:h,record};}catch(e){if(e.code!=="EEXIST")throw e;await recoverStaleLock(lockPath);await new Promise(r=>setTimeout(r,25));}}throw new Error("state_lock_timeout");}
