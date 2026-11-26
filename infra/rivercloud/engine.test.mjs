import test from "node:test";
import assert from "node:assert/strict";
import { validateDeployRequest, describePrototype } from "./engine.mjs";

const valid = { projectId: "riverspend", branch: "main", commit: "0123456789abcdef0123456789abcdef01234567", target: "staging" };
test("accepts allowlisted staging plan", () => assert.equal(validateDeployRequest(valid).status, "planned_not_queued"));
test("rejects unknown project", () => assert.throws(() => validateDeployRequest({...valid, projectId:"unknown"}), /project_not_allowlisted/));
test("rejects mutable/non-SHA refs", () => assert.throws(() => validateDeployRequest({...valid, commit:"main"}), /immutable_commit_sha_required/));
test("rejects unsupported target", () => assert.throws(() => validateDeployRequest({...valid, target:"production"}), /target_not_allowed/));
test("does not connect a runner", () => assert.equal(describePrototype().deployable, false));
test("deployment request accessors, hidden extras and symbols fail closed",()=>{
 let getterCalls=0;const hostile={...valid};
 Object.defineProperty(hostile,"projectId",{enumerable:true,get(){getterCalls++;return "riverspend";}});
 assert.throws(()=>validateDeployRequest(hostile),/invalid_request/);assert.equal(getterCalls,0);
 const hidden={...valid};Object.defineProperty(hidden,"extra",{value:"ignored",enumerable:false});
 assert.throws(()=>validateDeployRequest(hidden),/invalid_request/);
 const symbol={...valid};symbol[Symbol("hidden")]="x";assert.throws(()=>validateDeployRequest(symbol),/invalid_request/);
});
