import test from "node:test";import assert from "node:assert/strict";import {validateIdentityClaims,hasRole,hasPermission} from "./rc13-identity.mjs";
const now=1_700_000_000_000,claims={issuer:"issuer",subject:"user-1",audience:"rivercloud",issuedAt:now-1000,expiresAt:now+60_000,roles:["auditor"]},options={now,expectedIssuer:"issuer",expectedAudience:"rivercloud",verifyIssuer:()=>true};
test("rejects claims without verified signature",()=>assert.equal(validateIdentityClaims(claims,{...options,verifyIssuer:()=>false}).reason,"signature_not_verified"));
test("accepts validated identity and deduplicates roles",()=>{const r=validateIdentityClaims({...claims,roles:["auditor","auditor"]},options);assert.equal(r.ok,true);assert.deepEqual(r.actor.roles,["auditor"]);});
test("rejects expiry",()=>assert.equal(validateIdentityClaims({...claims,expiresAt:now-1},options).reason,"invalid_time_window"));
test("rejects unknown role",()=>assert.equal(validateIdentityClaims({...claims,roles:["root"]},options).reason,"invalid_roles"));
test("role helper denies unknown roles",()=>assert.equal(hasRole({roles:["root"]},"root"),false));
test("RBAC permission mapping is least-privilege and owner wildcard",()=>{assert.equal(hasPermission({roles:["auditor"]},"read_audit"),true);assert.equal(hasPermission({roles:["auditor"]},"approve_jobs"),false);assert.equal(hasPermission({roles:["auditor"]},"read_jobs"),false);assert.equal(hasPermission({roles:["viewer"]},"read_jobs"),false);assert.equal(hasPermission({roles:["operator"]},"read_jobs"),true);assert.equal(hasPermission({roles:["admin"]},"read_jobs"),true);assert.equal(hasPermission({roles:["viewer"]},"manage_users"),false);assert.equal(hasPermission({roles:["owner"]},"manage_users"),true);assert.equal(hasPermission({roles:["root"]},"manage_users"),false);assert.equal(hasPermission({roles:["owner"]},"unknown_permission"),false);});
test("supports standard multi-audience shape but requires configured audience",()=>{assert.equal(validateIdentityClaims({...claims,audience:["other","rivercloud"]},options).ok,true);assert.equal(validateIdentityClaims({...claims,audience:["other"]},options).reason,"issuer_or_audience_mismatch");});
test("rejects unsafe timestamps and excessive token lifetime",()=>{assert.equal(validateIdentityClaims({...claims,issuedAt:1.7e16},options).reason,"invalid_time_window");assert.equal(validateIdentityClaims({...claims,expiresAt:now+13*60*60*1000},options).reason,"invalid_time_window");});
test("rejects invalid verifier configuration",()=>{assert.equal(validateIdentityClaims(claims,{...options,expectedIssuer:""}).reason,"issuer_or_audience_mismatch");assert.equal(validateIdentityClaims(claims,{...options,verifyIssuer:null}).reason,"signature_not_verified");});
test("admin, operator and auditor receive status read access without widening unknown permissions",()=>{assert.equal(hasPermission({roles:["admin"]},"read_status"),true);assert.equal(hasPermission({roles:["operator"]},"read_status"),true);assert.equal(hasPermission({roles:["auditor"]},"read_status"),true);assert.equal(hasPermission({roles:["auditor"]},"manage_projects"),false);assert.equal(hasPermission({roles:["operator"]},"read_audit"),false);});
test("identity claim verifier exceptions fail closed with a normalized result",()=>{const r=validateIdentityClaims(claims,{...options,verifyIssuer:()=>{throw new Error("verifier_unavailable");}});assert.deepEqual(r,{ok:false,reason:"signature_not_verified"});});
test("identity validation requires own properties for every mandatory claim",()=>{const inherited=Object.create(claims);const r=validateIdentityClaims(inherited,options);assert.equal(r.ok,false);assert.equal(r.reason,"invalid_claims");});
test("claim accessors are rejected before any getter or issuer callback is invoked",()=>{
 let getterCalls=0,verifierCalls=0;
 const hostile={...claims};
 Object.defineProperty(hostile,"subject",{enumerable:true,get(){getterCalls++;return "user-1";}});
 const r=validateIdentityClaims(hostile,{...options,verifyIssuer(){verifierCalls++;return true;}});
 assert.deepEqual(r,{ok:false,reason:"invalid_claims"});assert.equal(getterCalls,0);assert.equal(verifierCalls,0);
});
test("accessor roles, sparse arrays, symbols and oversized claims fail closed",()=>{
 let getterCalls=0;const roles=[];Object.defineProperty(roles,"0",{enumerable:true,get(){getterCalls++;return "auditor";}});roles.length=1;
 assert.equal(validateIdentityClaims({...claims,roles},options).reason,"invalid_claims");assert.equal(getterCalls,0);
 const sparse=new Array(1);assert.equal(validateIdentityClaims({...claims,roles:sparse},options).reason,"invalid_claims");
 const symbolClaim={...claims};symbolClaim[Symbol("hidden")]="value";assert.equal(validateIdentityClaims(symbolClaim,options).reason,"invalid_claims");
 assert.equal(validateIdentityClaims({...claims,extra:"x".repeat(17000)},options).reason,"invalid_claims");
});
test("issuer callback receives the bounded descriptor-derived snapshot",()=>{
 let seen;const r=validateIdentityClaims(claims,{...options,verifyIssuer(c){seen=c;return true;}});
 assert.equal(r.ok,true);assert.equal(Object.getPrototypeOf(seen),null);assert.notEqual(seen,claims);
});
