import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, chmod, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { validateDeployRequest, planDigest } from "../../infra/rivercloud/engine.mjs";
import { createLifecycleJobAtomic, digestLifecyclePlan, readAtomicLifecycle } from "../../infra/rivercloud/rc17-atomic-lifecycle.mjs";
import { issueApproval, consumeApproval } from "../../infra/rivercloud/approval-bound.mjs";

const secret = "fixture-only-secret-that-is-longer-than-32-characters";
async function fixture(t) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "rivercloud-approval-"));
  await chmod(dir, 0o700);
  t.after(() => rm(dir, { recursive: true, force: true }));
  const plan = validateDeployRequest({ projectId: "riverspend", branch: "main", commit: "a".repeat(40), target: "staging" });
  const digest = digestLifecyclePlan(plan);
  const jobId = digest;
  const storeDir = dir;
  await createLifecycleJobAtomic(path.join(dir, "lifecycle.json"), { jobId, digest, plan, actor: "fixture-creator" });
  const binding = { jobId, projectId: "riverspend", profile: "node-static", target: "staging", commit: plan.commit, digest };
  return { storeDir, binding, digest, jobId };
}

test("one-use approval is consumed atomically and audited", async t => {
  const f = await fixture(t);
  const approval = await issueApproval({ storeDir: f.storeDir, binding: f.binding, secret, approver: "fixture-approver" });
  const result = await consumeApproval({ storeDir: f.storeDir, binding: f.binding, secret, token: approval.token, consumerIdentity: "fixture-consumer" });
  assert.equal(result.approved, true);
  assert.equal(result.jobState, "approved");
  const read = await readAtomicLifecycle(path.join(f.storeDir, "lifecycle.json"));
  assert.equal(read.integrity.valid, true);
  assert.equal(read.jobs[0].state, "approved");
  assert.equal(read.integrity.approvals[Object.keys(read.integrity.approvals)[0]].used, true);
});

test("self-approval is rejected and ledger remains pending", async t => {
  const f = await fixture(t);
  const approval = await issueApproval({ storeDir: f.storeDir, binding: f.binding, secret, approver: "same-identity" });
  await assert.rejects(() => consumeApproval({ storeDir: f.storeDir, binding: f.binding, secret, token: approval.token, consumerIdentity: "same-identity" }), /self_approval_not_allowed/);
  const read = await readAtomicLifecycle(path.join(f.storeDir, "lifecycle.json"));
  assert.equal(read.integrity.valid, true);
  assert.equal(read.jobs[0].state, "pending");
});

test("consumed approval cannot be reused", async t => {
  const f = await fixture(t);
  const approval = await issueApproval({ storeDir: f.storeDir, binding: f.binding, secret, approver: "fixture-approver" });
  await consumeApproval({ storeDir: f.storeDir, binding: f.binding, secret, token: approval.token, consumerIdentity: "fixture-consumer" });
  await assert.rejects(() => consumeApproval({ storeDir: f.storeDir, binding: f.binding, secret, token: approval.token, consumerIdentity: "second-consumer" }), /approval_missing_or_used/);
  const read = await readAtomicLifecycle(path.join(f.storeDir, "lifecycle.json"));
  assert.equal(read.integrity.valid, true);
  assert.equal(read.jobs[0].state, "approved");
});

test("wrong secret cannot consume approval", async t => {
  const f = await fixture(t);
  const approval = await issueApproval({ storeDir: f.storeDir, binding: f.binding, secret, approver: "fixture-approver" });
  await assert.rejects(() => consumeApproval({ storeDir: f.storeDir, binding: f.binding, secret: "wrong-secret-that-is-long-enough-but-not-correct", token: approval.token, consumerIdentity: "fixture-consumer" }), /approval_binding_mismatch/);
  const read = await readAtomicLifecycle(path.join(f.storeDir, "lifecycle.json"));
  assert.equal(read.integrity.valid, true);
  assert.equal(read.jobs[0].state, "pending");
});
