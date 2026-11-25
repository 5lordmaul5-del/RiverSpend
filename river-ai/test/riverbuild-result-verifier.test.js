import test from 'node:test';import assert from 'node:assert/strict';import {verifyBuildResult} from '../src/riverbuild-result-verifier.js';
const base={project:'demo',kind:'node-test',startedAt:1000,endedAt:2000};
test('verifies successful result only with zero exit code',()=>{const r=verifyBuildResult({...base,result:{status:'passed',exitCode:0,stdout:'ok'}});assert.equal(r.executionVerified,true);assert.equal(r.status,'passed');});
test('rejects contradictory pass',()=>assert.throws(()=>verifyBuildResult({...base,result:{status:'passed',exitCode:2}}),/pass requires/));
test('rejects invalid failed result',()=>assert.throws(()=>verifyBuildResult({...base,result:{status:'failed',exitCode:0}}),/failure requires/));
test('timeout report is not verified',()=>{const r=verifyBuildResult({...base,result:{status:'timeout',stderr:'timeout'}});assert.equal(r.executionVerified,false);assert.ok(r.notes.length);});
test('blocked and cancelled states are retained',()=>{for(const status of ['blocked','cancelled'])assert.equal(verifyBuildResult({...base,result:{status}}).status,status);});
test('bounds output via report factory',()=>{const r=verifyBuildResult({...base,result:{status:'failed',exitCode:1,stdout:'x'.repeat(20000)}});assert.equal(r.stdout.length,12000);});
