/** Integration preflight: reconciles review, ledger approval and execution authorization. Never invokes a worker. */
export class RiverBuildIntegrationPreflight {
 constructor({controller,authorization}={}) {
  if(!controller||typeof controller.evaluate!=='function') throw Error('Execution controller dependency required');
  if(!authorization||typeof authorization.validate!=='function') throw Error('Execution authorization dependency required');
  this.controller=controller; this.authorization=authorization;
 }
 evaluate(input={}) {
  const review=this.controller.evaluate(input);
  const auth=this.authorization.validate({authorizationId:input.authorizationId,jobId:input.job?.id,jobHash:input.jobHash,now:input.now});
  const blockers=[...(review.blockers||[])];
  if(!auth.valid) blockers.push({stage:'execution-authorization',reason:auth.issues?.join(',')||auth.reason||'invalid'});
  if(auth.authorization?.approvalId!==input.approvalId) blockers.push({stage:'execution-authorization',reason:'approval-link-mismatch'});
  const ready=review.decision==='ready-for-human-review'&&review.readyForHumanReview===true&&auth.valid&&auth.authorization?.approvalId===input.approvalId&&blockers.length===0;
  return Object.freeze({decision:ready?'preflight-clear':'blocked',preflightClear:ready,review,authorizationCheck:auth,blockers:Object.freeze(blockers),executionTriggered:false,workerInvoked:false,approvalGranted:false,readOnly:true,requiresExecutionAdapterAndSeparateRuntimeControls:true});
 }
}
