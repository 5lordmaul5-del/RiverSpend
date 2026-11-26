// RC-161: bounded recovery-state classification (no automatic restart/action).
const STATES=Object.freeze(["healthy","degraded","faulted","recovery_pending","recovery_verified","recovery_failed"]);
const ACTIONS=Object.freeze(["observe","isolate","manual_review","retry_candidate"]);
export function classifyRecovery(input){
 try{
  if(!input||typeof input!=="object"||Array.isArray(input))return null;
  const keys=["component","faultCode","integrity","availability"];const own=Reflect.ownKeys(input);
  if(own.length!==keys.length||own.some(k=>!keys.includes(k)))return null;
  const d={};for(const k of keys){const p=Object.getOwnPropertyDescriptor(input,k);if(!p||!p.enumerable||!Object.hasOwn(p,"value"))return null;d[k]=p.value;}
  if(typeof d.component!=="string"||!d.component||typeof d.faultCode!=="string"||typeof d.integrity!=="boolean"||typeof d.availability!=="boolean")return null;
  const state=d.integrity&&d.availability?"healthy":d.integrity?"degraded":"faulted";
  const action=state==="healthy"?"observe":state==="degraded"?"manual_review":"isolate";
  return Object.freeze({schema:"rivercloud.recovery.v1",component:d.component,faultCode:d.faultCode,state,action,automaticAction:false,requiresApproval:action!=="observe"});
 }catch{return null;}
}
export function validateRecoveryClassification(v){
 try{return !!v&&typeof v==="object"&&!Array.isArray(v)&&Reflect.ownKeys(v).length===7&&v.schema==="rivercloud.recovery.v1"&&typeof v.component==="string"&&typeof v.faultCode==="string"&&STATES.includes(v.state)&&ACTIONS.includes(v.action)&&v.automaticAction===false&&typeof v.requiresApproval==="boolean";}catch{return false;}
}
export function recoveryStates(){return [...STATES];}
