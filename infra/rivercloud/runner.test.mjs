import test from "node:test";
import assert from "node:assert/strict";
import { prepareRun, verifyPreparedRun, executeRun } from "./runner.mjs";

const valid={projectId:"riverspend",branch:"main",commit:"0123456789abcdef0123456789abcdef01234567",target:"staging"};
test("runner creates a verifiable safe prepared envelope",()=>{
 const run=prepareRun(valid);
 assert.equal(run.status,"prepared_not_executed");
 assert.equal(run.safety.commandExecution,false);
 assert.equal(run.safety.dockerSocket,false);
 assert.equal(run.plan.target,"staging");
 assert.equal(verifyPreparedRun(run).ok,true);
});
test("verification rejects plan, digest or identity tampering",()=>{
 const run=prepareRun(valid);
 assert.equal(verifyPreparedRun({...run,plan:{...run.plan,commit:"a".repeat(40)}}).reason,"plan_digest_mismatch");
 assert.equal(verifyPreparedRun({...run,digest:"b".repeat(64)}).reason,"plan_digest_mismatch");
 assert.equal(verifyPreparedRun({...run,runId:"altered"}).reason,"plan_digest_mismatch");
});
test("verification rejects unsafe execution flags and changed status",()=>{
 const run=prepareRun(valid);
 assert.equal(verifyPreparedRun({...run,safety:{...run.safety,networkFetch:true}}).reason,"unsafe_flags");
 assert.equal(verifyPreparedRun({...run,status:"running"}).reason,"run_status_invalid");
 assert.equal(verifyPreparedRun({...run,safety:{...run.safety,extra:false}}).reason,"unsafe_flags");
});
test("verification rejects envelope checksum alteration and unexpected fields",()=>{
 const run=prepareRun(valid);
 assert.equal(verifyPreparedRun({...run,envelopeDigest:"0".repeat(64)}).reason,"envelope_digest_mismatch");
 assert.equal(verifyPreparedRun({...run,unexpected:"value"}).reason,"run_schema_invalid");
});
test("execution remains disabled pending isolation and authenticated approval",()=>{
 assert.throws(()=>executeRun(prepareRun(valid)),/runner_execution_disabled/);
});
test("runner rejects unallowlisted project",()=>{
 assert.throws(()=>prepareRun({...valid,projectId:"unknown"}),/project_not_allowlisted/);
});
test("runner rejects nonimmutable commit",()=>{
 assert.throws(()=>prepareRun({...valid,commit:"main"}),/immutable_commit_sha_required/);
});

test("prepared-run verifier rejects envelope and safety accessors without invoking them",()=>{
 const run=prepareRun(valid);
 let calls=0;
 const envelope={...run};
 Object.defineProperty(envelope,"status",{enumerable:true,get(){calls++;return "prepared_not_executed";}});
 assert.equal(verifyPreparedRun(envelope).reason,"run_schema_invalid");
 assert.equal(calls,0);
 const safety={...run.safety};
 Object.defineProperty(safety,"networkFetch",{enumerable:true,get(){calls++;return false;}});
 assert.equal(verifyPreparedRun({...run,safety}).reason,"unsafe_flags");
 assert.equal(calls,0);
});
