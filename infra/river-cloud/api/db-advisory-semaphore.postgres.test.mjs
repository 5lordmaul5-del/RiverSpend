import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { buildDbAdvisorySemaphoreScript, RIVERCLOUD_SEMAPHORE_NAMESPACE } from './db-advisory-semaphore.mjs';

function psql(command, input = '') {
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

function holdSlot(slot, seconds = 3) {
  const sql = `SELECT pg_try_advisory_lock(${RIVERCLOUD_SEMAPHORE_NAMESPACE}, ${slot}); SELECT pg_sleep(${seconds});`;
  const args = [
    'compose', 'exec', '-T', 'rivercloud-db', 'psql',
    '-X', '-qAt', '-U', 'rivercloud', '-d', 'rivercloud', '-c', sql
  ];
  return new Promise((resolve, reject) => {
    const child = spawn('docker', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let acquired = false;
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', chunk => {
      stdout += chunk;
      if (!acquired && stdout.trim().startsWith('t')) {
        acquired = true;
        resolve({ child, stdout, stderr });
      }
    });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', code => {
      if (!acquired) reject(new Error('slot ' + slot + ' failed to acquire: code=' + code + ' stderr=' + stderr));
    });
  });
}

test('PostgreSQL advisory semaphore denies a ninth session and releases slots on session exit', async t => {
  const holders = [];
  t.after(async () => {
    for (const item of holders) {
      if (item.child.exitCode === null && item.child.signalCode === null) item.child.kill('SIGTERM');
    }
  });

  holders.push(...await Promise.all(Array.from({ length: 8 }, (_, index) => holdSlot(index + 1))));
  const full = await psql('', buildDbAdvisorySemaphoreScript(8));
  assert.equal(full.code, 77, 'all eight session slots should be held; stderr=' + full.stderr);

  await Promise.all(holders.map(item => new Promise(resolve => {
    if (item.child.exitCode !== null || item.child.signalCode !== null) return resolve();
    item.child.once('close', resolve);
  })));

  const available = await psql('', buildDbAdvisorySemaphoreScript(8));
  assert.equal(available.code, 0, 'slots should be available after holder sessions exit; stderr=' + available.stderr);
});
