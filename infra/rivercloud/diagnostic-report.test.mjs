import test from "node:test";
import assert from "node:assert/strict";
import { buildDiagnosticReport, validateDiagnosticReport } from "./diagnostic-report.mjs";
import { prepareRun } from "./runner.mjs";
import { projectPreparedRunAudit } from "./audit-projection.mjs";
function bundle(){const run=prepareRun({projectId:"riverspend",branch:"main",commit:"a".repeat(40),target:"staging"});return {run,audit:projectPreparedRunAudit(run),lifecycle:{runId:run.runId,digest:run.digest,status:run.status}};}
test("report contains summary and catalog coverage",()=>{const r=buildDiagnosticReport(bundle());assert.equal(r.schema,"rivercloud.diagnostic-report.v1");assert.equal(r.summary.total,7);assert.equal(r.coverage.missing.length,0);});
test("report validator accepts producer report",()=>assert.equal(validateDiagnosticReport(buildDiagnosticReport(bundle())),true));
test("report validator rejects hostile accessor",()=>{const r=buildDiagnosticReport(bundle());Object.defineProperty(r,"schema",{get(){throw Error("hostile");}});assert.equal(validateDiagnosticReport(r),false);});
test("report exposes limitations",()=>assert.ok(buildDiagnosticReport(bundle()).limitations.includes("test_execution_not_proven")));
