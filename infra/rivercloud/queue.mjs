import { validateDeployRequest, planDigest } from "./engine.mjs";
import { readState, transactState } from "./rc11-state.mjs";
const MAX_QUEUE_ITEMS=5000;
const MAX_QUEUE_EVENTS=10000;
const ROLES=new Set(["owner","admin","operator","auditor","viewer"]);

function validateActorContext(input) {
  if (input === null || input === undefined) return null;
  try {
    if (!input || typeof input !== "object" || Array.isArray(input) ||
        (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null) ||
        Object.getOwnPropertySymbols(input).length) throw new Error();
    const keys=Reflect.ownKeys(input);
    if(keys.length!==2||keys.some(key=>typeof key!=="string"||!["actorRef","roles"].includes(key)))throw new Error();
    const actorDescriptor=Object.getOwnPropertyDescriptor(input,"actorRef");
    const rolesDescriptor=Object.getOwnPropertyDescriptor(input,"roles");
    if(!actorDescriptor||!actorDescriptor.enumerable||!Object.hasOwn(actorDescriptor,"value")||
       !rolesDescriptor||!rolesDescriptor.enumerable||!Object.hasOwn(rolesDescriptor,"value"))throw new Error();
    const actorRef=actorDescriptor.value,roles=rolesDescriptor.value;
    if(typeof actorRef!=="string"||!/^[a-f0-9]{64}$/i.test(actorRef)||!Array.isArray(roles)||
       Object.getPrototypeOf(roles)!==Array.prototype||Object.getOwnPropertySymbols(roles).length)throw new Error();
    const roleKeys=Reflect.ownKeys(roles);
    if(roles.length<1||roles.length>5||roleKeys.length!==roles.length+1||!roleKeys.includes("length"))throw new Error();
    const values=[];
    for(let i=0;i<roles.length;i++){
      const descriptor=Object.getOwnPropertyDescriptor(roles,String(i));
      if(!descriptor||!descriptor.enumerable||!Object.hasOwn(descriptor,"value")||
         typeof descriptor.value!=="string"||!ROLES.has(descriptor.value))throw new Error();
      values.push(descriptor.value);
    }
    return {actorRef:actorRef.toLowerCase(),roles:[...new Set(values)].sort()};
  } catch {
    throw new Error("invalid_actor_context");
  }
}

export async function queuePlan(file, input, actorContext = null) {
  const plan = validateDeployRequest(input);
  const digest = planDigest(plan);
  const actor = validateActorContext(actorContext);
  return transactState(file, state => {
    // Idempotent retries remain successful even when the queue is at capacity.
    const existing = state.jobs.find(j => j.digest === digest);
    if (existing) return { job: existing, duplicate: true };
    if (state.jobs.length >= MAX_QUEUE_ITEMS || state.events.length >= MAX_QUEUE_EVENTS) {
      throw new Error("queue_capacity_exceeded");
    }
    const job = { id: digest, digest, plan, createdAt: new Date().toISOString(), state: "accepted_not_executed", ...(actor ? { actorRef: actor.actorRef, actorRoles: actor.roles } : {}) };
    state.jobs.unshift(job);
    state.events.push({ event: "job_created", jobId: job.id, digest, at: job.createdAt, ...(actor ? { actorRef: actor.actorRef, actorRoles: actor.roles } : {}) });
    return { job, duplicate: false };
  });
}

export async function listQueue(file) {
  return (await readState(file)).jobs;
}
