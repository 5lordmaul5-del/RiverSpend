import pg from 'pg';
import assert from 'node:assert/strict';
const url=process.env.RIVERDB_RUNTIME_TEST_URL;
assert.ok(url,'RIVERDB_RUNTIME_TEST_URL required');
const client=new pg.Client({connectionString:url});
await client.connect();
try {
  await client.query('SELECT 1 FROM riverdb.modules LIMIT 1');
  await assert.rejects(client.query('UPDATE audit.records SET action=action'));
  await assert.rejects(client.query('DELETE FROM audit.records'));
  await assert.rejects(client.query('CREATE TABLE riverdb.runtime_forbidden(id int)'));
  console.log('Runtime role permission checks passed');
} finally { await client.end(); }
