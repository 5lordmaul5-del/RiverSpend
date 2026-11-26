import test from "node:test";
import assert from "node:assert/strict";
import { SpecialistRegistry } from "../src/specialist-registry.js";

test("virtual catalog exposes 100000 definitions without processes",()=>{
 const registry=new SpecialistRegistry();
 const page=registry.list({limit:10});
 assert.equal(registry.total,100000);
 assert.equal(page.total,100000);
 assert.equal(page.items.length,10);
 assert.equal(page.items[0].id,"rs-specialist-000001");
 assert.equal(page.items[9].id,"rs-specialist-000010");
 assert.equal(page.items[0].definitionOnly,true);
 assert.equal(page.items[0].activeProcess,false);
 assert.equal(page.items[0].processCount,0);
 assert.equal(page.items[0].executionEnabled,false);
});

test("bounded pagination and domain filtering",()=>{
 const registry=new SpecialistRegistry();
 const page=registry.list({offset:100,limit:5});
 assert.equal(page.items[0].id,"rs-specialist-000101");
 assert.equal(page.items.length,5);
 const security=registry.list({domain:"security",limit:5});
 assert.equal(security.total,2000);
 assert.equal(security.items.length,5);
 assert.ok(security.items.every(x=>x.domain==="security"));
});

test("selection is deterministic and domain constrained",()=>{
 const registry=new SpecialistRegistry();
 const a=registry.selectForTask({taskId:"job-1",goal:"review security controls",domain:"security"});
 const b=registry.selectForTask({taskId:"job-1",goal:"review security controls",domain:"security"});
 assert.equal(a.id,b.id);
 assert.equal(a.domain,"security");
 assert.equal(a.activeProcess,false);
 assert.equal(a.executionEnabled,false);
 assert.equal(registry.inferDomain("test the checkout"),"testing");
});

test("rejects invalid ids, domains and page limits",()=>{
 const registry=new SpecialistRegistry();
 assert.equal(registry.get("rs-specialist-000000"),null);
 assert.equal(registry.get("rs-specialist-100001"),null);
 assert.throws(()=>registry.list({limit:501}),/limit/);
 assert.throws(()=>registry.list({domain:"unknown"}),/domain/);
 assert.throws(()=>new SpecialistRegistry({total:10}),/total/);
});
