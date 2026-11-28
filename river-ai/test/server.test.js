import test from "node:test";
import assert from "node:assert/strict";
import { createServer,startServer } from "../src/server.js";
import { SpecialistRegistry } from "../src/specialist-registry.js";

test("health, status and read-only specialist endpoints",async()=>{
 const server=createServer();
 await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
 const {port}=server.address();
 try{
  const health=await fetch("http://127.0.0.1:"+port+"/health");
  assert.equal(health.status,200);assert.deepEqual(await health.json(),{ok:true});
  const status=await fetch("http://127.0.0.1:"+port+"/status");
  const data=await status.json();assert.equal(status.status,200);assert.equal(data.name,"RiverSSAI 10.0");assert.equal(data.toolsEnabled,false);assert.equal(data.modelConnected,false);
  const specialists=await fetch("http://127.0.0.1:"+port+"/specialists?limit=5");
  const page=await specialists.json();assert.equal(specialists.status,200);assert.equal(page.total,100000);assert.equal(page.items.length,5);assert.equal(page.executionEnabled,false);
  const security=await fetch("http://127.0.0.1:"+port+"/specialists?domain=security&limit=3");
  const s=await security.json();const registry=new SpecialistRegistry();const domainIndex=registry.domains.indexOf("security");assert.equal(s.total,Math.floor((registry.total-1-domainIndex)/registry.domains.length)+1);assert.ok(s.items.every(x=>x.domain==="security"));
  const scheduler=await fetch("http://127.0.0.1:"+port+"/scheduler/status");
  const q=await scheduler.json();assert.equal(q.activeProcesses,0);assert.equal(q.executionEnabled,false);assert.equal(q.persistence,"memory-only");
  const tools=await fetch("http://127.0.0.1:"+port+"/tools");const t=await tools.json();assert.ok(t.tools.some(x=>x.name==="specialists-list"&&x.enabled));assert.ok(t.tools.some(x=>x.name==="scheduler-enqueue"&&!x.enabled));
 }finally{server.close();}
});
test("unsupported routes, invalid pagination and mutating methods are rejected",async()=>{
 const server=createServer();await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));const {port}=server.address();
 try{assert.equal((await fetch("http://127.0.0.1:"+port+"/unknown")).status,404);assert.equal((await fetch("http://127.0.0.1:"+port+"/specialists?limit=501")).status,400);assert.equal((await fetch("http://127.0.0.1:"+port+"/status",{method:"POST"})).status,405);}
 finally{server.close();}
});
test("startServer rejects public binding",()=>assert.throws(()=>startServer({bindHost:"0.0.0.0",bindPort:0}),/loopback only/));
