import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {RiverBuildApprovalLedger} from '../src/riverbuild-approval-ledger.js';
import {RiverBuildExecutionAuthorization} from '../src/riverbuild-execution-authorization.js';
import {RiverBuildExecutionController} from '../src/riverbuild-execution-controller.js';
import {RiverBuildIntegrationPreflight} from '../src/riverbuild-integration-preflight.js';
import {RiverBuildIntegrity} from '../src/riverbuild-integrity.js';
import {dockerBuildCommand} from '../src/riverbuild-runner.js';
import {createBuildReport} from '../src/riverbuild-report.js';

const jobHashFor=job=>createHash('sha256').update(JSON.stringify(job)).digest('hex');
function fixture(){
 const integrity=new RiverBuildIntegrity();
 const job={id:'integration-job-1',project:'fixture',kind:'node-test',entry:'test.js',status:'queued',approved:true,approvedBy:'owner',approvedAt:'2026-11-25T22:00:00.000Z'};
 const plan=dockerBuildCommand({project:job.project,kind:job.kind,entry:job.entry},{workspaceRoot:'/tmp/riverbuild',approval:true});
 const report=createBuildReport({project:job.project,kind:job.kind,status:'passed',startedAt:Date.parse('2026-11-25T22:00:00Z'),endedAt:Date.parse('2026-11-25T22:00:01Z'),exitCode:0});
 const jobHash=jobHashFor(job),approvalId='integration-approval-1';
 const ledger=new RiverBuildApprovalLedger();
 ledger.approve({job,approvedBy:'owner',approvedAt:'2026-11-25T22:00:00.000Z',jobHash,approvalId});
 const controller=new RiverBuildExecutionController({ledger});
 const authorization=new RiverBuildExecutionAuthorization();
 const hashes={job:integrity.fingerprint(job),report:integrity.fingerprint(report)};
 const review=controller.evaluate({job,commandPlan:plan,report,expectedHashes:hashes,approvalId,jobHash});
 authorization.issue({review,approvalId,jobId:job.id,jobHash,authorizedBy:'owner',issuedAt:'2026-11-25T22:00:00.000Z',expiresAt:'2026-11-25T22:30:00.000Z',authorizationId:'integration-auth-1'});
 const preflight=new RiverBuildIntegrationPreflight({controller,authorization});
 return {job,plan,report,jobHash,approvalId,ledger,controller,authorization,preflight,hashes};
}
test('integration chain reaches preflight-clear without invoking a worker',()=>{
 const f=fixture();
 const result=f.preflight.evaluate({job:f.job,commandPlan:f.plan,report:f.report,expectedHashes:f.hashes,approvalId:f.approvalId,jobHash:f.jobHash,authorizationId:'integration-auth-1',now:'2026-11-25T22:10:00.000Z'});
 assert.equal(result.decision,'preflight-clear');
 assert.equal(result.preflightClear,true);
 assert.equal(result.workerInvoked,false);
 assert.equal(result.executionTriggered,false);
 assert.equal(result.approvalGranted,false);
 assert.equal(result.readOnly,true);
});
test('integration chain blocks if report integrity hash changes',()=>{
 const f=fixture();
 const altered={...f.report,stdout:'tampered'};
 const result=f.preflight.evaluate({job:f.job,commandPlan:f.plan,report:altered,expectedHashes:f.hashes,approvalId:f.approvalId,jobHash:f.jobHash,authorizationId:'integration-auth-1',now:'2026-11-25T22:10:00.000Z'});
 assert.equal(result.decision,'blocked');
 assert.ok(result.blockers.some(x=>x.stage==='integrity'));
 assert.equal(result.workerInvoked,false);
});
test('integration chain blocks mismatched authorization/job scope',()=>{
 const f=fixture();
 const result=f.preflight.evaluate({job:{...f.job,id:'different-job'},commandPlan:f.plan,report:f.report,expectedHashes:f.hashes,approvalId:f.approvalId,jobHash:f.jobHash,authorizationId:'integration-auth-1',now:'2026-11-25T22:10:00.000Z'});
 assert.equal(result.decision,'blocked');
 assert.equal(result.workerInvoked,false);
});
test('integration chain blocks revoked approval',()=>{
 const f=fixture();
 f.ledger.revoke({approvalId:f.approvalId,revokedBy:'owner',revokedAt:'2026-11-25T22:05:00.000Z'});
 const result=f.preflight.evaluate({job:f.job,commandPlan:f.plan,report:f.report,expectedHashes:f.hashes,approvalId:f.approvalId,jobHash:f.jobHash,authorizationId:'integration-auth-1',now:'2026-11-25T22:10:00.000Z'});
 assert.equal(result.decision,'blocked');
 assert.equal(result.workerInvoked,false);
});
test('integration chain blocks expired authorization',()=>{
 const f=fixture();
 const result=f.preflight.evaluate({job:f.job,commandPlan:f.plan,report:f.report,expectedHashes:f.hashes,approvalId:f.approvalId,jobHash:f.jobHash,authorizationId:'integration-auth-1',now:'2026-11-25T23:00:00.000Z'});
 assert.equal(result.decision,'blocked');
 assert.ok(result.blockers.some(x=>x.stage==='execution-authorization'));
});
