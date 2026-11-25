import {RiverBuildGuardian} from './riverbuild-guardian.js';
import {RiverBuildAudit} from './riverbuild-audit.js';
import {RiverBuildIntegrity} from './riverbuild-integrity.js';
/** Read-only decision orchestrator: runs policy, audit, and integrity checks. Never executes or approves jobs. */
export class RiverBuildGatekeeper{
 constructor({guardian=new RiverBuildGuardian(),audit=new RiverBuildAudit(),integrity=new RiverBuildIntegrity()}={}){this.guardian=guardian;this.audit=audit;this.integrity=integrity;}
 evaluate({job=null,commandPlan=null,report=null,recoveryDecision=null,historyRecord=null,expectedHashes={}}={}){
  const policy=this.guardian.evaluate({job,commandPlan});
  const audit=this.audit.audit({job,report,recoveryDecision,historyRecord});
  const integrity=this.integrity.auditBundle({job,report,recoveryDecision,historyRecord,expectedHashes});
  const blockers=[];
  if(policy.decision!=='allow')blockers.push({stage:'guardian',reason:policy.decision});
  if(audit.status!=='clear')blockers.push({stage:'audit',reason:audit.status});
  if(integrity.mismatches>0)blockers.push({stage:'integrity',reason:'mismatch'});
  if(integrity.unanchored>0)blockers.push({stage:'integrity',reason:'unanchored'});
  const ready=blockers.length===0;
  return Object.freeze({gatekeeperId:'gatekeeper-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),decision:ready?'ready-for-human-review':'blocked',readyForHumanReview:ready,executionTriggered:false,approvalGranted:false,readOnly:true,stages:Object.freeze({guardian:policy,audit,integrity}),blockers:Object.freeze(blockers)});
 }
}
