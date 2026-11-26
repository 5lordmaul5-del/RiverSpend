import test from 'node:test';
import assert from 'node:assert/strict';
import {createEvidenceRecord,validateEvidenceRecord,buildEvidenceLedger,verifyEvidenceLedger} from './resilience-evidence.mjs';
const rec=(id,state='not_run')=>createEvidenceRecord({id,type:'test',component:'sample',state,summary:'Evidence only; execution status explicit',timestamp:100,sourceDigest:null});
test('record digest validation',()=>{const r=rec('a');assert.equal(validateEvidenceRecord(r),true);assert.equal(validateEvidenceRecord({...r,summary:'tampered'}),false);});
test('ledger deterministic and verified',()=>{const a=rec('a'),b=rec('b','passed');const l=buildEvidenceLedger([b,a]);assert.equal(verifyEvidenceLedger(l),true);assert.deepEqual(l.records.map(x=>x.id),['a','b']);});
test('rejects duplicates and malformed inputs',()=>{assert.throws(()=>buildEvidenceLedger([rec('x'),rec('x')]));assert.throws(()=>createEvidenceRecord({id:'x',type:'bad',component:'c',state:'run',summary:'s',timestamp:1,sourceDigest:null}));});
test('tampered ledger fails verification',()=>{const l=buildEvidenceLedger([rec('a')]);assert.equal(verifyEvidenceLedger({...l,digest:'0'.repeat(64)}),false);});
test('explicit non-run states remain distinct',()=>{const l=buildEvidenceLedger([rec('a','not_run'),rec('b','passed')]);assert.equal(l.counts.not_run,1);assert.equal(l.counts.passed,1);});
