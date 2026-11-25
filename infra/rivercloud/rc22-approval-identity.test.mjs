import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { readState } from "./rc11-state.mjs";
import { createLifecycleJobAtomic, readAtomicLifecycle } from "./rc17-atomic-lifecycle.mjs";
import { issueApprovalForIdentity, consumeApprovalForIdentity } from "./rc22-approval-identity.mjs";

const issuer = "https://issuer.example";
const audience = "rivercloud";
const binding = { jobId: "job22", projectId: "riverspend", profile: "node-tests", target: "staging", commit: "a".repeat(40), digest: "b".repeat(64) };
const claims = (subject, roles = ["operator"]) => {
  const now = Date.now();
  return { issuer, subject, audience, issuedAt: now - 1000, expiresAt: now + 60_000, roles };
};
const options = { expectedIssuer: issuer, expectedAudience: audience, verifyIssuer: () => true };
const secret = "r".repeat(40);

test("approval issuance requires verified identity with approve_jobs permission", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rc22-"));
  try {
    await assert.rejects(() => issueApprovalForIdentity({ claims: claims("auditor", ["auditor"]), identityOptions: options, storeDir: root, binding, secret }), /approval_permission_denied/);
    await assert.rejects(() => issueApprovalForIdentity({ claims: claims("unverified"), identityOptions: { ...options, verifyIssuer: () => false }, storeDir: root, binding, secret }), /identity_rejected:signature_not_verified/);
    const issued = await issueApprovalForIdentity({ claims: claims("approver-1"), identityOptions: options, storeDir: root, binding, secret });
    assert.equal(issued.approverIdentity.subject, "approver-1");
    assert.ok(issued.token);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("RC-22 blocks self-consumption and allows one distinct authorized consumer", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rc22-"));
  try {
    const lifecycleFile = path.join(root, "lifecycle.json");
    await createLifecycleJobAtomic(lifecycleFile, { jobId: binding.jobId, digest: binding.digest, plan: binding });
    const approverClaims = claims("approver-1");
    const issued = await issueApprovalForIdentity({ claims: approverClaims, identityOptions: options, storeDir: root, binding, secret });
    await assert.rejects(() => consumeApprovalForIdentity({ claims: approverClaims, identityOptions: options, storeDir: root, binding, secret, token: issued.token }), /self_approval_not_allowed/);
    const consumed = await consumeApprovalForIdentity({ claims: claims("executor-2"), identityOptions: options, storeDir: root, binding, secret, token: issued.token });
    assert.equal(consumed.approved, true);
    assert.equal(consumed.consumer.subject, "executor-2");
    const state = await readState(lifecycleFile);
    assert.equal(state.approvals.filter(a => a.used).length, 1);
    assert.equal(state.events.filter(e => e.event === "approval_consumed").length, 1);
    const lifecycle = await readAtomicLifecycle(lifecycleFile);
    assert.equal(lifecycle.jobs.length, 1);
    assert.equal(lifecycle.jobs[0].state, "pending");
    assert.equal(lifecycle.auditRecords.length, 1);
    assert.equal(lifecycle.integrity.valid, true);
    await assert.rejects(() => consumeApprovalForIdentity({ claims: claims("executor-3"), identityOptions: options, storeDir: root, binding, secret, token: issued.token }), /used/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("RC-22 rejects invalid issuer, audience and role before touching approval state", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rc22-"));
  try {
    const badIssuer = { ...claims("x"), issuer: "https://evil.example" };
    const badAudience = { ...claims("x"), audience: "other" };
    await assert.rejects(() => issueApprovalForIdentity({ claims: badIssuer, identityOptions: options, storeDir: root, binding, secret }), /identity_rejected:issuer_or_audience_mismatch/);
    await assert.rejects(() => consumeApprovalForIdentity({ claims: badAudience, identityOptions: options, storeDir: root, binding, secret, token: "unused" }), /identity_rejected:issuer_or_audience_mismatch/);
    assert.deepEqual((await readState(path.join(root, "lifecycle.json"))).approvals, []);
  } finally { await rm(root, { recursive: true, force: true }); }
});
