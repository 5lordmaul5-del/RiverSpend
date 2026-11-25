import test from "node:test";import assert from "node:assert/strict";import {createTask,assessTask} from "../src/task-engine.js";
test("creates a plan but never executes it",()=>{const t=createTask("Review marketplace checkout reliability");assert.equal(t.status,"planned");assert.equal(t.executionEnabled,false);assert.equal(t.requiresApproval,true);assert.equal(assessTask(t).executionEnabled,false);});
test("flags sensitive action goals for additional review",()=>{const t=createTask("deploy production");assert.deepEqual(assessTask(t).flags,["deploy","production"]);assert.equal(t.executionEnabled,false);});
test("rejects empty and excessively long goals",()=>{assert.throws(()=>createTask(""));assert.throws(()=>createTask("x".repeat(4001)));});
