// RC-162: deterministic component health snapshot, derived from recovery classifications.
import {classifyRecovery,validateRecoveryClassification} from "./recovery-classifier.mjs";
const REQUIRED=["gateway","observatory","diagnostic-report","boundary-isolation"];
export function buildHealthSnapshot(records){
 try{
  if(!Array.isArray(records)||records.length>100)return null;
  const normalized=records.map(r=>classifyRecovery(r));if(normalized.some(r=>!validateRecoveryClassification(r)))return null;
  const map=new Map(normalized.map(r=>[r.component,r]));
  const missing=REQUIRED.filter(k=>!map.has(k));
  const degraded=normalized.filter(r=>r.state!=="healthy").length;
  const status=missing.length||degraded?"degraded":"healthy";
  return Object.freeze({schema:"rivercloud.health.v1",status,total:normalized.length,healthy:normalized.filter(r=>r.state==="healthy").length,degraded:normalized.filter(r=>r.state==="degraded").length,faulted:normalized.filter(r=>r.state==="faulted").length,missing:Object.freeze(missing),components:Object.freeze(normalized),readOnly:true,automaticRemediation:false});
 }catch{return null;}
}
export function validateHealthSnapshot(s){
 try{
  if(!s||typeof s!=="object"||Array.isArray(s)||Reflect.ownKeys(s).length!==10)return false;
  return s.schema==="rivercloud.health.v1"&&["healthy","degraded"].includes(s.status)&&Number.isInteger(s.total)&&Number.isInteger(s.healthy)&&Number.isInteger(s.degraded)&&Number.isInteger(s.faulted)&&Array.isArray(s.missing)&&Array.isArray(s.components)&&s.readOnly===true&&s.automaticRemediation===false&&s.total===s.components.length&&s.healthy+s.degraded+s.faulted===s.total&&s.components.every(validateRecoveryClassification);
 }catch{return false;}
}
