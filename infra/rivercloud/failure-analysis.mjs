const SEVERITIES=new Set(['low','medium','high','critical','unknown']);
const SIGNALS=new Set(['input_validation','dependency','timeout','integrity','availability','unknown']);
export function analyzeFailure(input){
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.getPrototypeOf(input)!==Object.prototype)throw new TypeError('invalid input');
 const keys=['id','component','signal','severity','description','timestamp'];for(const k of Object.keys(input))if(!keys.includes(k))throw new TypeError('unexpected key');for(const k of keys){const d=Object.getOwnPropertyDescriptor(input,k);if(!d||!Object.hasOwn(d,'value'))throw new TypeError('missing/accessor');}
 if(typeof input.id!=='string'||!input.id.trim()||typeof input.component!=='string'||!input.component.trim()||!SIGNALS.has(input.signal)||!SEVERITIES.has(input.severity)||typeof input.description!=='string'||input.description.length>2000||!Number.isSafeInteger(input.timestamp)||input.timestamp<0)throw new TypeError('invalid fields');
 const review=input.severity==='high'||input.severity==='critical'||input.signal==='integrity';
 return Object.freeze({schema:'rivercloud.failure-analysis.v1',id:input.id,component:input.component,signal:input.signal,severity:input.severity,description:input.description,timestamp:input.timestamp,triage:review?'manual_review':'observe',rootCauseConfirmed:false,remediationPerformed:false});
}
