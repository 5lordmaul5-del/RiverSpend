import { createHash } from 'node:crypto';

const MAX_RECORDS = 500;
const MAX_TEXT = 4096;
const STATES = new Set(['not_run','run','blocked','failed','passed','unknown']);
const TYPES = new Set(['test','diagnostic','review','incident','check']);
const own = (o,k)=>Object.prototype.hasOwnProperty.call(o,k);
function cleanText(v,label){
 if(typeof v!=='string'||!v.trim()||v.length>MAX_TEXT) throw new TypeError(label+' invalid');
 return v.trim();
}
function exactObject(v,keys){
 if(!v||typeof v!=='object'||Array.isArray(v)) throw new TypeError('record must be an object');
 const proto=Object.getPrototypeOf(v); if(proto!==Object.prototype&&proto!==null) throw new TypeError('invalid prototype');
 if(Object.getOwnPropertySymbols(v).length) throw new TypeError('symbol keys rejected');
 for(const k of Object.keys(v)) if(!keys.includes(k)) throw new TypeError('unexpected key: '+k);
 for(const k of keys) if(!own(v,k)) throw new TypeError('missing key: '+k);
 for(const k of keys){const d=Object.getOwnPropertyDescriptor(v,k);if(!d||!own(d,'value'))throw new TypeError('accessor rejected');}
}
const canonical=(o)=>JSON.stringify(o);
const digest=(s)=>createHash('sha256').update(s,'utf8').digest('hex');
export function createEvidenceRecord(input){
 const keys=['id','type','component','state','summary','timestamp','sourceDigest'];
 exactObject(input,keys);
 const base={id:cleanText(input.id,'id'),type:input.type,component:cleanText(input.component,'component'),state:input.state,summary:cleanText(input.summary,'summary'),timestamp:input.timestamp,sourceDigest:input.sourceDigest};
 if(!TYPES.has(base.type)||!STATES.has(base.state))throw new TypeError('unsupported type or state');
 if(!Number.isSafeInteger(base.timestamp)||base.timestamp<0)throw new TypeError('timestamp invalid');
 if(base.sourceDigest!==null&&(typeof base.sourceDigest!=='string'||!/^[a-f0-9]{64}$/i.test(base.sourceDigest)))throw new TypeError('sourceDigest must be SHA-256 or null');
 const normalized={...base,sourceDigest:base.sourceDigest?.toLowerCase()??null};
 return Object.freeze({...normalized,digest:digest(canonical(normalized))});
}
export function validateEvidenceRecord(record){
 try{
  exactObject(record,['id','type','component','state','summary','timestamp','sourceDigest','digest']);
  const {digest:provided,...base}=record; const regenerated=createEvidenceRecord(base);
  return provided===regenerated.digest;
 }catch{return false;}
}
export function buildEvidenceLedger(records){
 if(!Array.isArray(records)||records.length>MAX_RECORDS)throw new TypeError('record limit exceeded');
 const checked=records.map(r=>{if(!validateEvidenceRecord(r))throw new TypeError('invalid evidence record');return r;});
 const ids=new Set();for(const r of checked){if(ids.has(r.id))throw new TypeError('duplicate evidence id');ids.add(r.id);}
 const ordered=[...checked].sort((a,b)=>a.timestamp-b.timestamp||a.id.localeCompare(b.id));
 const body={schema:'rivercloud.evidence-ledger.v1',records:ordered};
 return Object.freeze({...body,digest:digest(canonical(body)),counts:Object.freeze(ordered.reduce((acc,r)=>(acc[r.state]=(acc[r.state]||0)+1,acc),{}))});
}
export function verifyEvidenceLedger(ledger){
 try{
  exactObject(ledger,['schema','records','digest','counts']);
  if(ledger.schema!=='rivercloud.evidence-ledger.v1'||!Array.isArray(ledger.records)||ledger.records.length>MAX_RECORDS)return false;
  const rebuilt=buildEvidenceLedger(ledger.records);
  return rebuilt.digest===ledger.digest&&canonical(rebuilt.counts)===canonical(ledger.counts);
 }catch{return false;}
}
