import test from 'node:test';import assert from 'node:assert/strict';import {evaluateRecoveryState,createRecoveryLog,recoveryPlan} from '../../lib/riverband/latency-recovery.js';
test('normal conditions classify stable',()=>assert.equal(evaluateRecoveryState({}).state,'stable'));
test('warning thresholds identify telemetry concerns',()=>assert.equal(evaluateRecoveryState({jitterMs:40}).state,'warning'));
test('high loss or dropout classify degraded',()=>assert.equal(evaluateRecoveryState({lossPercent:6}).state,'degraded'));
test('log is bounded and copies snapshot',()=>{const l=createRecoveryLog({maxEntries:2});l.record({type:'a'});l.record({type:'b'});l.record({type:'c'});assert.equal(l.snapshot().length,2);});
test('degraded plan warns without local capture',()=>assert.equal(recoveryPlan('degraded').safe,false));
test('recovering plan uses reference resync',()=>assert.ok(recoveryPlan('recovering',{localCaptureAvailable:true}).actions.includes('resync-from-reference')));
