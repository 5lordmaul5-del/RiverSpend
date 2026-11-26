import test from "node:test";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createProxyApiServer } from "./rc34-proxy-api.mjs";

const basePlan = { projectId: "riverspend", branch: "main", target: "staging", commit: "b".repeat(40) };
const groupRoleMap = { operator: "operator", viewer: "viewer", auditor: "auditor", admin: "admin" };

async function withServer(options, run) {
  const root = await mkdtemp(path.join(os.tmpdir(), "rc34-"));
  const server = createProxyApiServer({ storeFile: path.join(root, "state.json"), ...options });
  try {
    await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, options.host || "127.0.0.1", resolve); });
    const url = "http://127.0.0.1:" + server.address().port;
    await run(url);
  } finally {
    server.closeAllConnections?.();
    await new Promise(resolve => server.close(resolve));
    await rm(root, { recursive: true, force: true });
  }
}

const headers = (user, groups) => ({ "x-forwarded-user": user, "x-forwarded-groups": groups });

test("RC-34 fails closed when direct caller is not the configured proxy", async () => {
  await withServer({}, async url => {
    const r = await fetch(url + "/api/jobs", { headers: headers("spoofed", "operator") });
    assert.equal(r.status, 403);
    assert.equal((await r.json()).error, "untrusted_proxy");
  });
});

test("RC-34 viewer may read queue but cannot submit a plan", async () => {
  await withServer({ trustedProxyAddress: "127.0.0.1", groupRoleMap }, async url => {
    const viewer = headers("viewer-1", "viewer");
    assert.equal((await fetch(url + "/api/jobs", { headers: viewer })).status, 200);
    const denied = await fetch(url + "/api/plan", { method: "POST", headers: { ...viewer, "content-type": "application/json" }, body: JSON.stringify(basePlan) });
    assert.equal(denied.status, 403);
    assert.equal((await denied.json()).error, "permission_denied");
  });
});

test("RC-34 operator may submit plans, but no execution is enabled and retries are idempotent", async () => {
  await withServer({ trustedProxyAddress: "127.0.0.1", groupRoleMap }, async url => {
    const operator = headers("operator-1", "operator");
    const health = await fetch(url + "/api/health", { headers: operator });
    assert.equal(health.status, 200);
    assert.equal((await health.json()).executionEnabled, false);
    const first = await fetch(url + "/api/plan", { method: "POST", headers: { ...operator, "content-type": "application/json" }, body: JSON.stringify(basePlan) });
    assert.equal(first.status, 202);
    const firstBody = await first.json();
    assert.match(firstBody.job.actorRef, /^[a-f0-9]{64}$/);
    assert.equal(firstBody.job.actorRef, createHash("sha256").update("rivercloud-actor-v1\\0operator-1").digest("hex"));
    assert.deepEqual(firstBody.job.actorRoles, ["operator"]);
    assert.doesNotMatch(JSON.stringify(firstBody.job), /operator-1/);
    const duplicate = await fetch(url + "/api/plan", { method: "POST", headers: { ...operator, "content-type": "application/json" }, body: JSON.stringify(basePlan) });
    assert.equal(duplicate.status, 200);
    const duplicateBody = await duplicate.json();
    assert.equal(duplicateBody.duplicate, true);
    assert.equal(duplicateBody.job.actorRef, firstBody.job.actorRef);
    const otherActor = await fetch(url + "/api/plan", { method: "POST", headers: { ...headers("operator-2", "operator"), "content-type": "application/json" }, body: JSON.stringify(basePlan) });
    assert.equal(otherActor.status, 200);
    assert.equal((await otherActor.json()).job.actorRef, firstBody.job.actorRef);
    const jobs = await fetch(url + "/api/jobs", { headers: operator });
    assert.equal((await jobs.json()).jobs.length, 1);
  });
});

test("RC-37 admin may read the job queue", async () => {
  await withServer({ trustedProxyAddress: "127.0.0.1", groupRoleMap }, async url => {
    const admin = headers("admin-1", "admin");
    const response = await fetch(url + "/api/jobs", { headers: admin });
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).jobs, []);
  });
});

test("RC-34 missing identity fails and unmapped groups are denied", async () => {
  await withServer({ trustedProxyAddress: "127.0.0.1", groupRoleMap }, async url => {
    assert.equal((await fetch(url + "/api/jobs")).status, 401);
    const noGroups = await fetch(url + "/api/jobs", { headers: { "x-forwarded-user": "user-1" } });
    assert.equal(noGroups.status, 401);
    const unknown = await fetch(url + "/api/jobs", { headers: headers("user-2", "unmapped-group") });
    assert.equal(unknown.status, 403);
    assert.equal((await unknown.json()).error, "role_not_mapped");
  });
});

test("RC-34 rejects wrong methods, media types and oversized bodies", async () => {
  await withServer({ trustedProxyAddress: "127.0.0.1", groupRoleMap }, async url => {
    const operator = headers("operator-1", "operator");
    const wrongMethod = await fetch(url + "/api/plan", { headers: operator });
    assert.equal(wrongMethod.status, 405);
    const badType = await fetch(url + "/api/plan", { method: "POST", headers: { ...operator, "content-type": "application/jsonp" }, body: JSON.stringify(basePlan) });
    assert.equal(badType.status, 415);
    const oversized = await fetch(url + "/api/plan", { method: "POST", headers: { ...operator, "content-type": "application/json" }, body: JSON.stringify({ padding: "x".repeat(9000) }) });
    assert.equal(oversized.status, 413);
  });
});
