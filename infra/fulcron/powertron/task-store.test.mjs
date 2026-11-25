import test from 'node:test';import assert from 'node:assert/strict';import os from 'node:os';import path from 'node:path';import fs from 'node:fs';import {TaskStore} from './task-store.mjs';
function temp(){return fs.mkdtempSync(path.join(os.tmpdir(),'fulcron-'));}
const task={task_id:'t1',request:'work',status:'queued_for_review',created_at:new Date().toISOString(),updated_at:new Date().toISOString()};
test('store persists across instances',()=>{const d=temp(),s=new TaskStore(d);s.create(task);assert.equal(new TaskStore(d).get('t1').request,'work');});
test('duplicate task blocked',()=>{const d=temp(),s=new TaskStore(d);s.create(task);assert.throws(()=>s.create(task),/Duplicate/);});
test('transition graph enforced and audit written',()=>{const d=temp(),s=new TaskStore(d);s.create(task);assert.throws(()=>s.transition('t1','completed'),/Transition/);s.transition('t1','approved');s.transition('t1','running');s.transition('t1','completed');assert.equal(s.get('t1').status,'completed');assert.equal(fs.readFileSync(path.join(d,'audit.jsonl'),'utf8').trim().split('\n').length,4);});
test('bad transition rejected',()=>{const s=new TaskStore(temp());s.create(task);assert.throws(()=>s.transition('t1','bogus'),/Invalid/);});
