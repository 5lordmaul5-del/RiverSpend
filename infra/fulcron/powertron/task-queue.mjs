/** In-memory task queue prototype. Persistence and execution intentionally absent. */
import { routeTask } from './coordinator.mjs';
export class TaskQueue {
 #tasks = new Map();
 enqueue(input) {
  const routed=routeTask(input);
  const id=routed.task_id || `task-${this.#tasks.size+1}`;
  if(this.#tasks.has(id)) throw new Error('Duplicate task id');
  const task={...routed,task_id:id,created_at:new Date().toISOString(),updated_at:new Date().toISOString()};
  this.#tasks.set(id,task); return structuredClone(task);
 }
 get(id){const t=this.#tasks.get(id);return t?structuredClone(t):null;}
 list(){return [...this.#tasks.values()].map(t=>structuredClone(t));}
 updateStatus(id,status){const t=this.#tasks.get(id);if(!t)throw new Error('Task not found');const allowed=['queued_for_review','approved','running','completed','failed','cancelled'];if(!allowed.includes(status))throw new Error('Invalid status');t.status=status;t.updated_at=new Date().toISOString();return structuredClone(t);}
}
