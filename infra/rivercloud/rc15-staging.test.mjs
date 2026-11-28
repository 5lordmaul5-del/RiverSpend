import test from "node:test";
import assert from "node:assert/strict";
import { createStagingPlan, validateWorkerSpec } from "./rc15-staging.mjs";

const base = { project: "riverspend", commit: "a".repeat(40), profile: "node-static", stagingPath: "/staging/demo", approved: true };

test("creates disabled staging plan", () => { const p = createStagingPlan(base); assert.equal(p.executionEnabled, false); assert.equal(validateWorkerSpec(p).ok, true); });
test("requires explicit approval", () => assert.throws(() => createStagingPlan({ ...base, approved: false })));
test("rejects arbitrary profile", () => assert.throws(() => createStagingPlan({ ...base, profile: "shell" })));
test("rejects non sha commit", () => assert.throws(() => createStagingPlan({ ...base, commit: "main" })));
test("rejects spec with execution enabled", () => assert.equal(validateWorkerSpec({ ...createStagingPlan(base), executionEnabled: true }).ok, false));
test("rejects path traversal", () => assert.throws(() => createStagingPlan({ ...base, stagingPath: "/staging/../../prod" })));
test("rejects traversal in worker spec", () => assert.equal(validateWorkerSpec({ ...createStagingPlan(base), stagingPath: "/staging/demo/../prod" }).ok, false));

test("rejects project outside allowlist", () => assert.throws(() => createStagingPlan({ ...base, project: "other-project" }), /project_not_allowlisted/));
test("rejects forged worker limits", () => assert.equal(validateWorkerSpec({ ...createStagingPlan(base), limits: { network: true, readOnly: false, timeoutMs: 999999 } }).reason, "limits_mismatch"));
