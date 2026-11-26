import test from "node:test";
import assert from "node:assert/strict";
import {canonicalJson} from "./canonical-json.mjs";

test("canonical JSON sorts object keys and preserves array order",()=>{
  assert.equal(canonicalJson({z:1,a:[true,"x"]}), '{"a":[true,"x"],"z":1}');
});
test("rejects sparse arrays and enumerable non-index array properties",()=>{
  const sparse=new Array(2);sparse[1]="x";
  assert.throws(()=>canonicalJson(sparse),/json_array_invalid/);
  const extra=[];extra.note="ignored by JSON but invalid for canonical input";
  assert.throws(()=>canonicalJson(extra),/json_array_invalid/);
});
test("rejects cycles while permitting repeated non-cyclic references",()=>{
  const cycle={};cycle.self=cycle;assert.throws(()=>canonicalJson(cycle),/json_cycle_detected/);
  const shared={value:1};assert.equal(canonicalJson({a:shared,b:shared}), '{"a":{"value":1},"b":{"value":1}}');
});
test("rejects deep input before recursive exhaustion",()=>{
  let root={},cursor=root;for(let i=0;i<40;i++){cursor.child={};cursor=cursor.child;}
  assert.throws(()=>canonicalJson(root),/json_depth_exceeded/);
});
test("rejects byte and node limit overruns",()=>{
  assert.throws(()=>canonicalJson("x".repeat(100),{maxBytes:32}),/json_size_exceeded/);
  assert.throws(()=>canonicalJson([1,2,3],{maxNodes:2}),/json_nodes_exceeded/);
});
test("rejects accessor properties and symbol keys",()=>{
  const getter={};Object.defineProperty(getter,"value",{enumerable:true,get(){return 1;}});
  assert.throws(()=>canonicalJson(getter),/json_object_invalid/);
  assert.throws(()=>canonicalJson({[Symbol("x")]:1}),/json_object_invalid/);
});
test("rejects prototype-sensitive keys and non-JSON values",()=>{
  assert.throws(()=>canonicalJson(JSON.parse('{"__proto__":{"polluted":true}}')),/json_key_invalid/);
  assert.throws(()=>canonicalJson({value:undefined}),/json_value_invalid/);
  assert.throws(()=>canonicalJson({value:Infinity}),/json_number_invalid/);
  assert.equal({}.polluted,undefined);
});
