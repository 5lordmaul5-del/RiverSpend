import test from "node:test";
import assert from "node:assert/strict";
import {createMockAdapter,createOllamaAdapter,getProviderState} from "../src/provider-adapter.js";

test("mock provider remains disconnected and never fabricates inference",async()=>{const a=createMockAdapter();assert.equal(getProviderState(a).connected,false);await assert.rejects(()=>a.generate("hello"),/mock-provider-not-connected/);});
test("provider status accurately reports no configured adapter",()=>{assert.deepEqual(getProviderState(),{configured:false,provider:"none",connected:false,capability:"adapter-contract-only"});});

test("local Ollama adapter sends bounded non-streaming request and reports state",async()=>{
 let seen;
 const adapter=createOllamaAdapter({baseUrl:"http://127.0.0.1:11434",model:"local-model:8b",fetchImpl:async(url,init)=>{seen={url,init};return{ok:true,json:async()=>({response:"local result",done:true})};}});
 assert.equal(adapter.connected,false);assert.equal(getProviderState(adapter).connected,false);
 const result=await adapter.generate("review this",{numPredict:64,temperature:0.3});
 assert.equal(seen.url,"http://127.0.0.1:11434/api/generate");assert.equal(seen.init.method,"POST");assert.equal(seen.init.signal instanceof AbortSignal,true);
 const body=JSON.parse(seen.init.body);assert.equal(body.stream,false);assert.equal(body.model,"local-model:8b");assert.equal(body.options.num_predict,64);
 assert.equal(result.response,"local result");assert.equal(result.executionEnabled,false);assert.equal(adapter.connected,true);assert.equal(getProviderState(adapter).capability,"local-inference-adapter");
});

test("Ollama adapter rejects nonlocal endpoints and malformed configuration",()=>{
 assert.throws(()=>createOllamaAdapter({baseUrl:"https://example.com",model:"local"}),/ollama-local-endpoint/);
 assert.throws(()=>createOllamaAdapter({baseUrl:"http://127.0.0.1:11434/api",model:"local"}),/ollama-local-endpoint/);
 assert.throws(()=>createOllamaAdapter({model:""}),/invalid-ollama-model/);
 assert.throws(()=>createOllamaAdapter({model:"local",timeoutMs:0}),/timeoutMs/);
});

test("Ollama adapter bounds prompt and inference options",async()=>{
 const adapter=createOllamaAdapter({model:"local",fetchImpl:async()=>({ok:true,json:async()=>({response:"ok"})})});
 await assert.rejects(()=>adapter.generate(""),/invalid-prompt/);
 await assert.rejects(()=>adapter.generate("x".repeat(8001)),/invalid-prompt/);
 await assert.rejects(()=>adapter.generate("ok",{numPredict:0}),/invalid-num-predict/);
 await assert.rejects(()=>adapter.generate("ok",{temperature:2}),/invalid-temperature/);
});

test("Ollama adapter rejects HTTP and malformed responses",async()=>{
 const http=createOllamaAdapter({model:"local",fetchImpl:async()=>({ok:false,status:503})});
 await assert.rejects(()=>http.generate("hello"),/ollama-http-503/);
 const malformed=createOllamaAdapter({model:"local",fetchImpl:async()=>({ok:true,json:async()=>({response:7})})});
 await assert.rejects(()=>malformed.generate("hello"),/ollama-response-invalid/);
 const large=createOllamaAdapter({model:"local",fetchImpl:async()=>({ok:true,json:async()=>({response:"x".repeat(16001)})})});
 await assert.rejects(()=>large.generate("hello"),/ollama-response-too-large/);
});

test("Ollama adapter aborts local request on timeout",async()=>{
 const adapter=createOllamaAdapter({model:"local",timeoutMs:5,fetchImpl:(_url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener("abort",()=>reject(new Error("aborted"))))});
 await assert.rejects(()=>adapter.generate("hello"),/ollama-timeout/);
});
