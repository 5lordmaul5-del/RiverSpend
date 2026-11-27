/** I.S.S.A. Sphere virtual trajectory planner (path interpolation; no actuator). */
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const finite=v=>Number.isFinite(Number(v));
const wrap=v=>((v+180)%360+360)%360-180;
export function normalizeWaypoint(input={}){
 return {azimuth:wrap(finite(input.azimuth)?Number(input.azimuth):0),
  elevation:clamp(finite(input.elevation)?Number(input.elevation):0,-90,90),
  dwellMs:clamp(finite(input.dwellMs)?Number(input.dwellMs):0,0,60000),
  label:String(input.label??"").slice(0,80)};
}
export function createTrajectory(input={}){
 const waypoints=Array.isArray(input.waypoints)?input.waypoints.map(normalizeWaypoint):[];
 if(waypoints.length>256)throw new RangeError("Trajectory supports at most 256 waypoints");
 return {schemaVersion:1,mode:["sequence","ping-pong","loop"].includes(input.mode)?input.mode:"sequence",
  waypoints, speedDegPerSec:clamp(finite(input.speedDegPerSec)?Number(input.speedDegPerSec):30,1,180),
  enabled:input.enabled!==false};
}
export function interpolateWaypoint(from={},to={},progress=0){
 const a=normalizeWaypoint(from),b=normalizeWaypoint(to),t=clamp(finite(progress)?Number(progress):0,0,1);
 return {azimuth:wrap(a.azimuth+wrap(b.azimuth-a.azimuth)*t),
  elevation:a.elevation+(b.elevation-a.elevation)*t};
}
export function estimateWaypointTravelSeconds(from={},to={},speed=30){
 const a=normalizeWaypoint(from),b=normalizeWaypoint(to),s=clamp(finite(speed)?Number(speed):30,1,180);
 const yaw=Math.abs(wrap(b.azimuth-a.azimuth)),pitch=Math.abs(b.elevation-a.elevation);
 return Math.max(yaw,pitch)/s;
}
export function trajectoryStep(trajectory={},state={},dt=1/60){
 const t=createTrajectory(trajectory),s={index:clamp(Math.trunc(Number(state.index)||0),0,Math.max(0,t.waypoints.length-1)),
  direction:state.direction===-1?-1:1,progress:clamp(finite(state.progress)?Number(state.progress):0,0,1)};
 if(!t.enabled||t.waypoints.length<2)return {state:s,target:t.waypoints[s.index]??{azimuth:0,elevation:0},done:true};
 let next=s.index+s.direction;if(t.mode==="loop")next=(next+t.waypoints.length)%t.waypoints.length;
 if(t.mode==="ping-pong"&&(next<0||next>=t.waypoints.length)){s.direction*=-1;next=s.index+s.direction;}
 if(next<0||next>=t.waypoints.length)return {state:s,target:t.waypoints[s.index],done:true};
 const seconds=estimateWaypointTravelSeconds(t.waypoints[s.index],t.waypoints[next],t.speedDegPerSec);
 const increment=seconds<=0?1:clamp((Number(dt)||0)/seconds,0,1);
 s.progress=clamp(s.progress+increment,0,1);
 const target=interpolateWaypoint(t.waypoints[s.index],t.waypoints[next],s.progress);
 if(s.progress>=1){s.index=next;s.progress=0;}
 return {state:s,target,done:false};
}
