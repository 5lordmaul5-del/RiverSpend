import test from "node:test";import assert from "node:assert/strict";import {validateIdentityClaims,hasRole,hasPermission} from "./rc13-identity.mjs";
const now=1_700_000_000_000,claims={issuer:"issuer",subject:"user-1",audience:"rivercloud",issuedAt:now-1000,expiresAt:now+60_000,roles:["auditor"]},options={now,expectedIssuer:"issuer",expectedAudience:"rivercloud",verifyIssuer:()=>true};
test("rejects claims without verified signature",()=>assert.equal(validateIdentityClaims(claims,{...options,verifyIssuer:()=>false}).reason,"signature_not_verified"));
test("accepts validated identity and deduplicates roles",()=>{const r=validateIdentityClaims({...claims,roles:["auditor","auditor"]},options);assert.equal(r.ok,true);assert.deepEqual(r.actor.roles,["auditor"]);});
test("rejects expiry",()=>assert.equal(validateIdentityClaims({...claims,expiresAt:now-1},options).reason,"invalid_time_window"));
test("rejects unknown role",()=>assert.equal(validateIdentityClaims({...claims,roles:["root"]},options).reason,"invalid_roles"));
test("role helper denies unknown roles",()=>assert.equal(hasRole({roles:["root"]},"root"),false));
test("RBAC permission mapping is least-privilege and owner wildcard",()=>{assert.equal(hasPermission({roles:["auditor"]},"read_audit"),true);assert.equal(hasPermission({roles:["auditor"]},"approve_jobs"),false);assert.equal(hasPermission({roles:["viewer"]},"manage_users"),false);assert.equal(hasPermission({roles:["owner"]},"manage_users"),true);assert.equal(hasPermission({roles:["root"]},"manage_users"),false);});
