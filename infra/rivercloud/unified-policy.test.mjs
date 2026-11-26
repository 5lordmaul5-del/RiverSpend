import test from "node:test";
import assert from "node:assert/strict";
import { resolveProjectPolicy, resolveWorkerProfile } from "./unified-policy.mjs";
test("policy resolves only allowlisted staging project",()=>assert.equal(resolveProjectPolicy("riverspend","main","staging").repository,"5lordmaul5-del/RiverSpend"));
test("rejects branch outside allowlist",()=>assert.throws(()=>resolveProjectPolicy("riverspend","feature/x","staging"),/branch_not_allowlisted/));
test("rejects production target",()=>assert.throws(()=>resolveProjectPolicy("riverspend","main","production"),/target_not_allowed/));
test("resolves only known worker profile",()=>assert.equal(resolveWorkerProfile("node-tests").timeoutSeconds,300));
test("rejects arbitrary profile",()=>assert.throws(()=>resolveWorkerProfile("shell"),/profile_not_allowlisted/));
