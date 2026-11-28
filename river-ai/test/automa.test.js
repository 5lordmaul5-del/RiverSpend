import test from "node:test";
import assert from "node:assert/strict";
import {listAutomaServices,getAutomaOverview,getService} from "../src/automa.js";
test("RiverAutoma overview is explicitly non-executing",()=>{const o=getAutomaOverview();assert.equal(o.executionEnabled,false);assert.equal(o.installationEnabled,false);});
test("ecosystem includes own planned components and external adapters",()=>{const s=listAutomaServices();assert.ok(s.some(x=>x.id==="river-git"&&x.ownership==="planned"));assert.ok(s.some(x=>x.id==="river-deploy"&&x.ownership==="planned"));assert.ok(s.some(x=>x.id==="github-adapter"&&x.externalDependency));assert.ok(s.some(x=>x.id==="vercel-adapter"&&x.externalDependency));});
test("service lookup returns copy or null",()=>{const s=getService("river-ai");assert.equal(s.name,"RiverSSAI");assert.equal(getService("unknown"),null);s.name="altered";assert.equal(getService("river-ai").name,"RiverSSAI");});
