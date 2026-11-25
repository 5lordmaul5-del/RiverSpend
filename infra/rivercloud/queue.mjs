import { validateDeployRequest, planDigest } from "./engine.mjs";
import { readState, transactState } from "./rc11-state.mjs";
const MAX_QUEUE_ITEMS=5000;
const MAX_QUEUE_EVENTS=10000;

export async function queuePlan(file, input) {
  const plan = validateDeployRequest(input);
  const digest = planDigest(plan);
  return transactState(file, state => {
    // Idempotent retries remain successful even when the queue is at capacity.
    const existing = state.jobs.find(j => j.digest === digest);
    if (existing) return { job: existing, duplicate: true };
    if (state.jobs.length >= MAX_QUEUE_ITEMS || state.events.length >= MAX_QUEUE_EVENTS) {
      throw new Error("queue_capacity_exceeded");
    }
    const job = { id: digest, digest, plan, createdAt: new Date().toISOString(), state: "accepted_not_executed" };
    state.jobs.unshift(job);
    state.events.push({ event: "job_created", jobId: job.id, digest, at: job.createdAt });
    return { job, duplicate: false };
  });
}

export async function listQueue(file) {
  return (await readState(file)).jobs;
}
