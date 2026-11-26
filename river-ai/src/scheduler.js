import { SpecialistRegistry } from "./specialist-registry.js";
const MAX_QUEUE=1000,MAX_GOAL=4000,MAX_ID=120;
const PRIORITY=Object.freeze({low:1,normal:2,high:3});
function copy(record){return {...record};}
/** In-memory scheduling and assignment only; it never starts a model or specialist process. */
export class SpecialistScheduler {
 #queue=[];#assigned=[];#known=new Set();#registry;
 constructor({registry=new SpecialistRegistry(),maxQueue=MAX_QUEUE}={}) {
  if(!registry||typeof registry.selectForTask!=="function")throw new Error("specialist registry required");
  if(!Number.isInteger(maxQueue)||maxQueue<1||maxQueue>MAX_QUEUE)throw new Error("maxQueue must be 1..1000");
  this.#registry=registry;this.maxQueue=maxQueue;
 }
 enqueue({taskId,goal,domain,priority="normal"}={}) {
  if(typeof taskId!=="string"||!taskId.trim()||taskId.length>MAX_ID)throw new Error("taskId required (max 120)");
  if(typeof goal!=="string"||!goal.trim()||goal.length>MAX_GOAL)throw new Error("goal required (max 4000)");
  if(!Object.hasOwn(PRIORITY,priority))throw new Error("invalid priority");
  if(this.#known.has(taskId))throw new Error("duplicate taskId");
  if(this.#queue.length>=this.maxQueue)throw new Error("scheduler queue full");
  const specialist=this.#registry.selectForTask({taskId,goal,domain});
  const record=Object.freeze({taskId,goal:goal.trim(),domain:specialist.domain,specialistId:specialist.id,priority,status:"queued",createdAt:new Date().toISOString(),executionEnabled:false,processStarted:false});
  this.#queue.push(record);this.#known.add(taskId);return copy(record);
 }
 assignNext() {
  if(!this.#queue.length)return null;
  let index=0;
  for(let i=1;i<this.#queue.length;i++)if(PRIORITY[this.#queue[i].priority]>PRIORITY[this.#queue[index].priority])index=i;
  const queued=this.#queue.splice(index,1)[0];
  const assigned=Object.freeze({...queued,status:"assigned_not_started",assignedAt:new Date().toISOString(),executionEnabled:false,processStarted:false});
  this.#assigned.push(assigned);
  if(this.#assigned.length>this.maxQueue)this.#assigned.shift();
  return copy(assigned);
 }
 get(taskId){const q=this.#queue.find(x=>x.taskId===taskId);if(q)return copy(q);const a=this.#assigned.find(x=>x.taskId===taskId);return a?copy(a):null;}
 listQueue(){return this.#queue.map(copy);}
 listAssigned(){return this.#assigned.map(copy);}
 status(){return Object.freeze({queued:this.#queue.length,assignedNotStarted:this.#assigned.length,activeProcesses:0,maxQueue:this.maxQueue,registryTotal:this.#registry.total,executionEnabled:false,persistence:"memory-only",note:"Assignments are plans; no specialist process is started."});}
}
