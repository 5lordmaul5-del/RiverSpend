import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../../infra/rivercloud/", import.meta.url);
const load = p => readFile(new URL(p, root), "utf8");

test("identity and approval prototypes declare their unverified boundaries", async () => {
  const identity = await load("rc13-identity.mjs");
  const approval = await load("approval-bound.mjs");
  const proxy = await load("rc34-proxy-api.mjs");
  assert.match(identity, /verifyIssuer=\(\)=>false/);
  assert.match(identity, /signature_not_verified/);
  assert.match(approval, /unverified label/i);
  assert.match(proxy, /trustedProxyAddress/);
  assert.match(proxy, /x-forwarded-user/);
});

test("proxy routes check permissions and do not expose execution endpoints", async () => {
  const proxy = await load("rc34-proxy-api.mjs");
  assert.match(proxy, /hasPermission\(actor, route\.permission\)/);
  assert.match(proxy, /Plan only; no build or deployment is executed/);
  assert.doesNotMatch(proxy, /\/api\/deploy/);
});
