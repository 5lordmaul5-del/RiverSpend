import test from "node:test";
import assert from "node:assert/strict";
import { runIntegrityScenario, integrityScenarios } from "./fault-integrity-harness.mjs";
import { prepareRun } from "./runner.mjs";
import { projectPreparedRunAudit } from "./audit-projection.mjs";
function bundle(){const run=prepareRun({projectId:"riverspend",branch:"main",commit:"a".repeat(40),target:"staging"});return {run,audit:projectPreparedRunAudit(run),lifecycle:{runId:run.runId,digest:run.digest,status:run.status}};}
test("scenario catalogue bounded",()=>assert.equal(integrityScenarios().length,7));
test("baseline expected to pass",()=>assert.equal(runIntegrityScenario(bundle(),"baseline").expectationMet,true));
for(const scenario of ["missing_bundle_field","altered_run_id","altered_digest","invalid_lifecycle","altered_audit","unsafe_accessor"]){test(scenario+" expected rejection",()=>assert.equal(runIntegrityScenario(bundle(),scenario).expectationMet,true));}
test("unknown scenario is rejected",()=>assert.equal(runIntegrityScenario(bundle(),"arbitrary").accepted,false));
