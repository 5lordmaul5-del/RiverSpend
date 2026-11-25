import test from "node:test";import assert from "node:assert/strict";import {validateWorkerJob,availableProfiles} from "./worker-spec.mjs";
const valid={commit:"0123456789abcdef0123456789abcdef01234567",target:"staging",profile:"node-static"};
test("accepts fixed staging build profile",()=>{const x=validateWorkerJob(valid);assert.equal(x.status,"specification_only");assert.equal(x.profileConfig.network,"restricted");});
test("rejects production target",()=>assert.throws(()=>validateWorkerJob({...valid,target:"production"}),/target_must_be_staging/));
test("rejects unknown profile",()=>assert.throws(()=>validateWorkerJob({...valid,profile:"arbitrary-shell"}),/profile_not_allowlisted/));
test("lists bounded profiles",()=>assert.deepEqual(availableProfiles(),["node-static","node-tests"]));
