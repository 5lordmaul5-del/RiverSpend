// RC-157 adapter regression checks (test source; not executed here).
import assert from "node:assert/strict";
import { adaptObservatory, adaptDiagnosticReport, validateAdapterResult } from "./compatibility-adapter.mjs";
const emptyBundle=Object.freeze({});
for(const fn of [adaptObservatory,adaptDiagnosticReport]){
 const result=fn(emptyBundle);
 assert.equal(validateAdapterResult(result),true);
 assert.equal(result.schema,"rivercloud.contract.v1");
 assert.equal(result.meta.requestId.startsWith("rc157-"),true);
}
const hostile={};Object.defineProperty(hostile,"x",{get(){throw Error("should not run")}});
assert.equal(validateAdapterResult(hostile),false);
