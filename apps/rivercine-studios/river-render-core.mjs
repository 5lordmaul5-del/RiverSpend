#!/usr/bin/env node
/**
 * RiverRender Execution Core — safe dry-run prototype.
 * This prototype simulates queue lifecycle only; it does not execute media tools.
 */
import { readFile } from 'node:fs/promises';
const input=process.argv[2];
if(!input){console.error('Usage: node river-render-core.mjs <queue-plan.json>');process.exit(2)}
let plan;
try{plan=JSON.parse(await readFile(input,'utf8'))}catch(e){console.error('Unable to read queue plan:',e.message);process.exit(2)}
if(plan.schema!=='river-render-queue-plan-v1'||!Array.isArray(plan.jobs)){console.error('Invalid plan schema');process.exit(2)}
const allowed=['Low','Normal','High'];
for(let i=0;i<plan.jobs.length;i++){
 const j=plan.jobs[i];
 if(!j||typeof j.name!=='string'||typeof j.preset!=='string'||!Number.isInteger(j.start)||!Number.isInteger(j.end)||j.start<0||j.end<j.start||!allowed.includes(j.priority)){
  console.error('Invalid job at index',i);process.exit(2)
 }
}
const rank={High:0,Normal:1,Low:2};
const jobs=[...plan.jobs].sort((a,b)=>rank[a.priority]-rank[b.priority]);
console.log('RiverRender dry-run: validated',jobs.length,'job(s). No rendering will be executed.');
for(const j of jobs)console.log(JSON.stringify({name:j.name,preset:j.preset,frameRange:[j.start,j.end],priority:j.priority,state:'SIMULATED_READY'}));
