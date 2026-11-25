import { validateDeployRequest, planDigest } from "./engine.mjs";
import { readState, transactState } from "./rc11-state.mjs";\nconst MAX_QUEUE_ITEMS=5000;\nconst MAX_QUEUE_EVENTS=10000;

export async function queuePlan(file, input) {
  const plan = validateDeployRequest(input);
  const digest = planDigest(plan);
  return transactState(file, state => {
    const existing = state.jobs.find(j => j.digest === digest);
    if (existing) return { job: existing, duplicate: true };
    const job = { id: digest, digest, plan, createdAt: new Date().toISOString(), state: "accepted_not_executed" };
    state.jobs.unshift(job);
    state.events.push({ event: "job_created", jobId: job.id, digest, at: job.createdAt });
    return { job, duplicate: false };
  });
}

export async function listQueue(file) {
  return (await readState(file)).jobs;
}
