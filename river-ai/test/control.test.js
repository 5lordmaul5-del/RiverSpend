import test from "node:test";
import assert from "node:assert/strict";
import {controlSnapshot} from "../src/control.js";
test("RiverControl reports conservative core status",()=>{
 const s=controlSnapshot();assert.equal(s.executionEnabled,false);assert.equal(s.modelConnected,false);assert.equal(s.deploymentEnabled,false);
 assert.equal(s.modules.provider.liveInference,false);assert.equal(s.modules.tools.mutationsEnabled,false);assert.equal(s.modules.tasks.executionEnabled,false);
});
test("snapshot cannot be mutated",()=>{const s=controlSnapshot();assert.equal(Object.isFrozen(s),true);assert.equal(Object.isFrozen(s.modules),true);});
