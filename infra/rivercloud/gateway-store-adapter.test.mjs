import test from "node:test";
import assert from "node:assert/strict";
import {mkdtemp,rm} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {createApiKeyStore} from "./api-key-store.mjs";
import {createStoreBackedMockGateway} from "./gateway-store-adapter.mjs";

const now=1_800_000_000_000;
const request={method:"POST",path:"/api/v1/signals/send",requestId:"req-145-00000001",idempotencyKey:"idem-145-00000001",body:{message:"integration-test"},now};

async function sandbox(fn){const root=await mkdtemp(path.join(os.tmpdir(),"rc145-"));try{await fn(root);}finally{await rm(root,{recursive:true,force:true});}}

test("persistent API key store and mock gateway join for scoped send, replay and revocation",async()=>sandbox(async root=>{
  const store=createApiKeyStore(path.join(root,"keys.json"));
  const key=await store.create({ownerId:"integration-owner",scopes:["signals:send"],now,ttlMs:60*60*1000});
  const gateway=createStoreBackedMockGateway({store});
  const first=await gateway.handle({...request,key});
  assert.equal(first.status,202);assert.equal(first.duplicate,false);
  const duplicate=await gateway.handle({...request,key});
  assert.equal(duplicate.status,202);assert.equal(duplicate.duplicate,true);
  const id=key.match(/^rs_test_([a-f0-9]{32})\./)[1];
  await store.revoke(id);
  const revoked=await gateway.handle({...request,key,idempotencyKey:"idem-145-revoked"});
  assert.equal(revoked.status,401);assert.equal(revoked.error,"key_revoked");
}));

test("store-backed mock gateway denies a persisted key with insufficient scope",async()=>sandbox(async root=>{
  const store=createApiKeyStore(path.join(root,"keys.json"));
  const key=await store.create({ownerId:"integration-owner",scopes:["signals:read"],now,ttlMs:60*60*1000});
  const gateway=createStoreBackedMockGateway({store});
  const denied=await gateway.handle({...request,key});
  assert.equal(denied.status,403);assert.equal(denied.error,"scope_denied");
}));

test("adapter rejects missing API-key-store boundary",()=>{
  assert.throws(()=>createStoreBackedMockGateway({}),/api_key_store_required/);
});


test("store-backed gateway maps key-store failures to fail-closed 503",async()=>{
  const gateway=createStoreBackedMockGateway({store:{resolveRecord:async()=>{throw new Error("store_read_failed");}}});
  const result=await gateway.handle({...request,key:"rs_test_00000000000000000000000000000000.invalid"});
  assert.equal(result.status,503);assert.equal(result.error,"api_key_store_unavailable");
});
