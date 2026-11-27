import test from "node:test";import assert from "node:assert/strict";import{recommendProfile,createDropoutMonitor,buildSessionSyncPlan,selectSessionStrategy}from"../../lib/riverband/latency-engine.js";
test("stable recommendation after dropout",()=>assert.equal(recommendProfile({dropouts:1}).id,"stable"));
test("responsive profile under clean conditions",()=>assert.equal(recommendProfile({cpuPressure:"low",network:{jitterMs:2,lossPercent:0}}).id,"responsive"));
test("monitor flags timestamp gap",()=>{const m=createDropoutMonitor({thresholdMs:100});m.observe(0);assert.equal(m.observe(150).dropoutSuspected,true);assert.equal(m.count,1);});
test("count-in plan",()=>assert.equal(buildSessionSyncPlan({tempoBpm:120,bars:2}).countInBeats,8));
test("unstable network selects remote recording",()=>assert.equal(selectSessionStrategy({networkRttMs:80,jitterMs:25,lossPercent:2}).strategy,"remote-take"));