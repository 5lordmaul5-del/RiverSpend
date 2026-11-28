import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyAction, createApprovalRequest, decideApproval } from '../src/guard.js';

test('classifies read-like goals as low risk without enabling execution', () => {
  const result = classifyAction('inspect the project status');
  assert.equal(result.risk, 'low');
  assert.equal(result.allowed, true);
});
test('write and sensitive actions require approval', () => {
  assert.equal(classifyAction('update a file').requiresApproval, true);
  assert.equal(classifyAction('deploy production').risk, 'high');
  assert.equal(classifyAction('delete database').allowed, false);
});
test('invalid or oversized input is blocked', () => {
  assert.equal(classifyAction('').risk, 'invalid');
  assert.equal(classifyAction('x'.repeat(2001)).allowed, false);
});
test('approval decision never enables execution', () => {
  const request = createApprovalRequest('update README');
  const approved = decideApproval(request, 'approve', 'owner');
  assert.equal(approved.status, 'approved');
  assert.equal(approved.executionEnabled, false);
  assert.throws(() => decideApproval(approved, 'reject'));
});
