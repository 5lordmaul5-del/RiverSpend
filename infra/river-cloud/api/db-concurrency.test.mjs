import test from 'node:test';
import assert from 'node:assert/strict';
import { createDbConcurrencyGate } from './db-concurrency.mjs';

test('gate refuses acquisition above its cap and releases capacity', () => {
  const gate = createDbConcurrencyGate(2);
  const release1 = gate.tryAcquire();
  const release2 = gate.tryAcquire();
  assert.equal(typeof release1, 'function');
  assert.equal(typeof release2, 'function');
  assert.equal(gate.activeCount(), 2);
  assert.equal(gate.tryAcquire(), null);
  release1();
  assert.equal(gate.activeCount(), 1);
  const release3 = gate.tryAcquire();
  assert.equal(typeof release3, 'function');
  assert.equal(gate.activeCount(), 2);
  release2();
  release2(); // release is idempotent
  release3();
  assert.equal(gate.activeCount(), 0);
});

test('gate rejects invalid limits', () => {
  for (const value of [0, -1, 1.5, 257, NaN]) {
    assert.throws(() => createDbConcurrencyGate(value), TypeError);
  }
});

test('gate statistics record bounded pressure without exposing identities', () => {
  const gate = createDbConcurrencyGate(1);
  const release = gate.tryAcquire();
  assert.deepEqual(gate.stats(), { limit: 1, active: 1, acquired: 1, rejected: 0 });
  assert.equal(gate.tryAcquire(), null);
  assert.deepEqual(gate.stats(), { limit: 1, active: 1, acquired: 1, rejected: 1 });
  release();
  assert.deepEqual(gate.stats(), { limit: 1, active: 0, acquired: 1, rejected: 1 });
});
