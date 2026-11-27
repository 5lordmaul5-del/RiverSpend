/** I.S.S.A. Sphere telemetry/event snapshot model (in-memory payloads only). */
const finite=v=>Number.isFinite(Number(v));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createSphereTelemetry(input={}){
 const status=["idle","tracking","moving","holding","blocked","fault"].includes(input.status)?input.status:"idle";
 return {schemaVersion:1,component:"ISSA_SPHERE",timestamp:finite(input.timestamp)?Number(input.timestamp):0,
  status,focusSourceId:input.focusSourceId==null?null:String(input.focusSourceId).slice(0,120),
  orientation:{yaw:clamp(finite(input.yaw)?Number(input.yaw):0,-180,180),
   pitch:clamp(finite(input.pitch)?Number(input.pitch):0,-90,90)},
  target:{yaw:clamp(finite(input.targetYaw)?Number(input.targetYaw):0,-180,180),
   pitch:clamp(finite(input.targetPitch)?Number(input.targetPitch):0,-90,90)},
  safetyBlocked:input.safetyBlocked===true,
  reason:String(input.reason??"").slice(0,240)};
}
export function createSphereEvent(input={}){
 const type=["focus-changed","target-accepted","target-rejected","motion-limited","trajectory-start","trajectory-stop","safety-block","fault","mode-changed"].includes(input.type)?input.type:"status";
 return {schemaVersion:1,component:"ISSA_SPHERE_EVENT",timestamp:finite(input.timestamp)?Number(input.timestamp):0,
  type,sourceId:input.sourceId==null?null:String(input.sourceId).slice(0,120),
  detail:String(input.detail??"").slice(0,240),severity:["info","warning","error"].includes(input.severity)?input.severity:"info"};
}
export function appendSphereTelemetry(history,entry,limit=200){
 if(!Array.isArray(history))throw new TypeError("history must be an array");
 const max=Math.trunc(clamp(finite(limit)?Number(limit):200,1,2000));
 return [...history,createSphereTelemetry(entry)].slice(-max);
}
export function appendSphereEvents(history,event,limit=500){
 if(!Array.isArray(history))throw new TypeError("history must be an array");
 const max=Math.trunc(clamp(finite(limit)?Number(limit):500,1,5000));
 return [...history,createSphereEvent(event)].slice(-max);
}
