import test from "node:test";
import assert from "node:assert/strict";
import { prepareRun, executeRun } from "./runner.mjs";

const valid={projectId:"riverspend",branch:"main",commit:"0123456789abcdef0123456789abcdef01234567",target:"staging"};
test("runner creates a deterministic run identity and safe prepared status",()=>{
 const run=prepareRun(valid);
 assert.equal(run.status,"prepared_not_executed");
 assert.equal(run.safety.commandExecution,false);
 assert.equal(run.safety.dockerSocket,false);
 assert.equal(run.plan.target,"staging");
});
test("execution remains disabled pending isolation and approval",()=>{
 assert.throws(()=>executeRun(prepareRun(valid)),/runner_execution_disabled/);
});
test("runner rejects unallowlisted project",()=>{
 assert.throws(()=>prepareRun({...valid,projectId:"unknown"}),/project_not_allowlisted/);
});
test("runner rejects nonimmutable commit",()=>{
 assert.throws(()=>prepareRun({...valid,commit:"main"}),/immutable_commit_sha_required/);
});
