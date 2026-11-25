import test from 'node:test';import assert from 'node:assert/strict';import {TaskQueue} from './task-queue.mjs';
test('queue assigns id and preserves task',()=>{const q=new TaskQueue();const t=q.enqueue({request:'audit market listings',scope:'market'});assert.ok(t.task_id);assert.equal(q.get(t.task_id).suggested_group,'market');});
test('duplicate id rejected',()=>{const q=new TaskQueue();q.enqueue({task_id:'x',request:'a'});assert.throws(()=>q.enqueue({task_id:'x',request:'b'}),/Duplicate/);});
test('status updates validated',()=>{const q=new TaskQueue();const t=q.enqueue({task_id:'x',request:'a'});assert.equal(q.updateStatus('x','approved').status,'approved');assert.throws(()=>q.updateStatus('x','bogus'),/Invalid status/);});
test('unknown task rejected',()=>{const q=new TaskQueue();assert.throws(()=>q.updateStatus('z','failed'),/not found/);});
