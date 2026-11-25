import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.dirname(fileURLToPath(import.meta.url));
const compose=await readFile(path.join(root,"docker-compose.yml"),"utf8");
const caddy=await readFile(path.join(root,"Caddyfile"),"utf8");
const env=await readFile(path.join(root,".env.example"),"utf8");
test("OIDC proxy is a version-pinned internal service and not host-published",()=>{assert.match(compose,/oauth2-proxy\/oauth2-proxy:v7\.15\.6/);assert.match(compose,/OAUTH2_PROXY_PROVIDER: oidc/);assert.match(compose,/OAUTH2_PROXY_ALLOWED_GROUPS:/);assert.match(compose,/OAUTH2_PROXY_TRUSTED_PROXY_IPS: 172\.30\.250\.2\/32/);const block=compose.split("  oauth2-proxy:")[1].split("  rivercloud-demo:")[0];assert.doesNotMatch(block,/ports:/);assert.match(caddy,/reverse_proxy oauth2-proxy:4180/);});
test("OIDC example keeps secrets as placeholders and requires group claim config",()=>{assert.match(env,/RIVERCLOUD_OIDC_CLIENT_SECRET=CHANGE_ME/);assert.match(env,/RIVERCLOUD_OAUTH2_PROXY_COOKIE_SECRET=CHANGE_ME/);assert.match(env,/RIVERCLOUD_OIDC_ALLOWED_GROUPS=RiverCloudOperators/);assert.match(compose,/OAUTH2_PROXY_OIDC_GROUPS_CLAIM:/);});
test("OIDC proxy uses bounded trust and secure cookies without skip-auth rules",()=>{const block=compose.split("  oauth2-proxy:")[1].split("  rivercloud-demo:")[0];assert.match(block,/OAUTH2_PROXY_REVERSE_PROXY: "true"/);assert.match(block,/OAUTH2_PROXY_TRUSTED_PROXY_IPS: 172\.30\.250\.2\/32/);assert.match(block,/OAUTH2_PROXY_COOKIE_SECURE: "true"/);assert.match(block,/OAUTH2_PROXY_COOKIE_HTTPONLY: "true"/);assert.match(block,/OAUTH2_PROXY_COOKIE_SAMESITE: lax/);assert.match(block,/OAUTH2_PROXY_ALLOWED_GROUPS:/);assert.doesNotMatch(block,/skip-auth-route|skip-auth-regex|OAUTH2_PROXY_SKIP_AUTH/);assert.doesNotMatch(block,/ports:/);});\n