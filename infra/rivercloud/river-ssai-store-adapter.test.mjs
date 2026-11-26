import test from "node:test";
import assert from "node:assert/strict";
import {mkdtemp,rm,chmod} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {createApiKeyStore} from "./api-key-store.mjs";
import {createStoreBackedRiverSSAIOrchestrator} from "./river-ssai-store-adapter.mjs";

const now=1_800_000_000_000,ttl=60*60*1000;
const schema={type:"object",properties:{prompt:{type:"string"}},required:["prompt"],additionalProperties:false};
const definition={id:"assistant.store",version:"1.0.0",name:"Store-backed mock",domain:"tests",capabilities:["summarize"],inputSchema:schema,outputSchema:schema,riskClass:"low",requiresApproval:false,maxRunSeconds:30,maxConcurrency:2,status:"active"};
const high={...definition,id:"assistant.store.high",riskClass:"high",requiresApproval:true};
const request={agentId:definition.id,version:definition.version,input:{prompt:"hello"},requestId:"req-store-0001",idempotencyKey:"idem-store-0000001",now};
async function sandbox(fn){const root=await mkdtemp(path.join(os.tmpdir(),"rc148-"));try{await fn(root);}finally{await rm(root,{recursive:true,force:true});}}

test("persisted API key drives RiverSSAI plan, replay and revocation fail closed",async()=>sandbox(async root=>{
  const store=createApiKeyStore(path.join(root,"keys.json"));
  const key=await store.create({ownerId:"integration-owner",scopes:["ai:invoke"],now,ttlMs:ttl});
  const adapter=createStoreBackedRiverSSAIOrchestrator({store,definitions:[definition]});
  const first=await adapter.planInvoke({...request,key,record:{status:"revoked"}});
  assert.equal(first.status,202);assert.equal(first.plan.executionEnabled,false);assert.equal(first.duplicate,false);
  const replay=await adapter.planInvoke({...request,key});
  assert.equal(replay.status,202);assert.equal(replay.duplicate,true);
  const id=key.match(/^rs_test_([a-f0-9]{32})\./)[1];
  await store.revoke(id);
  const denied=await adapter.planInvoke({...request,key,idempotencyKey:"idem-store-revoked"});
  assert.equal(denied.status,401);assert.equal(denied.error,"key_revoked");
}));

test("store-backed RiverSSAI denies missing scope and expired key",async()=>sandbox(async root=>{
  const store=createApiKeyStore(path.join(root,"keys.json"));
  const noScope=await store.create({ownerId:"scope-owner",scopes:["signals:read"],now,ttlMs:ttl});
  const expired=await store.create({ownerId:"expired-owner",scopes:["ai:invoke"],now,ttlMs:ttl});
  const adapter=createStoreBackedRiverSSAIOrchestrator({store,definitions:[definition]});
  const scopeResult=await adapter.planInvoke({...request,key:noScope});
  assert.equal(scopeResult.status,403);assert.equal(scopeResult.error,"scope_denied");
  const expiryResult=await adapter.planInvoke({...request,key:expired,now:now+ttl});
  assert.equal(expiryResult.status,401);assert.equal(expiryResult.error,"key_expired");
}));

test("high-risk plan uses the store key and binding-aware approval verifier",async()=>sandbox(async root=>{
  const store=createApiKeyStore(path.join(root,"keys.json"));
  const key=await store.create({ownerId:"high-owner",scopes:["ai:invoke"],now,ttlMs:ttl});
  const adapter=createStoreBackedRiverSSAIOrchestrator({store,definitions:[high],approvalVerifier:({token,binding})=>token==="approval-token-123456"&&binding.ownerId==="high-owner"&&binding.agentId===high.id&&binding.inputDigest.length===64});
  const result=await adapter.planInvoke({...request,key,agentId:high.id,approvalToken:"approval-token-123456"});
  assert.equal(result.status,202);assert.equal(result.plan.approvalVerified,true);assert.equal(result.plan.executionEnabled,false);
}));

test("store boundary is required and storage failures fail closed",async()=>sandbox(async root=>{
  assert.throws(()=>createStoreBackedRiverSSAIOrchestrator({}),/api_key_store_required/);
  const dir=path.join(root,"store");const store=createApiKeyStore(path.join(dir,"keys.json"));
  await store.create({ownerId:"error-owner",scopes:["ai:invoke"],now,ttlMs:ttl});
  await chmod(dir,0o755);
  const adapter=createStoreBackedRiverSSAIOrchestrator({store,definitions:[definition]});
  const result=await adapter.planInvoke({...request,key:"rs_test_invalid"});
  assert.equal(result.status,503);assert.equal(result.error,"api_key_store_unavailable");
}));
