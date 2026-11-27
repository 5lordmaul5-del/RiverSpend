import test from "node:test";
import assert from "node:assert/strict";
import { createProjectSnapshot, validateProjectSnapshot } from "../../lib/rivercloud/project-snapshot.js";
test("normalizes metadata and counts entries",()=>{const s=createProjectSnapshot({projectId:"p1",projectName:"Studio",items:[{path:"mix.wav",kind:"audio"},{path:""}],createdAt:"2026-01-01T00:00:00Z"});assert.equal(s.itemCount,1);assert.equal(s.items[0].kind,"audio");assert.equal(validateProjectSnapshot(s).valid,true);});
test("requires project identity",()=>assert.throws(()=>createProjectSnapshot({projectName:"x"}),/projectId/));
test("detects invalid count and paths",()=>{const s=createProjectSnapshot({projectId:"p",projectName:"x",items:[{path:"a"}]});assert.equal(validateProjectSnapshot({...s,itemCount:2}).valid,false);assert.equal(validateProjectSnapshot({...s,items:[{path:""}]}).valid,false);});