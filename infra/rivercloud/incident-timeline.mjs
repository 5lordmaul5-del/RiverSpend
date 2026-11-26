import {normalizeEvent} from './event-normalizer.mjs';
const INCIDENT_KINDS=new Set(['failure','diagnostic','state_change','review','test']);
export function buildIncidentTimeline(events){
 if(!Array.isArray(events)||events.length>1000)throw new TypeError('event limit');
 const normalized=events.map(normalizeEvent);if(normalized.some(e=>!INCIDENT_KINDS.has(e.kind)))throw new TypeError('kind not timeline eligible');
 const ids=new Set();for(const e of normalized){if(ids.has(e.id))throw new TypeError('duplicate event id');ids.add(e.id);}
 const ordered=normalized.sort((a,b)=>a.timestamp-b.timestamp||a.id.localeCompare(b.id));
 return Object.freeze({schema:'rivercloud.incident-timeline.v1',events:Object.freeze(ordered),count:ordered.length,readOnly:true,causalInference:false});
}
