import test from 'node:test';
import assert from 'node:assert/strict';
import { sendJsonResponse } from './response.mjs';

function mockResponse(overrides = {}) {
  const calls = [];
  return {
    calls,
    destroyed: false,
    writableEnded: false,
    writeHead(status, headers) { calls.push(['writeHead', status, headers]); },
    end(body) { calls.push(['end', body]); },
    ...overrides,
  };
}

test('response helper sends JSON with defensive headers', () => {
  const res = mockResponse();
  assert.equal(sendJsonResponse(res, 201, { ok: true }), true);
  assert.equal(res.calls[0][1], 201);
  assert.equal(res.calls[0][2]['cache-control'], 'no-store');
  assert.equal(res.calls[1][1], JSON.stringify({ ok: true }));
});

test('does not write to already closed responses', () => {
  for (const overrides of [{ destroyed: true }, { writableEnded: true }]) {
    const res = mockResponse(overrides);
    assert.equal(sendJsonResponse(res, 200, {}), false);
    assert.equal(res.calls.length, 0);
  }
});

test('response write failures are contained', () => {
  const res = mockResponse({ writeHead() { throw new Error('socket failure'); } });
  assert.equal(sendJsonResponse(res, 200, {}), false);
});
