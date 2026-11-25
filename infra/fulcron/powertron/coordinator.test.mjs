import test from 'node:test';
import assert from 'node:assert/strict';
import { routeTask } from './coordinator.mjs';

test('routes a security task without enabling execution', () => {
  const result = routeTask({task_id:'t1',scope:'security',request:'audit access controls'});
  assert.equal(result.suggested_group,'security');
  assert.equal(result.status,'queued_for_review');
  assert.equal(result.execution,'disabled');
  assert.equal(result.approval_required,true);
});
test('routes market tasks', () => {
  assert.equal(routeTask({request:'review product listing',scope:'market'}).suggested_group,'market');
});
test('defaults unknown requests to core', () => {
  assert.equal(routeTask({request:'miscellaneous request'}).suggested_group,'core');
});
test('rejects missing requests', () => {
  assert.throws(() => routeTask({}), /request is required/);
});
