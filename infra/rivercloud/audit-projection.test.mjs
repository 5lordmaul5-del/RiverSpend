import test from "node:test";
import assert from "node:assert/strict";
import {prepareRun} from "./runner.mjs";
import {projectPreparedRunAudit,verifyAuditProjection} from "./audit-projection.mjs";
const input={projectId:"riverspend",branch:"main",commit:"0123456789abcdef0123456789abcdef01234567",target:"staging"};
test("RC-148 emits deterministic, verified read-only audit projection",()=>{const run=prepareRun(input);const audit=projectPreparedRunAudit(run);assert.equal(audit.event,"prepared_run_verified");assert.equal(audit.status,"prepared_not_executed");assert.equal(verifyAuditProjection(audit),true);assert.equal(projectPreparedRunAudit(run).auditDigest,audit.auditDigest);});
test("projection rejects unverified run envelopes",()=>{const run=prepareRun(input);assert.throws(()=>projectPreparedRunAudit({...run,digest:"f".repeat(64)}),/prepared_run_unverified/);});
test("audit verifier rejects digest and field tampering",()=>{const audit=projectPreparedRunAudit(prepareRun(input));assert.equal(verifyAuditProjection({...audit,target:"production"}),false);assert.equal(verifyAuditProjection({...audit,auditDigest:"0".repeat(64)}),false);assert.equal(verifyAuditProjection({...audit,extra:true}),false);});
test("audit verifier rejects accessors and symbols",()=>{const audit=projectPreparedRunAudit(prepareRun(input));let calls=0;const accessor={...audit};Object.defineProperty(accessor,"status",{enumerable:true,get(){calls++;return "prepared_not_executed";}});assert.equal(verifyAuditProjection(accessor),false);assert.equal(calls,0);const sym={...audit};sym[Symbol("x")]=1;assert.equal(verifyAuditProjection(sym),false);});
