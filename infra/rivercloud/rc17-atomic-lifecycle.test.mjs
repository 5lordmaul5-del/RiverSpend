import test from "node:test";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createLifecycleJobAtomic, transitionLifecycleJobAtomic, readAtomicLifecycle, verifyAtomicAudit, storeApprovalForLifecycleAtomic } from "./rc17-atomic-lifecycle.mjs";
const digest = "a".repeat(64);
async function sandbox(fn) { const root = await mkdtemp(path.join(os.tmpdir(), "rc17-")); try { await fn(path.join(root, "state.json")); } finally { await rm(root, { recursive: true, force: true }); } }
test("job and initial audit record are committed together", async () => sandbox(async file => { await createLifecycleJobAtomic(file, { jobId: "J1", digest, plan: { target: "staging" }, actor: "test" }); const s = await readAtomicLifecycle(file); assert.equal(s.jobs.length, 1); assert.equal(s.auditRecords.length, 1); assert.equal(s.integrity.valid, true); }));
test("transition and audit record commit atomically and chain verifies", async () => sandbox(async file => { await createLifecycleJobAtomic(file, { jobId: "J2", digest, plan: {} }); await transitionLifecycleJobAtomic(file, { jobId: "J2", to: "rejected", actor: "reviewer" }); const s = await readAtomicLifecycle(file); assert.equal(s.jobs[0].state, "rejected"); assert.equal(s.auditRecords.length, 2); assert.equal(verifyAtomicAudit(s.auditRecords).valid, true); }));
test("illegal transition does not mutate job or audit", async () => sandbox(async file => { await createLifecycleJobAtomic(file, { jobId: "J3", digest, plan: {} }); await assert.rejects(() => transitionLifecycleJobAtomic(file, { jobId: "J3", to: "running" }), /transition_not_allowed/); const s = await readAtomicLifecycle(file); assert.equal(s.jobs[0].state, "pending"); assert.equal(s.auditRecords.length, 1); }));
test("concurrent pending-to-rejected transition succeeds exactly once", async () => sandbox(async file => { await createLifecycleJobAtomic(file, { jobId: "J4", digest, plan: {} }); const results = await Promise.allSettled(Array.from({ length: 12 }, () => transitionLifecycleJobAtomic(file, { jobId: "J4", to: "rejected" }))); assert.equal(results.filter(x => x.status === "fulfilled").length, 1); const s = await readAtomicLifecycle(file); assert.equal(s.jobs[0].state, "rejected"); assert.equal(s.auditRecords.length, 2); assert.equal(s.integrity.valid, true); }));
test("duplicate job creation is blocked and does not add audit", async () => sandbox(async file => { await createLifecycleJobAtomic(file, { jobId: "J5", digest, plan: {} }); await assert.rejects(() => createLifecycleJobAtomic(file, { jobId: "J5", digest, plan: {} }), /job_exists/); const s = await readAtomicLifecycle(file); assert.equal(s.jobs.length, 1); assert.equal(s.auditRecords.length, 1); }));
test("audit redacts sensitive details and detects tampering", async () => sandbox(async file => { await createLifecycleJobAtomic(file, { jobId: "J6", digest, plan: { secret: "not-audit", nested: { accessToken: "unsafe" } }, actor: "reviewer" }); const s = await readAtomicLifecycle(file); assert.equal(s.auditRecords[0].details.secret, undefined); assert.equal(s.jobs[0].plan.secret, "[redacted]"); assert.equal(s.jobs[0].plan.nested.accessToken, "[redacted]"); const mutated = structuredClone(s.auditRecords); mutated[0].details.actor = "attacker"; assert.equal(verifyAtomicAudit(mutated).valid, false); }));
test("rejects invalid IDs and actor", async () => sandbox(async file => { await assert.rejects(() => createLifecycleJobAtomic(file, { jobId: "../x", digest, plan: {} }), /invalid_job/); await assert.rejects(() => createLifecycleJobAtomic(file, { jobId: "J7", digest, plan: {}, actor: " " }), /invalid_job/); }));
test("concurrent distinct jobs persist with audit sequence", async () => sandbox(async file => { await Promise.all(Array.from({ length: 10 }, (_, i) => createLifecycleJobAtomic(file, { jobId: "J" + i, digest: (i + 1).toString(16).padStart(64, "0"), plan: { i } }))); const s = await readAtomicLifecycle(file); assert.equal(s.jobs.length, 10); assert.equal(s.auditRecords.length, 10); assert.equal(s.integrity.valid, true); assert.deepEqual(s.auditRecords.map(x => x.sequence), Array.from({ length: 10 }, (_, i) => i + 1)); }));

test("read detects a job state change without a matching audit transition", async () => sandbox(async file => { await createLifecycleJobAtomic(file, { jobId: "J8", digest, plan: {} }); const { transactState } = await import("./rc11-state.mjs"); await transactState(file, state => { state.lifecycleJobs[0].state = "approved"; }); const s = await readAtomicLifecycle(file); assert.equal(s.integrity.valid, false); assert.equal(s.integrity.reason, "job_audit_state_mismatch"); }));
test("read detects deleted audit history while jobs remain", async () => sandbox(async file => { await createLifecycleJobAtomic(file, { jobId: "J9", digest, plan: {} }); const { transactState } = await import("./rc11-state.mjs"); await transactState(file, state => { state.auditRecords = []; }); const s = await readAtomicLifecycle(file); assert.equal(s.integrity.valid, false); assert.equal(s.integrity.reason, "job_audit_count_mismatch"); }));
test("audit replay rejects an illegal transition even with a recomputed hash", async () => sandbox(async file => { await createLifecycleJobAtomic(file, { jobId: "J10", digest, plan: {} }); await transitionLifecycleJobAtomic(file, { jobId: "J10", to: "rejected" }); const s = await readAtomicLifecycle(file); const records = structuredClone(s.auditRecords); records[1].details.to = "running"; for (let i = 0; i < records.length; i++) { const { hash, ...payload } = records[i]; records[i].hash = createHash("sha256").update(JSON.stringify(payload)).digest("hex"); } assert.equal(verifyAtomicAudit(records).valid, false); assert.equal(verifyAtomicAudit(records).reason, "transition_sequence_invalid"); }));

