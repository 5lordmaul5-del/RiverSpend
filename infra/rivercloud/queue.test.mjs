import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { queuePlan, listQueue } from "./queue.mjs";
import { readState, transactState } from "./rc11-state.mjs";
import { planDigest, validateDeployRequest } from "./engine.mjs";

const base = { projectId: "riverspend", branch: "main", target: "staging", commit: "a".repeat(40) };

test("concurrent duplicate submissions persist exactly one queue job", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rcq-"));
  try {
    const file = path.join(root, "state.json");
    const results = await Promise.all(Array.from({ length: 12 }, () => queuePlan(file, base)));
    assert.equal(results.filter(x => !x.duplicate).length, 1);
    assert.equal((await listQueue(file)).length, 1);
    assert.equal((await readState(file)).events.length, 1);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("concurrent distinct plans are not lost", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rcq-"));
  try {
    const file = path.join(root, "state.json");
    const inputs = Array.from({ length: 8 }, (_, i) => ({ ...base, commit: (i + 1).toString(16).padStart(40, "0") }));
    await Promise.all(inputs.map(x => queuePlan(file, x)));
    const jobs = await listQueue(file);
    assert.equal(jobs.length, 8);
    assert.equal(new Set(jobs.map(x => x.digest)).size, 8);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("queue rejects non-allowlisted plan", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rcq-"));
  try { await assert.rejects(() => queuePlan(path.join(root, "state.json"), { ...base, target: "production" }), /target_not_allowed/); }
  finally { await rm(root, { recursive: true, force: true }); }
});

test("queue fails closed at the configured item cap", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rcq-cap-"));
  try {
    const file = path.join(root, "state.json");
    await transactState(file, state => { state.jobs = Array.from({ length: 5000 }, (_, i) => ({ id: "cap-" + i, digest: "cap-" + i })); });
    await assert.rejects(() => queuePlan(file, base), /queue_capacity_exceeded/);
    assert.equal((await listQueue(file)).length, 5000);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("queue fails closed at the configured event cap", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rcq-event-cap-"));
  try {
    const file = path.join(root, "state.json");
    await transactState(file, state => { state.events = Array.from({ length: 10000 }, (_, i) => ({ event: "cap-" + i })); });
    await assert.rejects(() => queuePlan(file, base), /queue_capacity_exceeded/);
    assert.equal((await readState(file)).events.length, 10000);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("idempotent retry remains accepted when both queue and event caps are reached", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rcq-idempotent-cap-"));
  try {
    const file = path.join(root, "state.json"), digest = planDigest(validateDeployRequest(base));
    await transactState(file, state => {
      state.jobs = Array.from({ length: 5000 }, (_, i) => ({ id: "cap-" + i, digest: i === 0 ? digest : "cap-" + i }));
      state.events = Array.from({ length: 10000 }, (_, i) => ({ event: "cap-" + i }));
    });
    const result = await queuePlan(file, base);
    assert.equal(result.duplicate, true);
    assert.equal((await listQueue(file)).length, 5000);
    assert.equal((await readState(file)).events.length, 10000);
  } finally { await rm(root, { recursive: true, force: true }); }
});


test("authenticated actor attribution is persisted pseudonymously and duplicates never overwrite it", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rcq-actor-"));
  try {
    const file = path.join(root, "state.json");
    const actorA = { actorRef: "a".repeat(64), roles: ["operator"] };
    const actorB = { actorRef: "b".repeat(64), roles: ["operator"] };
    const first = await queuePlan(file, base, actorA);
    assert.equal(first.duplicate, false);
    assert.equal(first.job.actorRef, actorA.actorRef);
    assert.deepEqual(first.job.actorRoles, ["operator"]);
    const retry = await queuePlan(file, base, actorB);
    assert.equal(retry.duplicate, true);
    assert.equal(retry.job.actorRef, actorA.actorRef);
    assert.deepEqual(retry.job.actorRoles, ["operator"]);
    const state = await readState(file);
    assert.equal(state.events.length, 1);
    assert.equal(state.events[0].actorRef, actorA.actorRef);
    assert.deepEqual(state.events[0].actorRoles, ["operator"]);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("queue rejects malformed actor attribution", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rcq-actor-invalid-"));
  try {
    await assert.rejects(() => queuePlan(path.join(root, "state.json"), base, { actorRef: "not-a-hash", roles: ["operator"] }), /invalid_actor_context/);
    await assert.rejects(() => queuePlan(path.join(root, "state.json"), base, { actorRef: "c".repeat(64), roles: ["root"] }), /invalid_actor_context/);
  } finally { await rm(root, { recursive: true, force: true }); }
});


test("retry after uncertain directory-sync durability returns the committed duplicate", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rcq-uncertain-"));
  try {
    const file = path.join(root, "state.json");
    let injected = false;
    await assert.rejects(() => transactState(file, state => {
      const plan = validateDeployRequest(base), digest = planDigest(plan);
      state.jobs.push({ id: digest, digest, plan, createdAt: new Date().toISOString(), state: "accepted_not_executed" });
      state.events.push({ event: "job_created", jobId: digest, digest, at: new Date().toISOString() });
      return digest;
    }, { syncDirectory: async () => { injected = true; throw new Error("simulated_sync_uncertainty"); } }), /state_commit_durability_uncertain/);
    assert.equal(injected, true);
    const retry = await queuePlan(file, base);
    assert.equal(retry.duplicate, true);
    assert.equal((await listQueue(file)).length, 1);
    assert.equal((await readState(file)).events.length, 1);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("rejects corrupt JSON state instead of treating it as an empty queue", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rcq-corrupt-"));
  try {
    const file = path.join(root, "state.json");
    await (await import("node:fs/promises")).writeFile(file, "{partial-json");
    await assert.rejects(() => listQueue(file));
    await assert.rejects(() => queuePlan(file, base));
  } finally { await rm(root, { recursive: true, force: true }); }
});


test("actor context rejects accessor, sparse and hidden data without invoking getters", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rcq-actor-data-only-"));
  try {
    const file = path.join(root, "state.json");
    let getterCalls = 0;
    const accessorContext = { roles: ["operator"] };
    Object.defineProperty(accessorContext, "actorRef", { enumerable: true, get() { getterCalls++; return "a".repeat(64); } });
    await assert.rejects(() => queuePlan(file, base, accessorContext), /invalid_actor_context/);

    const accessorRoles = ["operator"];
    Object.defineProperty(accessorRoles, "0", { enumerable: true, get() { getterCalls++; return "operator"; } });
    await assert.rejects(() => queuePlan(file, base, { actorRef: "b".repeat(64), roles: accessorRoles }), /invalid_actor_context/);

    const sparseRoles = new Array(2);
    sparseRoles[1] = "operator";
    await assert.rejects(() => queuePlan(file, base, { actorRef: "c".repeat(64), roles: sparseRoles }), /invalid_actor_context/);

    const hidden = { actorRef: "d".repeat(64), roles: ["operator"] };
    Object.defineProperty(hidden, "extra", { value: "hidden", enumerable: false });
    await assert.rejects(() => queuePlan(file, base, hidden), /invalid_actor_context/);
    assert.equal(getterCalls, 0);
  } finally { await rm(root, { recursive: true, force: true }); }
});
