import test from 'node:test';import assert from 'node:assert/strict';
import {createEvidenceRecord,buildEvidenceLedger} from './resilience-evidence.mjs';
import {correlateEvidence} from './evidence-correlation.mjs';
const mk=(id,component,state)=>createEvidenceRecord({id,type:'diagnostic',component,state,summary:'summary',timestamp:10,sourceDigest:null});
test('correlates evidence counts per component without certification',()=>{const l=buildEvidenceLedger([mk('1','gateway','passed'),mk('2','gateway','not_run'),mk('3','api','failed')]);const r=correlateEvidence(l);assert.equal(r.components.gateway.total,2);assert.equal(r.components.gateway.states.not_run,1);assert.equal(r.components.api.states.failed,1);assert.equal(r.certification,false);assert.equal(r.readOnly,true);});
test('rejects invalid ledger',()=>{assert.throws(()=>correlateEvidence({}));});
