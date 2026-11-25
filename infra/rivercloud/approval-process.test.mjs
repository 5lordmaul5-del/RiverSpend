import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { issueApproval } from "./approval-bound.mjs";
import { createLifecycleJobAtomic, readAtomicLifecycle } from "./rc17-atomic-lifecycle.mjs";
import { readState } from "./rc11-state.mjs";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const approvalModuleUrl = pathToFileURL(path.join(rootDir, "approval-bound.mjs")).href;
const binding = { jobId: "process-race", projectId: "riverspend", profile: "node-tests", target: "staging", commit: "a".repeat(40), digest: "b".repeat(64) };
const secret = "s".repeat(40);

function child(code, args = []) {
  return new Promise((resolve, reject) => {
    const p = spawn(process.execPath, ["-e", code, ...args], { stdio: ["ignore", "pipe", "pipe"] });
    let out = "", err = "";
    p.stdout.on("data", d => out += d);
    p.stderr.on("data", d => err += d);
    p.on("error", reject);
    p.on("close", (status, signal) => resolve({ status, signal, out, err }));
  });
}

test("separate processes race one approval and only one consumes it", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rc26-approval-process-"));
  try {
    await createLifecycleJobAtomic(path.join(root, "lifecycle.json"), { jobId: binding.jobId, digest: binding.digest, plan: binding });
    const issued = await issueApproval({ storeDir: root, binding, secret, approver: "unverified-test-label" });
    const code = `import { consumeApproval } from ${JSON.stringify(approvalModuleUrl)}; try { await consumeApproval({storeDir:process.argv[1],binding:JSON.parse(process.argv[2]),secret:process.argv[3],token:process.argv[4],consumerIdentity:"worker-"+process.pid}); } catch(e) { if(e.message==="approval_missing_or_used") process.exit(2); throw e; }`;
    const args = [root, JSON.stringify(binding), secret, issued.token];
    const runs = await Promise.all(Array.from({ length: 6 }, () => child(code, args)));
    assert.equal(runs.filter(r => r.status === 0).length, 1, runs.map(r => r.err).join("\n"));
    assert.equal(runs.filter(r => r.status === 2).length, 5);
    const state = await readState(path.join(root, "lifecycle.json"));
    assert.equal(state.approvals.length, 1); assert.equal(state.approvals[0].used, true); assert.equal(state.events.filter(e => e.event === "approval_consumed").length, 1);
    const lifecycle = await readAtomicLifecycle(path.join(root, "lifecycle.json"));
    assert.equal(lifecycle.jobs[0].state, "approved"); assert.equal(lifecycle.auditRecords.length, 4); assert.equal(lifecycle.integrity.valid, true); assert.equal(Object.values(lifecycle.integrity.approvals).filter(a => a.used).length, 1);
  } finally { await rm(root, { recursive: true, force: true }); }
});
