import test from "node:test";
import assert from "node:assert/strict";
import {RiverWatch,classifyWatchEvent} from "../src/watch.js";
test("normalizes event fields and limits input strings",()=>{const e=classifyWatchEvent({component:"bogus",severity:"bad",message:"x".repeat(500)});assert.equal(e.component,"core");assert.equal(e.severity,"info");assert.equal(e.message.length,160);});
test("records events and alerts",()=>{const w=new RiverWatch();w.record({severity:"info",message:"ok"});w.record({severity:"warning",message:"warn"});w.record({severity:"critical",message:"crit"});assert.equal(w.summary().eventCount,3);assert.equal(w.summary().unacknowledged,2);assert.equal(w.summary().critical,1);});
test("acknowledgement works",()=>{const w=new RiverWatch();w.record({severity:"warning"});assert.equal(w.acknowledge(0),true);assert.equal(w.summary().unacknowledged,0);assert.equal(w.acknowledge(9),false);});
test("bounded event retention",()=>{const w=new RiverWatch();for(let i=0;i<205;i++)w.record({message:String(i)});assert.equal(w.events().length,200);assert.equal(w.events({limit:3}).length,3);});
test("clear resets state",()=>{const w=new RiverWatch();w.record({severity:"warning"});w.clear();assert.deepEqual(w.summary(),{eventCount:0,alertCount:0,unacknowledged:0,critical:0,warning:0});});