test("read rejects approval state without matching hash-chain issuance record", async () => sandbox(async file => {
  await createLifecycleJobAtomic(file, { jobId: "J11", digest, plan: {} });
  const { transactState } = await import("./rc11-state.mjs");
  await transactState(file, state => { state.approvals.push({ tokenId: "c".repeat(64), jobId: "J11", binding: { jobId: "J11", digest }, approver: "reviewer", expiresAt: Date.now()+10000, used: false }); });
  const s = await readAtomicLifecycle(file);
  assert.equal(s.integrity.valid, false);
  assert.equal(s.integrity.reason, "approval_audit_count_mismatch");
}));


test("generic lifecycle transitions cannot approve without one-use approval consumption", async () => sandbox(async file => {
  await createLifecycleJobAtomic(file, { jobId: "J12", digest, plan: {} });
  await assert.rejects(() => transitionLifecycleJobAtomic(file, { jobId: "J12", to: "approved", actor: "manual" }), /approval_required/);
  const s = await readAtomicLifecycle(file); assert.equal(s.jobs[0].state, "pending"); assert.equal(s.auditRecords.length, 1); assert.equal(s.integrity.valid, true);
}));

test("audit replay rejects a manually approved transition with a recomputed hash", async () => sandbox(async file => {
  await createLifecycleJobAtomic(file, { jobId: "J13", digest, plan: {} });
  const s = await readAtomicLifecycle(file);
  const payload = { sequence: 2, event: "job_transition", details: { jobId: "J13", from: "pending", to: "approved", actor: "attacker", note: "manual", digest }, at: new Date().toISOString(), previousHash: s.auditRecords[0].hash };
  const hash = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  const records = [...s.auditRecords, { ...payload, hash }];
  assert.equal(verifyAtomicAudit(records).valid, false);
  assert.equal(verifyAtomicAudit(records).reason, "transition_sequence_invalid");
}));


test("malformed lifecycle extension collections fail closed without being reset", async () => sandbox(async file => {
  const { transactState, readState } = await import("./rc11-state.mjs");
  await createLifecycleJobAtomic(file, { jobId: "J14", digest, plan: {} });
  await transactState(file, state => { state.lifecycleJobs = null; });
  assert.equal((await readAtomicLifecycle(file)).integrity.reason, "lifecycle_jobs_schema_invalid");
  await assert.rejects(() => createLifecycleJobAtomic(file, { jobId: "J15", digest, plan: {} }), /lifecycle_jobs_schema_invalid/);
  assert.equal((await readState(file)).lifecycleJobs, null);
  await transactState(file, state => { state.lifecycleJobs = [{ id: "J14", digest, state: "pending", plan: {}, createdAt: "x", updatedAt: "x" }]; state.auditRecords = { damaged: true }; });
  assert.equal((await readAtomicLifecycle(file)).integrity.reason, "audit_records_schema_invalid");
  await assert.rejects(() => transitionLifecycleJobAtomic(file, { jobId: "J14", to: "rejected" }), /audit_records_schema_invalid/);
  assert.deepEqual((await readState(file)).auditRecords, { damaged: true });
}));

test("lifecycle and audit collections enforce explicit capacity bounds", async () => sandbox(async file => {
  const { transactState } = await import("./rc11-state.mjs");
  await transactState(file, state => { state.lifecycleJobs = Array.from({ length: 5000 }, (_, i) => ({ id: "C" + i })); state.auditRecords = []; });
  await assert.rejects(() => createLifecycleJobAtomic(file, { jobId: "CAP", digest, plan: {} }), /lifecycle_job_capacity_exceeded/);
  await transactState(file, state => { state.lifecycleJobs = [{ id: "J16", digest, state: "pending", plan: {}, createdAt: "x", updatedAt: "x" }]; state.auditRecords = Array.from({ length: 10000 }, (_, i) => ({ sequence: i + 1 })); });
  await assert.rejects(() => transitionLifecycleJobAtomic(file, { jobId: "J16", to: "rejected" }), /audit_capacity_exceeded/);
}));

test("approval event ledger fails closed at its capacity", async () => sandbox(async file => {
  await createLifecycleJobAtomic(file, { jobId: "J13", digest, plan: {} });
  const { transactState } = await import("./rc11-state.mjs");
  await transactState(file, state => { state.events = Array.from({ length: 10000 }, () => ({ event: "bounded-test" })); });
  await assert.rejects(() => storeApprovalForLifecycleAtomic(file, {
    tokenId: "b".repeat(64), jobId: "J13", binding: { jobId: "J13", digest },
    expiresAt: Date.now() + 10000, nonce: "nonce-test", approver: "reviewer"
  }), /approval_event_capacity_exceeded/);
}));
