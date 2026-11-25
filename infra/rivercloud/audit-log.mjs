// RC-8 local audit ledger prototype. Append-only hash chaining, file persistence.
import {createHash} from "node:crypto";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import path from "node:path";
const allowed=new Set(["plan_created","job_queued","approval_requested","approval_granted","approval_denied","worker_prepared","build_started","build_finished","health_check","rollback_requested","rollback_completed","failure","job_transition"]);
function hashRecord(r){return createHash("sha256").update(JSON.stringify(r)).digest("hex");}
export async function readLedger(file){try{return JSON.parse(await readFile(file,"utf8"));}catch(e){if(e.code==="ENOENT")return [];throw e;}}
export function verifyLedger(records){let previous="GENESIS";for(const record of records){if(record.previousHash!==previous)return {valid:false,reason:"chain_mismatch"};const {hash,...payload}=record;if(hashRecord(payload)!==hash)return {valid:false,reason:"record_hash_mismatch"};previous=hash;}return {valid:true,count:records.length};}
export async function appendAudit(file,event,details={}){if(!allowed.has(event))throw new Error("event_not_allowlisted");const dir=path.dirname(file);await mkdir(dir,{recursive:true,mode:0o700});const records=await readLedger(file);const verification=verifyLedger(records);if(!verification.valid)throw new Error("ledger_integrity_failure");const previousHash=records.at(-1)?.hash||"GENESIS";const payload={sequence:records.length+1,event,details,at:new Date().toISOString(),previousHash};const record={...payload,hash:hashRecord(payload)};records.push(record);await writeFile(file,JSON.stringify(records,null,2),{mode:0o600});return record;}
