import test from "node:test";import assert from "node:assert/strict";import {createMockAdapter,getProviderState} from "../src/provider-adapter.js";
test("provider adapter remains disconnected and never fabricates inference",async()=>{const a=createMockAdapter();assert.equal(getProviderState(a).connected,false);await assert.rejects(()=>a.generate("hello"),/mock-provider-not-connected/);});
test("provider status accurately reports no configured adapter",()=>{assert.deepEqual(getProviderState(),{configured:false,provider:"none",connected:false,capability:"adapter-contract-only"});});
