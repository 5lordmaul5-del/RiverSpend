import test from "node:test";
import assert from "node:assert/strict";
import { issueApproval, consumeApproval } from "./approval-bound.mjs";
import { createLifecycleJobAtomic, transitionLifecycleJobAtomic, readAtomicLifecycle } from "./rc17-atomic-lifecycle.mjs";
import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const binding = { jobId: "jobA", projectId: "riverspend", profile: "node-tests", target: "staging", commit: "a".repeat(40), digest: "b".repeat(64) };
async function prepareJob(root, jobId=binding.jobId, digest=binding.digest) { await createLifecycleJobAtomic(path.join(root, "lifecycle.json"), { jobId, digest, plan: binding }); }

test("approval bound to exact plan and single use", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rc10-"));
  try {
    await prepareJob(root); const secret = "s".repeat(40), issued = await issueApproval({ storeDir: root, binding, secret, approver: "reviewer" });
    await assert.rejects(() => consumeApproval({ storeDir: root, binding, secret, token: issued.token }), /consumer_identity_required/);
    await assert.rejects(() => consumeApproval({ storeDir: root, binding, secret, token: issued.token, consumerIdentity: "reviewer" }), /self_approval_not_allowed/);
    const result = await consumeApproval({ storeDir: root, binding, secret, token: issued.token, consumerIdentity: "executor-1" }); assert.equal(result.approved, true); assert.equal(result.jobState, "approved"); const lifecycle = await readAtomicLifecycle(path.join(root, "lifecycle.json")); assert.equal(lifecycle.jobs[0].state, "approved"); assert.equal(lifecycle.auditRecords.length, 2); assert.equal(lifecycle.auditRecords[1].details.note, "approval_consumed");
    await assert.rejects(() => consumeApproval({ storeDir: root, binding, secret, token: issued.token, consumerIdentity: "executor-1" }), /used/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("approval cannot be applied to changed commit", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rc10-"));
  try {
    await prepareJob(root); const secret = "s".repeat(40), issued = await issueApproval({ storeDir: root, binding, secret, approver: "reviewer" }), changed = { ...binding, commit: "c".repeat(40) };
    await assert.rejects(() => consumeApproval({ storeDir: root, binding: changed, secret, token: issued.token, consumerIdentity: "executor-1" }), /missing|mismatch/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("two concurrent consume attempts can succeed only once", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rc10-"));
  try {
    const secret = "s".repeat(40), issued = await issueApproval({ storeDir: root, binding, secret, approver: "reviewer" });
    const results = await Promise.allSettled([consumeApproval({ storeDir: root, binding, secret, token: issued.token, consumerIdentity: "executor-1" }), consumeApproval({ storeDir: root, binding, secret, token: issued.token, consumerIdentity: "executor-1" })]);
    assert.equal(results.filter(x => x.status === "fulfilled").length, 1);
    assert.equal(results.filter(x => x.status === "rejected").length, 1); const lifecycle = await readAtomicLifecycle(path.join(root, "lifecycle.json")); assert.equal(lifecycle.jobs[0].state, "approved"); assert.equal(lifecycle.auditRecords.length, 2);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("rejects malformed digest", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rc10-"));
  try { await assert.rejects(() => issueApproval({ storeDir: root, binding: { ...binding, digest: "not-a-digest" }, secret: "s".repeat(40), approver: "reviewer" }), /invalid_approval_request/); }
  finally { await rm(root, { recursive: true, force: true }); }
});

test("approval issuance requires a matching pending lifecycle job", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rc26-"));
  try {
    await assert.rejects(() => issueApproval({ storeDir: root, binding, secret: "s".repeat(40), approver: "reviewer" }), /approval_job_not_pending/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("failed consumption leaves approval unused and does not append consume event", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rc26-"));
  try {
    await prepareJob(root);
    const secret = "s".repeat(40), issued = await issueApproval({ storeDir: root, binding, secret, approver: "reviewer" });
    await transitionLifecycleJobAtomic(path.join(root, "lifecycle.json"), { jobId: binding.jobId, to: "approved", actor: "separate-test-transition" });
    await assert.rejects(() => consumeApproval({ storeDir: root, binding, secret, token: issued.token, consumerIdentity: "executor-1" }), /job_not_pending/);
    const state = await (await import("./rc11-state.mjs")).readState(path.join(root, "lifecycle.json"));
    assert.equal(state.approvals[0].used, false);
    assert.equal(state.events.filter(e => e.event === "approval_consumed").length, 0);
  } finally { await rm(root, { recursive: true, force: true }); }
});
