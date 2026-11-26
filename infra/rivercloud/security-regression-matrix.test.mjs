import test from "node:test";
import assert from "node:assert/strict";
import { assessRegressionMatrix, regressionMatrix } from "./security-regression-matrix.mjs";
import { prepareRun } from "./runner.mjs";
import { projectPreparedRunAudit } from "./audit-projection.mjs";
function bundle(){const run=prepareRun({projectId:"riverspend",branch:"main",commit:"a".repeat(40),target:"staging"});return {run,audit:projectPreparedRunAudit(run),lifecycle:{runId:run.runId,digest:run.digest,status:run.status}};}
test("matrix has stable seven controls",()=>assert.equal(regressionMatrix().length,7));
test("matrix summarizes scenario outcomes",()=>{const r=assessRegressionMatrix(bundle());assert.equal(r.summary.total,7);assert.equal(r.summary.blocked,0);assert.equal(r.summary.failed,0);});
test("each matrix control has traceable identifier",()=>assert.ok(regressionMatrix().every(c=>/^RC-S\\d{2}$/.test(c.id))));
