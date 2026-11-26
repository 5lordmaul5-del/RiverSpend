// RC-149: strict audit record schema and safe projection of verified prepared runs.
import { createHash } from "node:crypto";
import { verifyPreparedRun } from "./runner.mjs";
import { exactDataObject } from "./engine.mjs";

const AUDIT_KEYS=["schema","event","runId","planDigest","envelopeDigest","createdAt","target","status"];
const RECORD_KEYS=[...AUDIT_KEYS,"auditDigest"];
function canonical(record){return JSON.stringify({schema:record.schema,event:record.event,runId:record.runId,planDigest:record.planDigest,envelopeDigest:record.envelopeDigest,createdAt:record.createdAt,target:record.target,status:record.status});}
function normalizedAudit(input){
 const data=exactDataObject(input,RECORD_KEYS);
 if(!data)return null;
 if(data.schema!=="rivercloud.audit.v1"||data.event!=="prepared_run_verified"||data.status!=="prepared_not_executed")return null;
 if(typeof data.runId!=="string"||!/^[a-f0-9]{20}$/.test(data.runId))return null;
 if(typeof data.planDigest!=="string"||!/^[a-f0-9]{64}$/.test(data.planDigest)||typeof data.envelopeDigest!=="string"||!/^[a-f0-9]{64}$/.test(data.envelopeDigest))return null;
 if(typeof data.createdAt!=="string"||!Number.isFinite(Date.parse(data.createdAt))||new Date(data.createdAt).toISOString()!==data.createdAt)return null;
 if(data.target!=="staging")return null;
 if(typeof data.auditDigest!=="string"||!/^[a-f0-9]{64}$/.test(data.auditDigest))return null;
 return data;
}
export function projectPreparedRunAudit(input){
 const checked=verifyPreparedRun(input);
 if(!checked.ok)throw new Error("prepared_run_unverified");
 // Re-snapshot the envelope to avoid reading original input properties after verification.
 const run=exactDataObject(input,["runId","digest","plan","status","safety","createdAt","envelopeDigest"]);
 const plan=run&&exactDataObject(run.plan,["projectId","repository","branch","commit","target","status"]);
 if(!run||!plan)throw new Error("prepared_run_unverified");
 const record=Object.freeze({schema:"rivercloud.audit.v1",event:"prepared_run_verified",runId:checked.runId,planDigest:checked.digest,envelopeDigest:run.envelopeDigest,createdAt:run.createdAt,target:plan.target,status:"prepared_not_executed"});
 return Object.freeze({...record,auditDigest:createHash("sha256").update(canonical(record)).digest("hex")});
}
export function verifyAuditProjection(input){
 try{
  const data=normalizedAudit(input);if(!data)return false;
  return createHash("sha256").update(canonical(data)).digest("hex")===data.auditDigest;
 }catch{return false;}
}
