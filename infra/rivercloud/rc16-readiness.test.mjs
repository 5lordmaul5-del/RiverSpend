import test from "node:test";import assert from "node:assert/strict";import {assessReadiness} from "./rc16-readiness.mjs";
test("readiness defaults to blocked",()=>assert.equal(assessReadiness().ready,false));
test("requires all gates",()=>assert.ok(assessReadiness({unit_tests:true,security_review:true,backup_plan:true,restore_test:true,secrets_review:true,dependency_review:true,resource_limits:true,monitoring:true,incident_plan:true}).ready));
test("production eligibility remains false",()=>assert.equal(assessReadiness({unit_tests:true,security_review:true,backup_plan:true,restore_test:true,secrets_review:true,dependency_review:true,resource_limits:true,monitoring:true,incident_plan:true}).productionEligible,false));
