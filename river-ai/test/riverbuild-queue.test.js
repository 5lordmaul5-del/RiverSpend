import test from 'node:test';
import assert from 'node:assert/strict';
import { RiverBuildQueue } from '../src/riverbuild-queue.js';

const req=(project,kind='node-test')=>({project,kind,entry:kind==='node-test'?'test':'src/index.js'});

test('enqueue, claim, finish and summary states',()=>{
 const q=new RiverBuildQueue();const j=q.enqueue(req('alpha'));
 assert.equal(j.status,'queued');const c=q.claimNext();assert.equal(c.id,j.id);assert.equal(c.status,'running');
 assert.equal(q.finish(j.id,'passed').status,'passed');assert.equal(q.summary().passed,1);
});
test('priority ordering and concurrency cap',()=>{
 const q=new RiverBuildQueue({maxConcurrent:1});q.enqueue(req('low'),{priority:'low'});q.enqueue(req('high'),{priority:'high'});
 assert.equal(q.claimNext().project,'high');assert.equal(q.claimNext(),null);
});
test('queue cap and queued cancellation',()=>{
 const q=new RiverBuildQueue({maxQueued:1});const j=q.enqueue(req('one'));assert.throws(()=>q.enqueue(req('two')),/full/);
 assert.equal(q.cancel(j.id).status,'cancelled');assert.equal(q.enqueue(req('two')).status,'queued');
});
test('invalid transitions are rejected',()=>{
 const q=new RiverBuildQueue();const j=q.enqueue(req('a'));assert.throws(()=>q.finish(j.id,'passed'),/running/);
 const running=q.claimNext();assert.throws(()=>q.cancel(running.id),/queued/);
 assert.throws(()=>q.finish(running.id,'cancelled'),/Invalid/);
});
test('bounded history trims terminal records',()=>{
 const q=new RiverBuildQueue({maxHistory:2});const a=q.enqueue(req('a'));q.cancel(a.id);q.enqueue(req('b'));q.enqueue(req('c'));
 assert.equal(q.list().length,2);
});
