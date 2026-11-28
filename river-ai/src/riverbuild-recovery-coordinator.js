import {RiverBuildRecovery} from './riverbuild-recovery.js';
/** Connects terminal outcomes to the existing queue. Retries are queued unapproved. */
export class RiverBuildRecoveryCoordinator{
 constructor({queue,recovery=new RiverBuildRecovery()}={}){if(!queue)throw Error('queue required');this.queue=queue;this.recovery=recovery;}
 proposeRetry({buildId,job,status,attempt}={}){
  if(!job||typeof job.project!=='string'||!job.project)throw Error('original job context required');
  const recorded=this.recovery.recordAttempt(buildId,status);
  const decision=this.recovery.evaluate({buildId,status,attempt:attempt??recorded});
  if(decision.decision!=='retry-proposal')return {decision,queued:false};
  const retry=this.queue.enqueue({project:job.project,kind:job.kind,entry:job.entry},{priority:job.priority||'normal'});
  return {decision,queued:true,retryJob:retry,requiresApproval:true,automaticExecution:false};
 }
}
