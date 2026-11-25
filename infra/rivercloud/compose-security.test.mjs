import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const compose = await readFile(path.join(root, "docker-compose.yml"), "utf8");
const env = await readFile(path.join(root, ".env.example"), "utf8");
const serviceBlocks = [...compose.matchAll(/^  ([a-z0-9-]+):\n([\s\S]*?)(?=^  [a-z0-9-]+:\n|^networks:\n|^volumes:\n)/gm)]
  .map(match => ({ name: match[1], body: match[2] }));

test("every Compose image is immutable digest-pinned", () => {
  const images = [...compose.matchAll(/^\s*image:\s*(\S+)\s*$/gm)].map(match => match[1]);
  assert.equal(images.length, 3, "expected Caddy, OAuth2 Proxy and demo images");
  for (const image of images) assert.match(image, /@sha256:[a-f0-9]{64}$/i, image);
});

test("only Caddy publishes host ports", () => {
  const published = serviceBlocks.filter(({ body }) => /^\s*ports:/m.test(body)).map(({ name }) => name);
  assert.deepEqual(published, ["caddy"]);
  assert.doesNotMatch(compose, /docker\.sock|containerd\.sock/i);
  assert.doesNotMatch(compose, /^\s*privileged:\s*true/m);
  assert.doesNotMatch(compose, /^\s*network_mode:\s*host/m);
});

test("example secrets are placeholders and the network stays named", () => {
  for (const key of ["RIVERCLOUD_OIDC_CLIENT_SECRET", "RIVERCLOUD_OAUTH2_PROXY_COOKIE_SECRET"]) {
    assert.match(env, new RegExp("^" + key + "=CHANGE_ME", "m"));
  }
  assert.match(compose, /^  rivercloud:\n/m);
});
