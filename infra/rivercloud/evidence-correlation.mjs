import {verifyEvidenceLedger} from './resilience-evidence.mjs';
export function correlateEvidence(ledger){
 if(!verifyEvidenceLedger(ledger))throw new TypeError('invalid evidence ledger');
 const components={};
 for(const r of ledger.records){
  const c=components[r.component]??(components[r.component]={total:0,states:{},types:{}});
  c.total++;c.states[r.state]=(c.states[r.state]||0)+1;c.types[r.type]=(c.types[r.type]||0)+1;
 }
 const summary={components,recordCount:ledger.records.length,ledgerDigest:ledger.digest,readOnly:true,certification:false};
 return Object.freeze(summary);
}
