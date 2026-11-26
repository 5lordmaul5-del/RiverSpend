// RC-157: read-only compatibility adapter for observatory/report outputs.
import { makeContract, validateContract } from "./interface-contract.mjs";
import { buildControlObservatory, validateObservatory } from "./control-observatory.mjs";
import { buildDiagnosticReport, validateDiagnosticReport } from "./diagnostic-report.mjs";
import { isolateBoundaryInput } from "./boundary-isolation.mjs";

const fail=(component,code,message,diagnostic)=>makeContract({component,ok:false,code,message,data:null,diagnostics:[{code,severity:"high",message:diagnostic}],requestId:"rc157-local"});
export function adaptObservatory(bundle){
 try{
  const isolated=isolateBoundaryInput(bundle);
  if(isolated===null)return fail("observatory-adapter","invalid_input","Boundary input rejected","boundary_isolation_failed");
  const value=buildControlObservatory(isolated);
  if(!validateObservatory(value))return fail("observatory-adapter","invalid_contract","Observatory output failed validation","observatory_validation_failed");
  const envelope=makeContract({component:"control-observatory",ok:value.overview.reportValid,code:value.overview.reportValid?"ok":"integrity_failure",message:value.overview.reportValid?"Observatory normalized":"Observatory report invalid",data:value,diagnostics:value.overview.reportValid?[]:[{code:"report_invalid",severity:"high",message:"Underlying diagnostic report validation failed"}],requestId:"rc157-observatory"});
  return validateContract(envelope)?envelope:fail("observatory-adapter","invalid_contract","Envelope validation failed","contract_validation_failed");
 }catch{return fail("observatory-adapter","internal_error","Adapter safely failed","adapter_exception");}
}
export function adaptDiagnosticReport(bundle){
 try{
  const isolated=isolateBoundaryInput(bundle);
  if(isolated===null)return fail("diagnostic-adapter","invalid_input","Boundary input rejected","boundary_isolation_failed");
  const value=buildDiagnosticReport(isolated);
  if(!validateDiagnosticReport(value))return fail("diagnostic-adapter","invalid_contract","Diagnostic report failed validation","report_validation_failed");
  const envelope=makeContract({component:"diagnostic-report",ok:value.summary.failed===0&&value.summary.blocked===0,code:value.summary.failed===0&&value.summary.blocked===0?"ok":"integrity_failure",message:"Diagnostic report normalized",data:value,diagnostics:value.summary.failed===0&&value.summary.blocked===0?[]:[{code:"report_findings",severity:"medium",message:"Report contains findings or blocked checks"}],requestId:"rc157-report"});
  return validateContract(envelope)?envelope:fail("diagnostic-adapter","invalid_contract","Envelope validation failed","contract_validation_failed");
 }catch{return fail("diagnostic-adapter","internal_error","Adapter safely failed","adapter_exception");}
}
export function validateAdapterResult(result){return validateContract(result);}
