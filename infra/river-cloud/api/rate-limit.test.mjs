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
