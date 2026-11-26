import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { POLICY_ERROR_CODES, CAPACITY_ERROR_CODES } from "../../infra/rivercloud/shared-contracts.mjs";

const root = new URL("../../infra/rivercloud/", import.meta.url);
const server = await readFile(new URL("server.mjs", root), "utf8");
const proxy = await readFile(new URL("rc34-proxy-api.mjs", root), "utf8");

test("both API layers consume the shared error catalogs", () => {
  for (const source of [server, proxy]) {
    assert.match(source, /import\s*\{\s*POLICY_ERROR_CODES\s*,\s*CAPACITY_ERROR_CODES\s*\}\s*from\s*["']\.\/shared-contracts\.mjs["']/);
    assert.match(source, /new Set\(POLICY_ERROR_CODES\)/);
    assert.match(source, /new Set\(CAPACITY_ERROR_CODES\)/);
  }
  assert.ok(POLICY_ERROR_CODES.includes("profile_not_allowed"));
  assert.ok(CAPACITY_ERROR_CODES.includes("state_lock_timeout"));
});

test("API route surfaces are explicit and distinct, with plan endpoints", () => {
  assert.match(server, /["']\/deploy["']/);
  assert.match(proxy, /["']\/api\/plan["']/);
  assert.match(server, /executionEnabled:\s*false/);
  assert.match(proxy, /executionEnabled:\s*false/);
});
