// RC-152: bounded fault/integrity scenario harness; pure, read-only, no execution.
import { checkRunConsistency } from "./consistency-checker.mjs";
const SCENARIOS=Object.freeze(["baseline","missing_bundle_field","altered_run_id","altered_digest","invalid_lifecycle","altered_audit","unsafe_accessor"]);
function safeCopyBundle(bundle){
 if(!bundle||typeof bundle!=="object")return null;
 try{
  const keys=Reflect.ownKeys(bundle);if(keys.some(k=>typeof k!=="string"))return null;
  const out=Object.create(null);
  for(const k of keys){const d=Object.getOwnPropertyDescriptor(bundle,k);if(!d||!d.enumerable||!Object.hasOwn(d,"value"))return null;out[k]=d.value;}
  return out;
 }catch{return null;}
}
export function runIntegrityScenario(bundle,scenario){
 if(!SCENARIOS.includes(scenario))return Object.freeze({scenario,accepted:false,diagnostics:Object.freeze(["scenario_unknown"])});
 const copy=safeCopyBundle(bundle);if(!copy)return Object.freeze({scenario,accepted:false,diagnostics:Object.freeze(["bundle_unsafe"])});
 if(scenario==="missing_bundle_field")delete copy.lifecycle;
 if(scenario==="altered_run_id"){
  const l=copy.lifecycle;if(l&&typeof l==="object"){const c=safeCopyBundle(l);if(c){c.runId="0".repeat(20);copy.lifecycle=c;}}
 }
 if(scenario==="altered_digest"){
  const l=copy.lifecycle;if(l&&typeof l==="object"){const c=safeCopyBundle(l);if(c){c.digest="0".repeat(64);copy.lifecycle=c;}}
 }
 if(scenario==="invalid_lifecycle"){
  const l=copy.lifecycle;if(l&&typeof l==="object"){const c=safeCopyBundle(l);if(c){c.status="running";copy.lifecycle=c;}}
 }
 if(scenario==="altered_audit"){
  const a=copy.audit;if(a&&typeof a==="object"){const c=safeCopyBundle(a);if(c){c.auditDigest="0".repeat(64);copy.audit=c;}}
 }
 if(scenario==="unsafe_accessor"){
  const hostile=Object.create(null);for(const k of Reflect.ownKeys(copy)){const d=Object.getOwnPropertyDescriptor(copy,k);if(d&&Object.hasOwn(d,"value"))Object.defineProperty(hostile,k,{enumerable:true,get(){return d.value;}});}copy.bundle=hostile;
 }
 const checked=checkRunConsistency(copy);
 const expectedReject=scenario!=="baseline";
 return Object.freeze({scenario,accepted:checked.ok,diagnostics:Object.freeze([...checked.diagnostics]),expectation:expectedReject?"rejection":"acceptance",expectationMet:checked.ok===!expectedReject});
}
export function integrityScenarios(){return [...SCENARIOS];}
