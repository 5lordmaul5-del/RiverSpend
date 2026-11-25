import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { RiverDBTaskRepository } from '../task-repository.mjs';

const url=process.env.RIVERDB_TEST_URL;
test('RiverDB integration: persistence, idempotency, transitions, audit and concurrent claims', {skip:!url}, async()=>{
  const db=new RiverDBTaskRepository({connectionString:url});
  const suffix=randomUUID();
  try {
    const key='integration-'+suffix;
    const t=await db.create({task_type:'test.integration',payload:{test:true},idempotency_key:key});
    assert.ok(t.task_id);
    const fetched=await db.get(t.task_id);
    assert.equal(fetched.task_type,'test.integration');

    const repeated=await db.create({task_type:'test.integration',payload:{test:true},idempotency_key:key});
    assert.equal(repeated.task_id,t.task_id,'idempotency should return the same task');

    await assert.rejects(db.transition(t.task_id,'succeeded','test'),/Transition not allowed/);
    const claimed=await db.claimNext();
    assert.ok(claimed);
    assert.equal(claimed.task_id,t.task_id);
    assert.equal(claimed.status,'running');
    const done=await db.transition(t.task_id,'succeeded','test');
    assert.equal(done.status,'succeeded');
    await assert.rejects(db.transition(t.task_id,'running','test'),/Transition not allowed/);

    const a=await db.create({task_type:'test.concurrent.a',idempotency_key:'a-'+suffix});
    const b=await db.create({task_type:'test.concurrent.b',idempotency_key:'b-'+suffix});
    const claims=await Promise.all([db.claimNext(),db.claimNext()]);
    const ids=claims.filter(Boolean).map(x=>x.task_id);
    assert.equal(ids.length,2,'both concurrent claims should get distinct tasks');
    assert.notEqual(ids[0],ids[1],'concurrent claims must not duplicate work');
    assert.ok(ids.includes(a.task_id));
    assert.ok(ids.includes(b.task_id));

    await assert.rejects(db.pool.query('UPDATE audit.records SET action=action WHERE entity_id=$1',[String(t.task_id)]));
    await assert.rejects(db.pool.query('DELETE FROM audit.records WHERE entity_id=$1',[String(t.task_id)]));
  } finally { await db.close(); }
});
