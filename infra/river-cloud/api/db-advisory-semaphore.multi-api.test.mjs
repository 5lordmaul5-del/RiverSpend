import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const namespace = 2147483000;
const project = 'rivercloud-multi-api-test';
const compose = ['compose', '-p', project, '-f', 'docker-compose.yml', '-f', 'docker-compose.multi-api-test.yml'];

function psql(query) {
  return new Promise((resolve, reject) => {
    const child = spawn('docker', [...compose, 'exec', '-T', 'rivercloud-db', 'psql', '-X', '-qAt', '-U', 'rivercloud', '-d', 'rivercloud', '-v', 'ON_ERROR_STOP=1', '-c', query], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', code => resolve({ code, stdout, stderr }));
  });
}

function holdSlot(slot) {
  const query = `SELECT pg_try_advisory_lock(${namespace}, ${slot}); SELECT pg_sleep(15);`;
  const child = spawn('docker', [...compose, 'exec', '-T', 'rivercloud-db', 'psql', '-X', '-qAt', '-U', 'rivercloud', '-d', 'rivercloud', '-c', query], { stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.resume();
  child.stderr.resume();
  return child;
}

async function waitForLocks(expected, timeoutMs = 7000) {
  const query = `SELECT count(*) FROM pg_locks WHERE locktype = 'advisory' AND classid = ${namespace} AND objid BETWEEN 1 AND 8 AND objsubid = 2 AND granted;`;
  const deadline = Date.now() + timeoutMs;
  let last = -1;
  while (Date.now() < deadline) {
    const result = await psql(query);
    if (result.code !== 0) throw new Error('lock inspection failed: ' + result.stderr);
    last = Number(result.stdout.trim());
    if (last === expected) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`timed out waiting for ${expected} locks; last count=${last}`);
}

async function requestProfile(port) {
  const response = await fetch(`http://127.0.0.1:${port}/v1/me`, {
    headers: { authorization: 'Bearer test-token' },
    signal: AbortSignal.timeout(5000),
  });
  return { status: response.status, body: await response.json() };
}

test('two RiverCloud API instances share the PostgreSQL semaphore', async t => {
  const holders = Array.from({ length: 8 }, (_, i) => holdSlot(i + 1));
  t.after(async () => {
    await Promise.all(holders.map(child => new Promise(resolve => {
      if (child.exitCode !== null || child.signalCode !== null) return resolve();
      child.once('close', resolve);
    })));
  });

  await waitForLocks(8);
  for (const port of [18080, 18081]) {
    const busy = await requestProfile(port);
    assert.equal(busy.status, 503, `API ${port} should reject when the shared slots are held`);
    assert.deepEqual(busy.body, { error: 'database_busy' });
  }

  await Promise.all(holders.map(child => new Promise(resolve => {
    if (child.exitCode !== null || child.signalCode !== null) return resolve();
    child.once('close', resolve);
  })));
  await waitForLocks(0);

  const recovered = await Promise.all([requestProfile(18080), requestProfile(18081)]);
  for (const result of recovered) {
    assert.equal(result.status, 200);
    assert.deepEqual(result.body, { profile: null });
  }

  const burst = await Promise.all(Array.from({ length: 32 }, (_, i) =>
    requestProfile(i % 2 === 0 ? 18080 : 18081)
  ));
  let successes = 0;
  for (const result of burst) {
    if (result.status === 200) {
      successes += 1;
      assert.deepEqual(result.body, { profile: null });
    } else {
      assert.equal(result.status, 503);
      assert.deepEqual(result.body, { error: 'database_busy' });
    }
  }
  assert.ok(successes > 0, 'concurrent burst should allow at least one successful profile read');
  await waitForLocks(0);

  const finalRecovery = await Promise.all([requestProfile(18080), requestProfile(18081)]);
  for (const result of finalRecovery) {
    assert.equal(result.status, 200);
    assert.deepEqual(result.body, { profile: null });
  }
});
