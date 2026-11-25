/** Disabled-by-default execution boundary; requires an injected executor. */
const MAX_OUTPUT=16000,MAX_TIMEOUT=120000;
const REQUIRED=['--network','none','--read-only','--cap-drop','ALL','--security-opt','no-new-privileges'];
function validatePlan(p){
 if(!p||p.executable!=='docker'||p.executionMode!=='container'||p.approvalRequired!==true||p.networkDisabled!==true||p.readOnlyWorkspace!==true)throw Error('Restricted Docker plan required');
 const a=p.args;if(!Array.isArray(a)||a[0]!=='run')throw Error('Restricted Docker plan required');
 for(let i=0;i<REQUIRED.length;i+=2)if(!a.includes(REQUIRED[i])||a[a.indexOf(REQUIRED[i])+1]!==REQUIRED[i+1])throw Error('Docker restrictions missing');
 if(a.includes('--privileged')||a.includes('--network=host')||a.includes('--pid=host')||a.includes('--ipc=host'))throw Error('Unsafe Docker option rejected');
 const mounts=a.filter((x,i)=>x==='-v'||x==='--volume'||x.startsWith('--volume='));
 if(mounts.length!==1)throw Error('Workspace mount policy required');
 const mountIndex=a.indexOf(mounts[0]);const mountValue=mounts[0].startsWith('--volume=')?mounts[0].slice(9):a[mountIndex+1];
 if(!mountValue||!mountValue.endsWith(':/workspace:ro'))throw Error('Read-only workspace mount required');
 if(!a.includes('--rm')||!a.includes('--memory')||!a.includes('--cpus')||!a.includes('--pids-limit')||!a.includes('--user'))throw Error('Resource limits missing');
}
export class RiverBuildWorker{
 constructor({enabled=false,executor=null,timeoutMs=30000}={}){if(!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>MAX_TIMEOUT)throw Error('timeoutMs must be 1..120000');this.enabled=enabled===true;this.executor=executor;this.timeoutMs=timeoutMs;}
 async run(item){if(!this.enabled)return{status:'disabled',execution:'not-executed'};if(typeof this.executor!=='function')throw Error('Explicit executor adapter required');if(!item?.job||item.job.status!=='running'||item.job.approved!==true)throw Error('Approved running job required');validatePlan(item.commandPlan);const p=item.commandPlan;const controller=new AbortController();let timer;const timeout=new Promise(resolve=>{timer=setTimeout(()=>{controller.abort(new Error('Worker timeout'));resolve({status:'timeout',stderr:'Worker timeout'});},this.timeoutMs);});try{const r=await Promise.race([Promise.resolve().then(()=>this.executor({executable:p.executable,args:[...p.args],timeoutMs:this.timeoutMs,signal:controller.signal})),timeout]);if(r?.status==='timeout')return{status:'timeout',execution:'executor-invoked',stdout:'',stderr:String(r.stderr||'Worker timeout').slice(0,MAX_OUTPUT)};const code=Number.isInteger(r?.exitCode)?r.exitCode:1;return{status:code===0?'passed':'failed',execution:'executor-invoked',exitCode:code,stdout:String(r?.stdout||'').slice(0,MAX_OUTPUT),stderr:String(r?.stderr||'').slice(0,MAX_OUTPUT)};}catch(e){return{status:'failed',execution:'executor-invoked',exitCode:1,stdout:'',stderr:String(e?.message||e).slice(0,MAX_OUTPUT)}}finally{clearTimeout(timer);}}
}
