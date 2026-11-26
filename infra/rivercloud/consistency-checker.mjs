// RC-151: read-only consistency diagnostics. This module does not authorize execution.
import { verifyPreparedRun } from "./runner.mjs";
import { verifyAuditProjection } from "./audit-projection.mjs";
import { exactDataObject } from "./engine.mjs";
import { isLifecycleState } from "./lifecycle-guard.mjs";

const INPUT_KEYS=["run","audit","lifecycle"];
const LIFE_KEYS=["runId","digest","status"];
function result(ok,diagnostics){return Object.freeze({ok,diagnostics:Object.freeze([...diagnostics])});}
export function checkRunConsistency(input){
 const diagnostics=[];
 const bundle=exactDataObject(input,INPUT_KEYS);
 if(!bundle)return result(false,["bundle_schema_invalid"]);
 const run=bundle.run, audit=bundle.audit, lifecycle=bundle.lifecycle;
 const verified=verifyPreparedRun(run);
 if(!verified.ok)diagnostics.push("run_invalid");
 if(!verifyAuditProjection(audit))diagnostics.push("audit_invalid");
 const life=exactDataObject(lifecycle,LIFE_KEYS);
 if(!life||!isLifecycleState(life.status))diagnostics.push("lifecycle_invalid");
 if(verified.ok&&life&&life.runId!==verified.runId)diagnostics.push("lifecycle_run_id_mismatch");
 if(verified.ok&&life&&life.digest!==verified.digest)diagnostics.push("lifecycle_digest_mismatch");
 if(verified.ok&&audit&&typeof audit==="object"){
  const a=exactDataObject(audit,["schema","event","runId","planDigest","envelopeDigest","createdAt","target","status","auditDigest"]);
  if(a){
   if(a.runId!==verified.runId)diagnostics.push("audit_run_id_mismatch");
   if(a.planDigest!==verified.digest)diagnostics.push("audit_plan_digest_mismatch");
   if(run&&a.envelopeDigest!==run.envelopeDigest)diagnostics.push("audit_envelope_digest_mismatch");
  }
 }
 if(life&&typeof life.status==="string"&&life.status==="prepared_not_executed"&&run&&run.status!=="prepared_not_executed")diagnostics.push("lifecycle_run_status_mismatch");
 return result(diagnostics.length===0,diagnostics);
}
