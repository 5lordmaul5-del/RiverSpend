import pg from 'pg';
import test from 'node:test';
import assert from 'node:assert/strict';
const url=process.env.RIVERDB_RUNTIME_TEST_URL;
test('restricted runtime role permissions', {skip:!url}, async()=>{
 const client=new pg.Client({connectionString:url}); await client.connect();
 try {
  await client.query('SELECT 1 FROM riverdb.modules LIMIT 1');
  await assert.rejects(client.query('UPDATE audit.records SET action=action'));
  await assert.rejects(client.query('DELETE FROM audit.records'));
  await assert.rejects(client.query('CREATE TABLE riverdb.runtime_forbidden(id int)'));
 } finally { await client.end(); }
});
