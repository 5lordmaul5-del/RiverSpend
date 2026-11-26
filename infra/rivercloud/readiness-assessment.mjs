import {verifyEvidenceLedger} from './resilience-evidence.mjs';
import {buildControlMap} from './control-map.mjs';
const EXPECTED=['gateway','observatory','diagnostic-report','boundary-isolation'];
export function assessReadiness(input){
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.getPrototypeOf(input)!==Object.prototype)throw new TypeError('invalid input');
 const keys=['evidenceLedger','components'];for(const k of Object.keys(input))if(!keys.includes(k))throw new TypeError('unexpected key');
 for(const k of keys){const d=Object.getOwnPropertyDescriptor(input,k);if(!d||!Object.hasOwn(d,'value'))throw new TypeError('missing/accessor');}
 if(!verifyEvidenceLedger(input.evidenceLedger))throw new TypeError('invalid evidence');
 const map=buildControlMap(input.components);
 const present=new Set(map.nodes.map(n=>n.id));const missing=EXPECTED.filter(id=>!present.has(id));
 const faults=map.nodes.filter(n=>n.status==='faulted').map(n=>n.id),unknown=map.nodes.filter(n=>n.status==='unknown').map(n=>n.id),degraded=map.nodes.filter(n=>n.status==='degraded').map(n=>n.id);
 const evidenceStates=input.evidenceLedger.records.reduce((a,r)=>(a[r.state]=(a[r.state]||0)+1,a),{});
 const blockers=[...missing.map(x=>'missing:'+x),...faults.map(x=>'faulted:'+x),...(evidenceStates.failed?['failed_evidence:'+evidenceStates.failed]:[])];
 const warnings=[...unknown.map(x=>'unknown:'+x),...degraded.map(x=>'degraded:'+x),...(evidenceStates.not_run?['not_run_evidence:'+evidenceStates.not_run]:[])];
 let status=blockers.length?'not_ready':warnings.length?'review_required':'assessment_only';
 return Object.freeze({schema:'rivercloud.readiness.v1',status,blockers:Object.freeze(blockers),warnings:Object.freeze(warnings),componentCount:map.nodes.length,evidenceCount:input.evidenceLedger.records.length,evidenceDigest:input.evidenceLedger.digest,readinessIsCertification:false,liveChecksPerformed:false,executionAuthorized:false});
}
