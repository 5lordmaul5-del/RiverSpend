import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, chmod, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createLifecycleJobAtomic, readAtomicLifecycle, transitionLifecycleJobAtomic } from "../../infra/rivercloud/rc17-atomic-lifecycle.mjs";
import { digestLifecyclePlan } from "../../infra/rivercloud/rc17-atomic-lifecycle.mjs";

async function ledgerFixture(t) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "rivercloud-audit-fixture-"));
  await chmod(dir, 0o700);
  t.after(() => rm(dir, { recursive: true, force: true }));
  return path.join(dir, "ledger.json");
}

const plan = Object.freeze({ projectId: "riverspend", repository: "5lordmaul5-del/RiverSpend", branch: "main", commit: "a".repeat(40), target: "staging", status: "planned_not_queued" });

test("lifecycle creation records a verifiable audit entry", async t => {
  const file = await ledgerFixture(t);
  const digest = digestLifecyclePlan(plan);
  const job = await createLifecycleJobAtomic(file, { jobId: digest, digest, plan, actor: "fixture" });
  assert.equal(job.state, "pending");
  const read = await readAtomicLifecycle(file);
  assert.equal(read.integrity.valid, true);
  assert.equal(read.integrity.count, 1);
});

test("direct transition to approved is rejected without approval consumption", async t => {
  const file = await ledgerFixture(t);
  const digest = digestLifecyclePlan(plan);
  await createLifecycleJobAtomic(file, { jobId: digest, digest, plan });
  await assert.rejects(() => transitionLifecycleJobAtomic(file, { jobId: digest, to: "approved", actor: "fixture" }), /approval_required/);
  const read = await readAtomicLifecycle(file);
  assert.equal(read.integrity.valid, true);
  assert.equal(read.jobs[0].state, "pending");
  assert.equal(read.auditRecords.length, 1);
});

test("invalid transition leaves state and audit intact", async t => {
  const file = await ledgerFixture(t);
  const digest = digestLifecyclePlan(plan);
  await createLifecycleJobAtomic(file, { jobId: digest, digest, plan });
  await assert.rejects(() => transitionLifecycleJobAtomic(file, { jobId: digest, to: "completed", actor: "fixture" }), /transition_not_allowed/);
  const read = await readAtomicLifecycle(file);
  assert.equal(read.integrity.valid, true);
  assert.equal(read.jobs[0].state, "pending");
});
