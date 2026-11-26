import test from "node:test";
import assert from "node:assert/strict";
import { SpecialistScheduler } from "../src/scheduler.js";

test("queues and assigns a planning-only specialist task",()=>{
 const scheduler=new SpecialistScheduler();
 const queued=scheduler.enqueue({taskId:"task-1",goal:"review security policy",priority:"normal"});
 assert.equal(queued.status,"queued");
 assert.equal(queued.executionEnabled,false);
 assert.equal(queued.processStarted,false);
 const assigned=scheduler.assignNext();
 assert.equal(assigned.taskId,"task-1");
 assert.equal(assigned.status,"assigned_not_started");
 assert.equal(assigned.executionEnabled,false);
 assert.equal(assigned.processStarted,false);
 assert.equal(scheduler.status().activeProcesses,0);
});

test("priority ordering is stable and bounded",()=>{
 const scheduler=new SpecialistScheduler({maxQueue:3});
 scheduler.enqueue({taskId:"low",goal:"general review",priority:"low"});
 scheduler.enqueue({taskId:"normal",goal:"general review",priority:"normal"});
 scheduler.enqueue({taskId:"high",goal:"general review",priority:"high"});
 assert.equal(scheduler.assignNext().taskId,"high");
 assert.equal(scheduler.assignNext().taskId,"normal");
 assert.equal(scheduler.assignNext().taskId,"low");
 assert.equal(scheduler.assignNext(),null);
});

test("rejects duplicate, malformed and over-capacity tasks",()=>{
 const scheduler=new SpecialistScheduler({maxQueue:1});
 scheduler.enqueue({taskId:"one",goal:"general task"});
 assert.throws(()=>scheduler.enqueue({taskId:"one",goal:"duplicate"}),/duplicate/);
 assert.throws(()=>scheduler.enqueue({taskId:"two",goal:"second"}),/queue full/);
 assert.throws(()=>scheduler.enqueue({taskId:"",goal:"invalid"}),/taskId/);
 assert.throws(()=>scheduler.enqueue({taskId:"two",goal:"goal",priority:"urgent"}),/priority/);
 assert.throws(()=>new SpecialistScheduler({maxQueue:1001}),/maxQueue/);
});

test("assignments and queue status are memory-only and never execute",()=>{
 const scheduler=new SpecialistScheduler({maxQueue:2});
 scheduler.enqueue({taskId:"a",goal:"coding review"});
 scheduler.assignNext();
 const status=scheduler.status();
 assert.equal(status.persistence,"memory-only");
 assert.equal(status.executionEnabled,false);
 assert.equal(status.activeProcesses,0);
 assert.equal(status.queued,0);
 assert.equal(status.assignedNotStarted,1);
 assert.equal(scheduler.get("a").status,"assigned_not_started");
});
