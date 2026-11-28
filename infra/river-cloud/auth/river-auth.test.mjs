import test from 'node:test';
import assert from 'node:assert/strict';
import { createRiverAuth } from './river-auth.mjs';

const issuerUrl = 'https://river-test.supabase.co';
const publishableKey = 'sb_publishable_test';
const validId = '11111111-1111-4111-8111-111111111111';

test('RiverAuth validates bearer tokens through the configured issuer', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (url, options) => {
    assert.equal(url.href, issuerUrl + '/auth/v1/user');
    assert.equal(options.headers.apikey, publishableKey);
    assert.equal(options.headers.authorization, 'Bearer test-access-token');
    return new Response(JSON.stringify({ id: validId, user_metadata: { role: 'admin' } }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  const auth = createRiverAuth({ issuerUrl, publishableKey });
  const principal = await auth.verifyBearerToken('Bearer test-access-token');
  assert.deepEqual(principal, { subject: validId, issuer: issuerUrl });
  assert.equal(Object.hasOwn(principal, 'role'), false);
});

test('RiverAuth rejects missing and invalid bearer tokens without trusting client claims', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response(JSON.stringify({ id: 'not-a-uuid' }), { status: 200 });
  };

  const auth = createRiverAuth({ issuerUrl, publishableKey });
  assert.equal(await auth.verifyBearerToken(''), null);
  assert.equal(await auth.verifyBearerToken('Bearer invalid-token'), null);
  assert.equal(calls, 1);
});

test('RiverAuth treats upstream rejection as unauthenticated', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async () => new Response('{}', { status: 401 });
  const auth = createRiverAuth({ issuerUrl, publishableKey });
  assert.equal(await auth.verifyBearerToken('Bearer revoked-token'), null);
});

test('RiverAuth reports issuer outages as service unavailable', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async () => new Response('{}', { status: 503 });
  const auth = createRiverAuth({ issuerUrl, publishableKey });
  await assert.rejects(
    auth.verifyBearerToken('Bearer test-access-token'),
    (error) => error.status === 503,
  );
});


test('RiverAuth treats malformed issuer JSON as service unavailable', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async () => new Response('not-json', { status: 200 });
  const auth = createRiverAuth({ issuerUrl, publishableKey });
  await assert.rejects(
    auth.verifyBearerToken('Bearer test-access-token'),
    (error) => error.status === 503 && error.message === 'identity_provider_unavailable',
  );
});

test('RiverAuth rejects malformed authorization schemes without contacting issuer', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let calls = 0;
  globalThis.fetch = async () => { calls += 1; return new Response(JSON.stringify({ id: validId }), { status: 200 }); };
  const auth = createRiverAuth({ issuerUrl, publishableKey });
  for (const header of ['Basic abc', 'Bearer token/with/slash', 'Bearer token with spaces', 'bearer test-access-token']) {
    assert.equal(await auth.verifyBearerToken(header), null);
  }
  assert.equal(calls, 0);
});

test('RiverAuth rejects issuer user IDs that are not UUIDs', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async () => new Response(JSON.stringify({ id: 'admin', role: 'admin' }), { status: 200 });
  const auth = createRiverAuth({ issuerUrl, publishableKey });
  assert.equal(await auth.verifyBearerToken('Bearer test-access-token'), null);
});

test('RiverAuth maps transport failures to service unavailable', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async () => { throw new TypeError('network details must not leak'); };
  const auth = createRiverAuth({ issuerUrl, publishableKey });
  await assert.rejects(
    auth.verifyBearerToken('Bearer test-access-token'),
    (error) => error.status === 503 && error.message === 'identity_provider_unavailable',
  );
});

test('RiverAuth does not accept arbitrary issuer claims as a subject', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async () => new Response(JSON.stringify({ id: validId, app_metadata: { role: 'admin' }, role: 'admin' }), { status: 200 });
  const auth = createRiverAuth({ issuerUrl, publishableKey });
  const principal = await auth.verifyBearerToken('Bearer test-access-token');
  assert.equal(principal.subject, validId);
  assert.equal(Object.hasOwn(principal, 'role'), false);
  assert.equal(Object.hasOwn(principal, 'app_metadata'), false);
});
