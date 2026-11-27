import test from 'node:test';
import assert from 'node:assert/strict';
import { createRateLimiter } from './rate-limit.mjs';

test('rate limiter permits limit and rejects subsequent requests in window', () => {
  let now = 100;
  const limiter = createRateLimiter({ limit: 2, windowMs: 1000, clock: () => now });
  assert.equal(limiter('a'), false);
  assert.equal(limiter('a'), false);
  assert.equal(limiter('a'), true);
});

test('rate limiter resets after window expiration', () => {
  let now = 100;
  const limiter = createRateLimiter({ limit: 1, windowMs: 10, clock: () => now });
  assert.equal(limiter('a'), false);
  assert.equal(limiter('a'), true);
  now = 111;
  assert.equal(limiter('a'), false);
});

test('rate limiter bounds key storage', () => {
  let now = 0;
  const limiter = createRateLimiter({ limit: 1, windowMs: 100, maxKeys: 3, clock: () => now });
  limiter('a'); limiter('b'); limiter('c'); limiter('d');
  assert.equal(limiter('d'), true);
});

test('rate limiter boundary is inclusive at window expiration', () => {
  let now = 50;
  const limiter = createRateLimiter({ limit: 1, windowMs: 20, clock: () => now });
  assert.equal(limiter('boundary'), false);
  assert.equal(limiter('boundary'), true);
  now = 70;
  assert.equal(limiter('boundary'), false);
});

test('rate limiter independently tracks keys', () => {
  const limiter = createRateLimiter({ limit: 1, windowMs: 100 });
  assert.equal(limiter('one'), false);
  assert.equal(limiter('one'), true);
  assert.equal(limiter('two'), false);
  assert.equal(limiter('two'), true);
});

test('rate limiter supports zero limit as immediate rejection after first request', () => {
  const limiter = createRateLimiter({ limit: 0, windowMs: 100 });
  assert.equal(limiter('zero'), true);
});
