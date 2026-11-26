import test from "node:test";
import assert from "node:assert/strict";
import { checkRunConsistency } from "./consistency-checker.mjs";
import { prepareRun } from "./runner.mjs";
import { projectPreparedRunAudit } from "./audit-projection.mjs";
const request={projectId:"riverspend",branch:"main",commit:"a".repeat(40),target:"staging"};
function valid(){
 const run=prepareRun(request),audit=projectPreparedRunAudit(run);
 const lifecycle={runId:run.runId,digest:run.digest,status:run.status};
 return {run,audit,lifecycle};
}
test("valid bundle passes",()=>assert.equal(checkRunConsistency(valid()).ok,true));
test("schema and hostile accessor rejected",()=>{
 const b=valid();const hostile={run:b.run,audit:b.audit,lifecycle:b.lifecycle};
 Object.defineProperty(hostile,"audit",{enumerable:true,get(){throw Error("hostile");}});
 assert.deepEqual(checkRunConsistency(hostile).diagnostics,["bundle_schema_invalid"]);
});
test("lifecycle mismatch diagnostic",()=>{
 const b=valid();b.lifecycle={...b.lifecycle,runId:"0".repeat(20)};
 assert.ok(checkRunConsistency(b).diagnostics.includes("lifecycle_run_id_mismatch"));
});
test("digest mismatch diagnostic",()=>{
 const b=valid();b.lifecycle={...b.lifecycle,digest:"0".repeat(64)};
 assert.ok(checkRunConsistency(b).diagnostics.includes("lifecycle_digest_mismatch"));
});
test("status mismatch diagnostic",()=>{
 const b=valid();b.lifecycle={...b.lifecycle,status:"verified"};
 assert.ok(checkRunConsistency(b).diagnostics.includes("lifecycle_run_status_mismatch"));
});
test("tampered audit rejected",()=>{
 const b=valid();b.audit={...b.audit,runId:"0".repeat(20)};
 assert.ok(checkRunConsistency(b).diagnostics.includes("audit_invalid"));
});
test("unknown lifecycle state rejected",()=>{
 const b=valid();b.lifecycle={...b.lifecycle,status:"running"};
 assert.ok(checkRunConsistency(b).diagnostics.includes("lifecycle_invalid"));
});
