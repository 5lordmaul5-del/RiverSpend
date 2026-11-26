import {createIdempotencyStore} from "../src/idempotency-store.js";
import test from "node:test";
import assert from "node:assert/strict";
import {createIntegrationFacade} from "../src/facade.js";
function fixture({identity={tenantId:"tenant-a",actorId:"actor-a"},allowed=true,output="ok",providerError=false}={}){
 let providerCalls=0,audits=[];
 const keyManager={validate(args){assert.equal(args.scope,"inference");return allowed?{allowed:true,keyId:"kid-1"}:{allowed:false};}};
 const provider={name:"mock",async generate(task,opts){providerCalls++;if(providerError)throw Error("secret-provider-error");return{response:output,model:opts.model,provider:"mock"};}};
 const facade=createIntegrationFacade({verifyIdentity:async()=>identity,keyManager,provider,audit:e=>audits.push(e)});
 return{facade,providerCalls:()=>providerCalls,audits};
}
const request={authorization:{apiKey:"rs_api_test"},body:{requestId:"req-1",task:"hello",model:"test-model",maxOutputTokens:64}};
test("happy path is bounded and marks execution disabled",async()=>{const f=fixture();const r=await f.facade.invoke(request);assert.equal(r.status,200);assert.equal(r.output,"ok");assert.equal(r.executionEnabled,false);assert.equal(f.providerCalls(),1);assert.equal(f.audits[0].outcome,"success");});
test("identity failure denies before provider",async()=>{const f=fixture({identity:null});const r=await f.facade.invoke(request);assert.equal(r.status,403);assert.equal(f.providerCalls(),0);});
test("scope/key denial does not invoke provider",async()=>{const f=fixture({allowed:false});const r=await f.facade.invoke(request);assert.equal(r.status,403);assert.equal(f.providerCalls(),0);});
test("unknown fields rejected",async()=>{const f=fixture();const r=await f.facade.invoke({...request,body:{...request.body,tenantId:"evil"}});assert.equal(r.status,400);assert.equal(f.providerCalls(),0);});
test("prompt limit rejected",async()=>{const f=fixture();const r=await f.facade.invoke({...request,body:{...request.body,task:"x".repeat(8001)}});assert.equal(r.status,400);assert.equal(f.providerCalls(),0);});
test("output limit rejected and safely audited",async()=>{const f=fixture({output:"x".repeat(16001)});const r=await f.facade.invoke(request);assert.equal(r.status,502);assert.equal(f.audits[0].outcome,"error");assert.equal(JSON.stringify(f.audits).includes("hello"),false);});
test("provider failure is generic",async()=>{const f=fixture({providerError:true});const r=await f.facade.invoke(request);assert.equal(r.status,502);assert.equal(r.error,"provider-failure");assert.equal(JSON.stringify(f.audits).includes("secret-provider-error"),false);});
test("missing API key denied",async()=>{const f=fixture();const r=await f.facade.invoke({authorization:{},body:request.body});assert.equal(r.status,403);assert.equal(f.providerCalls(),0);});

test("missing actor binding is denied",async()=>{const f=fixture({identity:{tenantId:"tenant-a"}});const r=await f.facade.invoke(request);assert.equal(r.status,403);assert.equal(f.providerCalls(),0);});
test("invalid output token limit rejected",async()=>{const f=fixture();const r=await f.facade.invoke({...request,body:{...request.body,maxOutputTokens:999999}});assert.equal(r.status,400);assert.equal(f.providerCalls(),0);});
test("model length limit rejected",async()=>{const f=fixture();const r=await f.facade.invoke({...request,body:{...request.body,model:"m".repeat(121)}});assert.equal(r.status,400);assert.equal(f.providerCalls(),0);});
test("audit sink exception does not leak or break response",async()=>{const keyManager={validate:()=>({allowed:true,keyId:"kid"})};const provider={name:"mock",generate:async()=>({response:"safe"})};const facade=createIntegrationFacade({verifyIdentity:async()=>({tenantId:"tenant-a",actorId:"actor-a"}),keyManager,provider,audit:()=>{throw Error("audit-secret");}});const r=await facade.invoke(request);assert.equal(r.status,200);});

test("key-manager failure fails closed before provider",async()=>{const provider={generate:async()=>{throw Error('should-not-run')}};const facade=createIntegrationFacade({verifyIdentity:async()=>({tenantId:'tenant-a',actorId:'actor-a'}),keyManager:{validate:()=>{throw Error('storage-failure')}} ,provider});const r=await facade.invoke(request);assert.equal(r.status,403);});
test("invalid facade output-token configuration rejected",()=>{assert.throws(()=>createIntegrationFacade({verifyIdentity:async()=>({}),keyManager:{validate:()=>({allowed:true})},provider:{generate:async()=>({response:'ok'})},maxOutputTokens:0}),/integration-dependencies-required/);});

