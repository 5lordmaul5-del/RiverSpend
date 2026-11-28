import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDbAdvisorySemaphoreScript, RIVERCLOUD_SEMAPHORE_NAMESPACE } from './db-advisory-semaphore.mjs';

test('advisory semaphore script checks bounded slot locks and emits a reserved busy marker', () => {
  const script = buildDbAdvisorySemaphoreScript(8);
  assert.match(script, /generate_series\(1, 8\)/);
  assert.match(script, new RegExp('pg_try_advisory_lock\\(' + RIVERCLOUD_SEMAPHORE_NAMESPACE + ', slots\\.slot\\)'));
  assert.match(script, /\\if :acquired/);
  assert.ok(script.includes('\\echo RIVERCLOUD_SEMAPHORE_FULL'));
  assert.ok(script.includes('\\quit'));
  assert.match(script, /\\endif/);
});

test('advisory semaphore rejects invalid slot counts', () => {
  for (const value of [0, -1, 1.5, 257, NaN]) {
    assert.throws(() => buildDbAdvisorySemaphoreScript(value), TypeError);
  }
});
