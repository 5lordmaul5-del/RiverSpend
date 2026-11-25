import { randomUUID } from 'node:crypto';
import { validateBuildRequest } from './riverbuild.js';

const terminal = new Set(['passed','failed','timeout','blocked','cancelled']);
const priorities = new Set(['low','normal','high']);
export class RiverBuildQueue {
  #jobs = [];
  constructor({maxQueued=100, maxConcurrent=2, maxHistory=200}={}) {
    for (const [n,v] of Object.entries({maxQueued,maxConcurrent,maxHistory})) if(!Number.isInteger(v)||v<1) throw new Error(n+' must be a positive integer');
    this.maxQueued=maxQueued; this.maxConcurrent=maxConcurrent; this.maxHistory=maxHistory;
  }
  enqueue(request,{priority='normal'}={}) {
    const req=validateBuildRequest(request);
    if(!priorities.has(priority)) throw new Error('Invalid priority');
    if(this.#jobs.filter(j=>j.status==='queued').length>=this.maxQueued) throw new Error('Queue is full');
    const job={id:randomUUID(),project:req.project,kind:req.kind,entry:req.entry,priority,status:'queued',approved:false,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
    this.#jobs.push(job); this.#trim(); return {...job};
  }
  list(){return this.#jobs.map(j=>({...j}));}
  get(id){const j=this.#jobs.find(x=>x.id===id);return j?({...j}):null;}
  approve(id){const j=this.#jobs.find(x=>x.id===id);if(!j)throw new Error('Job not found');if(j.status!=='queued')throw new Error('Only queued jobs can be approved');if(j.approved)throw new Error('Job already approved');j.approved=true;j.updatedAt=new Date().toISOString();return {...j} ;}\n  cancel(id){const j=this.#jobs.find(x=>x.id===id);if(!j)throw new Error('Job not found');if(j.status!=='queued')throw new Error('Only queued jobs can be cancelled');j.status='cancelled';j.updatedAt=new Date().toISOString();this.#trim();return {...j};}
  claimNext(){if(this.#jobs.filter(j=>j.status==='running').length>=this.maxConcurrent)return null;
    const j=this.#jobs.filter(x=>x.status==='queued'&&x.approved).sort((a,b)=>({high:0,normal:1,low:2}[a.priority]-({high:0,normal:1,low:2}[b.priority])||a.createdAt.localeCompare(b.createdAt))[0];
    if(!j)return null;j.status='running';j.updatedAt=new Date().toISOString();return {...j};
  }
  finish(id,status){if(!terminal.has(status)||status==='cancelled')throw new Error('Invalid completion status');const j=this.#jobs.find(x=>x.id===id);if(!j)throw new Error('Job not found');if(j.status!=='running')throw new Error('Only running jobs can finish');j.status=status;j.updatedAt=new Date().toISOString();this.#trim();return {...j};}
  summary(){return Object.fromEntries(['queued','running','passed','failed','timeout','blocked','cancelled'].map(s=>[s,this.#jobs.filter(j=>j.status===s).length]));}
  #trim(){while(this.#jobs.length>this.maxHistory){const i=this.#jobs.findIndex(j=>terminal.has(j.status));if(i<0)break;this.#jobs.splice(i,1);}}
}
