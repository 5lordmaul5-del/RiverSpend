import test from 'node:test';import assert from 'node:assert/strict';import {createEvidenceRecord,buildEvidenceLedger} from './resilience-evidence.mjs';import {assessReadiness} from './readiness-assessment.mjs';
const nodes=['gateway','observatory','diagnostic-report','boundary-isolation'].map(id=>({id,label:id,status:'healthy',dependencies:[]}));
const led=(state='passed')=>buildEvidenceLedger([createEvidenceRecord({id:'e',type:'check',component:'all',state,summary:'record',timestamp:1,sourceDigest:null})]);
test('assessment only with complete static healthy map',()=>{const r=assessReadiness({evidenceLedger:led(),components:nodes});assert.equal(r.status,'assessment_only');assert.equal(r.readinessIsCertification,false);});
test('missing nodes or failed evidence blocks readiness',()=>{assert.equal(assessReadiness({evidenceLedger:led(),components:nodes.slice(1)}).status,'not_ready');assert.equal(assessReadiness({evidenceLedger:led('failed'),components:nodes}).status,'not_ready');});
test('not run evidence requires review',()=>{assert.equal(assessReadiness({evidenceLedger:led('not_run'),components:nodes}).status,'review_required');});
