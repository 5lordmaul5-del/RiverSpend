// RC-161 recovery classification tests — authored, not executed.
import assert from "node:assert/strict";
import {classifyRecovery,validateRecoveryClassification} from "./recovery-classifier.mjs";
const healthy=classifyRecovery({component:"gateway",faultCode:"none",integrity:true,availability:true});assert.equal(validateRecoveryClassification(healthy),true);assert.equal(healthy.action,"observe");
const bad=classifyRecovery({component:"gateway",faultCode:"fault",integrity:false,availability:false});assert.equal(validateRecoveryClassification(bad),true);assert.equal(bad.action,"isolate");assert.equal(bad.automaticAction,false);
assert.equal(classifyRecovery({component:"x"}),null);
