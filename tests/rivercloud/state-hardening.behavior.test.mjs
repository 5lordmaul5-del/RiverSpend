import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, chmod, rm, mkdir, symlink, writeFile, lstat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { readState, transactState } from "../../infra/rivercloud/rc11-state.mjs";

async function fixture(t){
 const dir=await mkdtemp(path.join(os.tmpdir(),"rivercloud-state-hardening-"));
 await chmod(dir,0o700);t.after(()=>rm(dir,{recursive:true,force:true}));
 return dir;
}

test("state reader rejects a symlink state file",async t=>{
 const dir=await fixture(t), target=path.join(dir,"target.json"), file=path.join(dir,"state.json");
 await writeFile(target,JSON.stringify({schema:1,jobs:[],approvals:[],events:[]}),{mode:0o600});
 await symlink(target,file);
 await assert.rejects(()=>readState(file),/state_file_symlink_rejected|ELOOP/);
});

test("transaction refuses unsafe directory permissions",async t=>{
 const dir=await fixture(t),unsafe=path.join(dir,"unsafe");
 await mkdir(unsafe,{mode:0o755});await chmod(unsafe,0o755);
 await assert.rejects(()=>transactState(path.join(unsafe,"state.json"),s=>s),/state_directory_permissions_unsafe/);
});

test("transaction validates mutation before commit and does not persist invalid schema",async t=>{
 const dir=await fixture(t),file=path.join(dir,"state.json");
 await assert.rejects(()=>transactState(file,s=>{s.jobs="corrupted";return "bad";}),/invalid_state_schema/);
 const read=await readState(file);
 assert.deepEqual(read.jobs,[]);
 assert.deepEqual(read.events,[]);
});

test("directory-sync failure reports durability uncertainty after commit rename",async t=>{
 const dir=await fixture(t),file=path.join(dir,"state.json");
 await assert.rejects(()=>transactState(file,s=>{s.events.push({event:"fixture",at:"fixed"});return true;},{syncDirectory:async()=>{throw new Error("fixture_sync_failure");}}),e=>e.code==="state_commit_durability_uncertain"&&e.commitApplied===true);
 const read=await readState(file);
 assert.equal(read.events.length,1);
});
