import test from "node:test";
import assert from "node:assert/strict";
import {mkdtemp,rm} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {spawn} from "node:child_process";
import {fileURLToPath,pathToFileURL} from "node:url";
import {readState} from "./rc11-state.mjs";
const rootDir=path.dirname(fileURLToPath(import.meta.url));
const queueUrl=pathToURL(path.join(rootDir,"queue.mjs"));
function pathToURL(p){return pathToFileURL(p).href;}
function child(code,args=[]){return new Promise((resolve,reject)=>{const p=spawn(process.execPath,["-e",code,...args],{stdio:["ignore","pipe","pipe"]});let out="",err="";p.stdout.on("data",d=>out+=d);p.stderr.on("data",d=>err+=d);p.on("error",reject);p.on("close",(status,signal)=>resolve({status,signal,out,err}));});}
async function sandbox(fn){const root=await mkdtemp(path.join(os.tmpdir(),"rc-queue-process-"));try{await fn(root);}finally{await rm(root,{recursive:true,force:true});}}
const input={projectId:"riverspend",branch:"main",target:"staging",commit:"b".repeat(40)};
test("separate processes queue identical plans idempotently",async()=>sandbox(async root=>{const file=path.join(root,"state.json");const code=`import {queuePlan} from ${JSON.stringify(queueUrl)}; const result=await queuePlan(process.argv[1],${JSON.stringify(input)}); console.log(JSON.stringify(result));`;const runs=await Promise.all(Array.from({length:6},()=>child(code,[file])));assert.ok(runs.every(r=>r.status===0),runs.map(r=>r.err).join("\n"));const results=runs.map(r=>JSON.parse(r.out.trim()));assert.equal(results.filter(r=>r.duplicate===false).length,1);assert.equal(results.filter(r=>r.duplicate===true).length,5);const state=await readState(file);assert.equal(state.jobs.length,1);assert.equal(state.events.length,1);}));
