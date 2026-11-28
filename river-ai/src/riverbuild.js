import path from 'node:path';
const allowed=['node-test','syntax-check'];
const namePattern=/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/;
export function validateBuildRequest(req){
 if(!req||typeof req!=='object')throw new Error('Invalid build request');
 if(!namePattern.test(req.project||''))throw new Error('Invalid project name');
 if(!allowed.includes(req.kind))throw new Error('Unsupported build kind');
 if(typeof req.entry!=='string'||!req.entry||req.entry.startsWith('/')||req.entry.includes('..')||req.entry.includes('\\'))throw new Error('Invalid entry path');
 return {project:req.project,kind:req.kind,entry:req.entry};
}
export function buildPlan(request,{workspaceRoot}={}){
 const req=validateBuildRequest(request);if(!workspaceRoot)throw new Error('workspaceRoot required');
 const root=path.resolve(workspaceRoot,req.project),entry=path.resolve(root,req.entry);
 if(!entry.startsWith(root+path.sep))throw new Error('Entry escapes project workspace');
 return {id:req.project,kind:req.kind,workspace:root,entry,steps:req.kind==='node-test'?['inspect workspace','run node --test in isolated sandbox','capture output','report status']:['inspect workspace','run node --check in isolated sandbox','capture output','report status'],executionEnabled:false,approvalRequired:true,networkAccess:false};
}
export function riverBuildStatus(){return {module:'RiverBuild',phase:0,planOnly:true,executionEnabled:false,sandboxRequired:true,approvedKinds:allowed};}
