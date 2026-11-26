import test from 'node:test';import assert from 'node:assert/strict';import {normalizeEvent} from './event-normalizer.mjs';
const e={id:'e1',kind:'failure',component:'gateway',summary:'signal',timestamp:12,source:'test-fixture'};
test('normalizes bounded event',()=>{assert.equal(normalizeEvent(e).normalized,true);});
test('rejects unsupported kind and oversized summary',()=>{assert.throws(()=>normalizeEvent({...e,kind:'execute'}));assert.throws(()=>normalizeEvent({...e,summary:'x'.repeat(2001)}));});
