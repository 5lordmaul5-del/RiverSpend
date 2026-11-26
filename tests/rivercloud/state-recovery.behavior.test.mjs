import test from "node:test";
import assert from "node:assert/strict";
import {mkdtemp,chmod,rm,writeFile,lstat} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {readState,transactState} from "../../infra/rivercloud/rc11-state.mjs";

async function fixture(t){
 const dir=await mkdtemp(path.join(os.tmpdir(),"rivercloud-recovery-"));
 await chmod(dir,0o700);t.after(()=>rm(dir,{recursive:true,force:true}));
 return dir;
}
const valid=JSON.stringify({schema:1,jobs:[],approvals:[],events:[]});

test("reader fails closed on corrupt JSON",async t=>{
 const dir=await fixture(t),file=path.join(dir,"state.json");
 await writeFile(file,"{broken",{mode:0o600});
 await assert.rejects(()=>readState(file),/JSON|Unexpected|invalid/i);
});
test("reader rejects oversized state file",async t=>{
 const dir=await fixture(t),file=path.join(dir,"state.json");
 await writeFile(file," ".repeat(8*1024*1024+1),{mode:0o600});
 await assert.rejects(()=>readState(file),/state_file_too_large/);
});
test("reader returns initial snapshot when state file is absent",async t=>{
 const dir=await fixture(t),file=path.join(dir,"state.json");
 assert.deepEqual(await readState(file),{schema:1,jobs:[],approvals:[],events:[]});
});
test("lock is released after mutation rejection",async t=>{
 const dir=await fixture(t),file=path.join(dir,"state.json");
 await assert.rejects(()=>transactState(file,()=>{throw new Error("fixture_mutator_failure");}),/fixture_mutator_failure/);
 await assert.rejects(()=>lstat(file+".lock"),e=>e.code==="ENOENT");
 await transactState(file,s=>{s.events.push({event:"after_failure"});});
 assert.equal((await readState(file)).events.length,1);
});
