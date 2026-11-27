import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createServer } from "./server.mjs";
import { transactState } from "./rc11-state.mjs";

const token = "t".repeat(40), base = { projectId: "riverspend", branch: "main", target: "staging", commit: "b".repeat(40) };

test("server enforces bounded timeout settings and token, queue-only health", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rcs-"));
  const server = createServer({ port: 0, token, storeFile: path.join(root, "state.json") });
  assert.equal(server.requestTimeout, 15_000);
  assert.equal(server.headersTimeout, 10_000);
  assert.equal(server.timeout, 15_000);
  assert.equal(server.keepAliveTimeout, 5_000);
  assert.equal(server.maxRequestsPerSocket, 100);
  try {
    await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
    const address = server.address(), url = "http://127.0.0.1:" + address.port;
    assert.equal((await fetch(url + "/health")).status, 401);
    const h = await fetch(url + "/health", { headers: { authorization: "Bearer " + token } });
    assert.equal(h.status, 200);
    assert.equal((await h.json()).executionEnabled, false);
    const bad = await fetch(url + "/deploy", { method: "POST", headers: { authorization: "Bearer " + token, "content-type": "application/json" }, body: JSON.stringify({ ...base, commit: "main" }) });
    assert.equal(bad.status, 400);
    const requests = await Promise.all(Array.from({ length: 6 }, () => fetch(url + "/deploy", { method: "POST", headers: { authorization: "Bearer " + token, "content-type": "application/json" }, body: JSON.stringify(base) })));
    assert.equal(requests.filter(x => x.status === 202).length, 1);
    assert.equal(requests.filter(x => x.status === 200).length, 5);
    const jobs = await fetch(url + "/jobs", { headers: { authorization: "Bearer " + token } });
    assert.equal((await jobs.json()).jobs.length, 1);
  } finally {
    await new Promise(resolve => server.close(resolve));
    await rm(root, { recursive: true, force: true });
  }
});

test("server rejects duplicate JSON keys before queueing", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rcs-dup-"));
  const file = path.join(root, "state.json");
  const server = createServer({ port: 0, token, storeFile: file });
  try {
    await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
    const url = "http://127.0.0.1:" + server.address().port;
    const raw = '{"projectId":"riverspend","branch":"main","branch":"main","target":"staging","commit":"' + "b".repeat(40) + '"}';
    const response = await fetch(url + "/deploy", { method: "POST", headers: { authorization: "Bearer " + token, "content-type": "application/json" }, body: raw });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error, "invalid_json");
    assert.deepEqual(await import("./queue.mjs").then(m => m.listQueue(file)), []);
  } finally {
    await new Promise(resolve => server.close(resolve));
    await rm(root, { recursive: true, force: true });
  }
});

test("server rejects oversized JSON", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rcs-"));
  const server = createServer({ port: 0, token, storeFile: path.join(root, "state.json") });
  try {
    await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
    const url = "http://127.0.0.1:" + server.address().port;
    const r = await fetch(url + "/deploy", { method: "POST", headers: { authorization: "Bearer " + token, "content-type": "application/json" }, body: JSON.stringify({ padding: "x".repeat(9000) }) });
    assert.equal(r.status, 413);
  } finally {
    await new Promise(resolve => server.close(resolve));
    await rm(root, { recursive: true, force: true });
  }
});

test("server rejects misleading JSON media types", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rcs-"));
  const server = createServer({ port: 0, token, storeFile: path.join(root, "state.json") });
  try {
    await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
    const url = "http://127.0.0.1:" + server.address().port;
    const r = await fetch(url + "/deploy", { method: "POST", headers: { authorization: "Bearer " + token, "content-type": "application/jsonp" }, body: JSON.stringify(base) });
    assert.equal(r.status, 415);
  } finally {
    await new Promise(resolve => server.close(resolve));
    await rm(root, { recursive: true, force: true });
  }
});

test("server maps queue capacity to 503", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rcs-cap-"));
  const file = path.join(root, "state.json");
  await transactState(file, state => { state.jobs = Array.from({ length: 5000 }, (_, i) => ({ id: "cap-" + i, digest: "cap-" + i })); });
  const server = createServer({ port: 0, token, storeFile: file });
  try {
    await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
    const url = "http://127.0.0.1:" + server.address().port;
    const r = await fetch(url + "/deploy", { method: "POST", headers: { authorization: "Bearer " + token, "content-type": "application/json" }, body: JSON.stringify(base) });
    assert.equal(r.status, 503); assert.equal((await r.json()).error, "queue_capacity_exceeded");
  } finally { await new Promise(resolve => server.close(resolve)); await rm(root, { recursive: true, force: true }); }
});
