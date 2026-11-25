import test from "node:test";import assert from "node:assert/strict";import {createStagingPlan,validateWorkerSpec} from "./rc15-staging.mjs";
const base={project:"demo",commit:"a".repeat(40),profile:"node-static",stagingPath:"/staging/demo",approved:true};
test("creates disabled staging plan",()=>{const p=createStagingPlan(base);assert.equal(p.executionEnabled,false);assert.equal(validateWorkerSpec(p).ok,true);});
test("requires explicit approval",()=>assert.throws(()=>createStagingPlan({...base,approved:false})));
test("rejects arbitrary profile",()=>assert.throws(()=>createStagingPlan({...base,profile:"shell"})));
test("rejects non sha commit",()=>assert.throws(()=>createStagingPlan({...base,commit:"main"})));
test("rejects spec with execution enabled",()=>assert.equal(validateWorkerSpec({...createStagingPlan(base),executionEnabled:true}).ok,false));
