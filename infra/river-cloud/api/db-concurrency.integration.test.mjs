import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { chmod, copyFile, mkdir, readdir, rm, writeFile, mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

async function freePorts() {
  const probes = [http.createServer(), http.createServer()];
  for (const probe of probes) {
    probe.listen(0, '127.0.0.1');
    await once(probe, 'listening');
  }
  const ports = probes.map((probe) => probe.address().port);
  await Promise.all(probes.map((probe) => new Promise((resolve, reject) => probe.close((error) => error ? reject(error) : resolve()))));
  return ports;
}

async function waitFor(fn, timeoutMs = 5000, intervalMs = 25) {
  const deadline = Date.now() + timeoutMs;
  let last;
  while (Date.now() < deadline) {
    try {
      last = await fn();
      if (last) return last;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error('timed out waiting for condition; last value=' + String(last));
}

async function activeMarkers(markerDir) {
  return (await readdir(markerDir)).filter((name) => name.endsWith('.active')).length;
}

test('API rejects excess parallel database subprocesses and releases slots after close', async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'rivercloud-gate-'));
  const runtime = path.join(root, 'runtime');
  await mkdir(runtime, { recursive: true });
  await Promise.all([
    copyFile(new URL('./server.mjs', import.meta.url), path.join(runtime, 'server.mjs')),
    copyFile(new URL('./rate-limit.mjs', import.meta.url), path.join(runtime, 'rate-limit.mjs')),
    copyFile(new URL('./db-concurrency.mjs', import.meta.url), path.join(runtime, 'db-concurrency.mjs')),
    copyFile(new URL('./response.mjs', import.meta.url), path.join(runtime, 'response.mjs')),
    copyFile(new URL('../auth/river-auth.mjs', import.meta.url), path.join(runtime, 'river-auth.mjs')),
  ]);
  const fakeBin = path.join(root, 'bin');
  const markers = path.join(root, 'markers');
  await mkdir(fakeBin, { recursive: true });
  await mkdir(markers, { recursive: true });
  const fakePsql = path.join(fakeBin, 'psql');
  const fakePsqlSource = [
    '#!/usr/bin/env node',
    "const fs = require('node:fs');",
    "const path = require('node:path');",
    "const forbidden = ['RIVERAUTH_ISSUER_URL', 'RIVERAUTH_PUBLISHABLE_KEY', 'RIVER_CLOUD_API_DB_PASSWORD', 'RIVER_TEST_PSQL_MARKERS', 'RIVER_TEST_PSQL_DELAY_MS'];",
    "if (forbidden.some((name) => Object.hasOwn(process.env, name))) { process.stderr.write('unexpected inherited environment\\n'); process.exit(1); }",
    "if (process.env.PGPASSWORD !== 'integration-test-password' || process.env.PGOPTIONS !== '-c statement_timeout=5000' || !process.env.PATH) { process.stderr.write('required psql environment missing\\n'); process.exit(1); }",
    `const marker = path.join(${JSON.stringify(markers)}, process.pid + '.active');`,
    "fs.writeFileSync(marker, 'active');",
    'process.stdin.resume();',
    'process.stdin.on("end", () => {',
    '  setTimeout(() => {',
    '    try { fs.unlinkSync(marker); } catch {}',
    "    process.stdout.write('null\\n');",
    '    process.exit(0);',
    '  }, 900);',
    '});',
  ].join('\n');
  await writeFile(fakePsql, fakePsqlSource);
  await chmod(fakePsql, 0o755);

  const [authPort, apiPort] = await freePorts();
  const issuer = http.createServer((req, res) => {
    if (req.url !== '/auth/v1/user' || req.headers.authorization !== 'Bearer test-token') {
      res.writeHead(401, { 'content-type': 'application/json' });
      return res.end('{}');
    }
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ id: '00000000-0000-4000-8000-000000000001' }));
  });
  issuer.listen(authPort, '127.0.0.1');
  await once(issuer, 'listening');

  const api = spawn(process.execPath, [path.join(runtime, 'server.mjs')], {
    env: {
      ...process.env,
      PORT: String(apiPort),
      RIVERAUTH_ISSUER_URL: 'http://127.0.0.1:' + authPort,
      RIVERAUTH_PUBLISHABLE_KEY: 'integration-test-key',
      RIVER_CLOUD_API_DB_PASSWORD: 'integration-test-password',
      RIVER_TEST_PSQL_MARKERS: markers,
      RIVER_TEST_PSQL_DELAY_MS: '900',
      PATH: fakeBin + path.delimiter + process.env.PATH,
    },
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  let stderr = '';
  api.stderr.setEncoding('utf8');
  api.stderr.on('data', (chunk) => { stderr += chunk; });
  t.after(async () => {
    if (api.exitCode === null && api.signalCode === null) {
      await new Promise((resolve) => {
        let finished = false;
        const finish = () => {
          if (finished) return;
          finished = true;
          clearTimeout(timer);
          resolve();
        };
        const timer = setTimeout(finish, 3000);
        api.once('exit', finish);
        api.kill('SIGTERM');
      });
    }
    await new Promise((resolve) => issuer.close(resolve));
    await rm(root, { recursive: true, force: true });
  });

  const healthDeadline = Date.now() + 5000;
  let healthFailure = 'no response';
  while (Date.now() < healthDeadline) {
    if (api.exitCode !== null || api.signalCode !== null) {
      throw new Error('API exited before health check; stderr=' + stderr);
    }
    try {
      const response = await fetch('http://127.0.0.1:' + apiPort + '/health', { signal: AbortSignal.timeout(500) });
      if (response.status === 200) break;
      healthFailure = 'HTTP ' + response.status;
    } catch (error) {
      healthFailure = error.message;
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  if (Date.now() >= healthDeadline) throw new Error('API health timeout; last=' + healthFailure + '; stderr=' + stderr);

  // Health probes remain available independently of the ordinary client rate limit.
  for (let i = 0; i < 65; i += 1) {
    const probe = await fetch('http://127.0.0.1:' + apiPort + '/health');
    assert.equal(probe.status, 200);
  }

  const request = () => fetch('http://127.0.0.1:' + apiPort + '/v1/me', {
    headers: { authorization: 'Bearer test-token' },
    signal: AbortSignal.timeout(5000),
  });

  // Verify malformed and oversized input is rejected before database work.
  const endpoint = 'http://127.0.0.1:' + apiPort + '/v1/me';
  const unauth = await fetch(endpoint);
  assert.equal(unauth.status, 401);
  const wrongType = await fetch(endpoint, { method: 'PUT', headers: { authorization: 'Bearer test-token', 'content-type': 'text/plain' }, body: 'ignored' });
  assert.equal(wrongType.status, 415);
  const malformed = await fetch(endpoint, { method: 'PUT', headers: { authorization: 'Bearer test-token', 'content-type': 'application/json' }, body: '{broken' });
  assert.equal(malformed.status, 400);
  const oversized = await fetch(endpoint, { method: 'PUT', headers: { authorization: 'Bearer test-token', 'content-type': 'application/json' }, body: JSON.stringify({ display_name: 'x'.repeat(5000) }) });
  assert.equal(oversized.status, 413);

  for (const invalidName of ['', '   ', 'x'.repeat(81), 'name\\u0000bad']) {
    const invalid = await fetch(endpoint, {
      method: 'PUT',
      headers: { authorization: 'Bearer test-token', 'content-type': 'application/json' },
      body: JSON.stringify({ display_name: invalidName }),
    });
    assert.equal(invalid.status, 400);
  }
  const missingName = await fetch(endpoint, {
    method: 'PUT',
    headers: { authorization: 'Bearer test-token', 'content-type': 'application/json' },
    body: JSON.stringify({ other: 'field' }),
  });
  assert.equal(missingName.status, 400);

  const parallelPromise = Promise.all(Array.from({ length: 9 }, request));
  await waitFor(async () => (await activeMarkers(markers)) === 8, 2000);
  const saturationProbe = await request();
  assert.equal(saturationProbe.status, 503);
  assert.deepEqual(await saturationProbe.json(), { error: 'database_busy' });
  const parallel = await parallelPromise;
  const statuses = parallel.map((response) => response.status).sort((a, b) => a - b);
  assert.deepEqual(statuses, [200, 200, 200, 200, 200, 200, 200, 200, 503]);
  const busy = parallel.find((response) => response.status === 503);
  assert.deepEqual(await busy.json(), { error: 'database_busy' });
  for (const response of parallel.filter((r) => r.status === 200)) {
    assert.deepEqual(await response.json(), { profile: null });
  }

  await waitFor(async () => (await activeMarkers(markers)) === 0, 3000);
  const afterRelease = await request();
  assert.equal(afterRelease.status, 200);
  assert.deepEqual(await afterRelease.json(), { profile: null });
});
