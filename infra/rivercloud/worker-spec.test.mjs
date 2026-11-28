import test from "node:test";import assert from "node:assert/strict";import {validateWorkerJob,availableProfiles} from "./worker-spec.mjs";
const valid={commit:"0123456789abcdef0123456789abcdef01234567",target:"staging",profile:"node-static"};
test("accepts fixed staging build profile",()=>{const x=validateWorkerJob(valid);assert.equal(x.status,"specification_only");assert.equal(x.profileConfig.network,"restricted");});
test("rejects production target",()=>assert.throws(()=>validateWorkerJob({...valid,target:"production"}),/target_must_be_staging/));
test("rejects unknown profile",()=>assert.throws(()=>validateWorkerJob({...valid,profile:"arbitrary-shell"}),/profile_not_allowlisted/));
test("lists bounded profiles",()=>assert.deepEqual(availableProfiles(),["node-static","node-tests"]));
test("worker specification accessors and hidden extras fail closed",()=>{
 let getterCalls=0;const hostile={...valid};
 Object.defineProperty(hostile,"profile",{enumerable:true,get(){getterCalls++;return "node-static";}});
 assert.throws(()=>validateWorkerJob(hostile),/invalid_job/);assert.equal(getterCalls,0);
 const hidden={...valid};Object.defineProperty(hidden,"extra",{value:"ignored",enumerable:false});
 assert.throws(()=>validateWorkerJob(hidden),/invalid_job/);
});
