import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "../src/server.js";

test("health and status endpoints are read-only and available", async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  try {
    const health = await fetch(`http://127.0.0.1:${port}/health`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { ok: true });
    const status = await fetch(`http://127.0.0.1:${port}/status`);
    const data = await status.json();
    assert.equal(status.status, 200);
    assert.equal(data.name, "RiverSSAI 10.0");
    assert.equal(data.toolsEnabled, false);
    assert.equal(data.modelConnected, false);
  } finally { server.close(); }
});
test("unsupported routes return 404 and mutating methods are rejected", async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  try {
    assert.equal((await fetch(`http://127.0.0.1:${port}/unknown`)).status, 404);
    assert.equal((await fetch(`http://127.0.0.1:${port}/status`, { method: "POST" })).status, 405);
  } finally { server.close(); }
});