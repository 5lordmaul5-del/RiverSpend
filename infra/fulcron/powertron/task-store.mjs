/**
 * Durable local task store.
 * Atomic snapshot replacement, append-only audit events, strict transition validation.
 * Single-process only: multi-process locking is not implemented.
 */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const transitions={queued_for_review:['approved','cancelled'],approved:['running','cancelled'],running:['completed','failed','cancelled'],completed:[],failed:['approved','cancelled'],cancelled:[]};
export class TaskStore {
 constructor(directory){if(!directory)throw new Error('Storage directory required');this.dir=path.resolve(directory);this.snapshot=path.join(this.dir,'tasks.json');this.audit=path.join(this.dir,'audit.jsonl');fs.mkdirSync(this.dir,{recursive:true,mode:0o700});if(!fs.existsSync(this.snapshot))this.#write({version:1,tasks:[]});}
 #write(data){const tmp=this.snapshot+'.tmp-'+crypto.randomUUID();fs.writeFileSync(tmp,JSON.stringify(data,null,2),{mode:0o600});fs.renameSync(tmp,this.snapshot);}
 #read(){const raw=JSON.parse(fs.readFileSync(this.snapshot,'utf8'));if(raw.version!==1||!Array.isArray(raw.tasks))throw new Error('Invalid task-store snapshot');return raw;}
 #audit(event){fs.appendFileSync(this.audit,JSON.stringify({event_id:crypto.randomUUID(),time:new Date().toISOString(),...event})+'\n',{mode:0o600});}
 create(task){const data=this.#read();if(data.tasks.some(t=>t.task_id===task.task_id))throw new Error('Duplicate task id');data.tasks.push(task);this.#write(data);this.#audit({action:'create',task_id:task.task_id,status:task.status});return structuredClone(task);}
 get(id){return structuredClone(this.#read().tasks.find(t=>t.task_id===id)||null);}
 list(){return structuredClone(this.#read().tasks);}
 transition(id,status,actor='operator'){const data=this.#read(),t=data.tasks.find(x=>x.task_id===id);if(!t)throw new Error('Task not found');if(!Object.hasOwn(transitions,status))throw new Error('Invalid status');if(!transitions[t.status]?.includes(status))throw new Error('Transition not allowed');const before=t.status;t.status=status;t.updated_at=new Date().toISOString();this.#write(data);this.#audit({action:'transition',task_id:id,from:before,to:status,actor});return structuredClone(t);}
}
