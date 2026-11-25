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
