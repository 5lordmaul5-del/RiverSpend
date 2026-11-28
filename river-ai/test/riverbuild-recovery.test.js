import test from 'node:test';
import assert from 'node:assert/strict';
import {RiverBuildRecovery} from '../src/riverbuild-recovery.js';
test('failed jobs produce bounded retry proposals requiring approval',()=>{const r=new RiverBuildRecovery({maxAttempts:3});assert.deepEqual(r.evaluate({buildId:'x',status:'failed',attempt:1}),{decision:'retry-proposal',reason:'retryable-failure',attempt:1,nextAttempt:2,maxAttempts:3,requiresApproval:true,automaticEnqueue:false});});
test('attempt limit stops retry proposals',()=>{const r=new RiverBuildRecovery({maxAttempts:2});assert.equal(r.evaluate({buildId:'x',status:'timeout',attempt:2}).reason,'attempt-limit');});
test('success, blocked and cancelled stop',()=>{const r=new RiverBuildRecovery();assert.equal(r.evaluate({buildId:'x',status:'passed'}).reason,'success');assert.equal(r.evaluate({buildId:'x',status:'blocked'}).decision,'stop');assert.equal(r.evaluate({buildId:'x',status:'cancelled'}).decision,'stop');});
test('attempt ledger increments independently and reset works',()=>{const r=new RiverBuildRecovery();assert.equal(r.recordAttempt('x','failed'),1);assert.equal(r.recordAttempt('x','timeout'),2);assert.equal(r.getAttemptCount('x'),2);r.reset('x');assert.equal(r.getAttemptCount('x'),0);});
test('validates constructor, attempts and status',()=>{assert.throws(()=>new RiverBuildRecovery({maxAttempts:0}));const r=new RiverBuildRecovery();assert.throws(()=>r.evaluate({buildId:'x',status:'running'}));assert.throws(()=>r.evaluate({buildId:'x',status:'failed',attempt:0}));});
