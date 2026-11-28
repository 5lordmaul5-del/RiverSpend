import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.dirname(fileURLToPath(import.meta.url));
const compose=await readFile(path.join(root,"docker-compose.yml"),"utf8");
const caddy=await readFile(path.join(root,"Caddyfile"),"utf8");
const env=await readFile(path.join(root,".env.example"),"utf8");
const proxyBlock=compose.split("  oauth2-proxy:")[1].split("  rivercloud-api:")[0];
test("OIDC proxy is digest-pinned, internal and trusted only through Caddy",()=>{
 assert.match(compose,/oauth2-proxy\/oauth2-proxy:v7\.15\.6@sha256:/);
 assert.match(proxyBlock,/OAUTH2_PROXY_PROVIDER: oidc/);
 assert.match(proxyBlock,/OAUTH2_PROXY_ALLOWED_GROUPS:/);
 assert.match(proxyBlock,/OAUTH2_PROXY_TRUSTED_PROXY_IPS: 172\.30\.250\.2\/32/);
 assert.doesNotMatch(proxyBlock,/ports:/);
 assert.match(caddy,/reverse_proxy oauth2-proxy:4180/);
});
test("OIDC upstream routes /api/ to API and fallback to demo",()=>{
 assert.match(proxyBlock,/OAUTH2_PROXY_UPSTREAMS:.*rivercloud-api:8788\/api\//);
 assert.match(proxyBlock,/rivercloud-demo:8080\//);
 assert.match(proxyBlock,/OAUTH2_PROXY_PASS_USER_HEADERS: "true"/);
 assert.match(proxyBlock,/OAUTH2_PROXY_SET_XAUTHREQUEST: "true"/);
});
test("OIDC example keeps secrets placeholders and role group allowlist",()=>{
 assert.match(env,/RIVERCLOUD_OIDC_CLIENT_SECRET=CHANGE_ME/);
 assert.match(env,/RIVERCLOUD_OAUTH2_PROXY_COOKIE_SECRET=CHANGE_ME/);
 assert.match(env,/RIVERCLOUD_OIDC_ALLOWED_GROUPS=RiverCloudOwners,RiverCloudAdmins,RiverCloudOperators,RiverCloudAuditors,RiverCloudViewers/);
 assert.match(compose,/OAUTH2_PROXY_OIDC_GROUPS_CLAIM:/);
});
test("proxy uses bounded trust and secure cookies without skip-auth rules",()=>{
 assert.match(proxyBlock,/OAUTH2_PROXY_REVERSE_PROXY: "true"/);
 assert.match(proxyBlock,/OAUTH2_PROXY_TRUSTED_PROXY_IPS: 172\.30\.250\.2\/32/);
 assert.match(proxyBlock,/OAUTH2_PROXY_COOKIE_SECURE: "true"/);
 assert.match(proxyBlock,/OAUTH2_PROXY_COOKIE_HTTPONLY: "true"/);
 assert.match(proxyBlock,/OAUTH2_PROXY_COOKIE_SAMESITE: lax/);
 assert.match(proxyBlock,/OAUTH2_PROXY_ALLOWED_GROUPS:/);
 assert.doesNotMatch(proxyBlock,/skip-auth-route|skip-auth-regex|OAUTH2_PROXY_SKIP_AUTH/);
});
