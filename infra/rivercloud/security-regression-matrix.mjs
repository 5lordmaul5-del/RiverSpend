// RC-153: observable security regression matrix. No execution/authorization semantics.
import { integrityScenarios, runIntegrityScenario } from "./fault-integrity-harness.mjs";
const CONTROLS=Object.freeze([
 {id:"RC-S01",scenario:"baseline",category:"integrity",severity:"info",expect:"accept"},
 {id:"RC-S02",scenario:"missing_bundle_field",category:"schema",severity:"high",expect:"reject"},
 {id:"RC-S03",scenario:"altered_run_id",category:"identity",severity:"high",expect:"reject"},
 {id:"RC-S04",scenario:"altered_digest",category:"integrity",severity:"critical",expect:"reject"},
 {id:"RC-S05",scenario:"invalid_lifecycle",category:"state",severity:"high",expect:"reject"},
 {id:"RC-S06",scenario:"altered_audit",category:"audit",severity:"critical",expect:"reject"},
 {id:"RC-S07",scenario:"unsafe_accessor",category:"hostile_input",severity:"high",expect:"reject"}
]);
export function regressionMatrix(){return CONTROLS.map(c=>Object.freeze({...c}));}
export function assessRegressionMatrix(bundle){
 const available=new Set(integrityScenarios());
 const entries=CONTROLS.map(c=>{
  if(!available.has(c.scenario))return Object.freeze({...c,outcome:"blocked",pass:false,diagnostics:Object.freeze(["scenario_not_available"])});
  const r=runIntegrityScenario(bundle,c.scenario);
  const pass=c.expect==="accept"?r.accepted===true:r.accepted===false;
  return Object.freeze({...c,outcome:pass?"pass":"regression",pass,diagnostics:r.diagnostics});
 });
 const summary=Object.freeze({total:entries.length,passed:entries.filter(x=>x.pass).length,failed:entries.filter(x=>!x.pass&&x.outcome==="regression").length,blocked:entries.filter(x=>x.outcome==="blocked").length});
 return Object.freeze({entries:Object.freeze(entries),summary});
}
