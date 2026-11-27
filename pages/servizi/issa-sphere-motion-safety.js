/**
 * I.S.S.A. Sphere movement safety model.
 * Virtual safety limits and stop/fallback decisions only, no physical actuation.
 */
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const finite=v=>Number.isFinite(Number(v));
export function normalizeSphereSafety(input={}){
 return {yawMin:clamp(finite(input.yawMin)?Number(input.yawMin):-180,-180,180),
  yawMax:clamp(finite(input.yawMax)?Number(input.yawMax):180,-180,180),
  pitchMin:clamp(finite(input.pitchMin)?Number(input.pitchMin):-30,-90,90),
  pitchMax:clamp(finite(input.pitchMax)?Number(input.pitchMax):90,-90,90),
  maxSpeed:clamp(finite(input.maxSpeed)?Number(input.maxSpeed):35,1,180),
  maxStep:clamp(finite(input.maxStep)?Number(input.maxStep):12,0.1,45),
  staleMs:clamp(finite(input.staleMs)?Number(input.staleMs):1500,100,10000),
  stopOnInvalid:input.stopOnInvalid!==false,
  enabled:input.enabled!==false};
}
export function assessSphereMotion(state={},target={},safety={},now=0){
 const c=normalizeSphereSafety(safety);
 const yaw=finite(state.yaw)?Number(state.yaw):0,pitch=finite(state.pitch)?Number(state.pitch):0;
 const ts=finite(target.timestamp)?Number(target.timestamp):0;
 const valid=target.active===true&&finite(target.azimuth)&&finite(target.elevation)&&
  (now===0||ts===0||now-ts<=c.staleMs);
 const reason=!c.enabled?"safety-disabled":!valid?"target-invalid-or-stale":null;
 if(reason&&c.stopOnInvalid)return {allowed:false,reason,current:{yaw,pitch},target:null,settings:c};
 const ty=clamp(finite(target.azimuth)?Number(target.azimuth):yaw,c.yawMin,c.yawMax);
 const tp=clamp(finite(target.elevation)?Number(target.elevation):pitch,c.pitchMin,c.pitchMax);
 return {allowed:c.enabled&&valid,reason, current:{yaw,pitch},
  target:{azimuth:ty,elevation:tp}, settings:c};
}
export function limitSphereStep(current={},target={},safety={},dt=1/60){
 const c=normalizeSphereSafety(safety);
 const yaw=finite(current.yaw)?Number(current.yaw):0,pitch=finite(current.pitch)?Number(current.pitch):0;
 const ty=finite(target.azimuth)?Number(target.azimuth):yaw,tp=finite(target.elevation)?Number(target.elevation):pitch;
 const sec=clamp(finite(dt)?Number(dt):1/60,0,0.25);
 const step=c.maxSpeed*sec;
 const dy=clamp(ty-yaw,-step,step),dp=clamp(tp-pitch,-step,step);
 const boundedYaw=clamp(yaw+dy,c.yawMin,c.yawMax),boundedPitch=clamp(pitch+dp,c.pitchMin,c.pitchMax);
 return {yaw:boundedYaw,pitch:boundedPitch,stepLimited:Math.abs(ty-yaw)>step||Math.abs(tp-pitch)>step,
  safeBoundsApplied:boundedYaw!==yaw+dy||boundedPitch!==pitch+dp};
}
