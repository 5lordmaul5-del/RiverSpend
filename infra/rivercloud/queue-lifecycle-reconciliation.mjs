// Explicit reconciliation adapter between queue plans and the isolated lifecycle ledger.
// This is NOT wired into the HTTP routes or execution runner yet.
// Reconciliation is deliberately operator-invoked and fails closed on mismatched IDs/digests.
import { listQueue } from "./queue.mjs";
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
    // Queue digest is the idempotency key. Lifecycle plan digest is independently derived.
    const lifecycleId = String(queueJob.digest ?? "");
    if (!/^[a-f0-9]{64}$/i.test(lifecycleId)) { report.mismatches++; continue; }
    const existing = known.get(lifecycleId);
    if (existing) {
      if (digestLifecyclePlan(existing.plan) !== existing.digest || digestLifecyclePlan(queueJob.plan) !== existing.digest) report.mismatches++;
      else report.alreadyPresent++;
      continue;
    }
    const derived = digestLifecyclePlan(queueJob.plan);
    // A queue digest and redacted lifecycle digest are distinct domains. Do not force them equal.
    const newId = derived.slice(0,64);
    if (known.has(newId)) { report.mismatches++; continue; }
    try {
      const created = await createLifecycleJobAtomic(lifecycleFile, { jobId: newId, plan: queueJob.plan, actor });
      known.set(created.id, created);
      report.created++;
    } catch (e) {
      if (e.message === "job_exists") report.alreadyPresent++;
      else throw e;
    }
  }
  return report;
}
