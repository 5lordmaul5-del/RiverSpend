import {randomUUID} from 'node:crypto';
const MAX_LOG=12000;
export function createBuildReport({project,kind,startedAt=Date.now(),endedAt=Date.now(),exitCode=null,stdout='',stderr='',status='planned',notes=[]}={}){
 if(typeof project!=='string'||!project.trim())throw new Error('project required');
 if(!['node-test','syntax-check'].includes(kind))throw new Error('unsupported kind');
 if(!['planned','passed','failed','timeout','blocked','cancelled'].includes(status))throw new Error('invalid status');
 const start=Number(startedAt),end=Number(endedAt);if(!Number.isFinite(start)||!Number.isFinite(end)||end<start)throw new Error('invalid time range');
 return Object.freeze({buildId:randomUUID(),project,kind,status,startedAt:new Date(start).toISOString(),endedAt:new Date(end).toISOString(),durationMs:end-start,exitCode,stdout:String(stdout).slice(0,MAX_LOG),stderr:String(stderr).slice(0,MAX_LOG),notes:Array.isArray(notes)?notes.slice(0,20).map(n=>String(n).slice(0,500)):[],createdAt:new Date().toISOString(),executionVerified:status==='passed'&&exitCode===0});
}
export function summarizeBuildReport(report){return {buildId:report.buildId,project:report.project,status:report.status,durationMs:report.durationMs,exitCode:report.exitCode,executionVerified:report.executionVerified};}
