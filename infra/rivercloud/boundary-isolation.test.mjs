// RC-159 boundary isolation tests — authored, not executed here.
import assert from "node:assert/strict";
import { isolateBoundaryInput } from "./boundary-isolation.mjs";
assert.deepEqual(isolateBoundaryInput({a:1,b:[true,"ok"]}),Object.assign(Object.create(null),{a:1,b:[true,"ok"]}));
assert.equal(isolateBoundaryInput({a:Infinity}),null);
const cyc={};cyc.self=cyc;assert.equal(isolateBoundaryInput(cyc),null);
const accessor={};Object.defineProperty(accessor,"x",{enumerable:true,get(){throw Error("must not run")}});assert.equal(isolateBoundaryInput(accessor),null);
assert.equal(isolateBoundaryInput({"__proto__":{bad:true}}),null);
