/**
 * RiverAudit — simple local event log foundation.
 * This is append-oriented, but not tamper-proof. No automatic actions.
 */
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
const ALLOWED=['request','classification','approval','rejection','result','error','system'];
export async function recordAudit(event,path='./data/audit.jsonl'){
 if(!event || !ALLOWED.includes(event.type)) throw new Error('Unsupported audit event type.');
 const entry={id:crypto.randomUUID(),type:event.type,actor:typeof event.actor==='string'?event.actor.slice(0,100):'unspecified',module:typeof event.module==='string'?event.module.slice(0,100):'unspecified',summary:typeof event.summary==='string'?event.summary.slice(0,1000):'',risk:['low','medium','high','invalid'].includes(event.risk)?event.risk:'unspecified',timestamp:new Date().toISOString()};
 await mkdir(dirname(path),{recursive:true});
 await appendFile(path,JSON.stringify(entry)+'\n',{mode:0o600});
 return entry;
}
export async function readAudit(path='./data/audit.jsonl'){
 try { const raw=await readFile(path,'utf8'); return raw.split('\n').filter(Boolean).map(line=>JSON.parse(line)); }
 catch(e){ if(e.code==='ENOENT') return []; throw e; }
}
