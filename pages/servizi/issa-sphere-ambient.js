/**
 * I.S.S.A. Sphere Ambient — directional tracking/control model.
 * Virtual steering model only; does not actuate hardware or perform DSP.
 */
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const finite=v=>Number.isFinite(Number(v));
const wrapAngle=v=>((v+180)%360+360)%360-180;
export const ISSA_SPHERE_MODES=Object.freeze(["auto-follow","manual","scene-focus","ambient-scan"]);
export function normalizeSphereConfig(input={}){
 return {schemaVersion:1,name:"ISSA_SPHERE_AMBIENT",mount:"overhead-center",
  mode:ISSA_SPHERE_MODES.includes(input.mode)?input.mode:"auto-follow",
  enabled:input.enabled!==false,
  yaw:wrapAngle(finite(input.yaw)?Number(input.yaw):0),
  pitch:clamp(finite(input.pitch)?Number(input.pitch):0,-90,90),
  movementSpeed:clamp(finite(input.movementSpeed)?Number(input.movementSpeed):0.35,0.05,1),
  smoothing:clamp(finite(input.smoothing)?Number(input.smoothing):0.7,0,0.98),
  focusThreshold:clamp(finite(input.focusThreshold)?Number(input.focusThreshold):0.15,0,1),
  trackingSource: String(input.trackingSource??"virtual-source-metadata").slice(0,80),
  targetRole: String(input.targetRole??"sphere-ambient").slice(0,80)};
}
export function normalizeDirection(input={}){
 return {azimuth:wrapAngle(finite(input.azimuth)?Number(input.azimuth):0),
  elevation:clamp(finite(input.elevation)?Number(input.elevation):0,-90,90),
  intensity:clamp(finite(input.intensity)?Number(input.intensity):0,0,1)};
}
/** Compute sphere orientation target from the chosen source's direction. */
export function sphereTargetFromSource(source,config={}){
 const c=normalizeSphereConfig(config),s=normalizeDirection(source);
 if(!c.enabled)return {yaw:c.yaw,pitch:c.pitch,active:false,reason:"disabled"};
 if(s.intensity<c.focusThreshold)return {yaw:c.yaw,pitch:c.pitch,active:false,reason:"below-focus-threshold"};
 return {yaw:s.azimuth,pitch:s.elevation,active:true,sourceIntensity:s.intensity};
}
/** Smooth incremental steering; call per frame/time step with dt in seconds. */
export function stepSphereOrientation(current={},target={},config={},dt=1/60){
 const c=normalizeSphereConfig(config);
 const cur={yaw:wrapAngle(finite(current.yaw)?Number(current.yaw):c.yaw),
  pitch:clamp(finite(current.pitch)?Number(current.pitch):c.pitch,-90,90)};
 const tgt={yaw:wrapAngle(finite(target.yaw)?Number(target.yaw):cur.yaw),
  pitch:clamp(finite(target.pitch)?Number(target.pitch):cur.pitch,-90,90)};
 const seconds=clamp(finite(dt)?Number(dt):1/60,0,0.25);
 const alpha=1-Math.pow(c.smoothing,seconds*60);
 const yawDelta=wrapAngle(tgt.yaw-cur.yaw);
 const speedLimit=c.movementSpeed*180*seconds;
 const yawStep=clamp(yawDelta*alpha,-speedLimit,speedLimit);
 const pitchStep=clamp((tgt.pitch-cur.pitch)*alpha,-speedLimit,speedLimit);
 return {yaw:wrapAngle(cur.yaw+yawStep),pitch:clamp(cur.pitch+pitchStep,-90,90),
  moving:Math.abs(yawDelta)>0.05||Math.abs(tgt.pitch-cur.pitch)>0.05};
}
export function validateSphereTargets(targets=[]){
 if(!Array.isArray(targets))throw new TypeError("targets must be an array");
 const seen=new Set();
 return targets.map(t=>{const id=String(t?.id??"").trim();if(!id)throw new Error("Target id required");
  if(seen.has(id))throw new Error("Duplicate sphere target id: "+id);seen.add(id);
  return {id,label:String(t.label??id).slice(0,100),...normalizeDirection(t),enabled:t.enabled!==false};});
}
