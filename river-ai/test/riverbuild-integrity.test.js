import test from 'node:test';import assert from 'node:assert/strict';import {RiverBuildIntegrity} from '../src/riverbuild-integrity.js';
test('stable hash ignores object key order',()=>{const i=new RiverBuildIntegrity();assert.equal(i.fingerprint({a:1,b:2}),i.fingerprint({b:2,a:1}));});
test('compare matches unchanged objects',()=>{const i=new RiverBuildIntegrity();const x={a:1,b:['x']};assert.equal(i.compare({expected:x,actual:{b:['x'],a:1}}).match,true);});
test('compare flags changed payload',()=>{const i=new RiverBuildIntegrity();assert.equal(i.compare({expected:{a:1},actual:{a:2}}).status,'mismatch');});
test('bundle reports mismatches and unanchored components without claiming authenticity',()=>{const i=new RiverBuildIntegrity();const job={id:'1'};const out=i.auditBundle({job,report:{status:'failed'},expectedHashes:{job:i.fingerprint({id:'wrong'})}});assert.equal(out.mismatches,1);assert.equal(out.unanchored,1);assert.equal(out.authenticityVerified,false);});
test('bounds and validates configuration',()=>{assert.throws(()=>new RiverBuildIntegrity({maxItems:0}));});
