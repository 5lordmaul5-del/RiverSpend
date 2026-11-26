// Explicit reconciliation adapter between queue plans and the isolated lifecycle ledger.
// NOT wired into HTTP routes or the execution runner. Operator-invoked, fail-closed.
import { listQueue } from "./queue.mjs";
import { planDigest } from "./engine.mjs";
import { readAtomicLifecycle, createLifecycleJobAtomic, digestLifecyclePlan } from "./rc17-atomic-lifecycle.mjs";

export async function reconcileAcceptedPlans({ queueFile, lifecycleFile, actor = "reconciliation" } = {}) {
  if (typeof queueFile !== "string" || typeof lifecycleFile !== "string" || queueFile === lifecycleFile) throw new Error("invalid_reconciliation_paths");
  if (typeof actor !== "string" || !actor.trim() || actor.length > 100) throw new Error("invalid_reconciliation_actor");
  const queueJobs = await listQueue(queueFile);
  const lifecycle = await readAtomicLifecycle(lifecycleFile);
  if (!lifecycle.integrity?.valid) throw new Error("lifecycle_integrity_failure");
  const known = new Map(lifecycle.jobs.map(j => [j.id, j]));
  const report = { examined: 0, created: 0, alreadyPresent: 0, mismatches: 0 };
  for (const queueJob of queueJobs) {
    if (queueJob.state !== "accepted_not_executed") continue;
    report.examined++;
    // Verify the queue's own digest before using the plan as reconciliation input.
    if (!queueJob.plan || planDigest(queueJob.plan) !== String(queueJob.digest ?? "").toLowerCase() ||
        queueJob.id !== queueJob.digest || !/^[a-f0-9]{64}$/i.test(String(queueJob.digest ?? ""))) {
      report.mismatches++; continue;
    }
    // Lifecycle digest is independently computed over the bounded/redacted plan.
    const lifecycleDigest = digestLifecyclePlan(queueJob.plan);
    const lifecycleId = lifecycleDigest;
    const existing = known.get(lifecycleId);
    if (existing) {
      if (existing.digest !== lifecycleDigest || digestLifecyclePlan(existing.plan) !== lifecycleDigest ||
          JSON.stringify(existing.plan) !== JSON.stringify(queueJob.plan)) report.mismatches++;
      else report.alreadyPresent++;
      continue;
    }
    try {
      const created = await createLifecycleJobAtomic(lifecycleFile, { jobId: lifecycleId, digest: lifecycleDigest, plan: queueJob.plan, actor });
      known.set(created.id, created);
      report.created++;
    } catch (e) {
      if (e.message === "job_exists") {
        // Concurrent operator invocation: reread and compare, never assume success.
        const refreshed = await readAtomicLifecycle(lifecycleFile);
        const concurrent = refreshed.jobs.find(j => j.id === lifecycleId);
        if (refreshed.integrity?.valid && concurrent?.digest === lifecycleDigest && digestLifecyclePlan(concurrent.plan) === lifecycleDigest) report.alreadyPresent++;
        else report.mismatches++;
      } else throw e;
    }
  }
  return report;
}
