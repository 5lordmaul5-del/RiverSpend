import test from 'node:test';import assert from 'node:assert/strict';import{RiverBuildWorker}from'../src/riverbuild-worker.js';
const item={job:{status:'running',approved:true},commandPlan:{executable:'docker',args:['run','--network','none','--read-only','--cap-drop','ALL','--security-opt','no-new-privileges'],executionMode:'container',approvalRequired:true,networkDisabled:true,readOnlyWorkspace:true}};
test('default disabled',async()=>{let c=false;const w=new RiverBuildWorker({executor:()=>c=true});assert.equal((await w.run(item)).status,'disabled');assert.equal(c,false)});
test('requires adapter',async()=>assert.rejects(()=>new RiverBuildWorker({enabled:true}).run(item),/executor adapter/));
test('rejects nonrunning job',async()=>assert.rejects(()=>new RiverBuildWorker({enabled:true,executor:async()=>({exitCode:0})}).run({...item,job:{status:'queued',approved:true}}),/Approved running/));
test('rejects weakened plan',async()=>assert.rejects(()=>new RiverBuildWorker({enabled:true,executor:async()=>({exitCode:0})}).run({...item,commandPlan:{...item.commandPlan,networkDisabled:false}}),/Restricted Docker/));
test('normalizes success',async()=>assert.equal((await new RiverBuildWorker({enabled:true,executor:async()=>({exitCode:0,stdout:'ok'})}).run(item)).status,'passed'));
test('normalizes failure',async()=>assert.equal((await new RiverBuildWorker({enabled:true,executor:async()=>({exitCode:3})}).run(item)).status,'failed'));
test('timeout',async()=>assert.equal((await new RiverBuildWorker({enabled:true,timeoutMs:10,executor:()=>new Promise(()=>{})}).run(item)).status,'timeout'));
