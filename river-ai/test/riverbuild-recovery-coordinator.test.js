import test from 'node:test';import assert from 'node:assert/strict';
import {RiverBuildQueue} from '../src/riverbuild-queue.js';
import {RiverBuildRecoveryCoordinator} from '../src/riverbuild-recovery-coordinator.js';
const job={project:'demo',kind:'node-test',entry:'test',priority:'high'};
test('retry proposal creates a fresh unapproved queue item',()=>{const q=new RiverBuildQueue();const rc=new RiverBuildRecoveryCoordinator({queue:q});const out=rc.proposeRetry({buildId:'b1',job,status:'failed',attempt:1});assert.equal(out.queued,true);assert.equal(out.retryJob.status,'queued');assert.equal(out.retryJob.approved,false);assert.equal(out.requiresApproval,true);assert.equal(q.claimNext(),null);});
test('max attempt yields no new queued retry',()=>{const q=new RiverBuildQueue();const rc=new RiverBuildRecoveryCoordinator({queue:q});const out=rc.proposeRetry({buildId:'b2',job,status:'timeout',attempt:3});assert.equal(out.queued,false);assert.equal(out.decision.reason,'attempt-limit');assert.equal(q.list().length,0);});
test('successful outcome stops recovery',()=>{const q=new RiverBuildQueue();const rc=new RiverBuildRecoveryCoordinator({queue:q});assert.equal(rc.proposeRetry({buildId:'b3',job,status:'passed',attempt:1}).queued,false);});
