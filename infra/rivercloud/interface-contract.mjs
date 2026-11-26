// RC-156: common contract envelope for read-only RiverCloud modules.
const CONTRACT_KEYS=["schema","component","ok","code","message","data","diagnostics","meta"];
const DIAG_KEYS=["code","severity","message"];
const META_KEYS=["requestId","timestamp"];
const CODES=Object.freeze(["ok","invalid_input","invalid_contract","integrity_failure","blocked","internal_error"]);
function exact(input,keys){try{if(!input||typeof input!=="object"||Array.isArray(input)||(Object.getPrototypeOf(input)!==Object.prototype&&Object.getPrototypeOf(input)!==null))return null;const own=Reflect.ownKeys(input);if(own.length!==keys.length||own.some(k=>typeof k!=="string"||!keys.includes(k)))return null;const out=Object.create(null);for(const k of keys){const d=Object.getOwnPropertyDescriptor(input,k);if(!d||!d.enumerable||!Object.hasOwn(d,"value"))return null;out[k]=d.value;}return out;}catch{return null;}}
export function makeContract({component,ok,code,message,data=null,diagnostics=[],requestId="local",timestamp=new Date().toISOString()}){
 if(typeof component!=="string"||!component||typeof ok!=="boolean"||!CODES.includes(code)||typeof message!=="string"||!Array.isArray(diagnostics))throw new Error("contract_arguments_invalid");
 const ds=diagnostics.map(d=>{const x=exact(d,DIAG_KEYS);if(!x||typeof x.code!=="string"||!["info","low","medium","high","critical"].includes(x.severity)||typeof x.message!=="string")throw new Error("diagnostic_invalid");return Object.freeze(x);});
 const meta=Object.freeze({requestId,timestamp});
 return Object.freeze({schema:"rivercloud.contract.v1",component,ok,code,message,data,diagnostics:Object.freeze(ds),meta});
}
export function validateContract(input){
 const d=exact(input,CONTRACT_KEYS);if(!d||d.schema!=="rivercloud.contract.v1"||typeof d.component!=="string"||typeof d.ok!=="boolean"||!CODES.includes(d.code)||typeof d.message!=="string"||!Array.isArray(d.diagnostics))return false;
 if(d.diagnostics.some(x=>{const y=exact(x,DIAG_KEYS);return !y||typeof y.code!=="string"||!["info","low","medium","high","critical"].includes(y.severity)||typeof y.message!=="string";}))return false;
 const m=exact(d.meta,META_KEYS);return !!m&&typeof m.requestId==="string"&&typeof m.timestamp==="string"&&Number.isFinite(Date.parse(m.timestamp))&&new Date(m.timestamp).toISOString()===m.timestamp;
}
export function contractCodes(){return [...CODES];}