test("provider timeout aborts and returns generic failure",async()=>{let aborted=false;const facade=createIntegrationFacade({verifyIdentity:async()=>({tenantId:"tenant-a",actorId:"actor-a"}),keyManager:{validate:()=>({allowed:true,keyId:"kid"})},provider:{generate:(_,opts)=>new Promise((_,reject)=>opts.signal.addEventListener("abort",()=>{aborted=true;reject(Error("aborted"));}))},timeoutMs:5});const r=await facade.invoke(request);assert.equal(r.status,502);assert.equal(r.error,"provider-failure");assert.equal(aborted,true);});

test("idempotency returns same result and runs operation once",async()=>{const s=createIdempotencyStore();let calls=0;const args={tenantId:"t",requestId:"r",payload:{x:1}};const a=await s.execute(args,async()=>{calls++;return{status:200,value:"v"}});const b=await s.execute(args,async()=>{calls++;return{status:500}});assert.deepEqual(a,b);assert.equal(calls,1);});
test("idempotency rejects payload mismatch",async()=>{const s=createIdempotencyStore();await s.execute({tenantId:"t",requestId:"r",payload:{x:1}},async()=>1);const r=await s.execute({tenantId:"t",requestId:"r",payload:{x:2}},async()=>2);assert.equal(r.status,409);});
test("idempotency shares concurrent operation",async()=>{const s=createIdempotencyStore();let calls=0;const args={tenantId:"t",requestId:"r2",payload:"p"};const op=async()=>{calls++;await new Promise(resolve=>setTimeout(resolve,15));return 42};const [a,b]=await Promise.all([s.execute(args,op),s.execute(args,op)]);assert.equal(a,42);assert.equal(b,42);assert.equal(calls,1);});
test("idempotency config is bounded",()=>{assert.throws(()=>createIdempotencyStore({maxEntries:0}),/invalid-idempotency-config/);});

test("quota allows requests then rejects within window",()=>{const q=createQuotaStore({windowMs:100,maxRequests:2});assert.equal(q.consume({tenantId:"a",now:0}).allowed,true);assert.equal(q.consume({tenantId:"a",now:1}).allowed,true);assert.equal(q.consume({tenantId:"a",now:2}).reason,"quota-exceeded");});
test("quota resets after window",()=>{const q=createQuotaStore({windowMs:100,maxRequests:1});q.consume({tenantId:"a",now:0});assert.equal(q.consume({tenantId:"a",now:100}).allowed,true);});
test("quota isolates tenants",()=>{const q=createQuotaStore({maxRequests:1});q.consume({tenantId:"a",now:1});assert.equal(q.consume({tenantId:"b",now:1}).allowed,true);});
test("quota bounds tenant buckets",()=>{const q=createQuotaStore({maxTenants:1,windowMs:1000});q.consume({tenantId:"a",now:0});assert.equal(q.consume({tenantId:"b",now:1}).reason,"capacity");assert.equal(q.consume({tenantId:"b",now:1000}).allowed,true);});
test("invalid configuration fails",()=>{assert.throws(()=>createQuotaStore({maxRequests:0}),/invalid-quota-config/);});

import {createQuotaStore} from "../src/quota-store.js";
test("facade rejects over-quota tenant before provider call",async()=>{const f=fixture();const quotaStore=createQuotaStore({maxRequests:1});const facade=createIntegrationFacade({verifyIdentity:async()=>({tenantId:"tenant-a",actorId:"actor-a"}),keyManager:{validate:()=>({allowed:true})},provider:{generate:async()=>({response:"ok"})},quotaStore});assert.equal((await facade.invoke(request)).status,200);const r=await facade.invoke({...request,body:{...request.body,requestId:"req-2"}});assert.equal(r.status,429);assert.equal(r.error,"quota-exceeded");});
test("quota store errors fail closed",async()=>{const facade=createIntegrationFacade({verifyIdentity:async()=>({tenantId:"tenant-a",actorId:"actor-a"}),keyManager:{validate:()=>({allowed:true})},provider:{generate:async()=>({response:"should not run"})},quotaStore:{consume(){throw Error("quota-store-error")}}});assert.equal((await facade.invoke(request)).status,403);});
