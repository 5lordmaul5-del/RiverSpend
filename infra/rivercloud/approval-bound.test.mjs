import test from "node:test";
import assert from "node:assert/strict";
import { issueApproval, consumeApproval } from "./approval-bound.mjs";
import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const binding = { jobId: "jobA", projectId: "riverspend", profile: "node-tests", target: "staging", commit: "a".repeat(40), digest: "b".repeat(64) };

test("approval bound to exact plan and single use", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rc10-"));
  try {
    const secret = "s".repeat(40), issued = await issueApproval({ storeDir: root, binding, secret, approver: "reviewer" });
    assert.equal((await consumeApproval({ storeDir: root, binding, secret, token: issued.token })).approved, true);
    await assert.rejects(() => consumeApproval({ storeDir: root, binding, secret, token: issued.token }), /used/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("approval cannot be applied to changed commit", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rc10-"));
  try {
    const secret = "s".repeat(40), issued = await issueApproval({ storeDir: root, binding, secret, approver: "reviewer" }), changed = { ...binding, commit: "c".repeat(40) };
    await assert.rejects(() => consumeApproval({ storeDir: root, binding: changed, secret, token: issued.token }), /missing|mismatch/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("two concurrent consume attempts can succeed only once", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rc10-"));
  try {
    const secret = "s".repeat(40), issued = await issueApproval({ storeDir: root, binding, secret, approver: "reviewer" });
    const results = await Promise.allSettled([consumeApproval({ storeDir: root, binding, secret, token: issued.token }), consumeApproval({ storeDir: root, binding, secret, token: issued.token })]);
    assert.equal(results.filter(x => x.status === "fulfilled").length, 1);
    assert.equal(results.filter(x => x.status === "rejected").length, 1);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("rejects malformed digest", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rc10-"));
  try { await assert.rejects(() => issueApproval({ storeDir: root, binding: { ...binding, digest: "not-a-digest" }, secret: "s".repeat(40), approver: "reviewer" }), /invalid_approval_request/); }
  finally { await rm(root, { recursive: true, force: true }); }
});
