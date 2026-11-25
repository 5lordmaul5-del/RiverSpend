import path from 'node:path';
import {validateBuildRequest} from './riverbuild.js';
const IMAGE='node:24-alpine';
export function dockerBuildCommand(request,{workspaceRoot,approval=false}={}){
 const req=validateBuildRequest(request);if(!approval)throw new Error('Explicit approval required');
 if(!workspaceRoot)throw new Error('workspaceRoot required');
 const root=path.resolve(workspaceRoot,req.project),entry=path.resolve(root,req.entry);
 if(!entry.startsWith(root+path.sep))throw new Error('Entry escapes project workspace');
 const relative=path.relative(root,entry).split(path.sep).join('/');
 const command=req.kind==='node-test'?['node','--test',relative]:['node','--check',relative];
 return {executable:'docker',args:['run','--rm','--network','none','--read-only','--cap-drop','ALL','--security-opt','no-new-privileges','--memory','512m','--cpus','1','--pids-limit','64','--user','1000:1000','--tmpfs','/tmp:rw,noexec,nosuid,size=64m','-v',root+':/workspace:ro','-w','/workspace',IMAGE,...command],approvalRequired:true,networkDisabled:true,readOnlyWorkspace:true,executionMode:'container'};
}
export function runnerStatus(){return {module:'RiverBuildRunner',phase:1,executionEnabled:false,containerCommandPlanning:true,dockerRequired:true,manualApprovalRequired:true};}
