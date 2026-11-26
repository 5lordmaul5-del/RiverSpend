import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root=path.dirname(fileURLToPath(import.meta.url));
const compose=await readFile(path.join(root,"docker-compose.yml"),"utf8");
const dockerfile=await readFile(path.join(root,"Dockerfile"),"utf8");
const apiSource=await readFile(path.join(root,"rc34-proxy-api.mjs"),"utf8");
const services=[...compose.matchAll(/^  ([a-z0-9-]+):\n([\s\S]*?)(?=^  [a-z0-9-]+:\n|^networks:\n|^volumes:\n)/gm)].map(m=>({name:m[1],body:m[2]}));
const block=name=>services.find(s=>s.name===name)?.body||"";

test("RC-35 API container uses an immutable Node base and a non-root entrypoint",()=>{
 assert.match(dockerfile,/FROM node:22\.23\.5-alpine3\.23@sha256:[a-f0-9]{64}/);
 assert.match(dockerfile,/USER node/);
 assert.match(dockerfile,/CMD \["node", "\/app\/infra\/rivercloud\/rc34-proxy-api\.mjs"\]/);
 assert.doesNotMatch(dockerfile,/COPY\s+\.\s+/);
 for(const name of ["rc34-proxy-api.mjs","queue.mjs","engine.mjs","rc11-state.mjs","rc13-identity.mjs"]) assert.match(dockerfile,new RegExp(name));
});

test("RC-35 API is reachable only through the internal path-mapped proxy",()=>{
 const proxy=block("oauth2-proxy"),api=block("rivercloud-api");
 assert.match(proxy,/OAUTH2_PROXY_UPSTREAMS:.*rivercloud-api:8788\/api\//);
 assert.match(proxy,/rivercloud-api:/);
 assert.match(api,/rivercloud-api:/);
 assert.doesNotMatch(api,/ports:/);
 assert.match(api,/RIVERCLOUD_TRUSTED_PROXY_IP: 172\.31\.250\.3/);
 assert.match(api,/RIVERCLOUD_API_HOST: 0\.0\.0\.0/);
 assert.match(api,/RIVERCLOUD_API_PORT: "8788"/);
});

test("RC-35 API storage is persistent and root filesystem is read-only",()=>{
 const api=block("rivercloud-api");
 assert.match(api,/queue_data:\/data/);
 assert.match(api,/read_only: true/);
 assert.match(api,/cap_drop:\n\s+- ALL/);
 assert.match(api,/no-new-privileges:true/);
});

test("RC-35 public and internal networks are separated",()=>{
 const caddy=block("caddy"),demo=block("rivercloud-demo");
 assert.match(caddy,/rivercloud-public:/);
 assert.doesNotMatch(caddy,/rivercloud-api:/);
 assert.match(demo,/rivercloud-api:/);
 assert.match(compose,/rivercloud-api:\n\s+name: rivercloud-api\n\s+internal: true/);
 assert.match(compose,/rivercloud-public:\n\s+name: rivercloud-public/);
});


test("RC-54 proxy peer defaults and Compose override match the private API network",()=>{
 assert.ok(apiSource.includes('trustedProxyAddress = "172.31.250.3"'));
 assert.ok(apiSource.includes('RIVERCLOUD_TRUSTED_PROXY_IP || "172.31.250.3"'));
 assert.ok(compose.includes("RIVERCLOUD_TRUSTED_PROXY_IP: 172.31.250.3"));
});


test("RC-62 API image initializes the queue data volume with private permissions",()=>{assert.match(dockerfile,/RUN mkdir -p \/data && chown node:node \/data && chmod 700 \/data/);});
