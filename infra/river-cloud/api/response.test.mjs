import test from 'node:test';
import assert from 'node:assert/strict';
import { sendJsonResponse } from './response.mjs';

function mockResponse(overrides = {}) {
  const calls = [];
  return {
    calls,
    destroyed: false,
    writableEnded: false,
    headersSent: false,
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
  for (const overrides of [{ destroyed: true }, { writableEnded: true }, { headersSent: true }]) {
    const res = mockResponse(overrides);
    assert.equal(sendJsonResponse(res, 200, {}), false);
    assert.equal(res.calls.length, 0);
  }
});

test('response write failures are contained', () => {
  const res = mockResponse({ writeHead() { throw new Error('socket failure'); } });
  assert.equal(sendJsonResponse(res, 200, {}), false);
});


test('serialization errors do not partially write headers', () => {
  const res = mockResponse();
  const payload = {};
  payload.self = payload;
  assert.equal(sendJsonResponse(res, 200, payload), false);
  assert.equal(res.calls.length, 0);
});


test('response end failures are contained', () => {
  const res = mockResponse({ end() { throw new Error('socket closed during end'); } });
  assert.equal(sendJsonResponse(res, 200, { ok: true }), false);
});

test('refuses responses whose headers have already been sent', () => {
  const res = mockResponse({ headersSent: true });
  assert.equal(sendJsonResponse(res, 500, { error: 'internal_error' }), false);
  assert.equal(res.calls.length, 0);
});


test('response helper sets content safety headers', () => {
  const res = mockResponse();
  assert.equal(sendJsonResponse(res, 200, { ok: true }), true);
  const headers = res.calls[0][2];
  assert.equal(headers['content-type'], 'application/json; charset=utf-8');
  assert.equal(headers['x-content-type-options'], 'nosniff');
  assert.equal(headers['referrer-policy'], 'no-referrer');
});


test('response helper never emits a partial body when end throws', () => {
  const res = mockResponse({ end() { throw new Error('client vanished'); } });
  assert.equal(sendJsonResponse(res, 200, { safe: true }), false);
});


test('response helper returns false when serialization fails before write', () => {
  const res = mockResponse();
  const bad = { toJSON() { throw new Error('serialization failure'); } };
  assert.equal(sendJsonResponse(res, 200, bad), false);
  assert.equal(res.calls.length, 0);
});


test('response helper rejects payloads that JSON.stringify cannot produce a body for', () => {
  const res = mockResponse();
  assert.equal(sendJsonResponse(res, 200, undefined), false);
  assert.equal(res.calls.length, 0);
});
