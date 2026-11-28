import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { buildDbAdvisorySemaphoreScript, RIVERCLOUD_SEMAPHORE_NAMESPACE } from './db-advisory-semaphore.mjs';

function psql(input = '') {
  const args = [
    'compose', 'exec', '-T', 'rivercloud-db', 'psql',
    '-X', '-qAt', '-U', 'rivercloud', '-d', 'rivercloud',
    '-v', 'ON_ERROR_STOP=1', '-f', '-'
  ];
  return new Promise((resolve, reject) => {
    const child = spawn('docker', args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', code => resolve({ code, stdout, stderr }));
    child.stdin.end(input);
  });
}

function holdSlot(slot, seconds = 10) {
  const sql = `SELECT pg_try_advisory_lock(${RIVERCLOUD_SEMAPHORE_NAMESPACE}, ${slot}); SELECT pg_sleep(${seconds});`;
  const args = [
    'compose', 'exec', '-T', 'rivercloud-db', 'psql',
    '-X', '-qAt', '-U', 'rivercloud', '-d', 'rivercloud', '-c', sql
  ];
  const child = spawn('docker', args, { stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.resume();
  child.stderr.resume();
  return child;
}

async function waitForLocks(expected, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  let last = -1;
  while (Date.now() < deadline) {
    const result = await psql(`SELECT count(*) FROM pg_locks WHERE locktype = 'advisory' AND classid = ${RIVERCLOUD_SEMAPHORE_NAMESPACE} AND objid BETWEEN 1 AND 8 AND objsubid = 2 AND granted;`);
    if (result.code !== 0) throw new Error('lock inspection failed: ' + result.stderr);
    last = Number(result.stdout.trim());
    if (last === expected) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('timed out waiting for ' + expected + ' advisory locks; last count=' + last);
}

test('PostgreSQL advisory semaphore denies a ninth session and releases slots on session exit', async t => {
  const holders = Array.from({ length: 8 }, (_, index) => holdSlot(index + 1));
  t.after(async () => {
    for (const child of holders) {
      if (child.exitCode === null && child.signalCode === null) child.kill('SIGTERM');
    }
    await Promise.all(holders.map(child => new Promise(resolve => {
      if (child.exitCode !== null || child.signalCode !== null) return resolve();
      child.once('close', resolve);
    })));
  });

  await waitForLocks(8);
  const full = await psql(buildDbAdvisorySemaphoreScript(8));
  assert.equal(full.code, 77, 'all eight session slots should be held; stdout=' + full.stdout + ' stderr=' + full.stderr);

  await Promise.all(holders.map(child => new Promise(resolve => {
    if (child.exitCode !== null || child.signalCode !== null) return resolve();
    child.once('close', resolve);
  })));
  await waitForLocks(0);

  const available = await psql(buildDbAdvisorySemaphoreScript(8));
  assert.equal(available.code, 0, 'slots should be available after holder sessions exit; stderr=' + available.stderr);
});
