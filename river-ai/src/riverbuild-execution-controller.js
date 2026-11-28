import {RiverBuildGatekeeper} from './riverbuild-gatekeeper.js';
/** Read-only execution controller: reconciles Gatekeeper and ledger verification; never starts a worker. */
export class RiverBuildExecutionController{
 constructor({gatekeeper=new RiverBuildGatekeeper(),ledger}={}){if(!ledger||typeof ledger.verify!=='function')throw Error('Approval ledger dependency required');this.gatekeeper=gatekeeper;this.ledger=ledger;}
 evaluate({job=null,commandPlan=null,report=null,recoveryDecision=null,historyRecord=null,expectedHashes={},approvalId=null,jobHash=null}={}){
  const gate=this.gatekeeper.evaluate({job,commandPlan,report,recoveryDecision,historyRecord,expectedHashes});
  const approval=this.ledger.verify({approvalId,job,jobHash});
  const blockers=[...gate.blockers];
  if(!approval.valid)blockers.push({stage:'approval-ledger',reason:approval.reason||approval.reasons?.join(',')||'invalid'});
  const ready=blockers.length===0&&gate.readyForHumanReview===true;
  return Object.freeze({controllerId:'controller-'+gate.gatekeeperId,decision:ready?'ready-for-human-review':'blocked',readyForHumanReview:ready,approvalLedger:approval,gatekeeper:gate,blockers:Object.freeze(blockers),executionTriggered:false,workerInvoked:false,approvalGranted:false,readOnly:true,requiresSeparateHumanExecutionAuthorization:true});
 }
}