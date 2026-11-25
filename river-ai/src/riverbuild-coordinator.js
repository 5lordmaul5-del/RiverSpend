import { dockerBuildCommand } from './riverbuild-runner.js';
/** Claim one approved queue item and produce a Docker plan. Never executes Docker. */
export class RiverBuildCoordinator {
  constructor({queue,workspaceRoot}={}){if(!queue)throw new Error('queue required');if(!workspaceRoot)throw new Error('workspaceRoot required');this.queue=queue;this.workspaceRoot=workspaceRoot;}
  processNext(){
    const job=this.queue.claimNext();if(!job)return null;
    try {
      const commandPlan=dockerBuildCommand({project:job.project,kind:job.kind,entry:job.entry},{workspaceRoot:this.workspaceRoot,approval:job.approved===true});
      return {job,commandPlan,execution:'not-executed',requiresExternalWorker:true};
    } catch(error){
      const finished=this.queue.finish(job.id,'blocked');
      return {job:finished,execution:'not-executed',blocked:true,error:String(error.message||error).slice(0,300)};
    }
  }
}
