/** I.S.S.A. Sphere-to-layout role mapping model (virtual channel metadata). */
const allowed=["sphere-ambient","top-center","height-front-left","height-front-right","height-rear-left","height-rear-right","subwoofer-1","subwoofer-2"];
export function createSphereRoleMapping(input={}){
 const layout=String(input.layout??"10.2.4.1");
 const sphereRole=String(input.sphereRole??"sphere-ambient");
 if(!allowed.includes(sphereRole))throw new Error("Unsupported sphere role");
 const channelCount=Math.max(0,Math.min(64,Math.trunc(Number(input.channelCount)||0)));
 const channelIndex=input.channelIndex==null?null:Math.trunc(Number(input.channelIndex));
 if(channelIndex!==null&&(channelIndex<0||channelIndex>=channelCount))throw new RangeError("channelIndex outside channelCount");
 return {schemaVersion:1,layout,sphereRole,channelCount,channelIndex,
  active:input.active!==false,exclusive:input.exclusive!==false,
  note:"Virtual role/channel mapping only; no physical speaker routing."};
}
export function validateSphereMappings(mappings=[]){
 if(!Array.isArray(mappings))throw new TypeError("mappings must be an array");
 const seen=new Set();
 return mappings.map(m=>{const result=createSphereRoleMapping(m);
  if(result.active&&result.channelIndex!==null&&result.exclusive){
   if(seen.has(result.channelIndex))throw new Error("Exclusive channel mapping conflict: "+result.channelIndex);
   seen.add(result.channelIndex);
  }return result;});
}
export function sphereRoleAvailable(layoutRoles=[]){
 if(!Array.isArray(layoutRoles))throw new TypeError("layoutRoles must be an array");
 return layoutRoles.includes("sphere-ambient")||layoutRoles.includes("top-center");
}
