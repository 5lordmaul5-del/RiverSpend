import test from "node:test";
import assert from "node:assert/strict";
import {mkdtemp,chmod,rm,lstat} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {transactState,readState} from "../../infra/rivercloud/rc11-state.mjs";

async function fixture(t){
 const dir=await mkdtemp(path.join(os.tmpdir(),"rivercloud-lock-"));
 await chmod(dir,0o700);t.after(()=>rm(dir,{recursive:true,force:true}));
 return dir;
}
test("lock contention fails with bounded timeout and leaves existing lock untouched",async t=>{
 const dir=await fixture(t),file=path.join(dir,"state.json"),lock=file+".lock";
 const {writeFile}=await import("node:fs/promises");
 await writeFile(lock,"held",{mode:0o600});
 await assert.rejects(()=>transactState(file,s=>s,{lockTimeoutMs:100}),/state_lock_timeout/);
 assert.equal((await (await import("node:fs/promises")).readFile(lock,"utf8")),"held");
});
test("mutation rejection cleans owned lock and preserves snapshot",async t=>{
 const dir=await fixture(t),file=path.join(dir,"state.json");
 await assert.rejects(()=>transactState(file,s=>{s.events.push({bad:true});throw new Error("reject");}),/reject/);
 await assert.rejects(()=>lstat(file+".lock"),e=>e.code==="ENOENT");
 assert.deepEqual((await readState(file)).events,[]);
});
