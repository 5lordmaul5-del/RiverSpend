import test from "node:test";
import assert from "node:assert/strict";
import {mkdtemp,mkdir,writeFile,symlink,chmod,rm} from "node:fs/promises";
import {readFile,lstat} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {createApiKeyStore} from "./api-key-store.mjs";

const now=1_800_000_000_000,ttl=60*60*1000;
const scopes=["signals:send","shop:catalog:read"];

test("key records persist privately and verification survives a store restart",async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),"api-key-store-"));try{
    const file=path.join(root,"private","keys.json"),store=createApiKeyStore(file);
    const key=await store.create({ownerId:"signals-shop",scopes,now,ttlMs:ttl});
    assert.equal((await store.verify(key,{now,requiredScope:"signals:send"})).valid,true);
    assert.equal((await store.verify(key,{now,requiredScope:"ai:invoke"})).reason,"scope_denied");
    const raw=await readFile(file,"utf8");assert.equal(raw.includes(key),false);assert.equal(raw.includes("keyHash"),true);
    assert.equal((await lstat(file)).mode&0o077,0);
    assert.equal((await lstat(path.dirname(file))).mode&0o077,0);
    const restarted=createApiKeyStore(file);assert.equal((await restarted.verify(key,{now})).valid,true);
  }finally{await rm(root,{recursive:true,force:true});}
});

test("stored keys expire and revocation survives restart",async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),"api-key-store-"));try{
    const file=path.join(root,"keys.json"),store=createApiKeyStore(file);
    const key=await store.create({ownerId:"owner",scopes:["ai:invoke"],now,ttlMs:ttl});
    const id=/^rs_test_([a-f0-9]{32})\./.exec(key)[1];
    assert.equal((await store.verify(key,{now:now+ttl})).reason,"key_expired");
    assert.equal(await store.revoke(id),true);assert.equal(await store.revoke(id),false);
    assert.equal((await createApiKeyStore(file).verify(key,{now})).reason,"key_revoked");
  }finally{await rm(root,{recursive:true,force:true});}
});

test("concurrent creates serialize without losing records and list metadata omits digests",async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),"api-key-store-"));try{
    const file=path.join(root,"keys.json"),store=createApiKeyStore(file);
    const keys=await Promise.all(Array.from({length:16},(_,i)=>store.create({ownerId:"batch",scopes:["registry:read"],now:now+i,ttlMs:ttl})));
    assert.equal(new Set(keys).size,16);assert.equal(await store.count(),16);
    const listed=await store.list("batch");assert.equal(listed.length,16);
    assert.equal(listed.some(r=>Object.hasOwn(r,"keyHash")),false);
    assert.equal(listed.some(r=>Object.hasOwn(r,"key")),false);
  }finally{await rm(root,{recursive:true,force:true});}
});

test("store capacity is bounded",async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),"api-key-store-"));try{
    const store=createApiKeyStore(path.join(root,"keys.json"),{maxKeys:2});
    await store.create({ownerId:"owner",scopes:["ai:invoke"],now,ttlMs:ttl});
    await store.create({ownerId:"owner",scopes:["ai:invoke"],now,ttlMs:ttl});
    await assert.rejects(()=>store.create({ownerId:"owner",scopes:["ai:invoke"],now,ttlMs:ttl}),/capacity_exceeded/);
    assert.equal(await store.count(),2);
  }finally{await rm(root,{recursive:true,force:true});}
});

test("unsafe directory permissions and symlinked key file are rejected",async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),"api-key-store-"));try{
    const unsafe=path.join(root,"unsafe");await mkdir(unsafe,{mode:0o755});await chmod(unsafe,0o755);
    await assert.rejects(()=>createApiKeyStore(path.join(unsafe,"keys.json")).create({ownerId:"owner",scopes:["ai:invoke"],now,ttlMs:ttl}),/permissions_unsafe/);
    const dir=path.join(root,"private");await mkdir(dir,{mode:0o700});const target=path.join(dir,"target.json"),file=path.join(dir,"keys.json");
    const base=createApiKeyStore(target);const key=await base.create({ownerId:"owner",scopes:["ai:invoke"],now,ttlMs:ttl});
    await symlink(target,file);await assert.rejects(()=>createApiKeyStore(file).verify(key,{now}),/symlink_rejected/);
  }finally{await rm(root,{recursive:true,force:true});}
});

test("lock timeout and invalid snapshot fail closed",async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),"api-key-store-"));try{
    const file=path.join(root,"keys.json");
    await writeFile(file+".lock","occupied",{mode:0o600});
    await assert.rejects(()=>createApiKeyStore(file,{lockTimeoutMs:100}).create({ownerId:"owner",scopes:["ai:invoke"],now,ttlMs:ttl}),/lock_timeout/);
    await rm(file+".lock");
    await writeFile(file,'{"schema":2,"keys":[]}',{mode:0o600});
    await assert.rejects(()=>createApiKeyStore(file).count(),/invalid_schema/);
  }finally{await rm(root,{recursive:true,force:true});}
});

test("directory sync uncertainty is reported after atomic commit",async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),"api-key-store-"));try{
    const file=path.join(root,"keys.json"),store=createApiKeyStore(file,{syncDirectoryFn:async()=>{throw new Error("test_sync_failure");}});
    await assert.rejects(()=>store.create({ownerId:"owner",scopes:["ai:invoke"],now,ttlMs:ttl}),e=>e.code==="api_key_store_commit_durability_uncertain"&&e.commitApplied===true);
    const snapshot=JSON.parse(await readFile(file,"utf8"));assert.equal(snapshot.keys.length,1);
  }finally{await rm(root,{recursive:true,force:true});}
});
