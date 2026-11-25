const MAX_FINDINGS=80;
const SAFE_STATUSES=new Set(['queued']);
const SAFE_KINDS=new Set(['node-test','syntax-check','unit-test','lint','build-check']);
const forbidden=new Set(['--privileged','--network=host','--pid=host','--ipc=host','--device','--mount','--env','-e','--publish','-p']);
const required=['--network','none','--read-only','--cap-drop','ALL','--security-opt','no-new-privileges'];
function add(findings,code,severity,message){findings.push({code,severity,message});}
function planCheck(plan,findings){
 if(!plan||plan.executable!=='docker'||plan.executionMode!=='container'){add(findings,'PLAN_TYPE','deny','Only the restricted Docker container plan is accepted');return;}
 if(plan.approvalRequired!==true||plan.networkDisabled!==true||plan.readOnlyWorkspace!==true){add(findings,'PLAN_FLAGS','deny','Plan must explicitly require approval, disable network, and use a read-only workspace');}
 const a=plan.args;
 if(!Array.isArray(a)||a.length<2||a[0]!=='run'){add(findings,'PLAN_ARGS','deny','Docker run argument list is missing or malformed');return;}
 for(let i=0;i<required.length;i+=2){const ix=a.indexOf(required[i]);if(ix<0||a[ix+1]!==required[i+1])add(findings,'DOCKER_RESTRICTION','deny','Required Docker isolation option is absent or weakened');}
 for(const token of a){if(forbidden.has(token)||token.startsWith('--network=host')||token.startsWith('--mount=')||token.startsWith('--volume=')||token.startsWith('-v='))add(findings,'DOCKER_OPTION','deny','Forbidden or unreviewed Docker option detected');}
 if(!a.includes('--rm')||!a.includes('--memory')||!a.includes('--cpus')||!a.includes('--pids-limit')||!a.includes('--user'))add(findings,'RESOURCE_LIMITS','deny','Container resource limits and non-root user must be explicit');
 const mounts=a.filter(x=>x==='-v'||x==='--volume'||x.startsWith('--volume=')||x==='--mount'||x.startsWith('--mount='));
 if(mounts.length!==1)add(findings,'MOUNT_POLICY','deny','Exactly one workspace mount is required');
 else {const idx=a.indexOf(mounts[0]);const value=mounts[0].startsWith('--volume=')?mounts[0].slice(9):a[idx+1];if(typeof value!=='string'||!value.endsWith(':/workspace:ro'))add(findings,'MOUNT_POLICY','deny','Workspace must be mounted read-only at /workspace');}
 if(a.includes('--network=none')&&!a.includes('--network'))add(findings,'NETWORK_SYNTAX','deny','Network isolation must use the approved argument form');
}
export class RiverBuildGuardian{
 constructor({allowedKinds=[...SAFE_KINDS],maxFindings=MAX_FINDINGS}={}){if(!Array.isArray(allowedKinds)||!allowedKinds.length||allowedKinds.some(k=>typeof k!=='string'))throw Error('allowedKinds must be a nonempty string list');if(!Number.isInteger(maxFindings)||maxFindings<1||maxFindings>MAX_FINDINGS)throw Error('maxFindings must be 1..80');this.allowedKinds=new Set(allowedKinds);this.maxFindings=maxFindings;}
 evaluate({job=null,commandPlan=null}={}){
  const findings=[];
  if(!job||typeof job!=='object'){add(findings,'JOB_REQUIRED','deny','A job object is required');}
  else{
   if(typeof job.id!=='string'||!job.id.trim())add(findings,'JOB_ID','deny','Job ID is required');
   if(!SAFE_STATUSES.has(job.status))add(findings,'JOB_STATUS','deny','Only queued jobs can pass Guardian');
   if(typeof job.project!=='string'||!job.project.trim())add(findings,'PROJECT_REQUIRED','deny','A project identifier is required');
   if(typeof job.kind!=='string'||!this.allowedKinds.has(job.kind))add(findings,'KIND_NOT_ALLOWED','deny','Job kind is not in the Guardian allowlist');
   if(job.approved!==true||typeof job.approvedBy!=='string'||!job.approvedBy.trim()||typeof job.approvedAt!=='string'||!Number.isFinite(Date.parse(job.approvedAt)))add(findings,'APPROVAL_REQUIRED','review','Explicit approval metadata (approved, approvedBy, approvedAt) is required');
  }
  planCheck(commandPlan,findings);
  findings.splice(this.maxFindings);
  const denied=findings.some(x=>x.severity==='deny'),review=findings.some(x=>x.severity==='review');
  const decision=denied?'deny':review?'review-required':'allow';
  return Object.freeze({guardianId:'guardian-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),decision,approvedForExecution:decision==='allow',executionTriggered:false,readOnly:true,findings:Object.freeze(findings),counts:{deny:findings.filter(x=>x.severity==='deny').length,review:findings.filter(x=>x.severity==='review').length,total:findings.length},policy:{allowedKinds:[...this.allowedKinds],queuedOnly:true,explicitApprovalRequired:true,networkDisabled:true,readOnlyWorkspace:true}});
 }
}
