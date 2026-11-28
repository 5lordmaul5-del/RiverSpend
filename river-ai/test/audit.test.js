import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {recordAudit,readAudit} from '../src/audit.js';
test('audit writes and reads structured events',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'riveraudit-')); const path=join(dir,'events.jsonl');
 try{ const e=await recordAudit({type:'approval',actor:'owner',module:'RiverGuard',summary:'Approved for review',risk:'medium'},path); const list=await readAudit(path); assert.equal(list.length,1); assert.equal(list[0].id,e.id); assert.equal(list[0].type,'approval');}
 finally{await rm(dir,{recursive:true,force:true});}
});
test('audit rejects invalid event types',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'riveraudit-')); const path=join(dir,'events.jsonl');
 try{await assert.rejects(()=>recordAudit({type:'unknown'},path));}
 finally{await rm(dir,{recursive:true,force:true});}
});
