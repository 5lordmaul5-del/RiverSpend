const VALID=new Set(['passed','failed','timeout','blocked','cancelled']);
const MAX_FINDINGS=100;
function finding(code,severity,message,detail={}){return {code,severity,message,detail};}
/** Read-only audit of a RiverBuild job/report/retry chain; does not mutate queue or history. */
export class RiverBuildAudit{
 audit({job=null,report=null,recoveryDecision=null,historyRecord=null}={}){
  const findings=[];
  if(!job)findings.push(finding('JOB_MISSING','warning','No job context supplied'));
  else{
   if(!job.id)findings.push(finding('JOB_ID_MISSING','warning','Job identifier missing'));
   if(!['queued','running','passed','failed','timeout','blocked','cancelled'].includes(job.status))findings.push(finding('JOB_STATUS_INVALID','error','Unexpected job status'));
   if(job.status==='running'&&!job.approved)findings.push(finding('RUNNING_UNAPPROVED','critical','Running job is not marked approved'));
  }
  if(report){
   if(!VALID.has(report.status))findings.push(finding('REPORT_STATUS_INVALID','error','Report has invalid terminal status'));
   if(report.status==='passed'&&(report.executionVerified!==true||report.exitCode!==0))findings.push(finding('PASS_UNVERIFIED','critical','Pass report lacks verified zero exit code'));
   if(['blocked','cancelled','timeout'].includes(report.status)&&report.exitCode!==null&&report.exitCode!==undefined)findings.push(finding('STATUS_EXITCODE_CONFLICT','error','Non-execution terminal state carries an exit code'));
   if(job&&report.project&&job.project!==report.project)findings.push(finding('PROJECT_MISMATCH','error','Job and report project differ'));
   if(job&&report.kind&&job.kind!==report.kind)findings.push(finding('KIND_MISMATCH','error','Job and report kind differ'));
  }else findings.push(finding('REPORT_MISSING','warning','No report supplied'));
  if(recoveryDecision){
   if(recoveryDecision.decision==='retry-proposal'&&recoveryDecision.requiresApproval!==true)findings.push(finding('RETRY_APPROVAL_MISSING','critical','Retry proposal does not require approval'));
   if(recoveryDecision.decision==='retry-proposal'&&recoveryDecision.automaticEnqueue!==false)findings.push(finding('RETRY_AUTOMATION_UNSAFE','critical','Retry proposal indicates automatic enqueue'));
   if(recoveryDecision.nextAttempt>recoveryDecision.maxAttempts)findings.push(finding('RETRY_LIMIT_BYPASS','critical','Next attempt exceeds configured limit'));
  }
  if(historyRecord&&report&&historyRecord.buildId!==report.buildId)findings.push(finding('HISTORY_ID_MISMATCH','error','History record and report identifiers differ'));
  if(findings.length>MAX_FINDINGS)findings.splice(MAX_FINDINGS);
  const critical=findings.filter(x=>x.severity==='critical').length,error=findings.filter(x=>x.severity==='error').length,warning=findings.filter(x=>x.severity==='warning').length;
  return Object.freeze({auditId:cryptoSafeId(),auditedAt:new Date().toISOString(),status:critical?'critical':error?'issues-found':warning?'warnings':'clear',counts:{critical,error,warning,total:findings.length},findings:Object.freeze(findings),readOnly:true});
 }
}
function cryptoSafeId(){return 'audit-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);}
