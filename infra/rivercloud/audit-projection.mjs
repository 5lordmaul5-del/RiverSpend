// RC-148: deterministic, read-only lifecycle/audit projection for verified prepared runs.
import { createHash } from "node:crypto";
import { verifyPreparedRun } from "./runner.mjs";

const AUDIT_KEYS=["schema","event","runId","planDigest","envelopeDigest","createdAt","target","status"];
function canonical(record){return JSON.stringify({schema:record.schema,event:record.event,runId:record.runId,planDigest:record.planDigest,envelopeDigest:record.envelopeDigest,createdAt:record.createdAt,target:record.target,status:record.status});}
export function projectPreparedRunAudit(input){
 const checked=verifyPreparedRun(input);
 if(!checked.ok)throw new Error("prepared_run_unverified");
 const record=Object.freeze({schema:"rivercloud.audit.v1",event:"prepared_run_verified",runId:checked.runId,planDigest:checked.digest,envelopeDigest:input.envelopeDigest,createdAt:input.createdAt,target:input.plan.target,status:"prepared_not_executed"});
 return Object.freeze({...record,auditDigest:createHash("sha256").update(canonical(record)).digest("hex")});
}
export function verifyAuditProjection(input){
 if(!input||typeof input!=="object"||Array.isArray(input))return false;
 try{
  const own=Reflect.ownKeys(input);
  if(own.length!==AUDIT_KEYS.length+1||own.some(k=>typeof k!=="string"||!AUDIT_KEYS.includes(k)&&k!=="auditDigest"))return false;
  for(const k of own){const d=Object.getOwnPropertyDescriptor(input,k);if(!d||!d.enumerable||!Object.hasOwn(d,"value"))return false;}
  if(input.schema!=="rivercloud.audit.v1"||input.event!=="prepared_run_verified"||input.status!=="prepared_not_executed"||typeof input.auditDigest!=="string"||!/^[a-f0-9]{64}$/.test(input.auditDigest))return false;
  return createHash("sha256").update(canonical(input)).digest("hex")===input.auditDigest;
 }catch{return false;}
}
