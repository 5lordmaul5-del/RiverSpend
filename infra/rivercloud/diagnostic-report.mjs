// RC-154: deterministic diagnostic report over RC-153 matrix outputs.
import { assessRegressionMatrix, regressionMatrix } from "./security-regression-matrix.mjs";
const REQUIRED=["RC-S01","RC-S02","RC-S03","RC-S04","RC-S05","RC-S06","RC-S07"];
function safeData(input,keys){
 try{if(!input||typeof input!=="object"||Array.isArray(input)||(Object.getPrototypeOf(input)!==Object.prototype&&Object.getPrototypeOf(input)!==null))return null;
 const own=Reflect.ownKeys(input);if(own.length!==keys.length||own.some(k=>typeof k!=="string"||!keys.includes(k)))return null;
 const out=Object.create(null);for(const k of keys){const d=Object.getOwnPropertyDescriptor(input,k);if(!d||!d.enumerable||!Object.hasOwn(d,"value"))return null;out[k]=d.value;}return out;}catch{return null;}
}
export function buildDiagnosticReport(bundle){
 const matrix=regressionMatrix(),matrixIds=matrix.map(x=>x.id),missing=REQUIRED.filter(id=>!matrixIds.includes(id));
 const assessment=assessRegressionMatrix(bundle);
 const findings=assessment.entries.filter(e=>!e.pass).map(e=>Object.freeze({controlId:e.id,scenario:e.scenario,severity:e.severity,outcome:e.outcome,diagnostics:Object.freeze([...e.diagnostics])}));
 const gaps=Object.freeze(missing.map(id=>Object.freeze({controlId:id,reason:"control_missing_from_matrix"})));
 const summary=Object.freeze({...assessment.summary,coverage:matrixIds.length===0?"none":missing.length===0?"catalogued":"partial",findings:findings.length,missingControls:missing.length});
 return Object.freeze({schema:"rivercloud.diagnostic-report.v1",summary,findings:Object.freeze(findings),coverage:Object.freeze({required:Object.freeze([...REQUIRED]),catalogued:Object.freeze(matrixIds),missing:Object.freeze(missing)}),gaps,limitations:Object.freeze(["diagnostic_only","not_security_certification","test_execution_not_proven","no_execution_or_deployment_authorization"])});
}
export function validateDiagnosticReport(report){
 const d=safeData(report,["schema","summary","findings","coverage","gaps","limitations"]);
 if(!d||d.schema!=="rivercloud.diagnostic-report.v1"||!Array.isArray(d.findings)||!Array.isArray(d.gaps)||!Array.isArray(d.limitations))return false;
 const s=safeData(d.summary,["total","passed","failed","blocked","coverage","findings","missingControls"]);
 const c=safeData(d.coverage,["required","catalogued","missing"]);
 if(!s||!c||!Array.isArray(c.required)||!Array.isArray(c.catalogued)||!Array.isArray(c.missing))return false;
 return Number.isInteger(s.total)&&Number.isInteger(s.passed)&&Number.isInteger(s.failed)&&Number.isInteger(s.blocked)&&Number.isInteger(s.findings)&&Number.isInteger(s.missingControls)&&s.total===s.passed+s.failed+s.blocked&&s.findings===d.findings.length&&s.missingControls===c.missing.length&&d.gaps.length===c.missing.length;
}
