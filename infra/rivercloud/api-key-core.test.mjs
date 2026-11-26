import test from "node:test";
import assert from "node:assert/strict";
import { createApiKey, verifyApiKey, revokeApiKey, API_KEY_SCOPES } from "./api-key-core.mjs";

const now = 1_800_000_000_000;
const ttl = 60 * 60 * 1000;

test("API key secret is returned once and the record stores only a hash", () => {
  const { key, record } = createApiKey({ ownerId: "signals-shop", scopes: ["signals:send","shop:catalog:read"], now, ttlMs: ttl });
  assert.match(key, /^rs_test_[a-f0-9]{32}\.[A-Za-z0-9_-]{43}$/);
  assert.equal(record.keyHash.length, 64);
  assert.equal("key" in record, false);
  assert.equal("secret" in record, false);
  assert.equal(record.status, "active");
  assert.equal(verifyApiKey(key, record, { now, requiredScope: "signals:send" }).valid, true);
});

test("scope denial, expiry, revocation and tampering fail closed", () => {
  const { key, record } = createApiKey({ ownerId: "river-api", scopes: ["ai:invoke"], now, ttlMs: ttl });
  assert.equal(verifyApiKey(key, record, { now, requiredScope: "shop:catalog:read" }).reason, "scope_denied");
  assert.equal(verifyApiKey(key, record, { now: now + ttl }).reason, "key_expired");
  assert.equal(verifyApiKey(key + "x", record, { now }).valid, false);
  const revoked = revokeApiKey(record);
  assert.equal(verifyApiKey(key, revoked, { now }).reason, "key_revoked");
});

test("invalid owner, duplicate scopes and TTL boundaries are rejected", () => {
  assert.throws(() => createApiKey({ ownerId: "bad owner", scopes: ["ai:invoke"], now, ttlMs: ttl }), /invalid_api_key_request/);
  assert.throws(() => createApiKey({ ownerId: "owner", scopes: ["ai:invoke","ai:invoke"], now, ttlMs: ttl }), /invalid_api_key_request/);
  assert.throws(() => createApiKey({ ownerId: "owner", scopes: ["ai:invoke"], now, ttlMs: 1000 }), /invalid_api_key_request/);
  assert.throws(() => createApiKey({ ownerId: "owner", scopes: ["not-a-scope"], now, ttlMs: ttl }), /invalid_api_key_request/);
});

test("unknown required scopes and malformed records are denied", () => {
  const { key, record } = createApiKey({ ownerId: "owner", scopes: ["ai:invoke"], now, ttlMs: ttl });
  assert.equal(verifyApiKey(key, record, { now, requiredScope: "unrecognized" }).reason, "invalid_required_scope");
  assert.equal(verifyApiKey(key, { ...record, keyHash: "bad" }, { now }).reason, "invalid_record");
  assert.equal(API_KEY_SCOPES.includes("shop:checkout:real"), false);
});

test("key expiry timestamp must remain within safe integer range",()=>{
  assert.throws(()=>createApiKey({ownerId:"owner",scopes:["ai:invoke"],now:Number.MAX_SAFE_INTEGER-1000,ttlMs:ttl}),/invalid_api_key_request/);
});

test("sparse, accessor and extended scope arrays are rejected without invoking getters",()=>{
  const sparse=new Array(1);
  assert.throws(()=>createApiKey({ownerId:"owner",scopes:sparse,now,ttlMs:ttl}),/invalid_api_key_request/);
  let getterCalls=0;
  const accessor=[];
  Object.defineProperty(accessor,"0",{enumerable:true,get(){getterCalls++;return "ai:invoke";}});
  accessor.length=1;
  assert.throws(()=>createApiKey({ownerId:"owner",scopes:accessor,now,ttlMs:ttl}),/invalid_api_key_request/);
  const extra=["ai:invoke"];
  Object.defineProperty(extra,"hidden",{value:"ignored",enumerable:false});
  assert.throws(()=>createApiKey({ownerId:"owner",scopes:extra,now,ttlMs:ttl}),/invalid_api_key_request/);
  assert.equal(getterCalls,0);
});

test("API key record rejects accessors, hidden fields and malformed scope snapshots fail closed",()=>{
  const {key,record}=createApiKey({ownerId:"owner",scopes:["ai:invoke"],now,ttlMs:ttl});
  let getterCalls=0;
  const accessor={...record};
  Object.defineProperty(accessor,"ownerId",{enumerable:true,get(){getterCalls++;return "owner";}});
  assert.equal(verifyApiKey(key,accessor,{now}).reason,"invalid_record");
  assert.equal(getterCalls,0);
  const hidden={...record};
  Object.defineProperty(hidden,"extra",{value:"hidden",enumerable:false});
  assert.equal(verifyApiKey(key,hidden,{now}).reason,"invalid_record");
  const sparse={...record,scopes:new Array(1)};
  assert.equal(verifyApiKey(key,sparse,{now}).reason,"invalid_record");
  assert.throws(()=>revokeApiKey(accessor),/invalid_api_key_record/);
});

test("record proxy traps fail closed instead of escaping verification",()=>{
  const {key,record}=createApiKey({ownerId:"owner",scopes:["ai:invoke"],now,ttlMs:ttl});
  const hostile=new Proxy(record,{getOwnPropertyDescriptor(){throw new Error("trap");}});
  assert.equal(verifyApiKey(key,hostile,{now}).reason,"invalid_record");
  assert.equal(revokeApiKey(record).status,"revoked");
});
