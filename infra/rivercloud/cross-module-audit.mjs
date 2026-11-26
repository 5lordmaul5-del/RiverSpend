import {verifyEvidenceLedger} from './resilience-evidence.mjs';import {buildControlMap} from './control-map.mjs';import {buildIncidentTimeline} from './incident-timeline.mjs';
export function crossModuleAudit(input){
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.getPrototypeOf(input)!==Object.prototype)throw new TypeError('invalid audit input');
 const keys=['ledger','components','events'];for(const k of Object.keys(input))if(!keys.includes(k))throw new TypeError('unexpected key');for(const k of keys){const d=Object.getOwnPropertyDescriptor(input,k);if(!d||!Object.hasOwn(d,'value'))throw new TypeError('missing/accessor');}
 if(!verifyEvidenceLedger(input.ledger))throw new TypeError('ledger invalid');
 const map=buildControlMap(input.components),timeline=buildIncidentTimeline(input.events);
 const eventComponents=new Set(timeline.events.map(e=>e.component));
 const mapComponents=new Set(map.nodes.map(n=>n.id));
 const orphanEvents=timeline.events.filter(e=>!mapComponents.has(e.component)).map(e=>e.id);
 const componentsWithNoEvents=map.nodes.filter(n=>!eventComponents.has(n.id)).map(n=>n.id);
 return Object.freeze({schema:'rivercloud.cross-module-audit.v1',evidenceDigest:input.ledger.digest,componentCount:map.nodes.length,eventCount:timeline.count,orphanEvents:Object.freeze(orphanEvents),componentsWithNoEvents:Object.freeze(componentsWithNoEvents),readOnly:true,certification:false});
}
