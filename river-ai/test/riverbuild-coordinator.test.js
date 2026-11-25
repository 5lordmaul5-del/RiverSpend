import test from 'node:test';
import assert from 'node:assert/strict';
import {RiverBuildQueue} from '../src/riverbuild-queue.js';
import {RiverBuildCoordinator} from '../src/riverbuild-coordinator.js';

const request={project:'sample',kind:'node-test',entry:'test'};
test('coordinator does not claim unapproved jobs',()=>{
 const q=new RiverBuildQueue();q.enqueue(request);
 const c=new RiverBuildCoordinator({queue:q,workspaceRoot:'/tmp/work'});
 assert.equal(c.processNext(),null);
});
test('coordinator returns a restricted plan only after approval',()=>{
 const q=new RiverBuildQueue();const job=q.enqueue(request);q.approve(job.id);
 const c=new RiverBuildCoordinator({queue:q,workspaceRoot:'/tmp/work'});
 const result=c.processNext();assert.equal(result.job.status,'running');assert.equal(result.execution,'not-executed');
 assert.equal(result.requiresExternalWorker,true);assert.equal(result.commandPlan.networkDisabled,true);
 assert.equal(result.commandPlan.executable,'docker');
});
