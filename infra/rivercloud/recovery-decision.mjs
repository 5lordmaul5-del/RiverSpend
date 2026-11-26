import {correlateEvidence} from './evidence-correlation.mjs';
const ACTIONS=new Set(['observe','manual_review','isolate_recommendation']);
const STATES=new Set(['healthy','degraded','faulted','unknown']);
export function assessRecovery(input){
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.getPrototypeOf(input)!==Object.prototype)throw new TypeError('invalid input');
 const keys=['component','state','evidenceLedger','requestedAction'];
 for(const k of Object.keys(input))if(!keys.includes(k))throw new TypeError('unexpected key');
 for(const k of keys){const d=Object.getOwnPropertyDescriptor(input,k);if(!d||!Object.hasOwn(d,'value'))throw new TypeError('accessor or missing key');}
 if(typeof input.component!=='string'||!input.component.trim()||!STATES.has(input.state)||!ACTIONS.has(input.requestedAction))throw new TypeError('invalid fields');
 const correlation=correlateEvidence(input.evidenceLedger);
 const counts=correlation.components[input.component]?.states??{};
 let recommendation='observe',reason='No evidence requiring escalation was supplied.';
 if(input.state==='faulted'||(counts.failed||0)>0){recommendation='manual_review';reason='Fault state or failed evidence detected; human review recommended.';}
 else if(input.state==='degraded'||(counts.not_run||0)>0||(counts.unknown||0)>0){recommendation='manual_review';reason='Degraded or incomplete evidence; human review recommended.';}
 else if(input.state==='unknown'){recommendation='manual_review';reason='Component state is unknown.';}
 return Object.freeze({schema:'rivercloud.recovery-assessment.v1',component:input.component,state:input.state,requestedAction:input.requestedAction,recommendation,reason,evidenceDigest:correlation.ledgerDigest,readOnly:true,automaticRecovery:false,decisionAuthority:false});
}
