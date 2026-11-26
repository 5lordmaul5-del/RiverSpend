import test from 'node:test';import assert from 'node:assert/strict';import {buildIncidentTimeline} from './incident-timeline.mjs';
const e=(id,t)=>({id,kind:'failure',component:'x',summary:'symptom',timestamp:t,source:'fixture'});
test('sorts incident events deterministically',()=>{const x=buildIncidentTimeline([e('b',5),e('a',3)]);assert.deepEqual(x.events.map(z=>z.id),['a','b']);assert.equal(x.causalInference,false);});
test('rejects duplicate IDs',()=>{assert.throws(()=>buildIncidentTimeline([e('a',1),e('a',2)]));});
