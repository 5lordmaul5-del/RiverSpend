// RC-158: read-only diagnostic gateway; routes to normalized adapter envelopes.
import { adaptObservatory, adaptDiagnosticReport, validateAdapterResult } from "./compatibility-adapter.mjs";
import { makeContract, validateContract } from "./interface-contract.mjs";
import { runContainedDiagnostic, validateContainedResult } from "./fault-containment.mjs";
const routes=Object.freeze(["observatory","diagnostic-report"]);
export function diagnosticGateway(bundle,route){
 if(!routes.includes(route))return makeContract({component:"diagnostic-gateway",ok:false,code:"invalid_input",message:"Unsupported diagnostic route",data:null,diagnostics:[{code:"route_invalid",severity:"low",message:"Route is outside the read-only allowlist"}],requestId:"rc158-route"});
 try{
  const contained=runContainedDiagnostic(route,route==="observatory"?adaptObservatory:adaptDiagnosticReport,bundle);
  if(!validateContainedResult(contained)||!contained.ok)return makeContract({component:"diagnostic-gateway",ok:false,code:"internal_error",message:"Contained diagnostic failure",data:null,diagnostics:[{code:"contained_failure",severity:"medium",message:"Diagnostic component failed inside isolation boundary"}],requestId:"rc160-contained"});
  const result=contained.data;
  if(!validateAdapterResult(result)||!validateContract(result))return makeContract({component:"diagnostic-gateway",ok:false,code:"invalid_contract",message:"Adapter result rejected",data:null,diagnostics:[{code:"adapter_invalid",severity:"high",message:"Normalized adapter output did not pass contract validation"}],requestId:"rc158-invalid"});
  return result;
 }catch{
  return makeContract({component:"diagnostic-gateway",ok:false,code:"internal_error",message:"Gateway safely failed",data:null,diagnostics:[{code:"gateway_exception",severity:"high",message:"Gateway caught an adapter failure"}],requestId:"rc158-fail"});
 }
}
export function gatewayRoutes(){return [...routes];}
