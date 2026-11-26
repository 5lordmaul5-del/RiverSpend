import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, chmod, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { validateDeployRequest, planDigest } from "../../infra/rivercloud/engine.mjs";
import { digestLifecyclePlan, readAtomicLifecycle } from "../../infra/rivercloud/rc17-atomic-lifecycle.mjs";
import { reconcileAcceptedPlans } from "../../infra/rivercloud/queue-lifecycle-reconciliation.mjs";

async function fixture(t, planOverride) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "rivercloud-reconcile-"));
  await chmod(dir, 0o700);
  t.after(() => rm(dir, { recursive: true, force: true }));
  const queueFile = path.join(dir, "queue.json");
  const lifecycleFile = path.join(dir, "lifecycle.json");
  const plan = planOverride ?? validateDeployRequest({
    projectId: "riverspend", repository: undefined, branch: "main",
    commit: "a".repeat(40), target: "staging"
  });
  const digest = planDigest(plan);
  await writeFile(queueFile, JSON.stringify({ schema: 1, jobs: [{
    id: digest, digest, plan, state: "accepted_not_executed", createdAt: new Date().toISOString()
  }], approvals: [], events: [] }), { mode: 0o600 });
  return { dir, queueFile, lifecycleFile, plan, digest };
}

test("reconciliation creates a lifecycle record from an accepted queue plan", async t => {
  const f = await fixture(t);
  const report = await reconcileAcceptedPlans(f);
  assert.deepEqual(report, { examined: 1, created: 1, alreadyPresent: 0, mismatches: 0 });
  const ledger = await readAtomicLifecycle(f.lifecycleFile);
  assert.equal(ledger.integrity.valid, true);
  assert.equal(ledger.jobs.length, 1);
  assert.equal(ledger.jobs[0].state, "pending");
  assert.equal(ledger.jobs[0].digest, digestLifecyclePlan(f.plan));
});

test("reconciliation is idempotent on repeat invocation", async t => {
  const f = await fixture(t);
  const first = await reconcileAcceptedPlans(f);
  const second = await reconcileAcceptedPlans(f);
  assert.equal(first.created, 1);
  assert.equal(second.alreadyPresent, 1);
  assert.equal(second.created, 0);
  assert.equal(second.mismatches, 0);
});

test("reconciliation reports queue digest/id mismatch without creating lifecycle state", async t => {
  const f = await fixture(t);
  const state = JSON.parse(await (await import("node:fs/promises")).readFile(f.queueFile, "utf8"));
  state.jobs[0].id = "0".repeat(64);
  await writeFile(f.queueFile, JSON.stringify(state), { mode: 0o600 });
  const report = await reconcileAcceptedPlans(f);
  assert.equal(report.examined, 1);
  assert.equal(report.mismatches, 1);
  assert.equal(report.created, 0);
  const ledger = await readAtomicLifecycle(f.lifecycleFile);
  assert.equal(ledger.jobs.length, 0);
});
