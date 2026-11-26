// RC-160: fault containment utilities for read-only diagnostic modules.
const ALLOWED=Object.freeze(["observatory","diagnostic-report"]);
export function runContainedDiagnostic(route,fn,input){
 if(typeof route!=="string"||!ALLOWED.includes(route)||typeof fn!=="function")return Object.freeze({ok:false,route:"unknown",code:"route_rejected",data:null,diagnostics:Object.freeze(["route_not_allowlisted"])});
 try{
  const output=fn(input);
  return Object.freeze({ok:true,route,code:"ok",data:output,diagnostics:Object.freeze([])});
 }catch(error){
  const code=error&&typeof error.message==="string"&&/^[a-z0-9_]{1,64}$/.test(error.message)?error.message:"component_failure";
  return Object.freeze({ok:false,route,code:"contained_failure",data:null,diagnostics:Object.freeze([code])});
 }
}
export function validateContainedResult(result){
 try{
  if(!result||typeof result!=="object"||Array.isArray(result))return false;
  const keys=Reflect.ownKeys(result);if(keys.length!==5||keys.some(k=>!["ok","route","code","data","diagnostics"].includes(k)))return false;
  const d={};for(const k of keys){const p=Object.getOwnPropertyDescriptor(result,k);if(!p||!p.enumerable||!Object.hasOwn(p,"value"))return false;d[k]=p.value;}
  return typeof d.ok==="boolean"&&typeof d.route==="string"&&typeof d.code==="string"&&Array.isArray(d.diagnostics)&&d.diagnostics.every(x=>typeof x==="string")&&(d.ok?d.code==="ok":d.code!=="ok");
 }catch{return false;}
}
