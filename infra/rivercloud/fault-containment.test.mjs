// RC-160 fault containment tests — authored, not executed.
import assert from "node:assert/strict";
import { runContainedDiagnostic,validateContainedResult } from "./fault-containment.mjs";
const good=runContainedDiagnostic("observatory",x=>x,{value:7});assert.equal(validateContainedResult(good),true);assert.equal(good.ok,true);
const fail=runContainedDiagnostic("diagnostic-report",()=>{throw new Error("expected_fault")});assert.equal(validateContainedResult(fail),true);assert.equal(fail.ok,false);
assert.equal(runContainedDiagnostic("execute",()=>1,null).code,"route_rejected");
assert.equal(validateContainedResult({}),false);
