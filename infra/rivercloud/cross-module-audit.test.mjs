import test from 'node:test';import assert from 'node:assert/strict';import {crossModuleAudit} from './cross-module-audit.mjs';import {buildEvidenceLedger} from './resilience-evidence.mjs';
const ledger=buildEvidenceLedger([]);const comps=[{id:'a',label:'A',status:'healthy',dependencies:[]}];const events=[{id:'ev',kind:'diagnostic',component:'ghost',summary:'s',timestamp:1,source:'fixture'}];
test('detects orphan event references in static audit',()=>{const a=crossModuleAudit({ledger,components:comps,events});assert.deepEqual(a.orphanEvents,['ev']);assert.equal(a.certification,false);});
test('rejects malformed ledger',()=>{assert.throws(()=>crossModuleAudit({ledger:{},components:comps,events}));});
