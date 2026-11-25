import test from 'node:test';import assert from 'node:assert/strict';import {TaskQueue} from './task-queue.mjs';import {dispatch} from './dispatcher.mjs';
test('dispatcher exposes pending tasks without executing',()=>{const q=new TaskQueue();q.enqueue({task_id:'a',request:'review payment flow',scope:'payments'});const d=dispatch(q);assert.equal(d.length,1);assert.equal(d[0].execution,'disabled');});
test('bounded limit',()=>{const q=new TaskQueue();assert.throws(()=>dispatch(q,0),/Limit/);});
