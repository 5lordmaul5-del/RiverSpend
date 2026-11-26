// RC-159: strict data boundary; copies bounded JSON-like input into isolated data.
const MAX_DEPTH=32, MAX_NODES=10000, MAX_STRING=1000000;
export function isolateBoundaryInput(input){
 const seen=new WeakSet();let nodes=0;
 function visit(v,depth){
  if(depth>MAX_DEPTH||++nodes>MAX_NODES)throw new Error("boundary_limit");
  if(v===null||typeof v==="boolean"||typeof v==="number"){
   if(typeof v==="number"&&!Number.isFinite(v))throw new Error("boundary_number");
   return v;
  }
  if(typeof v==="string"){if(v.length>MAX_STRING)throw new Error("boundary_string");return v;}
  if(typeof v!=="object"||Array.isArray(v)&&Object.getPrototypeOf(v)!==Array.prototype)throw new Error("boundary_type");
  if(seen.has(v))throw new Error("boundary_cycle");
  seen.add(v);
  if(Array.isArray(v)){
   if(Reflect.ownKeys(v).some(k=>typeof k==="symbol"||k!=="length"&&!/^(0|[1-9][0-9]*)$/.test(k)))throw new Error("boundary_array_keys");
   const out=[];for(let i=0;i<v.length;i++){const d=Object.getOwnPropertyDescriptor(v,String(i));if(!d||!d.enumerable||!Object.hasOwn(d,"value"))throw new Error("boundary_array_descriptor");out.push(visit(d.value,depth+1));}
   seen.delete(v);return out;
  }
  const proto=Object.getPrototypeOf(v);if(proto!==Object.prototype&&proto!==null)throw new Error("boundary_prototype");
  if(Object.getOwnPropertySymbols(v).length)throw new Error("boundary_symbol");
  const keys=Reflect.ownKeys(v);const out=Object.create(null);
  for(const k of keys){if(typeof k!=="string"||k==="__proto__"||k==="constructor"||k==="prototype")throw new Error("boundary_key");const d=Object.getOwnPropertyDescriptor(v,k);if(!d||!d.enumerable||!Object.hasOwn(d,"value"))throw new Error("boundary_descriptor");out[k]=visit(d.value,depth+1);}
  seen.delete(v);return out;
 }
 try{return Object.freeze(visit(input,0));}catch{return null;}
}
export function boundaryLimits(){return Object.freeze({maxDepth:MAX_DEPTH,maxNodes:MAX_NODES,maxStringLength:MAX_STRING});}
