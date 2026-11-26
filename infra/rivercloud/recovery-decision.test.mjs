import test from 'node:test';import assert from 'node:assert/strict';
import {createEvidenceRecord,buildEvidenceLedger} from './resilience-evidence.mjs';import {assessRecovery} from './recovery-decision.mjs';
const r=(id,state)=>createEvidenceRecord({id,type:'check',component:'node',state,summary:'status',timestamp:3,sourceDigest:null});
const ledger=states=>buildEvidenceLedger(states.map((s,i)=>r(String(i),s)));
test('healthy with complete evidence suggests observation',()=>{const a=assessRecovery({component:'node',state:'healthy',evidenceLedger:ledger(['passed']),requestedAction:'observe'});assert.equal(a.recommendation,'observe');assert.equal(a.automaticRecovery,false);});
test('failure or missing evidence requires human review',()=>{assert.equal(assessRecovery({component:'node',state:'faulted',evidenceLedger:ledger(['failed']),requestedAction:'isolate_recommendation'}).recommendation,'manual_review');assert.equal(assessRecovery({component:'node',state:'degraded',evidenceLedger:ledger(['not_run']),requestedAction:'observe'}).recommendation,'manual_review');});
test('rejects unexpected input fields',()=>{assert.throws(()=>assessRecovery({component:'node',state:'healthy',evidenceLedger:ledger([]),requestedAction:'observe',extra:true}));});
