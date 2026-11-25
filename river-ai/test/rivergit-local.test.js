import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createLocalBareRepository, listLocalRepositories, validateLocalRepoName } from '../src/rivergit-local.js';

test('rejects unsafe names',()=>{ for(const n of ['../escape','-flag','bad name','']) assert.throws(()=>validateLocalRepoName(n)); });
test('creates and lists a local bare repo in temp storage',async()=>{
 const temp=await mkdtemp(path.join(os.tmpdir(),'rivergit-'));
 try {
  const created=await createLocalBareRepository(temp,'demo');
  assert.equal(created.created,true); assert.equal(created.branch,'main');
  const list=await listLocalRepositories(temp); assert.equal(list.length,1); assert.equal(list[0].name,'demo');
  await assert.rejects(()=>createLocalBareRepository(temp,'demo'),/already exists/);
 } finally { await rm(temp,{recursive:true,force:true}); }
});
