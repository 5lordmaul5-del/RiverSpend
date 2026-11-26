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
const block = name => serviceBlocks.find(x => x.name === name)?.body || "";

test("every externally sourced Compose image is digest-pinned", () => {
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

test("API service is internal-only and has bounded runtime controls", () => {
  const api = block("rivercloud-api");
  assert.match(api, /dockerfile: infra\/rivercloud\/Dockerfile/);
  assert.match(api, /RIVERCLOUD_TRUSTED_PROXY_IP: 172\.31\.250\.3/);
  assert.match(api, /RIVERCLOUD_QUEUE_DIR: \/data\/state\.json/);
  assert.match(api, /expose:\n\s+- ["']?8788/);
  assert.doesNotMatch(api, /^\s*ports:/m);
  assert.match(api, /read_only:\s*true/);
  assert.match(api, /cap_drop:\n\s+- ALL/);
  assert.match(api, /no-new-privileges:true/);
  assert.match(api, /mem_limit: 256m/);
  assert.match(api, /cpus: 0\.5/);
});

test("API network is isolated and only the proxy bridges both networks", () => {
  const proxy = block("oauth2-proxy");
  assert.match(proxy, /rivercloud-public:/);
  assert.match(proxy, /rivercloud-api:/);
  assert.match(block("caddy"), /rivercloud-public:/);
  assert.doesNotMatch(block("caddy"), /rivercloud-api:/);
  assert.match(block("rivercloud-demo"), /rivercloud-api:/);
  assert.match(compose, /rivercloud-api:\n\s+name: rivercloud-api\n\s+internal: true/);
  assert.match(block("rivercloud-api"), /rivercloud-api:/);
  assert.doesNotMatch(block("rivercloud-api"), /rivercloud-public:/);
});

test("example secrets are placeholders and role groups are allowlisted", () => {
  for (const key of ["RIVERCLOUD_OIDC_CLIENT_SECRET", "RIVERCLOUD_OAUTH2_PROXY_COOKIE_SECRET"]) {
    assert.match(env, new RegExp("^" + key + "=CHANGE_ME", "m"));
  }
  assert.match(env, /RIVERCLOUD_OIDC_ALLOWED_GROUPS=RiverCloudOwners,RiverCloudAdmins,RiverCloudOperators,RiverCloudAuditors,RiverCloudViewers/);
});


const dockerignore = await readFile(path.join(root, "../../.dockerignore"), "utf8");
test("Docker build context excludes secret, runtime state and common artifact paths", () => {
  const required = [".env", ".env.*", "**/.env", "**/.env.*", ".git", "**/.git", "**/secrets/", "**/queue-data/", "**/queue_data/", "**/state.json", "**/lifecycle.json", "**/*.lock", "**/*.tmp", "**/*.log", "**/*.bak", "**/*.backup", "**/node_modules/", "**/coverage/", "**/dist/", "**/build/"];
  const lines = dockerignore.split(String.fromCharCode(10)).map(line => line.trim());
  for (const pattern of required) assert.ok(lines.includes(pattern), `missing Docker context exclusion: ${pattern}`);
});
