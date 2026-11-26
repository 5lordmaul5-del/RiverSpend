// RC-155: control observatory aggregation; read-only.
import { assessRegressionMatrix } from "./security-regression-matrix.mjs";
import { buildDiagnosticReport, validateDiagnosticReport } from "./diagnostic-report.mjs";
const safe=(v)=>{try{if(!v||typeof v!=="object"||Array.isArray(v)||(Object.getPrototypeOf(v)!==Object.prototype&&Object.getPrototypeOf(v)!==null))return null;const o=Object.create(null);for(const k of Reflect.ownKeys(v)){if(typeof k!=="string")return null;const d=Object.getOwnPropertyDescriptor(v,k);if(!d||!d.enumerable||!Object.hasOwn(d,"value"))return null;o[k]=d.value;}return o;}catch{return null;}};
export function buildControlObservatory(bundle){
 const matrix=assessRegressionMatrix(bundle);
 const report=buildDiagnosticReport(bundle);
 const reportValid=validateDiagnosticReport(report);
 const controls=matrix.entries.map(e=>Object.freeze({id:e.id,scenario:e.scenario,severity:e.severity,status:e.outcome,pass:e.pass,diagnostics:Object.freeze([...e.diagnostics])}));
 const overview=Object.freeze({schema:"rivercloud.observatory.v1",reportValid,controlsTotal:controls.length,controlsPassed:controls.filter(c=>c.pass).length,controlsFailed:controls.filter(c=>!c.pass&&c.status==="regression").length,controlsBlocked:controls.filter(c=>c.status==="blocked").length,reportFindings:report.summary.findings,coverage:report.summary.coverage});
 return Object.freeze({overview,controls:Object.freeze(controls),report,limitations:Object.freeze(["read_only","diagnostic_not_certification","execution_not_authorized","test_execution_not_confirmed"])});
}
export function validateObservatory(input){
 const d=safe(input,["overview","controls","report","limitations"]);if(!d||!Array.isArray(d.controls)||!Array.isArray(d.limitations))return false;
 const o=safe(d.overview,["schema","reportValid","controlsTotal","controlsPassed","controlsFailed","controlsBlocked","reportFindings","coverage"]);
 if(!o||o.schema!=="rivercloud.observatory.v1"||!Number.isInteger(o.controlsTotal)||!Number.isInteger(o.controlsPassed)||!Number.isInteger(o.controlsFailed)||!Number.isInteger(o.controlsBlocked)||o.controlsTotal!==d.controls.length)return false;
 if(o.controlsPassed+o.controlsFailed+o.controlsBlocked!==o.controlsTotal)return false;
 return d.controls.every(c=>{const x=safe(c,["id","scenario","severity","status","pass","diagnostics"]);return x&&typeof x.id==="string"&&typeof x.pass==="boolean"&&Array.isArray(x.diagnostics);});
}
