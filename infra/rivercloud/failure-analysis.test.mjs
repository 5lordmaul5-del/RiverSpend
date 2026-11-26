import test from 'node:test';import assert from 'node:assert/strict';import {analyzeFailure} from './failure-analysis.mjs';
const make=(severity='medium',signal='availability')=>({id:'f1',component:'service',signal,severity,description:'failure symptom',timestamp:4});
test('critical and integrity signals suggest human triage',()=>{assert.equal(analyzeFailure(make('critical')).triage,'manual_review');assert.equal(analyzeFailure(make('low','integrity')).triage,'manual_review');});
test('normal signals are observation only and do not assert root cause',()=>{const a=analyzeFailure(make());assert.equal(a.triage,'observe');assert.equal(a.rootCauseConfirmed,false);assert.equal(a.remediationPerformed,false);});
test('rejects invalid signal',()=>{assert.throws(()=>analyzeFailure({...make(),signal:'execute'}));});
