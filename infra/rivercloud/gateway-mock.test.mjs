import test from "node:test";
import assert from "node:assert/strict";
import { createApiKey } from "./api-key-core.mjs";
import { createMockGateway, MOCK_GATEWAY_ROUTES } from "./gateway-mock.mjs";

const now=1_800_000_000_000;
const scopes=["cloud:plan","cloud:jobs:read","ai:invoke","registry:read","signals:read","signals:send","shop:catalog:read","shop:catalog:write","shop:checkout:mock"];
const issued=createApiKey({ownerId:"mock-gateway-test",scopes,now,ttlMs:60*60*1000});
const gateway=createMockGateway();
const headers={requestId:"req-0000000000000001",idempotencyKey:"idem-0000000000000001"};

test("mock gateway exposes contract routes without executing services",()=>{
  assert.equal(MOCK_GATEWAY_ROUTES.length,9);
  const result=gateway.handle({key:issued.key,record:issued.record,method:"GET",path:"/api/v1/signals",requestId:headers.requestId,now});
  assert.equal(result.status,200);
  assert.equal(result.response.service,"Signals");
  assert.equal(result.response.status,"mock");
});

test("Signals mock write is idempotent and body canonicalization is stable",()=>{
  const first=gateway.handle({key:issued.key,record:issued.record,method:"POST",path:"/api/v1/signals/send",...headers,body:{message:"hello",recipient:"test"},now});
  const duplicate=gateway.handle({key:issued.key,record:issued.record,method:"POST",path:"/api/v1/signals/send",requestId:"req-0000000000000002",idempotencyKey:headers.idempotencyKey,body:{recipient:"test",message:"hello"},now});
  assert.equal(first.status,202);
  assert.equal(first.duplicate,false);
  assert.equal(duplicate.status,202);
  assert.equal(duplicate.duplicate,true);
  assert.deepEqual(duplicate.response,first.response);
});

test("Shop checkout stays mock-only and conflicting idempotency payloads fail",()=>{
  const first=gateway.handle({key:issued.key,record:issued.record,method:"POST",path:"/api/v1/shop/checkout/mock",...headers,body:{cartId:"demo-cart"},now});
  const conflict=gateway.handle({key:issued.key,record:issued.record,method:"POST",path:"/api/v1/shop/checkout/mock",...headers,body:{cartId:"other-cart"},now});
  const realRoute=gateway.handle({key:issued.key,record:issued.record,method:"POST",path:"/api/v1/shop/checkout",...headers,body:{cartId:"demo-cart"},now});
  assert.equal(first.status,202);
  assert.equal(first.response.status,"accepted_mock");
  assert.equal(conflict.status,409);
  assert.equal(conflict.error,"idempotency_conflict");
  assert.equal(realRoute.status,404);
});

test("scoped key, request ID and idempotency requirements fail closed",()=>{
  const readOnly=createApiKey({ownerId:"read-only",scopes:["registry:read"],now,ttlMs:60*60*1000});
  assert.equal(gateway.handle({key:readOnly.key,record:readOnly.record,method:"POST",path:"/api/v1/signals/send",...headers,body:{message:"no"},now}).status,403);
  assert.equal(gateway.handle({key:issued.key,record:issued.record,method:"GET",path:"/api/v1/signals",requestId:"bad id",now}).status,400);
  assert.equal(gateway.handle({key:issued.key,record:issued.record,method:"POST",path:"/api/v1/signals/send",requestId:headers.requestId,body:{message:"no"},now}).error,"idempotency_key_required");
});

test("mock gateway body and idempotency-store capacity are bounded",()=>{
  const tiny=createMockGateway({maxIdempotencyEntries:1});
  const first=tiny.handle({key:issued.key,record:issued.record,method:"POST",path:"/api/v1/signals/send",...headers,body:{message:"one"},now});
  const second=tiny.handle({key:issued.key,record:issued.record,method:"POST",path:"/api/v1/signals/send",requestId:"req-0000000000000002",idempotencyKey:"idem-0000000000000002",body:{message:"two"},now});
  const large=tiny.handle({key:issued.key,record:issued.record,method:"POST",path:"/api/v1/signals/send",requestId:headers.requestId,idempotencyKey:"idem-0000000000000003",body:{message:"x".repeat(9000)},now});
  assert.equal(first.status,202);
  assert.equal(second.status,503);
  assert.equal(large.status,413);
});

 
test("mock gateway rejects non-JSON nested values",()=>{
  const bad1=gateway.handle({key:issued.key,record:issued.record,method:"POST",path:"/api/v1/signals/send",requestId:"req-0000000000000003",idempotencyKey:"idem-0000000000000003",body:{message:undefined},now});
  const bad2=gateway.handle({key:issued.key,record:issued.record,method:"POST",path:"/api/v1/signals/send",requestId:"req-0000000000000004",idempotencyKey:"idem-0000000000000004",body:{nested:new Date(now)},now});
  const bad3=gateway.handle({key:issued.key,record:issued.record,method:"POST",path:"/api/v1/signals/send",requestId:"req-0000000000000005",idempotencyKey:"idem-0000000000000005",body:{count:NaN},now});
  assert.equal(bad1.status,400);
  assert.equal(bad2.status,400);
  assert.equal(bad3.status,400);
});


test("gateway cached idempotency responses cannot be mutated by callers",()=>{
  const isolated=createMockGateway();
  const first=isolated.handle({key:issued.key,record:issued.record,method:"POST",path:"/api/v1/signals/send",...headers,body:{message:"stable"},now});
  first.response.status="tampered";first.response.payloadDigest="changed";
  const duplicate=isolated.handle({key:issued.key,record:issued.record,method:"POST",path:"/api/v1/signals/send",...headers,body:{message:"stable"},now});
  assert.equal(duplicate.duplicate,true);assert.equal(duplicate.response.status,"accepted_mock");assert.notEqual(duplicate.response.payloadDigest,"changed");
  duplicate.response.status="again";
  const third=isolated.handle({key:issued.key,record:issued.record,method:"POST",path:"/api/v1/signals/send",...headers,body:{message:"stable"},now});
  assert.equal(third.response.status,"accepted_mock");
});

test("gateway canonicalization rejects excessive nesting",()=>{
  const deep={};let cursor=deep;for(let i=0;i<40;i++){cursor.child={};cursor=cursor.child;}
  const result=gateway.handle({key:issued.key,record:issued.record,method:"POST",path:"/api/v1/signals/send",requestId:"req-depth-00000001",idempotencyKey:"idem-depth-00000001",body:deep,now});
  assert.equal(result.status,400);assert.equal(result.error,"body_invalid");
});
