import {createBuildReport} from './riverbuild-report.js';
const ALLOWED=['passed','failed','timeout','blocked','cancelled'];
/** Converts a worker result into a trustworthy bounded report. */
export function verifyBuildResult({project,kind,result,startedAt,endedAt}={}){
 if(!result||typeof result!=='object')throw new Error('worker result required');
 if(!ALLOWED.includes(result.status))throw new Error('unsupported worker status');
 if(result.status==='passed'&&result.exitCode!==0)throw new Error('pass requires exitCode 0');
 if(result.status==='failed'&&(!Number.isInteger(result.exitCode)||result.exitCode===0))throw new Error('failure requires nonzero exitCode');
 if(['timeout','blocked','cancelled'].includes(result.status)&&result.exitCode!==null&&result.exitCode!==undefined)throw new Error('nonterminal status must not carry exitCode');
 const status=result.status;
 const notes=[];
 if(result.execution==='not-executed')notes.push('Execution was not performed');
 if(result.status==='timeout')notes.push('Worker timed out; executor termination is not independently confirmed');
 return createBuildReport({project,kind,status,startedAt,endedAt,exitCode:result.exitCode??null,stdout:result.stdout??'',stderr:result.stderr??'',notes});
}
