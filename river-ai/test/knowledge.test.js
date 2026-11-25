import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { addKnowledge,listKnowledge,removeKnowledge } from '../src/knowledge.js';
test('knowledge store adds, lists and removes entries in temporary storage',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'riverknowledge-')); const path=join(dir,'knowledge.json');
 try {
  assert.deepEqual(await listKnowledge(path),[]);
  const entry=await addKnowledge({title:'Test',content:'Approved note',tags:['test']},path);
  assert.equal((await listKnowledge(path)).length,1);
  assert.equal(await removeKnowledge(entry.id,path),true);
  assert.deepEqual(await listKnowledge(path),[]);
 } finally { await rm(dir,{recursive:true,force:true}); }
});
test('knowledge validates and limits inputs',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'riverknowledge-')); const path=join(dir,'knowledge.json');
 try {
  await assert.rejects(()=>addKnowledge({title:'',content:'x'},path));
  await assert.rejects(()=>addKnowledge({title:'x',content:'x'.repeat(10001)},path));
 } finally { await rm(dir,{recursive:true,force:true}); }
});
