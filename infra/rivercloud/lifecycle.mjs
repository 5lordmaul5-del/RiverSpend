// RC-9 bounded job lifecycle with audit-ledger integration. Prototype only.
import { appendAudit, readLedger, verifyLedger } from "./audit-log.mjs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const STATES = ["pending","approved","rejected","prepared","running","completed","failed","cancelled"];
const transitions = {
 pending:new Set(["approved","rejected","cancelled"]),
 approved:new Set(["prepared","cancelled"]),
 rejected:new Set(),
 prepared:new Set(["running","cancelled","failed"]),
 running:new Set(["completed","failed"]),
 completed:new Set(), failed:new Set(["prepared"]), cancelled:new Set()
};
const safeId=/^[a-zA-Z0-9_-]{1,64}$/;
export function transitionAllowed(from,to){return STATES.includes(from)&&transitions[from]?.has(to)===true;}
export async function transitionJob({storeDir,auditFile,jobId,to,actor="system",note=""}){
 if(!safeId.test(jobId)||!STATES.includes(to)||typeof actor!=="string"||actor.length>100||typeof note!=="string"||note.length>500)throw new Error("invalid_transition_input");
 await mkdir(storeDir,{recursive:true,mode:0o700});
 const file=path.join(storeDir,"lifecycle.json");
 let jobs=[];try{jobs=JSON.parse(await readFile(file,"utf8"));}catch(e){if(e.code!=="ENOENT")throw e;}
 const job=jobs.find(x=>x.id===jobId);if(!job)throw new Error("job_not_found");
 if(!transitionAllowed(job.state,to))throw new Error("transition_not_allowed");
 const from=job.state;job.state=to;job.updatedAt=new Date().toISOString();
 await appendAudit(auditFile,"job_transition",{jobId,from,to,actor,note});
 await writeFile(file,JSON.stringify(jobs,null,2),{mode:0o600});
 return job;
}
export async function createLifecycleJob({storeDir,auditFile,jobId,digest,plan,actor="system"}){
 if(!safeId.test(jobId)||typeof digest!=="string"||digest.length>128)throw new Error("invalid_job");
 await mkdir(storeDir,{recursive:true,mode:0o700});
 const file=path.join(storeDir,"lifecycle.json");let jobs=[];
 try{jobs=JSON.parse(await readFile(file,"utf8"));}catch(e){if(e.code!=="ENOENT")throw e;}
 if(jobs.some(x=>x.id===jobId))throw new Error("job_exists");
 const job={id:jobId,digest,plan,state:"pending",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
 jobs.push(job);await appendAudit(auditFile,"job_transition",{jobId,from:null,to:"pending",actor,note:"created"});await writeFile(file,JSON.stringify(jobs,null,2),{mode:0o600});return job;
}
