import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { readState, transactState } from "./rc11-state.mjs";

const rootDir=path.dirname(fileURLToPath(import.meta.url));
const moduleUrl=pathToFileURL(path.join(rootDir,"rc11-state.mjs")).href;
function child(code,args=[]){return new Promise((resolve,reject)=>{const p=spawn(process.execPath,["-e",code,...args],{stdio:["ignore","pipe","pipe"]});let out="",err="";p.stdout.on("data",d=>out+=d);p.stderr.on("data",d=>err+=d);p.on("error",reject);p.on("close",(status,signal)=>resolve({status,signal,out,err}));});}
async function sandbox(fn){const root=await mkdtemp(path.join(os.tmpdir(),"rc11-process-"));try{await fn(root);}finally{await rm(root,{recursive:true,force:true});}}

test("separate Node processes preserve all concurrent transactions",async()=>sandbox(async root=>{const file=path.join(root,"state.json");const code=`import {addJob} from ${JSON.stringify(moduleUrl)}; await addJob(process.argv[1],{id:process.argv[2]});`;const runs=await Promise.all(Array.from({length:6},(_,i)=>child(code,[file,"P"+i])));assert.ok(runs.every(r=>r.status===0),runs.map(r=>r.err).join("\n"));const state=await readState(file);assert.equal(state.jobs.length,6);assert.equal(state.events.length,6);}));

test("separate processes race duplicate job IDs and only one succeeds",async()=>sandbox(async root=>{const file=path.join(root,"state.json");const code=`import {addJob} from ${JSON.stringify(moduleUrl)}; try { await addJob(process.argv[1],{id:"SAME"}); } catch(e) { if(e.message==="job_exists") process.exit(2); throw e; }`;const runs=await Promise.all(Array.from({length:6},()=>child(code,[file])));assert.equal(runs.filter(r=>r.status===0).length,1);assert.equal(runs.filter(r=>r.status===2).length,5);const state=await readState(file);assert.equal(state.jobs.length,1);assert.equal(state.events.length,1);}));

test("process-crash orphan lock fails closed and is preserved",async()=>sandbox(async root=>{const file=path.join(root,"state.json"),lock=file+".lock";const code=`import {open} from "node:fs/promises";const h=await open(process.argv[1],"wx",0o600);await h.writeFile("orphan-lock");await h.sync();await h.close();`;const r=await child(code,[lock]);assert.equal(r.status,0,r.err);await assert.rejects(()=>transactState(file,s=>{s.jobs.push({id:"never"});return true;},{lockTimeoutMs:100}),/state_lock_timeout/);assert.equal(await readFile(lock,"utf8"),"orphan-lock");await assert.rejects(()=>stat(file));}));
