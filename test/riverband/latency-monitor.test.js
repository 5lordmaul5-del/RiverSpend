import test from "node:test";
import assert from "node:assert/strict";
import { scanAudioCapabilities, listAudioDevices, measureNetworkProbe } from "../../lib/riverband/latency-monitor.js";

test("capability scan safely handles unavailable browser APIs",()=>{
 const result=scanAudioCapabilities({});
 assert.equal(result.audioContextAvailable,false);
 assert.equal(result.webrtcAvailable,false);
});
test("audio device enumeration filters device types",async()=>{
 const result=await listAudioDevices({enumerateDevices:async()=>[{kind:"audioinput",label:"Mic"},{kind:"videoinput"},{kind:"audiooutput",label:"Speaker"}]});
 assert.equal(result.devices.length,2);
});
test("probe calculates average and jitter proxy",async()=>{
 let n=0; const fake=async()=>{n++;return {ok:true}};
 const result=await measureNetworkProbe("https://example.test/ping",{samples:3,fetchImpl:fake});
 assert.equal(result.ok,true); assert.equal(n,3); assert.ok(result.averageMs>=0);
});
test("probe validates sample count",async()=>{await assert.rejects(()=>measureNetworkProbe("x",{samples:1}),TypeError);});
